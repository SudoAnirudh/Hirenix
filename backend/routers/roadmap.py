import asyncio
import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from models.roadmap import Roadmap, RoadmapUpdate
from services.roadmap_engine import roadmap_engine
from services.skill_gap import _load_matrix
from dependencies import get_current_user, get_supabase_admin

logger = logging.getLogger("hirenix.routers.roadmap")

router = APIRouter(tags=["roadmap"])

@router.get("/roles", response_model=List[str])
async def get_roles():
    """Get the list of available career roles from the matrix."""
    try:
        matrix = _load_matrix()
        return list(matrix.keys())
    except Exception as e:
        logger.error(f"Failed to load roles: {e}")
        raise HTTPException(status_code=500, detail="Failed to load roles.")

@router.get("/current", response_model=Optional[Roadmap])
async def get_current_roadmap(
    user: dict = Depends(get_current_user),
    db = Depends(get_supabase_admin)
):
    """Retrieve the user's latest saved roadmap and apply completed status."""
    try:
        user_id = user["user_id"]
        res = db.table("roadmaps").select("*").eq("user_id", user_id).order("updated_at", desc=True).limit(1).execute()
        
        if not res.data:
            return None
            
        roadmap_record = res.data[0]
        roadmap_data = roadmap_record["roadmap_data"]
        completed_skills = roadmap_record.get("completed_skills", [])
        
        # Merge completion status back into roadmap_data
        for skill in roadmap_data.get("skills", []):
            if skill["name"] in completed_skills:
                skill["status"] = "completed"
        
        return Roadmap(**roadmap_data)
    except Exception as e:
        logger.error(f"Failed to fetch roadmap: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch roadmap.")

@router.post("/generate", response_model=Roadmap)
async def generate_roadmap(
    target_role: str,
    username: str = "guest",
    user: dict = Depends(get_current_user),
    db = Depends(get_supabase_admin)
):
    """Generate a new roadmap and save it to the database."""
    try:
        user_id = user["user_id"]
        
        # ⚡ Bolt: Parallelize independent database queries
        # What: Uses asyncio.gather with asyncio.to_thread to run 3 Supabase queries concurrently.
        # Why: The Supabase python client is synchronous; calling .execute() in series blocks the async event loop and increases latency.
        # Impact: Reduces query time from ~3N to ~1N, speeding up roadmap generation.
        resumes_task = asyncio.to_thread(lambda: db.table("resumes").select("raw_text").eq("user_id", user_id).order("created_at", desc=True).limit(1).execute())
        github_task = asyncio.to_thread(lambda: db.table("github_analyses").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(1).execute())
        linkedin_task = asyncio.to_thread(lambda: db.table("linkedin_analyses").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(1).execute())

        res_r, gh_r, li_r = await asyncio.gather(resumes_task, github_task, linkedin_task)

        # 1. Fetch Resume
        resume_text = ""
        if res_r.data:
            resume_text = res_r.data[0]["raw_text"]
        else:
            raise HTTPException(status_code=400, detail="No resume found. Please upload a resume first.")
        
        # 2. Fetch GitHub
        gh_analysis = None
        if gh_r.data:
            gh_analysis = gh_r.data[0]
            
        # 3. Fetch LinkedIn
        li_analysis = None
        if li_r.data:
            li_analysis = li_r.data[0]

        # 4. Generate
        roadmap = await roadmap_engine.generate_roadmap(
            resume_text=resume_text,
            github_data=gh_analysis,
            linkedin_data=li_analysis,
            target_role=target_role,
            user_id=user_id,
            github_username=username
        )

        # 5. Save to DB
        db.table("roadmaps").insert({
            "user_id": user_id,
            "target_role": target_role,
            "roadmap_data": roadmap.model_dump(),
            "completed_skills": []
        }).execute()

        return roadmap
    except Exception as e:
        import traceback
        traceback.print_exc()
        logger.error(f"Roadmap generation failed: {e}")
        raise HTTPException(status_code=500, detail="Roadmap generation failed.")

@router.patch("/skills", response_model=Optional[Roadmap])
async def update_skill_status(
    update: RoadmapUpdate,
    user: dict = Depends(get_current_user),
    db = Depends(get_supabase_admin)
):
    """Update which skills have been completed in the current roadmap."""
    try:
        user_id = user["user_id"]
        
        # Update the latest roadmap for this user and role
        res = db.table("roadmaps").update({
            "completed_skills": update.completed_skills
        }).eq("user_id", user_id).eq("target_role", update.target_role).execute()
        
        if not res.data:
            raise HTTPException(status_code=404, detail="Roadmap not found.")
            
        return await get_current_roadmap(user, db)
    except Exception as e:
        logger.error(f"Failed to update skills: {e}")
        raise HTTPException(status_code=500, detail="Failed to update skills.")
