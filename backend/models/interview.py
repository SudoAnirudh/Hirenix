from pydantic import BaseModel, Field
from typing import List, Optional


class StartInterviewRequest(BaseModel):
    resume_id: Optional[str] = None
    target_role: str
    experience_level: str = "junior"  # junior | mid | senior
    interview_type: str = "mixed"  # technical | behavioral | system_design | mixed
    difficulty: str = "medium"  # easy | medium | hard
    num_questions: int = 5
    answer_mode: str = "text"  # text | voice | video
    proctoring_enabled: bool = False


class InterviewQuestion(BaseModel):
    question_id: str
    question: str
    category: str  # technical | behavioral | situational
    difficulty: str
    expected_topics: List[str] = Field(default_factory=list)
    follow_up_prompt: Optional[str] = None


class InterviewPlan(BaseModel):
    role: str
    experience_level: str
    interview_type: str
    difficulty: str
    num_questions: int
    technical: int = 0
    behavioral: int = 0
    system_design: int = 0


class StartInterviewResponse(BaseModel):
    session_id: str
    target_role: str
    experience_level: str
    interview_type: str
    answer_mode: str
    interview_plan: InterviewPlan
    questions: List[InterviewQuestion]


class SubmitAnswerRequest(BaseModel):
    session_id: str
    question_id: str
    answer: str


class SessionAnswer(BaseModel):
    question_id: str
    answer: str


class EvaluateSessionRequest(BaseModel):
    session_id: str
    answers: List[SessionAnswer]


class AnswerFeedback(BaseModel):
    model_config = {"protected_namespaces": ()}

    question_id: str
    score: float  # 0–10
    overall_score: float
    clarity_score: float
    technical_score: float
    depth_score: float
    communication_score: float
    problem_solving_score: float
    strengths: List[str]
    improvements: List[str]
    model_answer_hint: str
    model_answer: str
    coaching_tip: str


class SessionSummaryResponse(BaseModel):
    session_id: str
    overall_score: float  # 0–100
    feedback: List[AnswerFeedback]
    overall_strengths: List[str]
    overall_improvements: List[str]

class Violation(BaseModel):
    type: str
    timestamp: int
    label: str

class ProctorReport(BaseModel):
    trustScore: float
    violations: List[Violation]
    elapsed: int
    cameraStatus: str
    faceStatus: str
    fullscreenActive: bool
    sessionRisk: str

class SaveProctorReportRequest(BaseModel):
    session_id: str
    report: ProctorReport
