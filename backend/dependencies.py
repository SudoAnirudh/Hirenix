from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from supabase import create_client, Client
from config import settings

bearer_scheme = HTTPBearer()


def get_supabase() -> Client:
    """Return an authenticated Supabase client (anon key)."""
    return create_client(settings.supabase_url, settings.supabase_key)


def get_supabase_admin() -> Client:
    """Return a Supabase client with service role (admin) access."""
    return create_client(settings.supabase_url, settings.supabase_service_key)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    """Validate token against Supabase Auth API (reliable remote check)."""
    token = credentials.credentials
    
    try:
        # Use Supabase client to verify token (handles RS256/HS256 and secret rotation)
        supabase = get_supabase()
        user_response = supabase.auth.get_user(token)
        user = user_response.user
        
        if not user:
             raise Exception("User not found")

        return {
            "user_id": user.id,
            "email": user.email,
            "plan": user.user_metadata.get("plan", "free"),
        }
    except Exception as e:
        print(f"❌ Auth Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials via Supabase",
        )


def require_plan(*allowed_plans: str):
    """Factory that returns a dependency enforcing a minimum subscription plan."""

    async def _check_plan(user: dict = Depends(get_current_user)) -> dict:
        if user["plan"] not in allowed_plans:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This feature requires one of: {', '.join(allowed_plans)} plan.",
            )
        return user

    return _check_plan
