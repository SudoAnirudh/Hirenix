from pydantic import BaseModel, Field
from typing import List, Optional

class LinkedInSectionAnalysis(BaseModel):
    score: int = Field(..., ge=0, le=100)
    current: str
    improved: Optional[str] = None
    tips: List[str]
    missing_keywords: List[str] = []

class LinkedInAnalysisResponse(BaseModel):
    overall_score: int = Field(..., ge=0, le=100)
    headline: LinkedInSectionAnalysis
    about: LinkedInSectionAnalysis
    experience: LinkedInSectionAnalysis
    skills: LinkedInSectionAnalysis
    completeness_score: int
    general_tips: List[str]
    suggested_roles: List[str]
