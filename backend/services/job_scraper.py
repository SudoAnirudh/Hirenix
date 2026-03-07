import re
from typing import List
import httpx

from models.analysis import JobListing


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


async def scrape_jobs(
    fields: List[str], location: str | None, remote_only: bool, limit: int
) -> List[JobListing]:
    query_parts = [f.strip() for f in fields if f and f.strip()]
    if location and location.strip():
        query_parts.append(location.strip())
    query = " ".join(query_parts).strip()

    per_source = max(5, min(50, limit))
    all_jobs: List[JobListing] = []

    try:
        all_jobs.extend(await _fetch_remotive(query, per_source))
    except Exception:
        pass

    try:
        all_jobs.extend(await _fetch_arbeitnow(query, per_source, remote_only))
    except Exception:
        pass

    # Keep only jobs with actionable apply links.
    all_jobs = [j for j in all_jobs if j.apply_url]

    # Optional remote filter across all sources.
    if remote_only:
        all_jobs = [j for j in all_jobs if j.remote]

    all_jobs = _dedupe_jobs(all_jobs)
    return all_jobs[:limit]
