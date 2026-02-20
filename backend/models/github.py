from pydantic import BaseModel
from typing import Dict, List, Any, Optional


class GitHubAnalysisRequest(BaseModel):
    username: str


class RepoMetric(BaseModel):
    name: str
    language: Optional[str]
    stars: int
    forks: int
    has_readme: bool
    has_ci: bool
    has_deployment: bool
    size_kb: int
    commits_last_90_days: int


class GitHubMetrics(BaseModel):
    total_repos: int
    total_stars: int
    languages: List[str]
    top_repos: List[RepoMetric]
    consistency_score: float      # 0–100
    project_depth_score: float    # 0–100
    stack_diversity_score: float  # 0–100
    production_readiness_score: float  # 0–100


class GitHubAnalysisResponse(BaseModel):
    analysis_id: str
    username: str
    gpi_score: float              # GitHub Performance Index 0–100
    metrics: GitHubMetrics
    strengths: List[str]
    recommendations: List[str]
