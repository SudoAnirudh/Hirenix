import httpx
import logging
import re
from datetime import datetime, timedelta
from typing import List, Dict, Tuple, Optional
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

SECRET_PATTERNS = [
    re.compile(r"sk_live_[0-9a-zA-Z]{24}"),
    re.compile(r"ghp_[0-9a-zA-Z]{36}"),
    re.compile(r"AKIA[0-9A-Z]{16}"),
    re.compile(r"AIzaSy[0-9A-Za-z\-_]{35}"),
    re.compile(r"-----BEGIN PRIVATE KEY-----"),
    re.compile(r"""(api_key|aws_secret|secret_key)\s*=\s*['"][A-Za-z0-9_\-+=/]{16,}['"]""", re.IGNORECASE),
]


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
) -> Tuple[bool, float, float, float, bool, float, float, bool, bool, bool]:
    """
    Inspect a flagship repository for:
    - has_tests (bool)
    - dependency_health_score (float 0-100)
    - semantic_commit_ratio (float 0-100)
    - atomic_commit_ratio (float 0-100)
    - uses_branches (bool)
    - docstring_score (float 0-100)
    - type_safety_score (float 0-100)
    - has_secrets_risk (bool)
    - has_dockerfile (bool)
    - has_ci_workflow (bool)
    """
    has_tests = False
    dep_health = 50.0
    semantic_ratio = 50.0
    atomic_ratio = 50.0
    uses_branches = False
    docstring_score = 50.0
    type_safety_score = 50.0
    has_secrets_risk = False
    has_dockerfile = False
    has_ci_workflow = False

    try:
        r = await client.get(
            f"{GITHUB_API}/repos/{username}/{repo_name}/contents",
            headers=_auth_headers(),
            timeout=8.0,
        )
        if r.status_code == 200:
            contents = r.json()
            file_names = [item.get("name", "").lower() for item in contents if isinstance(item, dict)]
            
            # Check dockerfile & CI workflows
            if any(d in file_names for d in ["dockerfile", "docker-compose.yml", "docker-compose.yaml"]):
                has_dockerfile = True
            if ".github" in file_names or ".gitlab-ci.yml" in file_names:
                has_ci_workflow = True

            # Check tests
            test_indicators = {"test", "tests", "__tests__", "spec", "e2e", "cypress", "pytest"}
            if any(name in test_indicators or name.startswith("test") for name in file_names):
                has_tests = True

            # Dependency health check
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

            # 3. Code Health, Type Safety & Secret Scanning on sample source files
            sample_code_files = [
                item for item in contents 
                if isinstance(item, dict) and item.get("type") == "file" and 
                any(item.get("name", "").lower().endswith(ext) for ext in [".py", ".ts", ".tsx", ".js", ".go", ".java", ".cpp"])
            ]
            
            doc_hits = 0
            type_hits = 0
            scanned_files = 0

            for sample_file in sample_code_files[:3]:
                scanned_files += 1
                try:
                    f_resp = await client.get(
                        sample_file.get("url", ""),
                        headers=_auth_headers(),
                        timeout=5.0,
                    )
                    if f_resp.status_code == 200:
                        import base64
                        code_txt = base64.b64decode(f_resp.json().get("content", "")).decode("utf-8", errors="ignore")
                        
                        # Docstring check
                        if '"""' in code_txt or "'''" in code_txt or "/**" in code_txt:
                            doc_hits += 1

                        # Type safety check
                        if any(pattern in code_txt for pattern in ["interface ", "type ", ": string", ": number", "def ", "-> ", ": List[", ": Dict["]):
                            type_hits += 1

                        # Secret scanner check
                        for sec_pat in SECRET_PATTERNS:
                            if sec_pat.search(code_txt):
                                has_secrets_risk = True
                                break
                except Exception:
                    pass

            if scanned_files > 0:
                docstring_score = round((doc_hits / scanned_files) * 100.0, 1)
                type_safety_score = round((type_hits / scanned_files) * 100.0, 1)

    except Exception as e:
        logger.debug(f"Repo contents quality check failed for {repo_name}: {e}")

    # 4. Check recent commits for Git Hygiene
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

    return (
        has_tests,
        dep_health,
        semantic_ratio,
        atomic_ratio,
        uses_branches,
        docstring_score,
        type_safety_score,
        has_secrets_risk,
        has_dockerfile,
        has_ci_workflow,
    )


async def analyze_github_profile(
    username: str, target_role: str = "fullstack"
) -> GitHubAnalysisResponse:
    """Fetch GitHub profile data and compute 4 core metric categories using 3-step pipeline & role benchmarks."""
    target_role = target_role.lower() if target_role else "fullstack"
    logger.info(f"Starting GitHub analysis for user: {username} (Role: {target_role})")
    
    async with httpx.AsyncClient(timeout=25) as client:
        try:
            user_r = await client.get(f"{GITHUB_API}/users/{username}", headers=_auth_headers())
            if user_r.status_code == 404:
                raise Exception(f"GitHub user '{username}' not found. Please check the spelling.")
            if user_r.status_code == 401:
                raise Exception("System GitHub token is invalid. Please contact support.")
            if user_r.status_code == 403:
                raise Exception("GitHub API rate limit reached. Please try again later.")
            user_r.raise_for_status()

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
        eval_repos = original_repos if original_repos else repos

        # ─── PIPELINE STEP 2: Identify Core Flagship Projects ─────────────────────
        def _flagship_score(r: dict) -> float:
            return (
                r.get("stargazers_count", 0) * 3.0
                + r.get("forks_count", 0) * 2.0
                + min(r.get("size", 0) / 100.0, 20.0)
            )

        sorted_repos = sorted(eval_repos, key=_flagship_score, reverse=True)
        flagship_repos = sorted_repos[:3]
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
                            if repo_name and not repo_name.lower().startswith(f"{username.lower()}/"):
                                if evt_type in ("PushEvent", "PullRequestEvent", "PullRequestReviewEvent", "IssuesEvent"):
                                    external_contributions_count += 1
        except Exception as e:
            logger.debug(f"Public events audit failed: {e}")

        # ─── ADVANCED FEATURE 1: Merged vs Unmerged PRs & Repo Reputation ────────
        pr_quality_score = 50.0
        merged_external_prs = 0
        open_external_prs = 0
        reputable_repos_contributed = 0

        try:
            # PR Description Quality
            prs_r = await client.get(
                f"{GITHUB_API}/search/issues",
                params={"q": f"type:pr author:{username}", "per_page": 20},
                headers=_auth_headers(),
                timeout=6.0,
            )
            if prs_r.status_code == 200:
                prs = prs_r.json().get("items", [])
                if prs:
                    body_lengths = [len(p.get("body") or "") for p in prs]
                    avg_len = sum(body_lengths) / len(body_lengths)
                    pr_quality_score = round(min(100.0, max(30.0, (avg_len / 150.0) * 100.0)), 1)

            # Search External PRs (by author in non-owned repos)
            ext_prs_r = await client.get(
                f"{GITHUB_API}/search/issues",
                params={"q": f"type:pr author:{username} -user:{username}", "per_page": 30},
                headers=_auth_headers(),
                timeout=6.0,
            )
            if ext_prs_r.status_code == 200:
                ext_prs = ext_prs_r.json().get("items", [])
                external_repo_paths = set()
                
                for p in ext_prs:
                    state = p.get("state")
                    is_pull = "pull_request" in p
                    pull_info = p.get("pull_request", {})
                    is_merged = bool(pull_info.get("merged_at"))

                    if is_merged or (state == "closed" and "merged" in str(p.get("labels", [])).lower()):
                        merged_external_prs += 1
                    elif state == "open":
                        open_external_prs += 1

                    repo_url = p.get("repository_url", "")
                    if repo_url and "/repos/" in repo_url:
                        repo_path = repo_url.split("/repos/")[1]
                        external_repo_paths.add(repo_path)

                external_contributions_count = max(external_contributions_count, len(external_repo_paths))

                # Check reputation (>100 stars) for top external repos
                repo_cache = {}
                for repo_path in list(external_repo_paths)[:5]:
                    try:
                        tr_r = await client.get(
                            f"{GITHUB_API}/repos/{repo_path}",
                            headers=_auth_headers(),
                            timeout=4.0,
                        )
                        if tr_r.status_code == 200:
                            tr_stars = tr_r.json().get("stargazers_count", 0)
                            if tr_stars >= 100:
                                reputable_repos_contributed += 1
                    except Exception:
                        pass

        except Exception as e:
            logger.debug(f"External PR & reputation audit failed: {e}")

        # ─── Language Focus vs Diversity ─────────────────────────────────────────
        lang_counts = {}
        for r in eval_repos:
            lang = r.get("language")
            if lang:
                lang_counts[lang] = lang_counts.get(lang, 0) + 1

        total_lang_repos = sum(lang_counts.values()) or 1
        lang_dist = {lang: (count / total_lang_repos) * 100 for lang, count in lang_counts.items()}
        languages = sorted(lang_counts.keys(), key=lambda x: lang_counts[x], reverse=True)

        top_two_share = sum(sorted(lang_dist.values(), reverse=True)[:2])
        if len(languages) <= 3 and top_two_share >= 70:
            stack_focus_score = 95.0
        elif top_two_share >= 60:
            stack_focus_score = 85.0
        elif len(languages) > 8 and top_two_share < 35:
            stack_focus_score = 40.0
        else:
            stack_focus_score = 70.0

        # ─── ADVANCED FEATURE 2: Deep Quality, Type Safety & Secret Inspection ───
        repo_metrics: list[RepoMetric] = []
        three_months_iso = three_months_ago.isoformat()
        
        tested_flagship_count = 0
        dep_health_scores = []
        semantic_commit_ratios = []
        atomic_commit_ratios = []
        branching_flags = []
        lifespan_days_list = []
        docstring_scores = []
        type_safety_scores = []
        secrets_detected_flags = []

        for r in top_repos_list:
            r_name = r["name"]
            is_flagship = r in flagship_repos

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

            (
                has_tests,
                dep_health,
                sem_ratio,
                atom_ratio,
                uses_branches,
                doc_score,
                type_score,
                has_sec_risk,
                has_docker,
                has_ci_wf,
            ) = (False, 50.0, 50.0, 50.0, False, 50.0, 50.0, False, False, False)

            if is_flagship:
                (
                    has_tests,
                    dep_health,
                    sem_ratio,
                    atom_ratio,
                    uses_branches,
                    doc_score,
                    type_score,
                    has_sec_risk,
                    has_docker,
                    has_ci_wf,
                ) = await _inspect_repo_quality(client, username, r_name)

                if has_tests:
                    tested_flagship_count += 1
                dep_health_scores.append(dep_health)
                semantic_commit_ratios.append(sem_ratio)
                atomic_commit_ratios.append(atom_ratio)
                branching_flags.append(uses_branches)
                docstring_scores.append(doc_score)
                type_safety_scores.append(type_score)
                secrets_detected_flags.append(has_sec_risk)

            repo_metrics.append(
                RepoMetric(
                    name=r_name,
                    description=r.get("description"),
                    language=r.get("language"),
                    license=r.get("license", {}).get("name") if r.get("license") else None,
                    stars=r.get("stargazers_count", 0),
                    forks=r.get("forks_count", 0),
                    has_readme=bool(r.get("description") or r.get("has_wiki")),
                    has_ci=has_ci_wf or bool(r.get("has_downloads", True)),
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
                    docstring_score=round(doc_score, 1),
                    type_safety_score=round(type_score, 1),
                    has_secrets_risk=has_sec_risk,
                    has_dockerfile=has_docker,
                    has_ci_workflow=has_ci_wf,
                )
            )

        # ─── CORE METRIC CATEGORY COMPUTATIONS ────────────────────────────────────
        testing_density_score = round(
            (tested_flagship_count / max(1, len(flagship_repos))) * 100.0, 1
        )
        avg_dep_health = round(
            sum(dep_health_scores) / max(1, len(dep_health_scores)), 1
        ) if dep_health_scores else 65.0

        avg_docstring_score = round(
            sum(docstring_scores) / max(1, len(docstring_scores)), 1
        ) if docstring_scores else 50.0

        avg_type_safety_score = round(
            sum(type_safety_scores) / max(1, len(type_safety_scores)), 1
        ) if type_safety_scores else 50.0

        security_clean_score = 100.0 if not any(secrets_detected_flags) else 30.0

        code_quality_score = round(
            stack_focus_score * 0.25
            + testing_density_score * 0.25
            + avg_dep_health * 0.20
            + avg_docstring_score * 0.15
            + avg_type_safety_score * 0.15,
            1,
        )

        if security_clean_score < 100.0:
            code_quality_score = max(0.0, round(code_quality_score - 20.0, 1))

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

        # Category 3: Open Source & Collaboration (Weighted for Merged PRs & Reputation)
        pr_collaboration_base = (
            merged_external_prs * 3.0 + open_external_prs * 1.5 + (external_contributions_count - merged_external_prs - open_external_prs) * 0.5
        )
        reputation_bonus = min(30.0, reputable_repos_contributed * 15.0)
        ext_contrib_score = round(min(100.0, pr_collaboration_base * 10.0 + reputation_bonus + (external_contributions_count * 5.0)), 1)
        
        collaboration_score = round(
            pr_quality_score * 0.35 + ext_contrib_score * 0.50 + min(100.0, recent_pushes_count * 5.0) * 0.15,
            1,
        )

        # Category 4: Project Longevity & Impact
        avg_lifespan_days = int(
            sum(lifespan_days_list) / max(1, len(lifespan_days_list))
        ) if lifespan_days_list else 30

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

        # ─── ADVANCED FEATURE 3: Role-Specific Metric Benchmarking ──────────────
        role_weights = {
            "code_quality_score": 0.30,
            "git_hygiene_score": 0.25,
            "collaboration_score": 0.25,
            "longevity_impact_score": 0.20,
        }

        if target_role == "backend":
            role_weights = {
                "code_quality_score": 0.35,
                "git_hygiene_score": 0.25,
                "longevity_impact_score": 0.25,
                "collaboration_score": 0.15,
            }
            # Bonus for Dockerfile & CI Workflows
            if any(r.has_dockerfile for r in repo_metrics):
                code_quality_score = min(100.0, round(code_quality_score + 5.0, 1))
            if any(r.has_ci_workflow for r in repo_metrics):
                git_hygiene_score = min(100.0, round(git_hygiene_score + 5.0, 1))

        elif target_role == "frontend":
            role_weights = {
                "code_quality_score": 0.30,
                "longevity_impact_score": 0.30,
                "git_hygiene_score": 0.20,
                "collaboration_score": 0.20,
            }
            # Bonus for production deployment links
            with_deploy_ratio = sum(1 for r in repo_metrics if r.has_deployment) / max(1, len(repo_metrics))
            longevity_impact_score = min(100.0, round(longevity_impact_score + with_deploy_ratio * 10.0, 1))

        elif target_role == "ml_ai":
            role_weights = {
                "code_quality_score": 0.35,
                "longevity_impact_score": 0.35,
                "git_hygiene_score": 0.15,
                "collaboration_score": 0.15,
            }
            # Bonus for Jupyter Notebooks & Data Scripts
            notebook_count = sum(1 for r in eval_repos if r.get("language") == "Jupyter Notebook")
            if notebook_count > 0:
                code_quality_score = min(100.0, round(code_quality_score + 8.0, 1))

        gpi = (
            code_quality_score * role_weights["code_quality_score"]
            + git_hygiene_score * role_weights["git_hygiene_score"]
            + collaboration_score * role_weights["collaboration_score"]
            + longevity_impact_score * role_weights["longevity_impact_score"]
        )
        gpi_score = round(gpi, 1)

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
            target_role=target_role,
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
            merged_external_prs=merged_external_prs,
            open_external_prs=open_external_prs,
            reputable_repos_contributed=reputable_repos_contributed,
            docstring_coverage_score=avg_docstring_score,
            type_safety_score=avg_type_safety_score,
            security_clean_score=security_clean_score,
            avg_maintenance_lifespan_days=avg_lifespan_days,
            # Legacy fallback
            consistency_score=round(min(100.0, (recent_pushes_count / 10.0) * 50.0 + (total_original_stars / 20.0) * 50.0), 1),
            project_depth_score=round(min(100.0, (avg_lifespan_days / 180.0) * 100.0), 1),
            stack_diversity_score=round(min(100.0, (len(languages) / 6.0) * 100.0), 1),
            production_readiness_score=code_quality_score,
        )

        # ─── AI Deep Dive ────────────────────────────────────────────────────────
        ai_summary = "AI analysis could not be generated."
        if settings.groq_api_key:
            prompt = f"""
            Analyze this GitHub profile for developer '{username}' targeted as a {target_role.upper()} engineer:
            - Role Benchmark: {target_role.upper()}
            - Original Repos Isolated: {original_repos_count} of {total_repos_scanned} total repos.
            - Code Quality & Architecture ({code_quality_score}/100): Testing density {testing_density_score}%, Docstring coverage {avg_docstring_score}%, Type safety {avg_type_safety_score}%, Dependency health {avg_dep_health}/100, Security clean score {security_clean_score}/100.
            - Workflow & Git Hygiene ({git_hygiene_score}/100): Semantic commits {avg_semantic_ratio}%, Atomic commits {avg_atomic_ratio}%.
            - Open Source & Collaboration ({collaboration_score}/100): Merged PRs {merged_external_prs}, Open PRs {open_external_prs}, Reputable repos (>100 stars) {reputable_repos_contributed}.
            - Project Longevity & Impact ({longevity_impact_score}/100): Avg project maintenance lifespan {avg_lifespan_days} days.

            Provide a concise 3-4 sentence forensic assessment highlighting technical rigor, open-source impact, code safety, and suitability for a {target_role.upper()} role.
            Return ONLY the raw summary text.
            """
            ai_resp = await invoke_groq_llm([{"role": "user", "content": prompt}])
            if ai_resp:
                ai_summary = ai_resp.get("choices", [{}])[0].get("message", {}).get("content", ai_summary)

        metrics.ai_summary = ai_summary

        # ─── Strategic Strengths & Actionable Recommendations ───────────────────
        strengths, recs = [], []
        
        if merged_external_prs > 0:
            strengths.append(f"Merged Open Source Contributor: {merged_external_prs} merged pull request(s) in external repositories.")
        if reputable_repos_contributed > 0:
            strengths.append(f"Reputable OS Impact: Contributed pull requests to {reputable_repos_contributed} high-reputation open-source repo(s) (>100 stars).")
        if testing_density_score >= 50:
            strengths.append(f"High Testing Density: {tested_flagship_count} flagship project(s) feature automated test suites.")
        if avg_docstring_score >= 50 and avg_type_safety_score >= 50:
            strengths.append(f"Clean Code & Type Safety: Strong docstring coverage ({avg_docstring_score}%) and type annotations ({avg_type_safety_score}%).")
        if avg_lifespan_days >= 180:
            strengths.append(f"Project Commitment: Maintained core flagship projects for an average of {avg_lifespan_days} days.")
        if not strengths:
            strengths.append("Active original repository owner with ongoing technical development.")

        if security_clean_score < 100.0:
            recs.append("CRITICAL: Remove hardcoded API keys or plaintext credentials from public source code.")
        if testing_density_score < 50:
            recs.append("Add unit & integration test suites (/tests folder) to flagship repositories.")
        if avg_docstring_score < 50:
            recs.append("Improve inline docstring / JSDoc documentation across core functions.")
        if avg_type_safety_score < 50:
            recs.append("Adopt explicit Type Annotations (TypeScript interfaces / Python type hints) for type safety.")
        if avg_semantic_ratio < 60:
            recs.append("Adopt Conventional Commits (e.g., 'feat: add auth', 'fix: null pointer') over generic commit messages.")
        if avg_lifespan_days < 90:
            recs.append("Maintain flagship projects consistently beyond 6 months to demonstrate long-term project stewardship.")

        return GitHubAnalysisResponse(
            analysis_id="",
            username=username,
            gpi_score=gpi_score,
            metrics=metrics,
            strengths=strengths,
            recommendations=recs,
        )



