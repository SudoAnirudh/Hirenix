import json
import logging
import uuid
from typing import Dict, Any

from services.job_scraper import scrape_jobs
from services.groq_client import invoke_groq_llm
from services.nvidia_client import invoke_nvidia_llm
from models.analysis import SuggestedJob, JobSuggestionResponse

logger = logging.getLogger("hirenix.job_suggester")

async def get_user_readiness_context(user_id: str, db) -> Dict[str, Any]:
    """
    Synthesizes user profile, resume, interview, GitHub, and LinkedIn data for suggestion context.
    """
    try:
        import asyncio
        # 1. Latest Resume
        resume_task = asyncio.to_thread(
            lambda: db.table("resumes").select("id, raw_text, ats_score").eq("user_id", user_id).order("created_at", desc=True).limit(1).execute()
        )
        
        # 2. Latest Interview Sessions
        interviews_task = asyncio.to_thread(
            lambda: db.table("interview_sessions").select("id, overall_score, target_role").eq("user_id", user_id).order("created_at", desc=True).limit(3).execute()
        )
        
        # 3. GitHub Stats
        github_task = asyncio.to_thread(
            lambda: db.table("github_analyses").select("gpi_score, strengths").eq("user_id", user_id).order("created_at", desc=True).limit(1).execute()
        )
        
        # 4. LinkedIn Stats
        linkedin_task = asyncio.to_thread(
            lambda: db.table("linkedin_analyses").select("strengths").eq("user_id", user_id).order("created_at", desc=True).limit(1).execute()
        )

        resume_r, interviews_r, github_r, linkedin_r = await asyncio.gather(
            resume_task, interviews_task, github_task, linkedin_task
        )

        ready_skills = []

        # 5. Extract Resume skills from sections if available
        sections_task = None
        if resume_r.data:
            resume_id = resume_r.data[0]["id"]
            sections_task = asyncio.to_thread(
                lambda: db.table("resume_sections").select("content").eq("resume_id", resume_id).eq("section_type", "skills").execute()
            )

        # 6. Ready Skills from Interviews (score >= 7.0)
        answers_task = None
        if interviews_r.data:
            session_ids = [i["id"] for i in interviews_r.data]
            answers_task = asyncio.to_thread(
                lambda: db.table("interview_answers").select("category, score").in_("session_id", session_ids).execute()
            )

        tasks_to_await = []
        if sections_task: tasks_to_await.append(sections_task)
        if answers_task: tasks_to_await.append(answers_task)

        sections_r = None
        answers_r = None

        if tasks_to_await:
            results = await asyncio.gather(*tasks_to_await)
            if sections_task and answers_task:
                sections_r, answers_r = results
            elif sections_task:
                sections_r = results[0]
            elif answers_task:
                answers_r = results[0]

        if sections_r and sections_r.data:
            content = sections_r.data[0]["content"] or ""
            skills_raw = [s.strip() for s in content.replace("\n", ",").split(",") if s.strip()]
            # filter clean short names
            clean_skills = [s for s in skills_raw if len(s) > 1 and len(s) < 30]
            ready_skills.extend(clean_skills[:5])

        if answers_r and answers_r.data:
            ready_skills.extend([a["category"] for a in answers_r.data if a["score"] and a["score"] >= 7.0 and a["category"]])

        # Add GitHub strengths
        if github_r.data and github_r.data[0].get("strengths"):
            github_strengths = github_r.data[0]["strengths"]
            if isinstance(github_strengths, list):
                ready_skills.extend(github_strengths[:2])
            elif isinstance(github_strengths, str):
                try:
                    ready_skills.extend(json.loads(github_strengths)[:2])
                except: pass

        # Add LinkedIn strengths
        if linkedin_r.data and linkedin_r.data[0].get("strengths"):
            linkedin_strengths = linkedin_r.data[0]["strengths"]
            if isinstance(linkedin_strengths, list):
                ready_skills.extend(linkedin_strengths[:2])
            elif isinstance(linkedin_strengths, str):
                try:
                    ready_skills.extend(json.loads(linkedin_strengths)[:2])
                except: pass

        target_role = interviews_r.data[0]["target_role"] if interviews_r.data else "Software Engineer"
        ats_score = resume_r.data[0]["ats_score"] if resume_r.data else 0
        resume_text = resume_r.data[0]["raw_text"] if resume_r.data else ""
        gpi_score = github_r.data[0]["gpi_score"] if github_r.data else 50.0

        return {
            "resume_text": resume_text[:2000],
            "ats_score": float(ats_score),
            "ready_skills": list(set([s for s in ready_skills if s])),
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
