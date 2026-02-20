import uuid
from fastapi import APIRouter, Depends, HTTPException
from dependencies import get_current_user, get_supabase_admin
from services.interview_engine import generate_questions, evaluate_answer
from models.interview import (
    StartInterviewRequest,
    StartInterviewResponse,
    SubmitAnswerRequest,
    AnswerFeedback,
    SessionSummaryResponse,
)
import json

router = APIRouter()


@router.post("/start-interview", response_model=StartInterviewResponse)
async def start_interview(
    payload: StartInterviewRequest,
    user: dict = Depends(get_current_user),
    db=Depends(get_supabase_admin),
):
    """Generate interview questions tailored to the user's resume and target role."""
    # Fetch resume sections for context
    sections_r = db.table("resume_sections").select("*").eq("resume_id", payload.resume_id).execute()
    resume_context = " ".join([s["content"] for s in (sections_r.data or [])])

    questions = await generate_questions(
        resume_context=resume_context,
        target_role=payload.target_role,
        difficulty=payload.difficulty,
        num_questions=payload.num_questions,
    )

    session_id = str(uuid.uuid4())
    db.table("interview_sessions").insert({
        "id": session_id,
        "user_id": user["user_id"],
        "resume_id": payload.resume_id,
        "target_role": payload.target_role,
        "questions": json.dumps([q.model_dump() for q in questions]),
        "answers": json.dumps([]),
        "feedback": json.dumps([]),
        "overall_score": 0.0,
    }).execute()

    return StartInterviewResponse(session_id=session_id, target_role=payload.target_role, questions=questions)


@router.post("/submit-answer", response_model=AnswerFeedback)
async def submit_answer(
    payload: SubmitAnswerRequest,
    user: dict = Depends(get_current_user),
    db=Depends(get_supabase_admin),
):
    """Evaluate a single interview answer and return structured feedback."""
    session_r = db.table("interview_sessions").select("*").eq("id", payload.session_id).single().execute()
    if not session_r.data:
        raise HTTPException(status_code=404, detail="Interview session not found.")

    questions = json.loads(session_r.data["questions"])
    question = next((q for q in questions if q["question_id"] == payload.question_id), None)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found in session.")

    feedback = await evaluate_answer(
        question=question["question"],
        answer=payload.answer,
        category=question["category"],
    )

    # Append answer + feedback to DB
    existing_answers = json.loads(session_r.data["answers"])
    existing_feedback = json.loads(session_r.data["feedback"])
    existing_answers.append({"question_id": payload.question_id, "answer": payload.answer})
    existing_feedback.append(feedback.model_dump())
    avg_score = sum(f["score"] for f in existing_feedback) / len(existing_feedback) * 10

    db.table("interview_sessions").update({
        "answers": json.dumps(existing_answers),
        "feedback": json.dumps(existing_feedback),
        "overall_score": avg_score,
    }).eq("id", payload.session_id).execute()

    return feedback
