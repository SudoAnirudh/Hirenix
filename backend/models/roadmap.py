from pydantic import BaseModel
from typing import List, Optional

class Resource(BaseModel):
    title: str
    url: str
    type: str  # 'video', 'course', 'article'
    is_free: bool

class RoadmapSkill(BaseModel):
    name: str
    status: str  # 'completed', 'in_progress', 'to_learn'
    priority: str  # 'high', 'medium', 'low'
    difficulty: str  # 'easy', 'medium', 'hard'
    estimated_time: str  # e.g., '2 weeks'
    resources: List[Resource]

class Roadmap(BaseModel):
    user_id: str
    target_role: str
    current_level: str  # 'junior', 'mid', 'senior'
    skills: List[RoadmapSkill]
    next_step: str
    overall_progress: float  # 0 to 100
    future_opportunities: List[str]
