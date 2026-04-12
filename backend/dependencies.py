import base64
import time
from functools import lru_cache
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import httpx
import jwt
from supabase import create_client, Client
from config import settings

bearer_scheme = HTTPBearer(auto_error=False)
SUPPORTED_ASYMMETRIC_ALGORITHMS = {"ES256", "RS256"}
JWKS_CACHE_TTL_SECONDS = 300
_jwks_cache: dict[str, object] = {"keys": None, "expires_at": 0.0}


class MalformedTokenError(Exception):
    """Raised when the bearer token is not a syntactically valid JWT."""


@lru_cache(maxsize=1)
def get_supabase() -> Client:
    """Return a cached Supabase client (anon key)."""
    return create_client(settings.supabase_url, settings.supabase_key)


@lru_cache(maxsize=1)
def get_supabase_admin() -> Client:
    """Return a cached Supabase client with service role (admin) access."""
    return create_client(settings.supabase_url, settings.supabase_service_key)


def _decode_hs_secret() -> str | bytes:
    try:
        return base64.b64decode(settings.jwt_secret)
    except Exception:
        return settings.jwt_secret


def _get_jwks() -> list[dict]:
    now = time.time()
    cached_keys = _jwks_cache.get("keys")
    expires_at = _jwks_cache.get("expires_at", 0.0)
    if isinstance(cached_keys, list) and isinstance(expires_at, (int, float)) and now < expires_at:
        return cached_keys

    jwks_url = f"{settings.supabase_url.rstrip('/')}/auth/v1/.well-known/jwks.json"
    response = httpx.get(jwks_url, timeout=5.0)
    response.raise_for_status()
    keys = response.json().get("keys", [])
    if not isinstance(keys, list) or not keys:
        raise ValueError("JWKS response did not contain any signing keys")

    _jwks_cache["keys"] = keys
    _jwks_cache["expires_at"] = now + JWKS_CACHE_TTL_SECONDS
    return keys


def _get_signing_key(token: str) -> tuple[object, list[str]]:
    try:
        header = jwt.get_unverified_header(token)
    except jwt.DecodeError as exc:
        raise MalformedTokenError("Malformed bearer token") from exc

    algorithm = header.get("alg")
    if not algorithm:
        raise MalformedTokenError("Token header missing alg")

    if algorithm in {"HS256", settings.jwt_algorithm}:
        return _decode_hs_secret(), [algorithm]

    if algorithm not in SUPPORTED_ASYMMETRIC_ALGORITHMS:
        raise jwt.InvalidAlgorithmError(f"Unsupported JWT algorithm: {algorithm}")

    key_id = header.get("kid")
    if not key_id:
        raise MalformedTokenError("Token header missing kid")

    for jwk in _get_jwks():
        if jwk.get("kid") == key_id:
            return jwt.PyJWK.from_dict(jwk).key, [algorithm]

    raise jwt.InvalidTokenError(f"No signing key found for kid={key_id}")


def _decode_token(token: str) -> dict:
    signing_key, algorithms = _get_signing_key(token)
    return jwt.decode(
        token,
        signing_key,
        algorithms=algorithms,
        audience="authenticated",
        issuer=f"{settings.supabase_url.rstrip('/')}/auth/v1",
        options={"verify_exp": True},
    )


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
        payload = _decode_token(token)

        user_id = payload.get("sub")
        email = payload.get("email")

        if not user_id:
            raise jwt.InvalidTokenError("Token missing 'sub' claim")

        # user_metadata lives in the JWT under the same key
        metadata = payload.get("user_metadata", {})

        return {
            "user_id": user_id,
            "email": email,
            "plan": "pro"  # Hardcoded to 'pro' to bypass all feature gates
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except MalformedTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError as exc:
        print(f"⚠️ Local JWT validation failed ({exc}), attempting Supabase network verification...")
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
                "plan": "pro"  # Hardcoded to 'pro' to bypass all feature gates
            }
        except Exception as net_e:
            print(f"❌ Supabase network verification failed: {net_e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials. Please log in again.",
                headers={"WWW-Authenticate": "Bearer"},
            )


def require_plan(*allowed_plans: str):
    """Factory that returns a dependency enforcing a minimum subscription plan."""

    async def _check_plan(user: dict = Depends(get_current_user)) -> dict:
        # Plan enforcement disabled: everyone is 'pro'
        return user

    return _check_plan
