from fastapi import APIRouter, HTTPException, status
from supabase import create_client
from config import settings
from models.user import RegisterRequest, LoginRequest, TokenResponse

router = APIRouter()


@router.post("/register", response_model=dict)
async def register(payload: RegisterRequest):
    """Register a new user via Supabase Auth."""
    client = create_client(settings.supabase_url, settings.supabase_key)
    try:
        result = client.auth.sign_up({
            "email": payload.email,
            "password": payload.password,
            "options": {
                "data": {
                    "full_name": payload.full_name or "",
                    "plan": "free",
                }
            },
        })
        if result.user is None:
            raise HTTPException(status_code=400, detail="Registration failed.")
        return {"message": "Registration successful. Please verify your email.", "user_id": result.user.id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
    """Authenticate user and return JWT."""
    client = create_client(settings.supabase_url, settings.supabase_key)
    try:
        result = client.auth.sign_in_with_password({
            "email": payload.email,
            "password": payload.password,
        })
        if result.session is None:
            raise HTTPException(status_code=401, detail="Invalid credentials.")
        plan = result.user.user_metadata.get("plan", "free")
        return TokenResponse(
            access_token=result.session.access_token,
            user_id=result.user.id,
            email=result.user.email,
            plan=plan,
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))
