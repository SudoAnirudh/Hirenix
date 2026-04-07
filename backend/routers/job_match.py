import uuid
import asyncio
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from typing import Optional
from dependencies import get_current_user, get_supabase_admin
from services.jd_matcher import match_job_description
from services.job_scraper import scrape_jobs
from services.resume_parser import parse_resume
from services.embedding_engine import compare_texts, get_embedding, cosine_similarity
from services.job_suggester import generate_job_suggestions
from models.analysis import (
    JobMatchRequest,
    JobMatchResponse,
    JobScrapeRequest,
    JobScrapeResponse,
    JobSuggestionResponse,
)
from utils.pdf_extractor import extract_pdf_text

router = APIRouter()

@router.post("/match-job", response_model=JobMatchResponse)
async def match_job(
    payload: JobMatchRequest,
    user: dict = Depends(get_current_user),
    db=Depends(get_supabase_admin),
):
    """Compare a resume against a job description and return match score + skill gaps."""
    # Fetch resume text
    actual_resume_id = payload.resume_id
    if payload.resume_id == "default":
        r = (
            db.table("resumes")
            .select("id, raw_text")
            .eq("user_id", user["user_id"])
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        if not r.data:
            raise HTTPException(status_code=404, detail="No resumes found for this user.")
        resume_text = r.data[0]["raw_text"]
        actual_resume_id = r.data[0]["id"]
    else:
        r = (
            db.table("resumes")
            .select("raw_text")
            .eq("id", payload.resume_id)
            .eq("user_id", user["user_id"])
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
            "resume_id": actual_resume_id,
            "user_id": user["user_id"],
            "target_role": payload.target_role or "Role",
            "jd_text": payload.jd_text[:3000],
            "match_score": result.match_score,
            "semantic_similarity": result.semantic_similarity,
            "skill_gap": result.skill_gap.model_dump(),
            "recommendations": result.recommendations,
            "metadata": {
                "technical_score": result.technical_score,
                "experience_score": result.experience_score,
                "soft_skills_score": result.soft_skills_score,
                "keyword_heatmap": result.keyword_heatmap,
                "bridge_advice": result.bridge_advice
            }
        }
    ).execute()

    # Note: Returning JobMatchResponse directly
    return result.model_copy(update={"match_id": match_id, "resume_id": payload.resume_id})

@router.post("/match-job-upload", response_model=JobMatchResponse)
async def match_job_upload(
    resume_file: UploadFile = File(...),
    jd_text: Optional[str] = Form(None),
    target_role: Optional[str] = Form(None),
    jd_file: Optional[UploadFile] = File(None),
    user: dict = Depends(get_current_user),
    db=Depends(get_supabase_admin),
):
    """Compare an uploaded resume (PDF) against job description (text or file) and return match results."""
    # 1. Parse Resume
    resume_content = await resume_file.read()
    if not resume_file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Resume must be a PDF.")
    
    _, resume_text = parse_resume(resume_content)
    if not resume_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from resume.")

    # 2. Extract JD Text
    final_jd_text = jd_text or ""
    if jd_file:
         jd_content = await jd_file.read()
         if jd_file.filename.lower().endswith(".pdf"):
             final_jd_text = extract_pdf_text(jd_content)
         else:
             final_jd_text = jd_content.decode("utf-8", errors="ignore")
    
    if not final_jd_text.strip():
        raise HTTPException(status_code=400, detail="Job description text or file is required.")

    # 3. Match
    result = await match_job_description(
        resume_text, final_jd_text, target_role
    )

    match_id = str(uuid.uuid4())
    # Save the match (optional link to resume_id="upload")
    db.table("job_matches").insert(
        {
            "id": match_id,
            "resume_id": None, # Nullable UUID to support direct upload
            "user_id": user["user_id"],
            "target_role": target_role or "Role",
            "jd_text": final_jd_text[:3000],
            "match_score": result.match_score,
            "semantic_similarity": result.semantic_similarity,
            "skill_gap": result.skill_gap.model_dump(),
            "recommendations": result.recommendations,
            "metadata": {
                "technical_score": result.technical_score,
                "experience_score": result.experience_score,
                "soft_skills_score": result.soft_skills_score,
                "keyword_heatmap": result.keyword_heatmap,
                "bridge_advice": result.bridge_advice
            }
        }
    ).execute()

    return result.model_copy(update={"match_id": match_id, "resume_id": "upload"})

@router.post("/scrape-jobs", response_model=JobScrapeResponse)
async def scrape_jobs_for_fields(
    payload: JobScrapeRequest,
    user: dict = Depends(get_current_user),
    db=Depends(get_supabase_admin),
):
    """Scrape job listings and automatically calculate a 'Quick Match' score against the user's latest resume."""
    fields = [f.strip() for f in payload.fields if f and f.strip()]
    if not fields:
        raise HTTPException(status_code=400, detail="At least one field is required.")

    # 1. Scrape jobs
    limit = max(1, min(payload.limit, 50))
    jobs = await scrape_jobs(fields, payload.location, payload.remote_only, limit)
    
    # 2. Fetch user's latest resume for auto-matching
    r = (
        db.table("resumes")
        .select("raw_text")
        .eq("user_id", user["user_id"])
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    
    if r.data:
        resume_text = r.data[0]["raw_text"]
        
        # Pre-compute the resume embedding once to avoid redundant O(N) remote or local API calls
        # ⚡ Bolt: Reduces job matching latency by avoiding N+1 embedding calculations
        resume_emb = await get_embedding(resume_text)

        # 3. Quick Match injection (Semantic Only for speed during browse)
        async def _score_job(job):
            # Job description snippet is used for speed
            job_emb = await get_embedding(job.description_snippet)
            if resume_emb is not None and job_emb is not None:
                score = cosine_similarity(resume_emb, job_emb)
            else:
                score = await compare_texts(resume_text, job.description_snippet)

            job.match_score = round(score * 100, 1)
            # Generate a unique ID if missing
            if not job.id:
                job.id = str(uuid.uuid5(uuid.NAMESPACE_URL, job.apply_url))
            return job

        scored_jobs = await asyncio.gather(*[_score_job(j) for j in jobs])
        jobs = scored_jobs

    query = " ".join(fields + ([payload.location.strip()] if payload.location else []))
    return JobScrapeResponse(query=query, total=len(jobs), jobs=jobs)

@router.get("/suggestions", response_model=JobSuggestionResponse)
async def get_suggestions(
    limit: int = 6,
    user: dict = Depends(get_current_user),
    db=Depends(get_supabase_admin),
):
    """Generate personalized job suggestions based on user readiness and progress."""
    return await generate_job_suggestions(user["user_id"], db, limit)
