import uuid
import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from dependencies import get_current_user, get_supabase_admin
from services.groq_client import invoke_groq_llm
from services.doc_generator import generate_pdf, generate_docx
from models.analysis import CoverLetterRequest, CoverLetterResponse

router = APIRouter()

@router.post("/generate", response_model=CoverLetterResponse)
async def generate_cover_letter(
    payload: CoverLetterRequest,
    user: dict = Depends(get_current_user),
    db=Depends(get_supabase_admin),
):
    """Generates a tailored cover letter using the user's resume and job description."""
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
    
    prompt = f"""
    You are an expert Career Strategist. Write a highly persuasive, 3-4 paragraph cover letter.
    Resume: {resume_text[:2000]}
    Job Description: {payload.jd_text[:2000]}
    Tone: {payload.tone}
    Target Role: {payload.target_role or 'the specified role'}

    Formatting requirements:
    - Address it to "Hiring Manager" if no name is provided.
    - Focus on tangible achievements and how they solve the company's problems.
    - End with a strong call to action.
    - Do NOT include placeholders like [Your Name] or [Date] in the final content; 
      Start directly with "Dear Hiring Manager," and end with "Sincerely," as the generator will add headers.
    """

    messages = [{"role": "user", "content": prompt}]
    result = await invoke_groq_llm(messages, temperature=0.7)
    
    if not result:
        raise HTTPException(status_code=500, detail="Failed to generate cover letter.")

    content = result["choices"][0]["message"]["content"]
    
    # Save to database
    letter_id = str(uuid.uuid4())
    db.table("cover_letters").insert({
        "id": letter_id,
        "user_id": user["user_id"],
        "resume_id": actual_resume_id,
        "target_role": payload.target_role or "Unknown",
        "content": content,
        "tone": payload.tone
    }).execute()

    return CoverLetterResponse(
        id=letter_id,
        content=content,
        resume_id=payload.resume_id,
        target_role=payload.target_role or "Unknown"
    )

@router.get("/export/{letter_id}")
async def export_cover_letter(
    letter_id: str,
    format: str = Query(..., regex="^(pdf|docx)$"),
    user: dict = Depends(get_current_user),
    db=Depends(get_supabase_admin),
):
    """Exports a cover letter as PDF or Docx."""
    r = (
        db.table("cover_letters")
        .select("*")
        .eq("id", letter_id)
        .eq("user_id", user["user_id"])
        .single()
        .execute()
    )
    if not r.data:
        raise HTTPException(status_code=404, detail="Cover letter not found.")

    # Fetch user profile for headers
    p = (
        db.table("profiles")
        .select("full_name")
        .eq("id", user["user_id"])
        .single()
        .execute()
    )
    
    header_info = {
        "name": p.data.get("full_name", "Valued User"),
        "email": user.get("email", ""),
        "date": datetime.date.today().strftime("%B %d, %Y"),
        "location": "Global", # Can be updated if profile has location
        "phone": ""
    }

    if format == "pdf":
        file_bytes = generate_pdf(r.data["content"], header_info)
        return Response(
            content=file_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=cover_letter_{letter_id}.pdf"}
        )
    else:
        file_bytes = generate_docx(r.data["content"], header_info)
        return Response(
            content=file_bytes,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f"attachment; filename=cover_letter_{letter_id}.docx"}
        )
