import asyncio
import json
import sys
import os

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services.github_analyzer import analyze_github_profile


async def run_live_test(username: str, role: str = "fullstack"):
    print(f"\n==================================================")
    print(f"🚀 RUNNING REAL-WORLD FORENSIC AUDIT FOR: '{username}' (Target Role: {role.upper()})")
    print(f"==================================================\n")

    try:
        res = await analyze_github_profile(username, target_role=role)
        m = res.metrics

        print(f"✅ OVERALL GPI SCORE ({role.upper()} BENCHMARK): {res.gpi_score}/100\n")

        print("--- ⚙️ 3-STEP PIPELINE RESULTS ---")
        print(f"• Total Repositories Scanned: {m.total_repos_scanned}")
        print(f"• Original Repositories Isolated (Non-Forked): {m.original_repos_count}")
        print(f"• Flagship Repos Identified & Audited: {len(m.top_repos)}\n")

        print("--- 📊 4 CORE METRIC CATEGORIES ---")
        print(f"1. Code Quality & Architecture Score: {m.code_quality_score}/100")
        print(f"   └─ Primary Stack Focus: {m.stack_focus_score}/100")
        print(f"   └─ Flagship Testing Density: {m.testing_density_score}%")
        print(f"   └─ Docstring Coverage: {m.docstring_coverage_score}%")
        print(f"   └─ Type Safety Score: {m.type_safety_score}%")
        print(f"   └─ Security Clean Score: {m.security_clean_score}/100")
        print(f"   └─ Avg Dependency Health: {m.dependency_health_score}/100")
        
        print(f"2. Workflow & Git Hygiene Score: {m.git_hygiene_score}/100")
        print(f"   └─ Semantic Commit Ratio: {m.semantic_commit_ratio}%")
        print(f"   └─ Atomic Granularity Ratio: {m.atomic_commit_ratio}%")
        print(f"   └─ Branching Hygiene: {m.branching_hygiene_score}/100")
        
        print(f"3. Open Source & Collaboration Score: {m.collaboration_score}/100")
        print(f"   └─ Total External Repos Contributed: {m.external_contributions_count}")
        print(f"   └─ Merged External PRs: {m.merged_external_prs} | Open PRs: {m.open_external_prs}")
        print(f"   └─ High-Reputation External Repos (>100 ★): {m.reputable_repos_contributed}")
        print(f"   └─ PR Description Quality: {m.pr_description_quality_score}/100")
        
        print(f"4. Project Longevity & Impact Score: {m.longevity_impact_score}/100")
        print(f"   └─ Avg Maintenance Lifespan: {m.avg_maintenance_lifespan_days} days")
        print(f"   └─ Total Original Stars: {m.total_stars}\n")

        print("--- 🏆 FLAGSHIP REPOSITORIES ---")
        for idx, r in enumerate(m.top_repos, 1):
            print(f"[{idx}] {r.name} ({r.language or 'Multi-stack'})")
            print(f"    - Fork: {r.is_fork} | Stars: {r.stars} | Forks: {r.forks}")
            print(f"    - Maintenance Lifespan: {r.maintenance_lifespan_days} days")
            print(f"    - Tests Suite Detected: {r.has_tests}")
            print(f"    - Docstrings: {r.docstring_score}% | Type Safety: {r.type_safety_score}%")
            print(f"    - Secrets Risk Detected: {r.has_secrets_risk}")
            print(f"    - Dockerfile: {r.has_dockerfile} | CI Workflow: {r.has_ci_workflow}")
            print(f"    - Dependency Health Score: {r.dependency_health_score}/100")
            print(f"    - Semantic Commit Ratio: {r.semantic_commit_ratio}%\n")

        print("--- 🤖 AI FORENSIC ASSESSMENT ---")
        print(f"{m.ai_summary}\n")

        print("--- 💪 STRATEGIC STRENGTHS ---")
        for s in res.strengths:
            print(f"• {s}")
        print()

        print("--- 💡 ACTIONABLE RECOMMENDATIONS ---")
        for r in res.recommendations:
            print(f"• {r}")
        print()

    except Exception as e:
        print(f"❌ Real-world test failed with error: {e}")


if __name__ == "__main__":
    target_user = sys.argv[1] if len(sys.argv) > 1 else "SudoAnirudh"
    target_role = sys.argv[2] if len(sys.argv) > 2 else "fullstack"
    asyncio.run(run_live_test(target_user, target_role))

