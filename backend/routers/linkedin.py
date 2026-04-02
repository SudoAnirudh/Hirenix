from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from models.linkedin import LinkedInAnalysisResponse
from services.linkedin_analyzer import analyze_linkedin_profile
from dependencies import get_current_user, get_supabase_admin
import logging

router = APIRouter(tags=["LinkedIn Analytics"])
logger = logging.getLogger("hirenix.routers.linkedin")

@router.post("/analyze", response_model=LinkedInAnalysisResponse)
async def analyze_linkedin(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db=Depends(get_supabase_admin)
):
    """
    Analyzes a LinkedIn profile PDF export and persists results.
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

        # Persist to database
        try:
            # Map analysis response to database schema
            # Strengths: sections with high scores
            strengths = []
            if analysis.headline.score >= 80: strengths.append("Strong Headline")
            if analysis.about.score >= 80: strengths.append("Engaging About/Bio")
            if analysis.experience.score >= 80: strengths.append("Impactful Experience")
            if analysis.skills.score >= 80: strengths.append("Well-Structured Skills")

            metrics = {
                "overall_score": analysis.overall_score,
                "completeness": analysis.completeness_score,
                "headline_score": analysis.headline.score,
                "about_score": analysis.about.score,
                "experience_score": analysis.experience.score,
                "skills_score": analysis.skills.score
            }

            db.table("linkedin_analyses").insert({
                "user_id": current_user["user_id"],
                "linkedin_url": "PDF Upload", # Analysis from PDF, URL not directly available
                "profile_summary": analysis.about.improved,
                "metrics": metrics,
                "strengths": strengths,
                "recommendations": analysis.general_tips,
                "raw_data": analysis.model_dump() # Save full structure
            }).execute()
            
            logger.info(f"LinkedIn analysis persisted for user {current_user['user_id']}")
        except Exception as db_err:
            logger.error(f"Failed to persist LinkedIn analysis: {str(db_err)}")
            # We don't fail the request if persistence fails, just log it
            
        return analysis

    except Exception as e:
        logger.error(f"Router error in LinkedIn analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
