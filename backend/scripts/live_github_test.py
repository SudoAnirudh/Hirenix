import asyncio
import json
import sys
import os

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services.github_analyzer import analyze_github_profile


async def run_live_test(username: str):
    print(f"\n==================================================")
    print(f"🚀 RUNNING REAL-WORLD GITHUB FORENSIC AUDIT FOR: '{username}'")
    print(f"==================================================\n")

    try:
        res = await analyze_github_profile(username)
        m = res.metrics

        print(f"✅ OVERALL GPI SCORE: {res.gpi_score}/100\n")

        print("--- ⚙️ 3-STEP PIPELINE RESULTS ---")
        print(f"• Total Repositories Scanned: {m.total_repos_scanned}")
        print(f"• Original Repositories Isolated (Non-Forked): {m.original_repos_count}")
        print(f"• Flagship Repos Identified & Audited: {len(m.top_repos)}\n")

        print("--- 📊 4 CORE METRIC CATEGORIES ---")
        print(f"1. Code Quality & Architecture Score: {m.code_quality_score}/100")
        print(f"   └─ Primary Stack Focus: {m.stack_focus_score}/100")
        print(f"   └─ Flagship Testing Density: {m.testing_density_score}%")
        print(f"   └─ Avg Dependency Health: {m.dependency_health_score}/100")
        
        print(f"2. Workflow & Git Hygiene Score: {m.git_hygiene_score}/100")
        print(f"   └─ Semantic Commit Ratio: {m.semantic_commit_ratio}%")
        print(f"   └─ Atomic Granularity Ratio: {m.atomic_commit_ratio}%")
        print(f"   └─ Branching Hygiene: {m.branching_hygiene_score}/100")
        
        print(f"3. Open Source & Collaboration Score: {m.collaboration_score}/100")
        print(f"   └─ External Contributions: {m.external_contributions_count} repos")
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
    asyncio.run(run_live_test(target_user))
