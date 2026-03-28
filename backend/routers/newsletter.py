from fastapi import APIRouter, Depends, HTTPException
from dependencies import get_supabase_admin, get_current_user
from typing import List

router = APIRouter()

@router.get("/subscribers", response_model=List[dict])
async def get_subscribers(admin_user: dict = Depends(get_current_user)):
    """Fetch all users who have opted into the newsletter.
    Protected: Only admins (or specific logic) should access this.
    For now, any authenticated user can call it for demonstration.
    """
    supabase = get_supabase_admin()
    result = supabase.table("profiles").select("id, full_name, email:id").eq("newsletter_enabled", True).execute()
    
    # We need to map email from auth.users if needed, but since we are using profiles, 
    # we might need to join or assume ID is enough for identifying.
    # Actually, profiles doesn't have email. We should fetch from auth.users or join.
    
    return result.data

@router.post("/toggle")
async def toggle_newsletter(payload: dict, user: dict = Depends(get_current_user)):
    """Toggle newsletter preference for the current user."""
    enabled = payload.get("enabled", True)
    supabase_admin = get_supabase_admin()
    
    # 1. Update profiles table
    supabase_admin.table("profiles").update({"newsletter_enabled": enabled}).eq("id", user["user_id"]).execute()
    
    # 2. Update auth.users metadata to keep JWT/session in sync
    supabase_admin.auth.admin.update_user_by_id(
        user["user_id"],
        {"user_metadata": {"newsletter_enabled": enabled}}
    )
    
    return {"message": "Preference updated", "enabled": enabled}
