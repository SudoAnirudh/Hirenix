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
