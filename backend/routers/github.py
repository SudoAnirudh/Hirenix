import uuid
from fastapi import APIRouter, Depends, HTTPException
from dependencies import get_current_user, get_supabase_admin, require_plan
from services.github_analyzer import analyze_github_profile
from models.github import GitHubAnalysisRequest, GitHubAnalysisResponse

router = APIRouter()


@router.post("/analyze-github", response_model=GitHubAnalysisResponse)
async def analyze_github(
    payload: GitHubAnalysisRequest,
    # GitHub deep analysis is a paid (pro) feature
    user: dict = Depends(require_plan("pro", "enterprise")),
    db=Depends(get_supabase_admin),
):
    """Fetch GitHub profile data and compute GitHub Performance Index (GPI)."""
    try:
        result = await analyze_github_profile(payload.username)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"GitHub analysis failed: {e}")

    analysis_id = str(uuid.uuid4())
    db.table("github_analyses").insert({
        "id": analysis_id,
        "user_id": user["user_id"],
        "github_username": payload.username,
        "gpi_score": result.gpi_score,
        "metrics": result.metrics.model_dump(),
    }).execute()

    return GitHubAnalysisResponse(
        analysis_id=analysis_id,
        **result.model_dump(exclude={"analysis_id"}),
    )
