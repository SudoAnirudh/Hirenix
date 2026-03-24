import uuid
from fastapi import APIRouter, Depends, HTTPException
from dependencies import get_supabase_admin, require_plan
from services.linkedin_analyzer import analyze_linkedin_profile
from models.linkedin import LinkedInAnalysisRequest, LinkedInAnalysisResponse

router = APIRouter()


@router.post("/analyze", response_model=LinkedInAnalysisResponse)
async def analyze_linkedin(
    payload: LinkedInAnalysisRequest,
    user: dict = Depends(require_plan("pro", "elite")),
    db=Depends(get_supabase_admin),
):
    """Fetch LinkedIn profile data and compute LinkedIn Performance Index (LPI)."""
    try:
        result = await analyze_linkedin_profile(payload.linkedin_url)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"LinkedIn analysis failed: {e}")

    analysis_id = str(uuid.uuid4())
    db.table("linkedin_analyses").insert({
        "id": analysis_id,
        "user_id": user["user_id"],
        "linkedin_url": payload.linkedin_url,
        "lpi_score": result.lpi_score,
        "metrics": result.metrics.model_dump(),
        "strengths": result.strengths,
        "recommendations": result.recommendations,
        "raw_data": result.raw_data,
    }).execute()

    return LinkedInAnalysisResponse(
        analysis_id=analysis_id,
        **result.model_dump(exclude={"analysis_id"}),
    )
