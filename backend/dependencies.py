import asyncio
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
from config import settings

bearer_scheme = HTTPBearer(auto_error=False)


def get_supabase() -> Client:
    """Return an authenticated Supabase client (anon key)."""
    return create_client(settings.supabase_url, settings.supabase_key)


def get_supabase_admin() -> Client:
    """Return a Supabase client with service role (admin) access."""
    return create_client(settings.supabase_url, settings.supabase_service_key)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict:
    """Validate token against Supabase Auth API (handles RS256/HS256 and secret rotation)."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated. Please log in.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    try:
        supabase = get_supabase()
        # Timeout after 10s to prevent hanging on invalid/expired tokens
        user_response = await asyncio.wait_for(
            asyncio.get_event_loop().run_in_executor(
                None, lambda: supabase.auth.get_user(token)
            ),
            timeout=10.0,
        )
        user = user_response.user

        if not user:
            raise Exception("User not found")

        return {
            "user_id": user.id,
            "email": user.email,
            "plan": user.user_metadata.get("plan", "free"),
        }
    except asyncio.TimeoutError:
        print("❌ Auth Error: Supabase auth timed out")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication timed out. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        print(f"❌ Auth Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials via Supabase",
            headers={"WWW-Authenticate": "Bearer"},
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
