from pydantic import BaseModel
from typing import List, Optional


class StartInterviewRequest(BaseModel):
    resume_id: str
    target_role: str
    difficulty: str = "medium"   # easy | medium | hard
    num_questions: int = 5


class InterviewQuestion(BaseModel):
    question_id: str
    question: str
    category: str                # technical | behavioral | situational
    difficulty: str


class StartInterviewResponse(BaseModel):
    session_id: str
    target_role: str
    questions: List[InterviewQuestion]


class SubmitAnswerRequest(BaseModel):
    session_id: str
    question_id: str
    answer: str


class AnswerFeedback(BaseModel):
    question_id: str
    score: float                 # 0–10
    clarity_score: float
    technical_score: float
    depth_score: float
    communication_score: float
    strengths: List[str]
    improvements: List[str]
    model_answer_hint: str


class SessionSummaryResponse(BaseModel):
    session_id: str
    overall_score: float         # 0–100
    feedback: List[AnswerFeedback]
    overall_strengths: List[str]
    overall_improvements: List[str]
