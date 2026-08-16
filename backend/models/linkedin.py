from pydantic import BaseModel, Field
from typing import List, Optional

class LinkedInSectionAnalysis(BaseModel):
    score: int = Field(..., ge=0, le=100)
    current: str
    improved: Optional[str] = None
    tips: List[str]
    missing_keywords: List[str] = []

class LinkedInKeywordDensityItem(BaseModel):
    keyword: str
    current_count: int
    recommended_count: int
    priority: str  # "High", "Medium", "Low"

class LinkedInHeadlineVariations(BaseModel):
    seo_specialist: str
    impact_leader: str
    tech_evangelist: str

class LinkedInXYZBulletAudit(BaseModel):
    weak_bullet: str
    xyz_rewritten: str
    impact_metric_tip: str

class LinkedInChecklistItem(BaseModel):
    label: str
    completed: bool
    tip: str

class LinkedInAnalysisResponse(BaseModel):
    overall_score: int = Field(..., ge=0, le=100)
    headline: LinkedInSectionAnalysis
    about: LinkedInSectionAnalysis
    experience: LinkedInSectionAnalysis
    skills: LinkedInSectionAnalysis
    completeness_score: int
    general_tips: List[str]
    suggested_roles: List[str]
    # New features (defaulted for compatibility)
    headline_variations: Optional[LinkedInHeadlineVariations] = None
    keyword_density: List[LinkedInKeywordDensityItem] = []
    xyz_bullet_audits: List[LinkedInXYZBulletAudit] = []
    recruiter_checklist: List[LinkedInChecklistItem] = []

