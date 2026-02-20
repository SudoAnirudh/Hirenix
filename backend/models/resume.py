from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class ResumeSection(BaseModel):
    section_type: str  # education, experience, skills, projects, certifications
    content: str


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


class ResumeGetResponse(BaseModel):
    resume_id: str
    file_url: str
    ats_score: float
    ats_breakdown: Dict[str, float]
    sections: List[ResumeSection]
    feedback: List[str]
    created_at: datetime
