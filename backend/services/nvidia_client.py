import httpx
import logging
from typing import List, Dict, Any, Optional
from config import settings

logger = logging.getLogger(__name__)

INVOKE_URL = "https://integrate.api.nvidia.com/v1/chat/completions"
DEFAULT_MODEL = "moonshotai/kimi-k2.5"

async def invoke_nvidia_llm(
    messages: List[Dict[str, str]],
    model: str = DEFAULT_MODEL,
    temperature: float = 1.0,
    max_tokens: int = 16384,
    top_p: float = 1.0,
) -> Optional[str]:
    """
    Invokes the NVIDIA API for chat completions.
    """
    if not settings.nvidia_api_key:
        logger.warning("NVIDIA_API_KEY is not set. LLM features will be disabled.")
        return None

    headers = {
        "Authorization": f"Bearer {settings.nvidia_api_key}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

    payload = {
        "model": model,
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": temperature,
        "top_p": top_p,
        "stream": False,
    }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(INVOKE_URL, headers=headers, json=payload)
            response.raise_for_status()
            
            data = response.json()
            if "choices" in data and len(data["choices"]) > 0:
                return data["choices"][0]["message"]["content"]
            
            logger.error(f"Unexpected NVIDIA API response structure: {data}")
            return None

    except httpx.HTTPStatusError as e:
        logger.error(f"NVIDIA API HTTP Error: {e.response.status_code} - {e.response.text}")
        return None
    except Exception as e:
        logger.error(f"Error calling NVIDIA API: {str(e)}")
        return None
