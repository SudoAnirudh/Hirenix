import asyncio
import uuid
from fastapi import APIRouter, Depends
from dependencies import get_current_user, get_supabase_admin
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class ApplicationCreate(BaseModel):
    company: str
    role: str
    location: Optional[str] = None
    status: str = "wishlist"
    apply_url: Optional[str] = None
    match_score: Optional[float] = None
    notes: Optional[str] = None

class ApplicationUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None

@router.post("/", response_model=dict)
async def create_application(
    payload: ApplicationCreate,
    user: dict = Depends(get_current_user),
    db=Depends(get_supabase_admin),
):
    """Adds a new job application record for tracking."""
    app_id = str(uuid.uuid4())
    # ⚡ Bolt: Offload synchronous Supabase call to thread
    # What: Uses asyncio.to_thread to run the synchronous .execute() call in a background thread.
    # Why: The Supabase python client is synchronous; calling .execute() directly blocks the async event loop and increases latency.
    # Impact: Unblocks the main thread, allowing concurrent handling of other async requests.
    await asyncio.to_thread(
        lambda: db.table("job_applications").insert({
            "id": app_id,
            "user_id": user["user_id"],
            **payload.model_dump()
        }).execute()
    )
    return {"message": "Application tracked successfully.", "id": app_id}

@router.get("/", response_model=List[dict])
async def list_applications(
    user: dict = Depends(get_current_user),
    db=Depends(get_supabase_admin),
):
    """Lists all tracked applications for the current user."""
    # ⚡ Bolt: Offload synchronous Supabase call to thread
    # What: Uses asyncio.to_thread to run the synchronous .execute() call in a background thread.
    # Why: The Supabase python client is synchronous; calling .execute() directly blocks the async event loop and increases latency.
    # Impact: Unblocks the main thread, allowing concurrent handling of other async requests.
    r = await asyncio.to_thread(
        lambda: db.table("job_applications")
        .select("*")
        .eq("user_id", user["user_id"])
        .order("created_at", desc=True)
        .execute()
    )
    return r.data

@router.patch("/{app_id}")
async def update_application(
    app_id: str,
    payload: ApplicationUpdate,
    user: dict = Depends(get_current_user),
    db=Depends(get_supabase_admin),
):
    """Updates status or notes for an application."""
    # ⚡ Bolt: Offload synchronous Supabase call to thread
    # What: Uses asyncio.to_thread to run the synchronous .execute() call in a background thread.
    # Why: The Supabase python client is synchronous; calling .execute() directly blocks the async event loop and increases latency.
    # Impact: Unblocks the main thread, allowing concurrent handling of other async requests.
    await asyncio.to_thread(
        lambda: db.table("job_applications").update(
            payload.model_dump(exclude_none=True)
        ).eq("id", app_id).eq("user_id", user["user_id"]).execute()
    )
    return {"message": "Application updated."}

@router.delete("/{app_id}")
async def delete_application(
    app_id: str,
    user: dict = Depends(get_current_user),
    db=Depends(get_supabase_admin),
):
    """Removes an application record."""
    # ⚡ Bolt: Offload synchronous Supabase call to thread
    # What: Uses asyncio.to_thread to run the synchronous .execute() call in a background thread.
    # Why: The Supabase python client is synchronous; calling .execute() directly blocks the async event loop and increases latency.
    # Impact: Unblocks the main thread, allowing concurrent handling of other async requests.
    await asyncio.to_thread(
        lambda: db.table("job_applications").delete().eq("id", app_id).eq("user_id", user["user_id"]).execute()
    )
    return {"message": "Application removed."}
