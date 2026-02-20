import re
import httpx
from typing import Optional
from config import settings
from models.github import GitHubAnalysisResponse, GitHubMetrics, RepoMetric
from utils.scoring_weights import GPI_WEIGHTS

GITHUB_API = "https://api.github.com"


def _auth_headers() -> dict:
    headers = {"Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28"}
    if settings.github_token:
        headers["Authorization"] = f"Bearer {settings.github_token}"
    return headers


async def analyze_github_profile(username: str) -> GitHubAnalysisResponse:
    """Fetch GitHub repos and compute GitHub Performance Index (GPI)."""
    async with httpx.AsyncClient(timeout=15) as client:
        # User info
        user_r = await client.get(f"{GITHUB_API}/users/{username}", headers=_auth_headers())
        user_r.raise_for_status()

        # Repositories (up to 100)
        repos_r = await client.get(
            f"{GITHUB_API}/users/{username}/repos",
            params={"per_page": 100, "sort": "updated"},
            headers=_auth_headers(),
        )
        repos_r.raise_for_status()
        repos = repos_r.json()

    languages = list({r["language"] for r in repos if r.get("language")})
    total_stars = sum(r.get("stargazers_count", 0) for r in repos)

    repo_metrics: list[RepoMetric] = []
    for r in repos[:10]:  # top 10 by recency
        rm = RepoMetric(
            name=r["name"],
            language=r.get("language"),
            stars=r.get("stargazers_count", 0),
            forks=r.get("forks_count", 0),
            has_readme=bool(r.get("has_projects") or r.get("description")),
            has_ci=False,   # would require per-repo API call
            has_deployment=bool(r.get("homepage")),
            size_kb=r.get("size", 0),
            commits_last_90_days=0,  # would require statistics API
        )
        repo_metrics.append(rm)

    # ─── Metric Calculations ──────────────────────────────────────────────────
    # 1. Stack Diversity (language count normalised to 10)
    stack_diversity = min(len(languages) / 10.0, 1.0) * 100

    # 2. Project Depth (avg repo size, normalised to 500KB)
    avg_size = sum(r.get("size", 0) for r in repos) / max(len(repos), 1)
    project_depth = min(avg_size / 500.0, 1.0) * 100

    # 3. Production Readiness (% repos with homepage/deployment)
    with_deploy = sum(1 for r in repos if r.get("homepage"))
    production_readiness = (with_deploy / max(len(repos), 1)) * 100

    # 4. Consistency (proxy: public repos > 5 and stars > 5)
    consistency = min((len(repos) / 30.0) * 0.5 + (total_stars / 50.0) * 0.5, 1.0) * 100

    metrics = GitHubMetrics(
        total_repos=len(repos),
        total_stars=total_stars,
        languages=languages,
        top_repos=repo_metrics,
        consistency_score=round(consistency, 1),
        project_depth_score=round(project_depth, 1),
        stack_diversity_score=round(stack_diversity, 1),
        production_readiness_score=round(production_readiness, 1),
    )

    gpi = sum(
        getattr(metrics, key) * weight
        for key, weight in GPI_WEIGHTS.items()
    )
    gpi = round(gpi, 1)

    # Strengths and recommendations
    strengths, recs = [], []
    if stack_diversity >= 60:
        strengths.append(f"Diverse tech stack: {', '.join(languages[:5])}")
    if total_stars >= 10:
        strengths.append(f"{total_stars} total stars — evidence of community recognition")
    if production_readiness < 20:
        recs.append("Add deployment links/homepages to your repos (GitHub Pages, Vercel, etc.)")
    if len(languages) < 3:
        recs.append("Explore more languages/frameworks to show stack breadth")
    if not strengths:
        strengths.append("Active GitHub presence with consistent contributions")

    return GitHubAnalysisResponse(
        analysis_id="",  # filled by router
        username=username,
        gpi_score=gpi,
        metrics=metrics,
        strengths=strengths,
        recommendations=recs,
    )
