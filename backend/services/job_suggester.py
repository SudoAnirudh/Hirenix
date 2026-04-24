import json
import logging
import uuid
import asyncio
from typing import Dict, Any

from services.job_scraper import scrape_jobs
from services.groq_client import invoke_groq_llm
from services.nvidia_client import invoke_nvidia_llm
from models.analysis import SuggestedJob, JobSuggestionResponse

logger = logging.getLogger("hirenix.job_suggester")

async def get_user_readiness_context(user_id: str, db) -> Dict[str, Any]:
    """
    Synthesizes user profile, resume, interview, and GitHub data for suggestion context.
    """
    try:
        # ⚡ Bolt: Parallelize independent synchronous Supabase queries
        # What: Uses asyncio.gather with asyncio.to_thread to run independent DB queries concurrently.
        # Why: The Supabase Python client's .execute() performs synchronous network I/O, which blocks the event loop in async functions and adds N+1 latency.
        # Impact: Reduces context fetch time from sum(T_i) to max(T_i).
        resume_task = asyncio.to_thread(
            lambda: db.table("resumes").select("raw_text, ats_score").eq("user_id", user_id).order("created_at", desc=True).limit(1).execute()
        )
        interviews_task = asyncio.to_thread(
            lambda: db.table("interview_sessions").select("id, overall_score, target_role").eq("user_id", user_id).order("created_at", desc=True).limit(3).execute()
        )
        github_task = asyncio.to_thread(
            lambda: db.table("github_analyses").select("gpi_score, strengths").eq("user_id", user_id).order("created_at", desc=True).limit(1).execute()
        )
        
        resume_r, interviews_r, github_r = await asyncio.gather(resume_task, interviews_task, github_task)
        
        # 4. Ready Skills from Interviews (score >= 7.0)
        ready_skills = []
        if interviews_r.data:
            session_ids = [i["id"] for i in interviews_r.data]
            answers_r = await asyncio.to_thread(
                lambda: db.table("interview_answers").select("category, score").in_("session_id", session_ids).execute()
            )
            if answers_r.data:
                ready_skills = list(set([a["category"] for a in answers_r.data if a["score"] and a["score"] >= 7.0 and a["category"]]))

        # Add GitHub strengths
        if github_r.data and github_r.data[0].get("strengths"):
            ready_skills.extend(github_r.data[0]["strengths"][:2])

        target_role = interviews_r.data[0]["target_role"] if interviews_r.data else "Software Engineer"
        ats_score = resume_r.data[0]["ats_score"] if resume_r.data else 0
        resume_text = resume_r.data[0]["raw_text"] if resume_r.data else ""
        gpi_score = github_r.data[0]["gpi_score"] if github_r.data else 50.0

        return {
            "resume_text": resume_text[:2000],
            "ats_score": float(ats_score),
            "ready_skills": list(set(ready_skills)),
            "target_role": target_role,
            "gpi_score": float(gpi_score),
        }
    except Exception as e:
        logger.error(f"Error fetching readiness context: {e}")
        return {
            "resume_text": "",
            "ats_score": 0,
            "ready_skills": [],
            "target_role": "Software Engineer",
            "gpi_score": 50.0,
        }

async def generate_job_suggestions(user_id: str, db, limit: int = 6) -> JobSuggestionResponse:
    context = await get_user_readiness_context(user_id, db)
    
    # 1. Generate search queries optimized for user's proven skills
    prompt_queries = f"""
    The user is a {context['target_role']} with proven skills in: {", ".join(context['ready_skills'])}.
    Generate 3 highly specific search terms (role + skill) to find high-growth job opportunities.
    Output ONLY as a JSON list of strings.
    """
    
    query_resp = await invoke_groq_llm([{"role": "user", "content": prompt_queries}], temperature=0.2)
    search_fields = [context['target_role']]
    try:
        content = query_resp["choices"][0]["message"]["content"]
        if "```json" in content: content = content.split("```json")[1].split("```")[0]
        search_fields = json.loads(content.strip())
    except:
        pass

    # 2. Scrape jobs from market
    jobs = await scrape_jobs(search_fields, None, True, 15)
    
    if not jobs:
        return JobSuggestionResponse(
            user_id=user_id, 
            suggestions=[], 
            evolution_score=context['ats_score'], 
            readiness_summary="No matching opportunities found."
        )

    # 3. Use NVIDIA/Groq to re-rank and generate rationale
    job_data_for_llm = []
    for j in jobs[:10]:
        job_data_for_llm.append({
            "idx": jobs.index(j),
            "title": j.title,
            "company": j.company,
            "snippet": j.description_snippet[:150]
        })

    prompt_reasoning = f"""
    Analyze these jobs for a candidate aiming for: {context['target_role']}.
    User Strengths: {", ".join(context['ready_skills'])}.
    
    Jobs:
    {json.dumps(job_data_for_llm)}
    
    Assign a 'reason' for each (mentioning their strengths) and an 'alignment_score' (0-100).
    Output ONLY JSON: [{{"idx": 0, "reason": "...", "alignment_score": 92}}, ...]
    """
    
    # Using NVIDIA for deeper reasoning if available, else Groq
    rank_resp = await invoke_nvidia_llm([{"role": "user", "content": prompt_reasoning}])
    if not rank_resp:
        rank_resp = await invoke_groq_llm([{"role": "user", "content": prompt_reasoning}])

    recommendations = {}
    try:
        content = rank_resp["choices"][0]["message"]["content"]
        if "```json" in content: content = content.split("```json")[1].split("```")[0]
        rec_list = json.loads(content.strip())
        for r in rec_list:
            recommendations[r["idx"]] = r
    except:
        pass

    final_suggestions = []
    for idx, j in enumerate(jobs):
        if idx in recommendations:
            rec = recommendations[idx]
            final_suggestions.append(
                SuggestedJob(
                    id=j.id or str(uuid.uuid4()),
                    title=j.title,
                    company=j.company,
                    location=j.location,
                    remote=j.remote,
                    job_type=j.job_type,
                    tags=j.tags,
                    apply_url=j.apply_url,
                    source=j.source,
                    posted_at=j.posted_at,
                    description_snippet=j.description_snippet,
                    match_score=float(j.match_score or 0),
                    reason=rec["reason"],
                    alignment_score=float(rec["alignment_score"])
                )
            )

    # Sort by alignment score
    final_suggestions.sort(key=lambda x: x.alignment_score, reverse=True)

    return JobSuggestionResponse(
        user_id=user_id,
        suggestions=final_suggestions[:limit],
        evolution_score=context['ats_score'],
        readiness_summary=f"Optimized suggestions based on your {context['target_role']} path."
    )
