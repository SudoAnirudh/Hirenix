import jwt
import base64
from functools import lru_cache
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
from config import settings

bearer_scheme = HTTPBearer(auto_error=False)


@lru_cache(maxsize=1)
def get_supabase() -> Client:
    """Return a cached Supabase client (anon key)."""
    return create_client(settings.supabase_url, settings.supabase_key)


@lru_cache(maxsize=1)
def get_supabase_admin() -> Client:
    """Return a cached Supabase client with service role (admin) access."""
    return create_client(settings.supabase_url, settings.supabase_service_key)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict:
    """Validate the Supabase JWT locally using the project's JWT secret.

    This avoids making a network call to Supabase on every request,
    which was causing timeouts and 401 errors.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated. Please log in.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    try:
        print(f"Token unverified header: {jwt.get_unverified_header(token)}")
        # Supabase JWT secrets are base64 encoded
        try:
            secret = base64.b64decode(settings.jwt_secret)
        except Exception:
            secret = settings.jwt_secret

        payload = jwt.decode(
            token,
            secret,
            algorithms=[settings.jwt_algorithm, "HS256"],
            audience="authenticated",
            options={"verify_exp": True},
        )

        user_id = payload.get("sub")
        email = payload.get("email")

        if not user_id:
            raise Exception("Token missing 'sub' claim")

        # user_metadata lives in the JWT under the same key
        metadata = payload.get("user_metadata", {})

        return {
            "user_id": user_id,
            "email": email,
            "plan": metadata.get("plan", "free"),
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError as e:
        # Fallback for ES256 / asymmetric tokens or when local HS256 secret fails
        print(f"⚠️ Local JWT validation failed ({e}), attempting Supabase network verification...")
        try:
            supabase = get_supabase()
            user_res = supabase.auth.get_user(token)
            if not user_res or not user_res.user:
                raise Exception("Network verification returned no user")
            user = user_res.user
            metadata = getattr(user, "user_metadata", {}) or {}
            print("✅ Supabase network verification succeeded.")
            return {
                "user_id": user.id,
                "email": user.email,
                "plan": metadata.get("plan", "free"),
            }
        except Exception as net_e:
            print(f"❌ Supabase network verification failed: {net_e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Could not validate credentials via Supabase. Local: {e}. Network: {net_e}",
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
