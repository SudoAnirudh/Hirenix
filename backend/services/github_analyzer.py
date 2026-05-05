import httpx
import logging
from datetime import datetime, timedelta
from config import settings
from models.github import GitHubAnalysisResponse, GitHubMetrics, RepoMetric
from utils.scoring_weights import GPI_WEIGHTS
from services.groq_client import invoke_groq_llm

GITHUB_API = "https://api.github.com"
logger = logging.getLogger("hirenix.github")

def _auth_headers() -> dict:
    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "Hirenix-AI-Agent"
    }
    if settings.github_token:
        headers["Authorization"] = f"Bearer {settings.github_token}"
    return headers

async def analyze_github_profile(username: str) -> GitHubAnalysisResponse:
    """Fetch GitHub repos and compute a comprehensive AI-powered profile analysis."""
    import asyncio
    logger.info(f"Starting GitHub analysis for user: {username}")
    async with httpx.AsyncClient(timeout=25) as client:
        try:
            logger.debug(f"Fetching user info and repos concurrently for {username}")
            user_req = client.get(f"{GITHUB_API}/users/{username}", headers=_auth_headers())
            repos_req = client.get(
                f"{GITHUB_API}/users/{username}/repos",
                params={"per_page": 100, "sort": "updated"},
                headers=_auth_headers(),
            )

            user_r, repos_r = await asyncio.gather(user_req, repos_req)
            
            if user_r.status_code == 404:
                raise Exception(f"GitHub user '{username}' not found. Please check the spelling.")
            if user_r.status_code == 401:
                logger.error("GitHub 401 Unauthorized: Invalid token.")
                raise Exception("System GitHub token is invalid. Please contact support.")
            if user_r.status_code == 403:
                logger.warning(f"GitHub 403 Forbidden: Rate limit reached for {username}.")
                raise Exception("GitHub API rate limit reached. Please try again later.")
            
            user_r.raise_for_status()
            user_data = user_r.json()

            repos_r.raise_for_status()
            repos = repos_r.json()
            logger.info(f"Retrieved {len(repos)} repos for {username}")
        except httpx.HTTPError as e:
            logger.error(f"HTTP error during GitHub fetch: {str(e)}")
            raise Exception(f"GitHub connection error: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error during GitHub analysis: {str(e)}")
            raise e

        # ─── Language Distribution ────────────────────────────────────────────────
        lang_counts = {}
        for r in repos:
            lang = r.get("language")
            if lang:
                lang_counts[lang] = lang_counts.get(lang, 0) + 1
        
        total_lang_repos = sum(lang_counts.values()) or 1
        lang_dist = {lang: (count / total_lang_repos) * 100 for lang, count in lang_counts.items()}
        languages = sorted(lang_counts.keys(), key=lambda x: lang_counts[x], reverse=True)

        total_stars = sum(r.get("stargazers_count", 0) for r in repos)

        # ─── Detailed Repo Metrics (Top 5) ───────────────────────────────────────
        repo_metrics: list[RepoMetric] = []
        three_months_ago = (datetime.now() - timedelta(days=90)).isoformat()
        
        commit_tasks = []
        top_repos = repos[:5]
        for r in top_repos:
            commit_tasks.append(
                client.get(
                    f"{GITHUB_API}/repos/{username}/{r['name']}/commits",
                    params={"since": three_months_ago, "per_page": 1, "author": username},
                    headers=_auth_headers(),
                )
            )

        commit_responses = await asyncio.gather(*commit_tasks, return_exceptions=True)

        for i, r in enumerate(top_repos):
            commits_count = 0
            commits_r = commit_responses[i]
            if not isinstance(commits_r, Exception) and commits_r.status_code == 200:
                # Link header often contains 'last' page info for count
                link = commits_r.headers.get("Link", "")
                if 'rel="last"' in link:
                    # Simple heuristic: last page number is the count if per_page=1
                    import re
                    match = re.search(r'page=(\d+)&since=.*>; rel="last"', link)
                    if match:
                        commits_count = int(match.group(1))
                else:
                    commits_count = len(commits_r.json())

            repo_metrics.append(RepoMetric(
                name=r["name"],
                description=r.get("description"),
                language=r.get("language"),
                license=r.get("license", {}).get("name") if r.get("license") else None,
                stars=r.get("stargazers_count", 0),
                forks=r.get("forks_count", 0),
                has_readme=bool(r.get("description")), # Simplified check
                has_ci=False, 
                has_deployment=bool(r.get("homepage")),
                size_kb=r.get("size", 0),
                commits_last_90_days=commits_count
            ))

        # ─── Metric Calculations ──────────────────────────────────────────────────
        stack_diversity = min(len(languages) / 10.0, 1.0) * 100
        avg_size = sum(r.get("size", 0) for r in repos) / max(len(repos), 1)
        project_depth = min(avg_size / 500.0, 1.0) * 100
        with_deploy = sum(1 for r in repos if r.get("homepage"))
        production_readiness = (with_deploy / max(len(repos), 1)) * 100
        consistency = min((len(repos) / 30.0) * 0.5 + (total_stars / 50.0) * 0.5, 1.0) * 100

        metrics = GitHubMetrics(
            total_repos=len(repos),
            total_stars=total_stars,
            languages=languages,
            language_distribution=lang_dist,
            top_repos=repo_metrics,
            consistency_score=round(consistency, 1),
            project_depth_score=round(project_depth, 1),
            stack_diversity_score=round(stack_diversity, 1),
            production_readiness_score=round(production_readiness, 1),
        )

        # ─── AI Deep Dive ────────────────────────────────────────────────────────
        ai_summary = "AI analysis could not be generated."
        if settings.groq_api_key:
            prompt = f"""
            Analyze this GitHub profile for a developer named {username}.
            Total Repos: {len(repos)}
            Total Stars: {total_stars}
            Top Languages: {', '.join(languages[:5])}
            Key Projects: {', '.join([f"{r.name} ({r.stars} stars, {r.commits_last_90_days} recent commits)" for r in repo_metrics])}
            
            Provide a 3-4 sentence high-level technical summary of this developer's "vibe", impact, and expertise.
            Focus on what makes them unique and their career potential.
            Return ONLY the summary text.
            """
            ai_resp = await invoke_groq_llm([{"role": "user", "content": prompt}])
            if ai_resp:
                ai_summary = ai_resp.get("choices", [{}])[0].get("message", {}).get("content", ai_summary)
        
        metrics.ai_summary = ai_summary

        gpi = sum(getattr(metrics, key) * weight for key, weight in GPI_WEIGHTS.items())
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
            analysis_id="", 
            username=username,
            gpi_score=gpi,
            metrics=metrics,
            strengths=strengths,
            recommendations=recs,
        )

