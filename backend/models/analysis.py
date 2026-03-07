from pydantic import BaseModel
from typing import List, Optional


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
    semantic_similarity: float  # cosine similarity
    skill_gap: SkillGapResult
    recommendations: List[str]


class JobScrapeRequest(BaseModel):
    fields: List[str]
    location: Optional[str] = None
    remote_only: bool = False
    limit: int = 20


class JobListing(BaseModel):
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


class JobScrapeResponse(BaseModel):
    query: str
    total: int
    jobs: List[JobListing]
