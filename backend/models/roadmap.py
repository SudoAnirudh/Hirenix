from pydantic import BaseModel
from typing import List, Optional

class Resource(BaseModel):
    title: str
    url: str
    type: str  # 'video', 'course', 'article'
    is_free: bool

class RoadmapSkill(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    status: str = 'to_learn'  # 'completed', 'in_progress', 'to_learn'
    priority: Optional[str] = 'medium'  # 'high', 'medium', 'low'
    difficulty: Optional[str] = 'medium'
    estimated_time: Optional[str] = None
    resources: List[Resource] = []
    children: List['RoadmapSkill'] = []
    is_optional: bool = False

class CareerRoadmap(BaseModel):
    user_id: Optional[str] = None
    target_role: str
    current_level: str  # 'junior', 'mid', 'senior'
    skills: List[RoadmapSkill]
    next_step: Optional[str] = None
    overall_progress: float = 0.0
    future_opportunities: List[str] = []

# Needed for self-referencing model
RoadmapSkill.model_rebuild()

class RoadmapUpdate(BaseModel):
    target_role: str
    completed_skills: List[str]
