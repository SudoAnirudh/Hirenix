import httpx
import feedparser
import re
import asyncio
import logging
from typing import List

from models.analysis import JobListing

logger = logging.getLogger("hirenix.job_scraper")

# ⚡ Bolt: Pre-compile regex for HTML stripping to reduce compilation overhead
# What: Pre-compile the _HTML_TAG_PATTERN and _WHITESPACE_PATTERN at the module level.
# Why: _strip_html is called repeatedly in scraping loops. Without pre-compiling, re.sub dynamically checks the regex cache or compiles the pattern on every call, increasing CPU overhead.
# Impact: Reduces CPU time spent on repetitive regex initialization, speeding up job scraping and processing large JSON payloads.
_HTML_TAG_PATTERN = re.compile(r"<[^>]+>")
_WHITESPACE_PATTERN = re.compile(r"\s+")

def _strip_html(text: str) -> str:
    if not text:
        return ""
    text = _HTML_TAG_PATTERN.sub(" ", text)
    text = _WHITESPACE_PATTERN.sub(" ", text)
    return text.strip()


def _snippet(text: str, max_len: int = 450) -> str:
    if len(text) <= max_len:
        return text
    # Try to cut at a sentence or space
    cut = text[: max_len - 1].rsplit(".", 1)[0]
    if len(cut) < max_len * 0.7: # Too aggressive cut
         cut = text[: max_len - 1].rsplit(" ", 1)[0]
    return cut.rstrip() + "..."


def _dedupe_jobs(jobs: List[JobListing]) -> List[JobListing]:
    seen = set()
    deduped: List[JobListing] = []
    for job in jobs:
        # Normalize key for better deduping
        key = (
            job.apply_url.strip().lower(),
            job.title.strip().lower()[:30], # First 30 chars of title
            job.company.strip().lower(),
        )
        if key in seen:
            continue
        seen.add(key)
        deduped.append(job)
    return deduped


async def _fetch_remotive(query: str, limit: int) -> List[JobListing]:
    url = "https://remotive.com/api/remote-jobs"
    params = {"search": query}

    async with httpx.AsyncClient(timeout=20.0) as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        payload = response.json()

    jobs: List[JobListing] = []
    for row in (payload.get("jobs") or [])[:limit]:
        description = _strip_html(row.get("description", ""))
        jobs.append(
            JobListing(
                title=row.get("title", "Untitled Role"),
                company=row.get("company_name", "Unknown Company"),
                location=row.get("candidate_required_location") or "Remote",
                remote=True,
                job_type=row.get("job_type") or "Not specified",
                tags=row.get("tags") or [],
                apply_url=row.get("url") or "",
                source="Remotive",
                posted_at=row.get("publication_date") or "",
                description_snippet=_snippet(description),
            )
        )
    return jobs


async def _fetch_arbeitnow(
    query: str, limit: int, remote_only: bool
) -> List[JobListing]:
    # Public job board API. Returns paginated JSON in `data`.
    url = "https://www.arbeitnow.com/api/job-board-api"

    async with httpx.AsyncClient(timeout=20.0) as client:
        response = await client.get(url)
        response.raise_for_status()
        payload = response.json()

    q = query.lower().strip()
    jobs: List[JobListing] = []

    for row in payload.get("data") or []:
        title = row.get("title", "")
        company = row.get("company_name", "")
        tags = row.get("tags") or []
        location = row.get("location") or "Unknown"
        is_remote = bool(row.get("remote") or "remote" in location.lower())
        haystack = " ".join([title, company, location, " ".join(tags)]).lower()

        if q and q not in haystack:
            continue
        if remote_only and not is_remote:
            continue

        description = _strip_html(row.get("description", ""))
        apply_url = row.get("url") or row.get("job_url") or ""
        if not apply_url and row.get("slug"):
            apply_url = f"https://www.arbeitnow.com/jobs/{row['slug']}"

        jobs.append(
            JobListing(
                title=title or "Untitled Role",
                company=company or "Unknown Company",
                location=location,
                remote=is_remote,
                job_type=(row.get("job_types") or ["Not specified"])[0],
                tags=tags,
                apply_url=apply_url,
                source="Arbeitnow",
                posted_at=str(row.get("created_at") or ""),
                description_snippet=_snippet(description),
            )
        )

        if len(jobs) >= limit:
            break

    return jobs


async def _fetch_rss_jobs(
    url: str, source_name: str, keywords: List[str], limit: int
) -> List[JobListing]:
    # Use feedparser to get jobs from RSS feeds
    try:
        # feedparser.parse is blocking I/O, so we offload it to a threadpool
        # to prevent blocking the FastAPI asyncio event loop.
        # This significantly improves concurrency when fetching multiple feeds.
        feed = await asyncio.to_thread(feedparser.parse, url)
    except Exception:
        return []

    keyword_list = [k.lower() for k in keywords]
    jobs: List[JobListing] = []

    for entry in feed.entries:
        title = getattr(entry, "title", "").lower()
        summary = getattr(entry, "summary", "").lower()
        company = getattr(entry, "company", "Unknown")
        
        haystack = f"{title} {summary} {company}"
        if keyword_list and not all(k in haystack for k in keyword_list):
            continue

        # WWR specific mapping
        location = getattr(entry, "location", "Remote")
        
        jobs.append(
            JobListing(
                title=getattr(entry, "title", "Untitled Role"),
                company=company,
                location=location,
                remote=True, # WWR and Jobspresso are remote-first
                job_type="Full-time", # Default for these feeds
                tags=[],
                apply_url=getattr(entry, "link", ""),
                source=source_name,
                posted_at=getattr(entry, "published", ""),
                description_snippet=_snippet(_strip_html(summary)),
            )
        )

        if len(jobs) >= limit:
            break

    return jobs


async def _fetch_wwr(keywords: List[str], limit: int) -> List[JobListing]:
    url = "https://weworkremotely.com/remote-jobs.rss"
    return await _fetch_rss_jobs(url, "We Work Remotely", keywords, limit)


async def _fetch_jobspresso(keywords: List[str], limit: int) -> List[JobListing]:
    url = "https://jobspresso.co/feed/"
    return await _fetch_rss_jobs(url, "Jobspresso", keywords, limit)


async def scrape_jobs(
    fields: List[str], location: str | None, remote_only: bool, limit: int
) -> List[JobListing]:
    # Refined search query construction
    queries = [f.strip() for f in fields if f and f.strip()]
    
    # We'll run searches for each field separately to maximize breadth
    source_limit = max(8, limit // 2)
    
    all_tasks = []
    for q in queries:
        all_tasks.append(_fetch_remotive(q, source_limit))
        all_tasks.append(_fetch_arbeitnow(q, source_limit, remote_only))
        all_tasks.append(_fetch_wwr([q], source_limit))
        all_tasks.append(_fetch_jobspresso([q], source_limit))

    if not all_tasks and location: # Just location search
        all_tasks = [
            _fetch_remotive(location, source_limit),
            _fetch_arbeitnow(location, source_limit, remote_only)
        ]

    results = await asyncio.gather(*all_tasks, return_exceptions=True)
    
    all_jobs: List[JobListing] = []
    for res in results:
        if isinstance(res, list):
            all_jobs.extend(res)
        elif isinstance(res, Exception):
            logger.error(f"Global Scraper error: {res}")

    # Robust location filtering if provided
    if location:
        loc_q = location.lower().strip()
        all_jobs = [
            j for j in all_jobs 
            if loc_q in j.location.lower() or (j.remote and loc_q == "remote")
        ]

    # Post-filtering for quality
    all_jobs = [j for j in all_jobs if j.apply_url and len(j.title) > 3]
    all_jobs = _dedupe_jobs(all_jobs)
    
    return all_jobs[:limit]
