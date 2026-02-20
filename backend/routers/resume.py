import uuid
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from dependencies import get_current_user, get_supabase_admin
from services.resume_parser import parse_resume
from services.ats_scorer import compute_ats_score
from models.resume import ResumeUploadResponse, ResumeGetResponse
from datetime import datetime, timezone

router = APIRouter()


@router.post("/upload-resume", response_model=ResumeUploadResponse)
async def upload_resume(
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
    db=Depends(get_supabase_admin),
):
    """Upload a PDF resume, parse it, score it, and store results."""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    content = await file.read()
    resume_id = str(uuid.uuid4())

    # Upload raw file to Supabase Storage
    storage_path = f"resumes/{user['user_id']}/{resume_id}.pdf"
    db.storage.from_("resumes").upload(storage_path, content, {"content-type": "application/pdf"})
    file_url = db.storage.from_("resumes").get_public_url(storage_path)

    # Parse resume
    sections, raw_text = parse_resume(content)

    # ATS scoring
    ats_score, ats_breakdown, feedback = compute_ats_score(sections, raw_text)

    # Persist to DB
    now = datetime.now(timezone.utc)
    db.table("resumes").insert({
        "id": resume_id,
        "user_id": user["user_id"],
        "file_name": file.filename,
        "file_url": file_url,
        "raw_text": raw_text,
        "ats_score": ats_score,
        "created_at": now.isoformat(),
    }).execute()

    for section in sections:
        db.table("resume_sections").insert({
            "id": str(uuid.uuid4()),
            "resume_id": resume_id,
            "section_type": section.section_type,
            "content": section.content,
        }).execute()

    return ResumeUploadResponse(
        resume_id=resume_id,
        user_id=user["user_id"],
        file_url=file_url,
        raw_text_preview=raw_text[:500],
        sections=sections,
        ats_score=ats_score,
        ats_breakdown=ats_breakdown,
        feedback=feedback,
        created_at=now,
    )


@router.get("/{resume_id}", response_model=ResumeGetResponse)
async def get_resume(
    resume_id: str,
    user: dict = Depends(get_current_user),
    db=Depends(get_supabase_admin),
):
    """Fetch a previously analyzed resume by ID."""
    r = db.table("resumes").select("*").eq("id", resume_id).eq("user_id", user["user_id"]).single().execute()
    if not r.data:
        raise HTTPException(status_code=404, detail="Resume not found.")
    sections_r = db.table("resume_sections").select("*").eq("resume_id", resume_id).execute()
    from models.resume import ResumeSection
    sections = [ResumeSection(section_type=s["section_type"], content=s["content"]) for s in (sections_r.data or [])]
    return ResumeGetResponse(
        resume_id=resume_id,
        file_url=r.data["file_url"],
        ats_score=r.data["ats_score"],
        ats_breakdown={},
        sections=sections,
        feedback=[],
        created_at=r.data["created_at"],
    )
