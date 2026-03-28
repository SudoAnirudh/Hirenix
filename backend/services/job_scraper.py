import httpx
import feedparser
import re
import asyncio
import logging
from typing import List, Optional

from models.analysis import JobListing

logger = logging.getLogger("hirenix.job_scraper")


def _strip_html(text: str) -> str:
    if not text:
        return ""
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def _snippet(text: str, max_len: int = 220) -> str:
    if len(text) <= max_len:
        return text
    return text[: max_len - 1].rstrip() + "..."


def _dedupe_jobs(jobs: List[JobListing]) -> List[JobListing]:
    seen = set()
    deduped: List[JobListing] = []
    for job in jobs:
        key = (
            job.apply_url.strip().lower(),
            job.title.strip().lower(),
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
        # feedparser.parse is blocking, but for small feeds it's usually fine.
        # In a high-perf app, we'd run this in a threadpool.
        feed = feedparser.parse(url)
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
    query_parts = [f.strip() for f in fields if f and f.strip()]
    query = " ".join(query_parts).strip()

    per_source = max(5, min(50, limit))
    
    # Parallelize fetching from all sources
    tasks = [
        _fetch_remotive(query, per_source),
        _fetch_arbeitnow(query, per_source, remote_only),
        _fetch_wwr(fields, per_source),
        _fetch_jobspresso(fields, per_source)
    ]
    
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    all_jobs: List[JobListing] = []
    for res in results:
        if isinstance(res, list):
            all_jobs.extend(res)
        elif isinstance(res, Exception):
            logger.error(f"Scraper error: {res}")

    # Keep only jobs with actionable apply links.
    all_jobs = [j for j in all_jobs if j.apply_url]

    # Optional remote filter across all sources.
    if remote_only:
        all_jobs = [j for j in all_jobs if j.remote]

    all_jobs = _dedupe_jobs(all_jobs)
    return all_jobs[:limit]
