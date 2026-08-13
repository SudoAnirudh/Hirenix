from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime


class ResumeSection(BaseModel):
    section_type: str  # education, experience, skills, projects, certifications
    content: str


class ParsedBulletPoint(BaseModel):
    content: str
    action_verb: Optional[str] = ""
    metric: Optional[str] = ""
    impact: Optional[str] = ""
    xyz_score: float = 0.0


class ParsedExperience(BaseModel):
    title: str = ""
    company: Optional[str] = ""
    start_date: Optional[str] = ""
    end_date: Optional[str] = ""
    is_current: bool = False
    bullets: List[ParsedBulletPoint] = Field(default_factory=list)
    recency_decay_factor: float = 1.0


class ParsedResumeSchema(BaseModel):
    summary: Optional[str] = ""
    skills: List[str] = Field(default_factory=list)
    experiences: List[ParsedExperience] = Field(default_factory=list)
    education: List[str] = Field(default_factory=list)
    projects: List[str] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)


class BulletRewrite(BaseModel):
    original_bullet: str
    rewritten_bullet: str
    explanation: str


class ResumeUploadResponse(BaseModel):
    resume_id: str
    user_id: str
    file_url: str
    raw_text_preview: str
    sections: List[ResumeSection]
    ats_score: float
    ats_breakdown: Dict[str, float]
    feedback: List[str]
    created_at: datetime
    xyz_score: float = 0.0
    multi_aspect_scores: Dict[str, float] = Field(default_factory=dict)
    gap_analysis: List[str] = Field(default_factory=list)
    synthetic_bullet_rewrites: List[BulletRewrite] = Field(default_factory=list)


class ResumeGetResponse(BaseModel):
    resume_id: str
    file_url: str
    ats_score: float
    ats_breakdown: Dict[str, float]
    sections: List[ResumeSection]
    feedback: List[str]
    created_at: datetime
    xyz_score: float = 0.0
    multi_aspect_scores: Dict[str, float] = Field(default_factory=dict)
    gap_analysis: List[str] = Field(default_factory=list)
    synthetic_bullet_rewrites: List[BulletRewrite] = Field(default_factory=list)

