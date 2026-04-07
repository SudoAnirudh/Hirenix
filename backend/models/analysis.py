from pydantic import BaseModel
from typing import List, Optional, Dict


class JobMatchRequest(BaseModel):
    resume_id: str
    jd_text: str
    target_role: Optional[str] = None


class SkillGapResult(BaseModel):
    mandatory_missing: List[str]
    competitive_missing: List[str]
    matched_skills: List[str]


class JobMatchResponse(BaseModel):
    match_id: str
    resume_id: str
    match_score: float  # 0–100
    technical_score: float
    experience_score: float
    soft_skills_score: float
    semantic_similarity: float
    fit_verdict: str
    pros: List[str]
    cons: List[str]
    skill_gap: SkillGapResult
    keyword_heatmap: Dict[str, str]  # skill -> "matched" | "missing" | "partial"
    recommendations: List[str]
    bridge_advice: List[str]


class JobScrapeRequest(BaseModel):
    fields: List[str]
    location: Optional[str] = None
    remote_only: bool = False
    limit: int = 20


class JobListing(BaseModel):
    id: Optional[str] = None
    title: str
    company: str
    location: str
    remote: bool
    job_type: str
    tags: List[str]
    apply_url: str
    source: str
    posted_at: str
    description_snippet: str
    match_score: Optional[float] = None


class JobScrapeResponse(BaseModel):
    query: str
    total: int
    jobs: List[JobListing]


class CoverLetterRequest(BaseModel):
    resume_id: str
    jd_text: str
    target_role: Optional[str] = None
    tone: str = "Professional"  # Professional, Creative, Persuasive


class CoverLetterResponse(BaseModel):
    id: str
    content: str  # Markdown/Plaintext
    resume_id: str
    target_role: str

class JobSuggestionRequest(BaseModel):
    limit: int = 6


class SuggestedJob(BaseModel):
    id: str
    title: str
    company: str
    location: str
    remote: bool
    job_type: str
    tags: List[str]
    apply_url: str
    source: str
    posted_at: str
    description_snippet: str
    match_score: float
    reason: str
    alignment_score: float # How well it matches user progress


class JobSuggestionResponse(BaseModel):
    user_id: str
    suggestions: List[SuggestedJob]
    evolution_score: float
    readiness_summary: str


class OutreachDraftsRequest(BaseModel):
    match_id: str
    tone: str = "Formal"


class OutreachDraftsResponse(BaseModel):
    match_id: str
    linkedin_request: str
    cold_email: str
    company_name: Optional[str] = None
