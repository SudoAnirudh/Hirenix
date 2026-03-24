from pydantic import BaseModel
from typing import List, Optional, Any

class LinkedInAnalysisRequest(BaseModel):
    linkedin_url: str

class LinkedInMetrics(BaseModel):
    completeness_score: float      # 0–100
    experience_score: float        # 0–100
    network_presence_score: float  # 0–100
    education_score: float         # 0–100

class LinkedInAnalysisResponse(BaseModel):
    analysis_id: str
    linkedin_url: str
    lpi_score: float               # LinkedIn Performance Index 0-100
    metrics: LinkedInMetrics
    strengths: List[str]
    recommendations: List[str]
    raw_data: Any                  # Store raw proxycurl payload for reference
