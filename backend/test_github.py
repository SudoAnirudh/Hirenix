import asyncio
import os
import sys

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.github_analyzer import analyze_github_profile
from config import settings

async def main():
    username = "torvalds"  # Linus Torvalds
    print(f"Testing GitHub API with token: {settings.github_token[:4]}...{settings.github_token[-4:] if settings.github_token else 'None'}")
    
    try:
        print(f"Fetching data for: {username}")
        result = await analyze_github_profile(username)
        print("\n✅ Success!")
        print(f"GPI Score: {result.gpi_score}")
        print(f"Repo Count: {result.metrics.total_repos}")
        print(f"Stars: {result.metrics.total_stars}")
    except Exception as e:
        print(f"\n❌ Failed: {e}")
        # If it's an HTTP error, print details
        if hasattr(e, 'response'):
            print(f"Status: {e.response.status_code}")
            print(f"Body: {e.response.text}")

if __name__ == "__main__":
    asyncio.run(main())
