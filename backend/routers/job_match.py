import uuid
from fastapi import APIRouter, Depends, HTTPException
from dependencies import get_current_user, get_supabase_admin
from services.jd_matcher import match_job_description
from models.analysis import JobMatchRequest, JobMatchResponse

router = APIRouter()


@router.post("/match-job", response_model=JobMatchResponse)
async def match_job(
    payload: JobMatchRequest,
    user: dict = Depends(get_current_user),
    db=Depends(get_supabase_admin),
):
    """Compare a resume against a job description and return match score + skill gaps."""
    # Fetch resume text
    r = db.table("resumes").select("raw_text").eq("id", payload.resume_id).single().execute()
    if not r.data:
        raise HTTPException(status_code=404, detail="Resume not found.")

    resume_text = r.data["raw_text"]
    result = await match_job_description(resume_text, payload.jd_text, payload.target_role)

    match_id = str(uuid.uuid4())
    db.table("job_matches").insert({
        "id": match_id,
        "resume_id": payload.resume_id,
        "user_id": user["user_id"],
        "target_role": payload.target_role,
        "jd_text": payload.jd_text[:2000],
        "match_score": result.match_score,
        "skill_gap": {
            "missing": result.skill_gap.mandatory_missing + result.skill_gap.competitive_missing
        },
    }).execute()

    return JobMatchResponse(match_id=match_id, resume_id=payload.resume_id, **result.model_dump(exclude={"match_id", "resume_id"}))
