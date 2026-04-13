import asyncio
import httpx
import logging
import urllib.parse
from typing import List, Dict

logger = logging.getLogger(__name__)

async def validate_url(client: httpx.AsyncClient, url: str) -> bool:
    """Checks if a URL is reachable using a HEAD request."""
    try:
        # We use a short timeout because we don't want to block roadmap generation
        response = await client.head(url, timeout=2.0, follow_redirects=True)
        return response.status_code < 400
    except Exception:
        # If HEAD fails, try GET with a tiny bit of content (some sites block HEAD)
        try:
            response = await client.get(url, timeout=2.0, follow_redirects=True, headers={"Range": "bytes=0-0"})
            return response.status_code < 400
        except:
            return False

async def validate_links(urls: List[str]) -> Dict[str, bool]:
    """Validates a list of URLs in parallel."""
    async with httpx.AsyncClient(headers={"User-Agent": "Hirenix-Link-Validator/1.0"}) as client:
        tasks = [validate_url(client, url) for url in urls]
        results = await asyncio.gather(*tasks)
        return dict(zip(urls, results))

def get_fallback_url(skill_name: str, resource_type: str = "video") -> str:
    """Generates a verified search URL as a fallback."""
    query = urllib.parse.quote(f"learn {skill_name} {resource_type}")
    if resource_type == "video":
        return f"https://www.youtube.com/results?search_query={query}"
    return f"https://www.google.com/search?q={query}"
