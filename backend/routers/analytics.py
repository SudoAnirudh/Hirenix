from fastapi import APIRouter, Depends
from dependencies import get_current_user, get_supabase_admin
import json
import asyncio
import logging
from services.groq_client import invoke_groq_llm
from services.nvidia_client import invoke_nvidia_llm

logger = logging.getLogger("hirenix.routers.analytics")

router = APIRouter()


@router.get("/progress")
async def get_progress(
    user: dict = Depends(get_current_user),
    db=Depends(get_supabase_admin),
):
    """Return historical performance trends for trend visualization."""

    # ⚡ Bolt: Parallelize independent database queries
    # What: Uses asyncio.gather with asyncio.to_thread to run 4 Supabase queries concurrently.
    # Why: The Supabase python client is synchronous; calling .execute() in series blocks the async event loop and increases latency.
    # Impact: Reduces query time from ~4N to ~1N, significantly speeding up the dashboard load time.
    resumes_task = asyncio.to_thread(lambda: db.table("resumes").select("ats_score, created_at").eq("user_id", user["user_id"]).order("created_at").execute())
    interviews_task = asyncio.to_thread(lambda: db.table("interview_sessions").select("overall_score, target_role, created_at").eq("user_id", user["user_id"]).order("created_at").execute())
    github_task = asyncio.to_thread(lambda: db.table("github_analyses").select("gpi_score, github_username, created_at").eq("user_id", user["user_id"]).order("created_at").execute())
    linkedin_task = asyncio.to_thread(lambda: db.table("linkedin_analyses").select("metrics, created_at").eq("user_id", user["user_id"]).order("created_at").execute())

    resumes_r, interviews_r, github_r, linkedin_r = await asyncio.gather(
        resumes_task, interviews_task, github_task, linkedin_task
    )

    ats_trend = [{"score": r["ats_score"], "date": r["created_at"]} for r in (resumes_r.data or [])]
    interview_trend = [{"score": i["overall_score"], "role": i["target_role"], "date": i["created_at"]} for i in (interviews_r.data or [])]
    github_trend = [{"gpi": g["gpi_score"], "username": g["github_username"], "date": g["created_at"]} for g in (github_r.data or [])]
    linkedin_trend = [
        {"score": li["metrics"]["overall_score"] if isinstance(li["metrics"], dict) else 0, "date": li["created_at"]}
        for li in (linkedin_r.data or [])
    ]

    # Evolution Score: weighted average of latest metrics
    metrics = []
    weights = []

    # ATS & Interviews: Core pillars (35% each)
    if ats_trend:
        metrics.append(ats_trend[-1]["score"])
        weights.append(0.35)
    if interview_trend:
        metrics.append(interview_trend[-1]["score"])
        weights.append(0.35)
    
    # Github (15%)
    latest_gpi = github_trend[-1]["gpi"] if github_trend else 50.0
    metrics.append(latest_gpi)
    weights.append(0.15)

    # LinkedIn (15%)
    latest_linkedin = linkedin_trend[-1]["score"] if linkedin_trend else 50.0
    metrics.append(latest_linkedin)
    weights.append(0.15)

    evolution_score = None
    if len(metrics) > 2: # At least core metrics + one optional
        total_weight = sum(weights)
        weighted_sum = sum(m * w for m, w in zip(metrics, weights))
        evolution_score = round(weighted_sum / total_weight, 1)

    return {
        "user_id": user["user_id"],
        "ats_trend": ats_trend,
        "interview_trend": interview_trend,
        "github_trend": github_trend,
        "linkedin_trend": linkedin_trend,
        "resume_evolution_score": evolution_score,
    }


@router.post("/summary")
async def get_ai_summary(
    user: dict = Depends(get_current_user),
    db=Depends(get_supabase_admin),
):
    """
    Generate a comprehensive AI summary of the user's progress across all sections.
    """

    # ⚡ Bolt: Parallelize independent database queries
    # What: Uses asyncio.gather with asyncio.to_thread to run 4 Supabase queries concurrently.
    # Why: The Supabase python client is synchronous; calling .execute() in series blocks the async event loop and increases latency.
    # Impact: Reduces query time from ~4N to ~1N, significantly speeding up the AI summary generation.
    resumes_task = asyncio.to_thread(lambda: db.table("resumes").select("ats_score, feedback, created_at").eq("user_id", user["user_id"]).order("created_at", desc=True).limit(5).execute())
    interviews_task = asyncio.to_thread(lambda: db.table("interview_sessions").select("id, overall_score, target_role, created_at").eq("user_id", user["user_id"]).order("created_at", desc=True).limit(5).execute())
    github_task = asyncio.to_thread(lambda: db.table("github_analyses").select("gpi_score, strengths, recommendations, created_at").eq("user_id", user["user_id"]).order("created_at", desc=True).limit(3).execute())
    linkedin_task = asyncio.to_thread(lambda: db.table("linkedin_analyses").select("metrics, strengths, recommendations, created_at").eq("user_id", user["user_id"]).order("created_at", desc=True).limit(3).execute())

    # Fetch detailed historical data concurrently
    resumes, interviews, github, linkedin = await asyncio.gather(
        resumes_task, interviews_task, github_task, linkedin_task
    )

    # Get interview answers for more depth
    interview_ids = [i["id"] for i in (interviews.data or [])]
    answers = []
    if interview_ids:
        answers_r = await asyncio.to_thread(lambda: db.table("interview_answers").select("session_id, question, score, strengths, improvements").in_("session_id", interview_ids).execute())
        answers = answers_r.data or []

    # Prepare context for LLM
    context = {
        "resumes": resumes.data or [],
        "interviews": [],
        "github": github.data or [],
        "linkedin": linkedin.data or [],
    }

    # Group answers by session
    for session in (interviews.data or []):
        session_answers = [a for a in answers if a["session_id"] == session["id"]]
        context["interviews"].append({
            "score": session["overall_score"],
            "role": session["target_role"],
            "date": session["created_at"],
            "answers": session_answers[:3] # limit to 3 answers per session for context size
        })

    prompt = f"""
    You are a world-class career growth strategist and talent analyst. Analyze the following user progress data from the Hirenix platform, which includes Resume scores, Mock Interview performance, GitHub Intelligence, and LinkedIn Optimization.
    
    Data Context:
    {json.dumps(context, default=str)}
    
    Task:
    Generate a concise, motivating, and high-impact "AI Progress Summary" in Markdown. You MUST analyze all provided data points (Resume, Interview, GitHub, and LinkedIn) to provide a holistic career health report.
    
    Sections to include:
    1. **Executive Summary**: A 2-sentence overview of their current professional trajectory across all dimensions.
    2. **Key Improvements**: What has gotten better since their first analysis? Compare early scores to recent ones for Resumes, Interviews, GitHub, or LinkedIn.
    3. **Professional Branding**: Specifically analyze their GitHub and LinkedIn presence. Are they visible to recruiters? Is their headline/content optimized? 
    4. **Growth Opportunities**: What recurring patterns of issues or gaps are still showing up across their entire profile?
    5. **Top 3 Strategic Priorities**: Actionable, high-impact steps they should take this week to improve their overall "Readiness Index".
    
    Style:
    - Use a professional, highly encouraging, and data-driven tone.
    - Use bullet points for readability.
    - Keep it under 400 words.
    - Ensure LinkedIn and GitHub insights are specifically integrated into the branding AND priorities sections.
    """

    messages = [
        {"role": "system", "content": "You are a world-class career growth strategist."},
        {"role": "user", "content": prompt}
    ]

    # Try NVIDIA Gemma 4 (31B Dense) first for high-reasoning summaries
    response = await invoke_nvidia_llm(messages)
    
    # Fallback to Groq Llama 3 if NVIDIA fails or is not configured
    if not response:
        logger.info("NVIDIA Gemma 4 failed or is not configured; falling back to Groq Llama 3.")
        response = await invoke_groq_llm(messages)
    
    if not response:
        return {"summary": "Failed to generate summary. Please ensure your analyses are complete and try again."}

    summary_text = response.get("choices", [{}])[0].get("message", {}).get("content", "")
    
    return {
        "summary": summary_text,
        "generated_at": response.get("created")
    }
