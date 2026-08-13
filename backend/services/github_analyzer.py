import httpx
import logging
import re
from datetime import datetime, timedelta
from typing import List, Dict, Tuple
from config import settings
from models.github import GitHubAnalysisResponse, GitHubMetrics, RepoMetric
from utils.scoring_weights import GPI_CATEGORY_WEIGHTS
from services.groq_client import invoke_groq_llm

GITHUB_API = "https://api.github.com"
logger = logging.getLogger("hirenix.github")

SEMANTIC_PREFIX_PATTERN = re.compile(
    r"^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\([a-zA-Z0-9_\-]+\))?:",
    re.IGNORECASE,
)
LAZY_COMMIT_PATTERN = re.compile(
    r"^(update|fixed|wip|changes|commit|stuff|asdf|fix|test|done)$", re.IGNORECASE
)


def _auth_headers() -> dict:
    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "Hirenix-AI-Agent",
    }
    if settings.github_token:
        headers["Authorization"] = f"Bearer {settings.github_token}"
    return headers


async def _inspect_repo_quality(
    client: httpx.AsyncClient, username: str, repo_name: str
) -> Tuple[bool, float, float, float, bool]:
    """
    Inspect a flagship repository for:
    - has_tests (bool)
    - dependency_health_score (float 0-100)
    - semantic_commit_ratio (float 0-100)
    - atomic_commit_ratio (float 0-100)
    - uses_branches (bool)
    """
    has_tests = False
    dep_health = 50.0
    semantic_ratio = 50.0
    atomic_ratio = 50.0
    uses_branches = False

    # 1. Check for tests & dependency files via contents API
    try:
        r = await client.get(
            f"{GITHUB_API}/repos/{username}/{repo_name}/contents",
            headers=_auth_headers(),
            timeout=8.0,
        )
        if r.status_code == 200:
            contents = r.json()
            file_names = [item.get("name", "").lower() for item in contents if isinstance(item, dict)]
            
            # Check tests
            test_indicators = {"test", "tests", "__tests__", "spec", "e2e", "cypress", "pytest"}
            if any(name in test_indicators or name.startswith("test") for name in file_names):
                has_tests = True

            # Check dependency health
            if "package.json" in file_names:
                pkg_r = await client.get(
                    f"{GITHUB_API}/repos/{username}/{repo_name}/contents/package.json",
                    headers=_auth_headers(),
                    timeout=5.0,
                )
                if pkg_r.status_code == 200:
                    import json, base64
                    try:
                        content_b64 = pkg_r.json().get("content", "")
                        pkg_data = json.loads(base64.b64decode(content_b64).decode("utf-8"))
                        deps = pkg_data.get("dependencies", {})
                        dev_deps = pkg_data.get("devDependencies", {})
                        total_deps = len(deps) + len(dev_deps)
                        # Penalize extreme dependency bloat (>60) or encourage reasonable count (5-30)
                        if total_deps == 0:
                            dep_health = 60.0
                        elif 1 <= total_deps <= 35:
                            dep_health = 90.0
                        elif 36 <= total_deps <= 60:
                            dep_health = 70.0
                        else:
                            dep_health = 45.0
                    except Exception:
                        dep_health = 60.0
            elif "requirements.txt" in file_names:
                req_r = await client.get(
                    f"{GITHUB_API}/repos/{username}/{repo_name}/contents/requirements.txt",
                    headers=_auth_headers(),
                    timeout=5.0,
                )
                if req_r.status_code == 200:
                    import base64
                    try:
                        content = base64.b64decode(req_r.json().get("content", "")).decode("utf-8")
                        lines = [l.strip() for l in content.splitlines() if l.strip() and not l.startswith("#")]
                        if lines:
                            pinned = sum(1 for l in lines if "==" in l)
                            dep_health = round((pinned / len(lines)) * 100.0, 1)
                        else:
                            dep_health = 70.0
                    except Exception:
                        dep_health = 60.0
            elif any(d in file_names for d in ["cargo.toml", "go.mod", "pyproject.toml"]):
                dep_health = 85.0
    except Exception as e:
        logger.debug(f"Repo contents check failed for {repo_name}: {e}")

    # 2. Check recent commits for Git Hygiene (Semantic + Granularity + Branching)
    try:
        commits_r = await client.get(
            f"{GITHUB_API}/repos/{username}/{repo_name}/commits",
            params={"per_page": 15},
            headers=_auth_headers(),
            timeout=8.0,
        )
        if commits_r.status_code == 200:
            commits = commits_r.json()
            if isinstance(commits, list) and len(commits) > 0:
                semantic_count = 0
                lazy_count = 0
                atomic_count = 0
                branch_merge_count = 0

                for c in commits:
                    msg = c.get("commit", {}).get("message", "").split("\n")[0].strip()
                    if SEMANTIC_PREFIX_PATTERN.search(msg):
                        semantic_count += 1
                    elif LAZY_COMMIT_PATTERN.search(msg):
                        lazy_count += 1

                    if "merge" in msg.lower() or "pull request" in msg.lower():
                        branch_merge_count += 1

                total = len(commits)
                semantic_ratio = round((semantic_count / total) * 100.0, 1) if total > 0 else 50.0
                if lazy_count > 0:
                    semantic_ratio = max(0.0, semantic_ratio - (lazy_count / total) * 30.0)

                uses_branches = branch_merge_count > 0
                atomic_ratio = round(min(100.0, max(40.0, 100.0 - (lazy_count * 15.0))), 1)
    except Exception as e:
        logger.debug(f"Commits inspection failed for {repo_name}: {e}")

    return has_tests, dep_health, semantic_ratio, atomic_ratio, uses_branches


async def analyze_github_profile(username: str) -> GitHubAnalysisResponse:
    """Fetch GitHub profile data and compute 4 core metric categories using the 3-step pipeline."""
    logger.info(f"Starting GitHub analysis for user: {username}")
    async with httpx.AsyncClient(timeout=25) as client:
        try:
            # User info
            user_r = await client.get(f"{GITHUB_API}/users/{username}", headers=_auth_headers())
            if user_r.status_code == 404:
                raise Exception(f"GitHub user '{username}' not found. Please check the spelling.")
            if user_r.status_code == 401:
                raise Exception("System GitHub token is invalid. Please contact support.")
            if user_r.status_code == 403:
                raise Exception("GitHub API rate limit reached. Please try again later.")
            user_r.raise_for_status()

            # All Repositories
            repos_r = await client.get(
                f"{GITHUB_API}/users/{username}/repos",
                params={"per_page": 100, "sort": "updated"},
                headers=_auth_headers(),
            )
            repos_r.raise_for_status()
            repos = repos_r.json()
        except httpx.HTTPError as e:
            logger.error(f"HTTP error during GitHub fetch: {str(e)}")
            raise Exception(f"GitHub connection error: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error during GitHub analysis: {str(e)}")
            raise e

        # ─── PIPELINE STEP 1: Isolate Original Work ──────────────────────────────
        total_repos_scanned = len(repos)
        original_repos = [r for r in repos if not r.get("fork", False)]
        original_repos_count = len(original_repos)
        
        # Fallback to all repos if user has no original repos
        eval_repos = original_repos if original_repos else repos

        # ─── PIPELINE STEP 2: Identify Core Flagship Projects ─────────────────────
        # Rank by impact score: stars * 3 + forks * 2 + min(size/100, 20)
        def _flagship_score(r: dict) -> float:
            return (
                r.get("stargazers_count", 0) * 3.0
                + r.get("forks_count", 0) * 2.0
                + min(r.get("size", 0) / 100.0, 20.0)
            )

        sorted_repos = sorted(eval_repos, key=_flagship_score, reverse=True)
        flagship_repos = sorted_repos[:3]  # Focus 80% evaluation here
        top_repos_list = sorted_repos[:5]

        # ─── PIPELINE STEP 3: Audit Recent Activity (90-Day Audit) ────────────────
        external_contributions_count = 0
        recent_pushes_count = 0
        three_months_ago = datetime.now() - timedelta(days=90)

        try:
            events_r = await client.get(
                f"{GITHUB_API}/users/{username}/events/public",
                params={"per_page": 100},
                headers=_auth_headers(),
                timeout=8.0,
            )
            if events_r.status_code == 200:
                events = events_r.json()
                if isinstance(events, list):
                    for evt in events:
                        evt_type = evt.get("type")
                        repo_name = evt.get("repo", {}).get("name", "")
                        created_at_str = evt.get("created_at")
                        
                        is_recent = True
                        if created_at_str:
                            try:
                                dt = datetime.fromisoformat(created_at_str.replace("Z", "+00:00"))
                                if dt.tzinfo:
                                    dt = dt.replace(tzinfo=None)
                                if dt < three_months_ago:
                                    is_recent = False
                            except Exception:
                                pass

                        if is_recent:
                            if evt_type == "PushEvent":
                                recent_pushes_count += 1
                            # External contribution check
                            if repo_name and not repo_name.lower().startswith(f"{username.lower()}/"):
                                if evt_type in ("PushEvent", "PullRequestEvent", "PullRequestReviewEvent", "IssuesEvent"):
                                    external_contributions_count += 1
        except Exception as e:
            logger.debug(f"Public events audit failed: {e}")

        # ─── PR Description Quality & OS Audit ───────────────────────────────────
        pr_quality_score = 50.0
        try:
            prs_r = await client.get(
                f"{GITHUB_API}/search/issues",
                params={"q": f"type:pr author:{username}", "per_page": 10},
                headers=_auth_headers(),
                timeout=6.0,
            )
            if prs_r.status_code == 200:
                prs = prs_r.json().get("items", [])
                if prs:
                    body_lengths = [len(p.get("body") or "") for p in prs]
                    avg_len = sum(body_lengths) / len(body_lengths)
                    pr_quality_score = round(min(100.0, max(30.0, (avg_len / 150.0) * 100.0)), 1)
        except Exception as e:
            logger.debug(f"PR search audit failed: {e}")

        # ─── Language Focus vs Diversity ─────────────────────────────────────────
        lang_counts = {}
        for r in eval_repos:
            lang = r.get("language")
            if lang:
                lang_counts[lang] = lang_counts.get(lang, 0) + 1

        total_lang_repos = sum(lang_counts.values()) or 1
        lang_dist = {lang: (count / total_lang_repos) * 100 for lang, count in lang_counts.items()}
        languages = sorted(lang_counts.keys(), key=lambda x: lang_counts[x], reverse=True)

        # Primary stack focus calculation
        top_two_share = sum(sorted(lang_dist.values(), reverse=True)[:2])
        if len(languages) <= 3 and top_two_share >= 70:
            stack_focus_score = 95.0
        elif top_two_share >= 60:
            stack_focus_score = 85.0
        elif len(languages) > 8 and top_two_share < 35:
            stack_focus_score = 40.0  # Scattered mess penalty
        else:
            stack_focus_score = 70.0

        # ─── Deep Inspection of Flagship Repositories ──────────────────────────────
        repo_metrics: list[RepoMetric] = []
        three_months_iso = three_months_ago.isoformat()
        
        tested_flagship_count = 0
        dep_health_scores = []
        semantic_commit_ratios = []
        atomic_commit_ratios = []
        branching_flags = []
        lifespan_days_list = []

        for r in top_repos_list:
            r_name = r["name"]
            is_flagship = r in flagship_repos

            # Commits in last 90 days
            commits_count = 0
            try:
                commits_r = await client.get(
                    f"{GITHUB_API}/repos/{username}/{r_name}/commits",
                    params={"since": three_months_iso, "per_page": 1, "author": username},
                    headers=_auth_headers(),
                    timeout=5.0,
                )
                if commits_r.status_code == 200:
                    link = commits_r.headers.get("Link", "")
                    if 'rel="last"' in link:
                        match = re.search(r'page=(\d+)&since=.*>; rel="last"', link)
                        if match:
                            commits_count = int(match.group(1))
                    else:
                        commits_count = len(commits_r.json())
            except Exception:
                pass

            # Maintenance Lifespan Calculation
            created_str = r.get("created_at")
            pushed_str = r.get("pushed_at")
            lifespan_days = 0
            if created_str and pushed_str:
                try:
                    c_dt = datetime.fromisoformat(created_str.replace("Z", "+00:00"))
                    p_dt = datetime.fromisoformat(pushed_str.replace("Z", "+00:00"))
                    lifespan_days = max(1, (p_dt - c_dt).days)
                except Exception:
                    lifespan_days = 30

            lifespan_days_list.append(lifespan_days)

            # Deep quality inspection for top flagship repos
            has_tests, dep_health, sem_ratio, atom_ratio, uses_branches = False, 50.0, 50.0, 50.0, False
            if is_flagship:
                has_tests, dep_health, sem_ratio, atom_ratio, uses_branches = await _inspect_repo_quality(
                    client, username, r_name
                )
                if has_tests:
                    tested_flagship_count += 1
                dep_health_scores.append(dep_health)
                semantic_commit_ratios.append(sem_ratio)
                atomic_commit_ratios.append(atom_ratio)
                branching_flags.append(uses_branches)

            repo_metrics.append(
                RepoMetric(
                    name=r_name,
                    description=r.get("description"),
                    language=r.get("language"),
                    license=r.get("license", {}).get("name") if r.get("license") else None,
                    stars=r.get("stargazers_count", 0),
                    forks=r.get("forks_count", 0),
                    has_readme=bool(r.get("description") or r.get("has_wiki")),
                    has_ci=bool(r.get("has_downloads", True)),
                    has_deployment=bool(r.get("homepage")),
                    size_kb=r.get("size", 0),
                    commits_last_90_days=commits_count,
                    is_fork=r.get("fork", False),
                    has_tests=has_tests,
                    dependency_health_score=round(dep_health, 1),
                    maintenance_lifespan_days=lifespan_days,
                    semantic_commit_ratio=round(sem_ratio, 1),
                    atomic_commit_ratio=round(atom_ratio, 1),
                    uses_branches=uses_branches,
                )
            )

        # ─── CORE METRIC CATEGORY COMPUTATIONS ────────────────────────────────────

        # Category 1: Code Quality & Architecture
        testing_density_score = round(
            (tested_flagship_count / max(1, len(flagship_repos))) * 100.0, 1
        )
        avg_dep_health = round(
            sum(dep_health_scores) / max(1, len(dep_health_scores)), 1
        ) if dep_health_scores else 65.0

        code_quality_score = round(
            stack_focus_score * 0.35 + testing_density_score * 0.35 + avg_dep_health * 0.30, 1
        )

        # Category 2: Workflow & Git Hygiene
        avg_semantic_ratio = round(
            sum(semantic_commit_ratios) / max(1, len(semantic_commit_ratios)), 1
        ) if semantic_commit_ratios else 60.0

        avg_atomic_ratio = round(
            sum(atomic_commit_ratios) / max(1, len(atomic_commit_ratios)), 1
        ) if atomic_commit_ratios else 65.0

        branching_score = round(
            (sum(1 for b in branching_flags if b) / max(1, len(branching_flags))) * 100.0, 1
        ) if branching_flags else 50.0

        git_hygiene_score = round(
            avg_semantic_ratio * 0.40 + avg_atomic_ratio * 0.35 + branching_score * 0.25, 1
        )

        # Category 3: Open Source & Collaboration
        external_contrib_score = round(min(100.0, external_contributions_count * 20.0), 1)
        collaboration_score = round(
            pr_quality_score * 0.40 + external_contrib_score * 0.45 + min(100.0, recent_pushes_count * 5.0) * 0.15,
            1,
        )

        # Category 4: Project Longevity & Impact
        avg_lifespan_days = int(
            sum(lifespan_days_list) / max(1, len(lifespan_days_list))
        ) if lifespan_days_list else 30

        # Lifespan score: >180 days = 95+, 90-180 = 80, 30-90 = 65, <3 days = 20 (tutorial clone penalty)
        if avg_lifespan_days >= 180:
            lifespan_score = 95.0
        elif avg_lifespan_days >= 90:
            lifespan_score = 80.0
        elif avg_lifespan_days >= 30:
            lifespan_score = 65.0
        elif avg_lifespan_days >= 7:
            lifespan_score = 45.0
        else:
            lifespan_score = 25.0

        total_original_stars = sum(r.get("stargazers_count", 0) for r in eval_repos)
        total_original_forks = sum(r.get("forks_count", 0) for r in eval_repos)
        social_proof_score = round(
            min(100.0, (total_original_stars * 8.0 + total_original_forks * 12.0) + 30.0), 1
        )

        longevity_impact_score = round(
            lifespan_score * 0.60 + social_proof_score * 0.40, 1
        )

        # ─── OVERALL GPI SCORE COMPUTATION ───────────────────────────────────────
        gpi = (
            code_quality_score * GPI_CATEGORY_WEIGHTS["code_quality_score"]
            + git_hygiene_score * GPI_CATEGORY_WEIGHTS["git_hygiene_score"]
            + collaboration_score * GPI_CATEGORY_WEIGHTS["collaboration_score"]
            + longevity_impact_score * GPI_CATEGORY_WEIGHTS["longevity_impact_score"]
        )
        gpi_score = round(gpi, 1)

        # Legacy backward compatibility metrics
        consistency = round(min(100.0, (recent_pushes_count / 10.0) * 50.0 + (total_original_stars / 20.0) * 50.0), 1)
        project_depth = round(min(100.0, (avg_lifespan_days / 180.0) * 100.0), 1)
        stack_diversity = round(min(100.0, (len(languages) / 6.0) * 100.0), 1)
        production_readiness = code_quality_score

        metrics = GitHubMetrics(
            total_repos=len(eval_repos),
            total_stars=total_original_stars,
            languages=languages,
            language_distribution=lang_dist,
            top_repos=repo_metrics,
            # 4 Category Scores
            code_quality_score=code_quality_score,
            git_hygiene_score=git_hygiene_score,
            collaboration_score=collaboration_score,
            longevity_impact_score=longevity_impact_score,
            # Sub-metrics
            original_repos_count=original_repos_count,
            total_repos_scanned=total_repos_scanned,
            stack_focus_score=stack_focus_score,
            testing_density_score=testing_density_score,
            dependency_health_score=avg_dep_health,
            semantic_commit_ratio=avg_semantic_ratio,
            atomic_commit_ratio=avg_atomic_ratio,
            branching_hygiene_score=branching_score,
            pr_description_quality_score=pr_quality_score,
            external_contributions_count=external_contributions_count,
            avg_maintenance_lifespan_days=avg_lifespan_days,
            # Legacy fallback
            consistency_score=consistency,
            project_depth_score=project_depth,
            stack_diversity_score=stack_diversity,
            production_readiness_score=production_readiness,
        )

        # ─── AI Deep Dive ────────────────────────────────────────────────────────
        ai_summary = "AI analysis could not be generated."
        if settings.groq_api_key:
            prompt = f"""
            Analyze this GitHub profile for developer '{username}' based on our 4-category forensic framework:
            - Original Repos Isolated: {original_repos_count} of {total_repos_scanned} total repos.
            - Code Quality & Architecture ({code_quality_score}/100): Testing density {testing_density_score}%, Dependency health {avg_dep_health}/100, Primary stack focus {stack_focus_score}/100.
            - Workflow & Git Hygiene ({git_hygiene_score}/100): Semantic commits {avg_semantic_ratio}%, Atomic commits {avg_atomic_ratio}%.
            - Open Source & Collaboration ({collaboration_score}/100): External contributions {external_contributions_count}, PR description score {pr_quality_score}/100.
            - Project Longevity & Impact ({longevity_impact_score}/100): Avg project maintenance lifespan {avg_lifespan_days} days.

            Provide a concise 3-4 sentence forensic assessment highlighting technical rigor, git discipline, open-source impact, and software engineering maturity.
            Return ONLY the raw summary text.
            """
            ai_resp = await invoke_groq_llm([{"role": "user", "content": prompt}])
            if ai_resp:
                ai_summary = ai_resp.get("choices", [{}])[0].get("message", {}).get("content", ai_summary)

        metrics.ai_summary = ai_summary

        # ─── Strategic Strengths & Actionable Recommendations ───────────────────
        strengths, recs = [], []
        
        if testing_density_score >= 50:
            strengths.append(f"High Testing Density: {tested_flagship_count} flagship project(s) feature automated test suites.")
        if avg_semantic_ratio >= 60:
            strengths.append("Strong Git Hygiene: Consistent semantic commit messages (feat, fix, docs).")
        if external_contributions_count > 0:
            strengths.append(f"Open Source Contributor: Active contributions to {external_contributions_count} external repositories.")
        if avg_lifespan_days >= 180:
            strengths.append(f"Project Commitment: Maintained core flagship projects for an average of {avg_lifespan_days} days.")
        if not strengths:
            strengths.append("Active original repository owner with ongoing technical development.")

        if testing_density_score < 50:
            recs.append("Add unit & integration test suites (/tests folder) to flagship repositories.")
        if avg_semantic_ratio < 60:
            recs.append("Adopt Conventional Commits (e.g., 'feat: add auth', 'fix: null pointer') over generic messages.")
        if avg_lifespan_days < 90:
            recs.append("Maintain flagship projects consistently beyond 6 months to demonstrate long-term project stewardship.")
        if external_contributions_count == 0:
            recs.append("Contribute pull requests to open-source projects outside your own repositories.")

        return GitHubAnalysisResponse(
            analysis_id="",
            username=username,
            gpi_score=gpi_score,
            metrics=metrics,
            strengths=strengths,
            recommendations=recs,
        )


