import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from dependencies import get_current_user, get_supabase_admin
from services.jd_matcher import match_job_description
from services.job_scraper import scrape_jobs
from services.resume_parser import parse_resume
from models.analysis import (
    JobMatchRequest,
    JobMatchResponse,
    JobScrapeRequest,
    JobScrapeResponse,
)
from utils.pdf_extractor import extract_pdf_text
from utils.text_cleaner import clean_text

router = APIRouter()


@router.post("/match-job", response_model=JobMatchResponse)
async def match_job(
    payload: JobMatchRequest,
    user: dict = Depends(get_current_user),
    db=Depends(get_supabase_admin),
):
    """Compare a resume against a job description and return match score + skill gaps."""
    # Fetch resume text
    r = (
        db.table("resumes")
        .select("raw_text")
        .eq("id", payload.resume_id)
        .single()
        .execute()
    )
    if not r.data:
        raise HTTPException(status_code=404, detail="Resume not found.")

    resume_text = r.data["raw_text"]
    result = await match_job_description(
        resume_text, payload.jd_text, payload.target_role
    )

    match_id = str(uuid.uuid4())
    db.table("job_matches").insert(
        {
            "id": match_id,
            "resume_id": payload.resume_id,
            "user_id": user["user_id"],
            "target_role": payload.target_role,
            "jd_text": payload.jd_text[:2000],
            "match_score": result.match_score,
            "skill_gap": {
                "missing": result.skill_gap.mandatory_missing
                + result.skill_gap.competitive_missing
            },
        }
    ).execute()

    return JobMatchResponse(
        match_id=match_id,
        resume_id=payload.resume_id,
        **result.model_dump(exclude={"match_id", "resume_id"})
    )


@router.post("/match-job-upload", response_model=JobMatchResponse)
async def match_job_upload(
    resume_file: UploadFile = File(...),
    jd_text: str | None = Form(default=None),
    jd_file: UploadFile | None = File(default=None),
    target_role: str | None = Form(default=None),
    user: dict = Depends(get_current_user),
):
    """Compare uploaded resume and uploaded/pasted job description."""
    if not resume_file.filename or not resume_file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Resume must be a PDF file.")

    resume_content = await resume_file.read()
    _, resume_text = parse_resume(resume_content)
    if len(resume_text.strip()) < 40:
        raise HTTPException(
            status_code=422,
            detail="Could not extract readable text from the resume PDF.",
        )

    effective_jd_text = (jd_text or "").strip()
    if jd_file is not None:
        if not jd_file.filename:
            raise HTTPException(status_code=400, detail="Job description file is invalid.")
        jd_content = await jd_file.read()
        lowered = jd_file.filename.lower()
        if lowered.endswith(".pdf"):
            effective_jd_text = clean_text(extract_pdf_text(jd_content))
        elif lowered.endswith(".txt") or lowered.endswith(".md"):
            effective_jd_text = clean_text(jd_content.decode("utf-8", errors="ignore"))
        else:
            raise HTTPException(
                status_code=400,
                detail="Job description file must be PDF, TXT, or MD.",
            )

    if len(effective_jd_text) < 40:
        raise HTTPException(
            status_code=422,
            detail="Provide a valid job description (paste text or upload JD file).",
        )

    result = await match_job_description(resume_text, effective_jd_text, target_role)
    match_id = str(uuid.uuid4())
    return JobMatchResponse(
        match_id=match_id,
        resume_id=f"uploaded:{user['user_id']}",
        **result.model_dump(exclude={"match_id", "resume_id"})
    )


@router.post("/scrape-jobs", response_model=JobScrapeResponse)
async def scrape_jobs_for_fields(
    payload: JobScrapeRequest,
    user: dict = Depends(get_current_user),
):
    """Scrape job listings for user-specified fields and return apply links + details."""
    fields = [f.strip() for f in payload.fields if f and f.strip()]
    if not fields:
        raise HTTPException(status_code=400, detail="At least one field is required.")

    limit = max(1, min(payload.limit, 50))
    jobs = await scrape_jobs(fields, payload.location, payload.remote_only, limit)
    query = " ".join(fields + ([payload.location.strip()] if payload.location else []))
    return JobScrapeResponse(query=query, total=len(jobs), jobs=jobs)
