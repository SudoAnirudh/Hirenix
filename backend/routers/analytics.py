from fastapi import APIRouter, Depends
from dependencies import get_current_user, get_supabase_admin

router = APIRouter()


@router.get("/progress")
async def get_progress(
    user: dict = Depends(get_current_user),
    db=Depends(get_supabase_admin),
):
    """Return historical ATS scores and interview performance for trend visualization."""
    resumes_r = db.table("resumes").select("ats_score, created_at").eq("user_id", user["user_id"]).order("created_at").execute()
    interviews_r = db.table("interviews").select("score, role, created_at").eq("user_id", user["user_id"]).order("created_at").execute()
    github_r = db.table("github_analyses").select("gpi_score, username, created_at").eq("user_id", user["user_id"]).order("created_at").execute()

    ats_trend = [{"score": r["ats_score"], "date": r["created_at"]} for r in (resumes_r.data or [])]
    interview_trend = [{"score": i["score"], "role": i["role"], "date": i["created_at"]} for i in (interviews_r.data or [])]
    github_trend = [{"gpi": g["gpi_score"], "username": g["username"], "date": g["created_at"]} for g in (github_r.data or [])]

    # Resume Evolution Score: weighted average of latest metrics
    evolution_score = None
    if ats_trend and interview_trend:
        latest_ats = ats_trend[-1]["score"]
        latest_interview = interview_trend[-1]["score"]
        latest_gpi = github_trend[-1]["gpi"] if github_trend else 50.0
        evolution_score = round(latest_ats * 0.4 + latest_interview * 0.4 + latest_gpi * 0.2, 1)

    return {
        "user_id": user["user_id"],
        "ats_trend": ats_trend,
        "interview_trend": interview_trend,
        "github_trend": github_trend,
        "resume_evolution_score": evolution_score,
    }
