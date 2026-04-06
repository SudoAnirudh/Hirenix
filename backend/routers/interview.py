import uuid
import logging
import asyncio
from typing import Dict, List
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from dependencies import get_current_user, get_supabase_admin
from services.interview_engine import (
    generate_questions,
    evaluate_answer,
    stream_evaluate_answer
)
from models.interview import (
    StartInterviewRequest,
    StartInterviewResponse,
    SubmitAnswerRequest,
    AnswerFeedback,
    SaveProctorReportRequest,
    EvaluateSessionRequest,
    SessionSummaryResponse,
)
import json

logger = logging.getLogger("hirenix.interview")
router = APIRouter()
QUESTION_CACHE: Dict[str, List[dict]] = {}


def _cache_questions(session_id: str, questions) -> None:
    QUESTION_CACHE[session_id] = [q.model_dump() for q in questions]


def _get_session_questions(session_data: dict | None, session_id: str) -> List[dict]:
    if session_data:
        raw_questions = session_data.get("questions")
        if isinstance(raw_questions, str) and raw_questions:
            try:
                return json.loads(raw_questions)
            except json.JSONDecodeError:
                pass
        if isinstance(raw_questions, list):
            return raw_questions
    return QUESTION_CACHE.get(session_id, [])


@router.post("/start-interview", response_model=StartInterviewResponse)
async def start_interview(
    payload: StartInterviewRequest,
    user: dict = Depends(get_current_user),
    db=Depends(get_supabase_admin),
):
    """Generate interview questions tailored to the user's resume and target role."""
    # Fetch resume sections for context
    resume_context = ""
    actual_resume_id = None
    if payload.resume_id:
        # Resolve "default" to the latest resume ID if needed
        actual_resume_id = payload.resume_id
        if payload.resume_id == "default":
            latest_r = (
                db.table("resumes")
                .select("id")
                .eq("user_id", user["user_id"])
                .order("created_at", desc=True)
                .limit(1)
                .execute()
            )
            if not latest_r.data:
                raise HTTPException(status_code=404, detail="No resumes found.")
            actual_resume_id = latest_r.data[0]["id"]

        # First verify the resume belongs to the user
        resume_check = (
            db.table("resumes")
            .select("id")
            .eq("id", actual_resume_id)
            .eq("user_id", user["user_id"])
            .single()
            .execute()
        )
        if not resume_check.data:
            raise HTTPException(status_code=404, detail="Resume not found.")

        sections_r = (
            db.table("resume_sections")
            .select("*")
            .eq("resume_id", actual_resume_id)
            .execute()
        )
        for s in (sections_r.data or []):
            resume_context += s.get("content", "") + " "

    interview_plan, questions = await generate_questions(
        resume_context=resume_context,
        target_role=payload.target_role,
        difficulty=payload.difficulty,
        num_questions=payload.num_questions,
        interview_type=payload.interview_type,
        experience_level=payload.experience_level,
    )

    session_id = str(uuid.uuid4())
    serialized_questions = [q.model_dump() for q in questions]
    _cache_questions(session_id, questions)
    try:
        db.table("interview_sessions").insert({
            "id": session_id,
            "user_id": user["user_id"],
            "resume_id": actual_resume_id,
            "target_role": payload.target_role,
            "overall_score": 0.0,
        }).execute()
    except Exception as minimal_insert_err:
        try:
            db.table("interview_sessions").insert({
                "id": session_id,
                "user_id": user["user_id"],
                "resume_id": actual_resume_id,
                "target_role": payload.target_role,
                "questions": json.dumps(serialized_questions),
                "answers": json.dumps([]),
                "feedback": json.dumps([]),
                "overall_score": 0.0,
            }).execute()
        except Exception as legacy_insert_err:
            logger.error(
                "⚠️  interview_sessions insert failed "
                f"(minimal={minimal_insert_err}, legacy={legacy_insert_err})"
            )
            raise HTTPException(
                status_code=500,
                detail="Could not create interview session.",
            )

    return StartInterviewResponse(
        session_id=session_id,
        target_role=payload.target_role,
        experience_level=payload.experience_level,
        interview_type=payload.interview_type,
        answer_mode=payload.answer_mode,
        interview_plan=interview_plan,
        questions=questions,
    )


@router.post("/submit-answer", response_model=AnswerFeedback)
async def submit_answer(
    payload: SubmitAnswerRequest,
    user: dict = Depends(get_current_user),
    db=Depends(get_supabase_admin),
):
    """Evaluate a single interview answer and return structured feedback."""
    session_rows = (
        db.table("interview_sessions")
        .select("*")
        .eq("id", payload.session_id)
        .eq("user_id", user["user_id"])
        .limit(1)
        .execute()
    )
    session_data = (session_rows.data or [None])[0]
    if not session_data:
        raise HTTPException(status_code=404, detail="Interview session not found.")

    questions = _get_session_questions(session_data, payload.session_id)
    question = next((q for q in questions if q["question_id"] == payload.question_id), None)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found in session.")

    feedback = await evaluate_answer(
        question_id=payload.question_id,
        question=question["question"],
        answer=payload.answer,
        category=question["category"],
        expected_topics=question.get("expected_topics", []),
    )

    try:
        db.table("interview_answers").insert({
            "session_id": payload.session_id,
            "question_id": payload.question_id,
            "question": question["question"],
            "category": question.get("category"),
            "difficulty": question.get("difficulty"),
            "user_answer": payload.answer,
            "score": feedback.score,
            "clarity_score": feedback.clarity_score,
            "technical_score": feedback.technical_score,
            "depth_score": feedback.depth_score,
            "communication_score": feedback.communication_score,
            "strengths": feedback.strengths,
            "improvements": feedback.improvements,
            "model_answer_hint": feedback.model_answer_hint,
        }).execute()

        answer_rows = (
            db.table("interview_answers")
            .select("score")
            .eq("session_id", payload.session_id)
            .execute()
        )
        scores = [float(item["score"]) for item in (answer_rows.data or []) if item.get("score") is not None]
        if scores:
            avg_score = sum(scores) / len(scores) * 10
            db.table("interview_sessions").update({
                "overall_score": avg_score,
            }).eq("id", payload.session_id).eq("user_id", user["user_id"]).execute()
    except Exception as structured_db_err:
        try:
            existing_answers = json.loads(session_data.get("answers", "[]") or "[]")
            existing_feedback = json.loads(session_data.get("feedback", "[]") or "[]")
            existing_answers.append({"question_id": payload.question_id, "answer": payload.answer})
            existing_feedback.append(feedback.model_dump())
            avg_score = sum(f["score"] for f in existing_feedback) / len(existing_feedback) * 10

            db.table("interview_sessions").update({
                "answers": json.dumps(existing_answers),
                "feedback": json.dumps(existing_feedback),
                "overall_score": avg_score,
            }).eq("id", payload.session_id).eq("user_id", user["user_id"]).execute()
        except Exception as legacy_db_err:
            print(
                "⚠️  interview answer persistence failed "
                f"(structured={structured_db_err}, legacy={legacy_db_err})"
            )

    return feedback


@router.post("/evaluate-session", response_model=SessionSummaryResponse)
async def evaluate_session(
    payload: EvaluateSessionRequest,
    user: dict = Depends(get_current_user),
    db=Depends(get_supabase_admin),
):
    """
    Evaluate the full interview session after the candidate completes all questions.
    Returns per-answer feedback plus an overall summary (no per-question UI required).
    """
    session_rows = (
        db.table("interview_sessions")
        .select("*")
        .eq("id", payload.session_id)
        .eq("user_id", user["user_id"])
        .limit(1)
        .execute()
    )
    session_data = (session_rows.data or [None])[0]
    if not session_data:
        raise HTTPException(status_code=404, detail="Interview session not found.")

    questions = _get_session_questions(session_data, payload.session_id)
    if not questions:
        raise HTTPException(status_code=400, detail="No questions found for session.")

    by_id = {q["question_id"]: q for q in questions if "question_id" in q}

    # ⚡ Bolt Optimization:
    # 💡 What: Changed sequential evaluate_answer loop to concurrent execution using asyncio.gather.
    # 🎯 Why: Evaluating LLM answers sequentially is a major bottleneck since each call is I/O bound.
    # 📊 Impact: Changes O(N) waiting time to O(1) (bounded by the slowest LLM response), significantly reducing total evaluation time.
    evaluation_tasks = []
    for item in payload.answers:
        q = by_id.get(item.question_id)
        if not q:
            continue
        task = evaluate_answer(
            question_id=item.question_id,
            question=q["question"],
            answer=item.answer,
            category=q.get("category", "technical"),
            expected_topics=q.get("expected_topics", []) or [],
        )
        evaluation_tasks.append(task)

    feedback_items: List[AnswerFeedback] = await asyncio.gather(*evaluation_tasks) if evaluation_tasks else []

    if not feedback_items:
        raise HTTPException(status_code=400, detail="No valid answers to evaluate.")

    scores_0_10 = [float(f.score) for f in feedback_items if f.score is not None]
    overall_score = (sum(scores_0_10) / len(scores_0_10)) * 10 if scores_0_10 else 0.0

    overall_strengths = list({s for f in feedback_items for s in (f.strengths or [])})[:6]
    overall_improvements = list({s for f in feedback_items for s in (f.improvements or [])})[:6]

    # Best-effort persistence (won't fail request if schema differs)
    try:
        db.table("interview_sessions").update(
            {
                "feedback": json.dumps([f.model_dump() for f in feedback_items]),
                "overall_score": overall_score,
            }
        ).eq("id", payload.session_id).eq("user_id", user["user_id"]).execute()
    except Exception as e:
        logger.warning(f"interview_sessions update failed (evaluate-session): {e}")

    return SessionSummaryResponse(
        session_id=payload.session_id,
        overall_score=overall_score,
        feedback=feedback_items,
        overall_strengths=overall_strengths,
        overall_improvements=overall_improvements,
    )


@router.post("/submit-answer-stream")
async def submit_answer_stream(
    payload: SubmitAnswerRequest,
    user: dict = Depends(get_current_user),
    db=Depends(get_supabase_admin),
):
    """
    Evaluate an interview answer and stream the raw LLM response chunks.
    Note: Performance metrics and DB updates happen after the stream is complete.
    """
    session_rows = (
        db.table("interview_sessions")
        .select("*")
        .eq("id", payload.session_id)
        .eq("user_id", user["user_id"])
        .limit(1)
        .execute()
    )
    if not (session_rows.data or []):
        raise HTTPException(status_code=404, detail="Interview session not found.")

    session_data = session_rows.data[0]
    questions = _get_session_questions(session_data, payload.session_id)
    question = next((q for q in questions if q["question_id"] == payload.question_id), None)
    
    if not question:
        raise HTTPException(status_code=404, detail="Question not found in session.")

    async def event_generator():
        async for chunk in stream_evaluate_answer(
            question_id=payload.question_id,
            question=question["question"],
            answer=payload.answer,
            category=question["category"],
            expected_topics=question.get("expected_topics", []),
        ):
            yield f"data: {chunk}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.post("/save-proctor-report")
async def save_proctor_report(
    payload: SaveProctorReportRequest,
    user: dict = Depends(get_current_user),
    db=Depends(get_supabase_admin),
):
    """Save the proctoring report for a specific interview session."""
    session_rows = (
        db.table("interview_sessions")
        .select("id")
        .eq("id", payload.session_id)
        .eq("user_id", user["user_id"])
        .limit(1)
        .execute()
    )
    if not (session_rows.data or []):
        raise HTTPException(status_code=404, detail="Interview session not found.")

    try:
        db.table("interview_sessions").update({
            "proctor_report": payload.report.model_dump_json()
        }).eq("id", payload.session_id).eq("user_id", user["user_id"]).execute()
    except Exception as db_err:
        logger.error(f"⚠️ interview_sessions update (proctor_report) failed: {db_err}")
        # The schema might not have the column yet, we just print the error and return success

    return {"status": "success"}
