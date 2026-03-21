from fastapi import APIRouter, Depends, HTTPException
from models.roadmap import Roadmap
from services.roadmap_engine import roadmap_engine
from dependencies import get_current_user

from services.skill_gap import _load_matrix

router = APIRouter(prefix="/roadmap", tags=["roadmap"])

@router.get("/roles", response_model=List[str])
async def get_roles():
    """
    Get the list of available career roles.
    """
    try:
        matrix = _load_matrix()
        return list(matrix.keys())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{username}", response_model=Roadmap)
async def get_roadmap(username: str, target_role: str, resume_text: str, user: dict = Depends(get_current_user)):
    """
    Generate or fetch a career roadmap for a given user and target role.
    """
    try:
        # In a real app, you'd fetch resume_text from DB or S3.
        # For now, we expect it in the query or body.
        roadmap = await roadmap_engine.generate_roadmap(
            resume_text=resume_text,
            github_username=username,
            target_role=target_role,
            user_id=str(user["id"])
        )
        return roadmap
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
