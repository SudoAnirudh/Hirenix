from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from models.linkedin import LinkedInAnalysisResponse
from services.linkedin_analyzer import analyze_linkedin_profile
from dependencies import get_current_user
import logging

router = APIRouter(tags=["LinkedIn Analytics"])
logger = logging.getLogger("hirenix.routers.linkedin")

@router.post("/analyze", response_model=LinkedInAnalysisResponse)
async def analyze_linkedin(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """
    Analyzes a LinkedIn profile PDF export.
    """
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    try:
        content = await file.read()
        analysis = await analyze_linkedin_profile(content)
        
        if not analysis:
            raise HTTPException(
                status_code=500, 
                detail="Failed to analyze LinkedIn profile. Please try again later."
            )
            
        return analysis

    except Exception as e:
        logger.error(f"Router error in LinkedIn analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
