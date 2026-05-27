import os
import secrets
import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

from dependencies import get_supabase_admin
from config import settings
from services.twitter_job_aggregator import sync_twitter_jobs

logger = logging.getLogger("hirenix.jobs_board")
router = APIRouter()
security = HTTPBearer(auto_error=False)

class JobPostResponse(BaseModel):
    id: str
    title: str
    company: str
    location: str
    apply_url: Optional[str] = None
    description: Optional[str] = None
    requirements: List[str] = []
    posted_at: str
    created_at: str

class PaginatedJobsResponse(BaseModel):
    total: int
    page: int
    limit: int
    jobs: List[JobPostResponse]

@router.get("", response_model=PaginatedJobsResponse)
async def get_jobs_board(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    db=Depends(get_supabase_admin)
):
    try:
        query = db.table("job_posts").select("*", count="exact")
        if search:
            query = query.or_(f"title.ilike.%{search}%,company.ilike.%{search}%,description.ilike.%{search}%")
        if location:
            query = query.ilike("location", f"%{location}%")
        query = query.order("posted_at", desc=True)
        start = (page - 1) * limit
        end = start + limit - 1
        response = query.range(start, end).execute()
        jobs_data = response.data or []
        total_count = response.count or len(jobs_data)
        
        formatted_jobs = [
            JobPostResponse(
                id=j["id"], title=j["title"], company=j["company"], location=j["location"],
                apply_url=j.get("apply_url"), description=j.get("description"),
                requirements=j.get("requirements") or [], posted_at=j["posted_at"], created_at=j["created_at"]
            ) for j in jobs_data
        ]
        return PaginatedJobsResponse(total=total_count, page=page, limit=limit, jobs=formatted_jobs)
    except Exception as e:
        logger.error(f"Error fetching jobs: {e}")
        raise HTTPException(status_code=500, detail="Could not retrieve job postings.")

@router.post("/sync")
async def trigger_jobs_sync(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security),
    db=Depends(get_supabase_admin)
):
    expected_token = os.environ.get("JOBS_SYNC_TOKEN") or settings.jwt_secret
    if not credentials or not secrets.compare_digest(credentials.credentials, expected_token):
        raise HTTPException(status_code=401, detail="Unauthorized.")
    try:
        new_jobs = await sync_twitter_jobs()
        return {"status": "success", "message": f"Sync complete. Added {new_jobs} jobs."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
