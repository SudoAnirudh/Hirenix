from fastapi import APIRouter, Depends
from dependencies import get_current_user, get_supabase_admin
import json
from services.groq_client import invoke_groq_llm

router = APIRouter()


@router.get("/progress")
async def get_progress(
    user: dict = Depends(get_current_user),
    db=Depends(get_supabase_admin),
):
    """Return historical ATS scores and interview performance for trend visualization."""
    resumes_r = db.table("resumes").select("ats_score, created_at").eq("user_id", user["user_id"]).order("created_at").execute()
    interviews_r = db.table("interview_sessions").select("overall_score, target_role, created_at").eq("user_id", user["user_id"]).order("created_at").execute()
    github_r = db.table("github_analyses").select("gpi_score, github_username, created_at").eq("user_id", user["user_id"]).order("created_at").execute()

    ats_trend = [{"score": r["ats_score"], "date": r["created_at"]} for r in (resumes_r.data or [])]
    interview_trend = [{"score": i["overall_score"], "role": i["target_role"], "date": i["created_at"]} for i in (interviews_r.data or [])]
    github_trend = [{"gpi": g["gpi_score"], "username": g["github_username"], "date": g["created_at"]} for g in (github_r.data or [])]

    # Resume Evolution Score: weighted average of latest metrics
    metrics = []
    weights = []

    if ats_trend:
        metrics.append(ats_trend[-1]["score"])
        weights.append(0.4)
    if interview_trend:
        metrics.append(interview_trend[-1]["score"])
        weights.append(0.4)
    
    # Github is optional, default to mid-range if not present but other metrics exist
    latest_gpi = github_trend[-1]["gpi"] if github_trend else 50.0
    metrics.append(latest_gpi)
    weights.append(0.2)

    evolution_score = None
    if len(metrics) > 1: # At least one core metric besides GPI
        total_weight = sum(weights)
        weighted_sum = sum(m * w for m, w in zip(metrics, weights))
        evolution_score = round(weighted_sum / total_weight, 1)

    return {
        "user_id": user["user_id"],
        "ats_trend": ats_trend,
        "interview_trend": interview_trend,
        "github_trend": github_trend,
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
    # Fetch detailed historical data
    resumes = db.table("resumes").select("ats_score, feedback, created_at").eq("user_id", user["user_id"]).order("created_at", desc=True).limit(5).execute()
    interviews = db.table("interview_sessions").select("id, overall_score, target_role, created_at").eq("user_id", user["user_id"]).order("created_at", desc=True).limit(5).execute()
    github = db.table("github_analyses").select("gpi_score, strengths, recommendations, created_at").eq("user_id", user["user_id"]).order("created_at", desc=True).limit(3).execute()
    linkedin = db.table("linkedin_analyses").select("metrics, strengths, recommendations, created_at").eq("user_id", user["user_id"]).order("created_at", desc=True).limit(3).execute()

    # Get interview answers for more depth
    interview_ids = [i["id"] for i in (interviews.data or [])]
    answers = []
    if interview_ids:
        answers = db.table("interview_answers").select("session_id, question, score, strengths, improvements").in_("session_id", interview_ids).execute().data or []

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
    You are a professional career coach and talent analyst. Analyze the following user progress data from the Hirenix platform.
    
    Data Context:
    {json.dumps(context, default=str)}
    
    Task:
    Generate a concise, motivating, and high-impact "AI Progress Summary" in Markdown.
    
    Sections to include:
    1. **Executive Summary**: A 2-sentence overview of their current trajectory.
    2. **Key Improvements**: What has gotten better since their first analysis? Compare early scores to recent ones.
    3. **Recurring Weaknesses**: What patterns of issues are still showing up across resumes or interviews?
    4. **Top 3 Priorities**: Actionable steps they should take this week to improve their scores.
    
    Style:
    - Use professional, encouraging tone.
    - Use bullet points for readability.
    - Keep it under 400 words.
    - Focus on tangible growth.
    """

    messages = [
        {"role": "system", "content": "You are a world-class career growth strategist."},
        {"role": "user", "content": prompt}
    ]

    response = await invoke_groq_llm(messages)
    
    if not response:
        return {"summary": "Failed to generate summary. Please ensure your analyses are complete and try again."}

    summary_text = response.get("choices", [{}])[0].get("message", {}).get("content", "")
    
    return {
        "summary": summary_text,
        "generated_at": response.get("created")
    }
