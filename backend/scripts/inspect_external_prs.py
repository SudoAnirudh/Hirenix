import asyncio
import httpx
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from config import settings


async def inspect_user_external_contributions(username: str):
    print(f"\n==================================================")
    print(f"🔍 DETAILED OPEN SOURCE CONTRIBUTION OVERVIEW FOR: '{username}'")
    print(f"==================================================\n")

    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "Hirenix-AI-Agent",
    }
    if settings.github_token:
        headers["Authorization"] = f"Bearer {settings.github_token}"

    async with httpx.AsyncClient(timeout=20) as client:
        # Search PRs created in non-owned repositories
        url = "https://api.github.com/search/issues"
        params = {"q": f"type:pr author:{username} -user:{username}", "per_page": 50}

        resp = await client.get(url, params=params, headers=headers)
        if resp.status_code != 200:
            print(f"❌ Failed to fetch PRs: {resp.status_code} {resp.text}")
            return

        data = resp.json()
        prs = data.get("items", [])
        total_count = data.get("total_count", 0)

        print(f"Total External Pull Requests Found: {total_count}\n")

        repo_prs = {}
        for pr in prs:
            repo_url = pr.get("repository_url", "")
            repo_name = repo_url.split("/repos/")[1] if "/repos/" in repo_url else "Unknown"
            
            if repo_name not in repo_prs:
                repo_prs[repo_name] = []
            
            repo_prs[repo_name].append({
                "title": pr.get("title"),
                "state": pr.get("state"),
                "created_at": pr.get("created_at", "")[:10],
                "url": pr.get("html_url"),
                "draft": pr.get("draft", False),
            })

        print(f"Distinct External Repositories Contributed To: {len(repo_prs)}\n")
        
        for idx, (repo_name, items) in enumerate(repo_prs.items(), 1):
            print(f"📦 [{idx}] {repo_name} ({len(items)} Pull Request(s))")
            for item in items:
                state_badge = "🟢 OPEN" if item['state'] == 'open' else "💜 MERGED/CLOSED"
                print(f"    • {state_badge}: \"{item['title']}\"")
                print(f"      Date: {item['created_at']} | Link: {item['url']}")
            print()


if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "SudoAnirudh"
    asyncio.run(inspect_user_external_contributions(target))
