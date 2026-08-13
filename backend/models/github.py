from pydantic import BaseModel
from typing import List, Optional, Dict

from pydantic import Field

class GitHubAnalysisRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=39, pattern=r"^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$")
    target_role: Optional[str] = Field("fullstack", pattern=r"^(fullstack|frontend|backend|ml_ai)$")


class RepoMetric(BaseModel):
    name: str
    description: Optional[str]
    language: Optional[str]
    license: Optional[str]
    stars: int
    forks: int
    has_readme: bool
    has_ci: bool
    has_deployment: bool
    size_kb: int
    commits_last_90_days: int
    is_fork: bool = False
    has_tests: bool = False
    dependency_health_score: float = 50.0
    maintenance_lifespan_days: int = 0
    semantic_commit_ratio: float = 0.0
    atomic_commit_ratio: float = 0.0
    uses_branches: bool = False
    docstring_score: float = 50.0
    type_safety_score: float = 50.0
    has_secrets_risk: bool = False
    has_dockerfile: bool = False
    has_ci_workflow: bool = False


class GitHubMetrics(BaseModel):
    total_repos: int
    total_stars: int
    languages: List[str]
    language_distribution: Dict[str, float]
    top_repos: List[RepoMetric]
    
    # 4 Core Metric Categories (0–100)
    code_quality_score: float
    git_hygiene_score: float
    collaboration_score: float
    longevity_impact_score: float

    # Granular Sub-metrics & Advanced Features
    target_role: str = "fullstack"
    original_repos_count: int = 0
    total_repos_scanned: int = 0
    stack_focus_score: float = 50.0
    testing_density_score: float = 0.0
    dependency_health_score: float = 50.0
    semantic_commit_ratio: float = 0.0
    atomic_commit_ratio: float = 0.0
    branching_hygiene_score: float = 50.0
    pr_description_quality_score: float = 50.0
    external_contributions_count: int = 0
    merged_external_prs: int = 0
    open_external_prs: int = 0
    reputable_repos_contributed: int = 0
    docstring_coverage_score: float = 50.0
    type_safety_score: float = 50.0
    security_clean_score: float = 100.0
    avg_maintenance_lifespan_days: int = 0
    
    # Backward compatibility fields
    consistency_score: float = 50.0
    project_depth_score: float = 50.0
    stack_diversity_score: float = 50.0
    production_readiness_score: float = 50.0
    ai_summary: Optional[str] = None


class GitHubAnalysisResponse(BaseModel):
    analysis_id: str
    username: str
    gpi_score: float              # GitHub Performance Index 0–100
    metrics: GitHubMetrics
    strengths: List[str]
    recommendations: List[str]


