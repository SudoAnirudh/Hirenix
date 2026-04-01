import json
import httpx
import logging
import time
from typing import List, Dict, Any, Optional
from config import settings
from services.telemetry_service import telemetry

logger = logging.getLogger("hirenix.groq")

async def invoke_groq_llm(
    messages: List[Dict[str, str]],
    model: str = "llama-3.3-70b-versatile",
    temperature: float = 0.7,
    max_tokens: int = 4096,
) -> Optional[Dict[str, Any]]:
    """
    Invokes the Groq inference API with the provided messages and parameters.
    Returns the JSON response or None if the request fails.
    """
    if not settings.groq_api_key:
        logger.warning("GROQ_API_KEY is not set.")
        telemetry.track_call("groq", success=False, latency_ms=0)
        return None

    invoke_url = "https://api.groq.com/openai/v1/chat/completions"
    
    headers = {
        "Authorization": f"Bearer {settings.groq_api_key}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

    payload = {
        "model": model,
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": temperature,
        "stream": False,
    }

    start_time = time.time()
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(invoke_url, headers=headers, json=payload)
            response.raise_for_status()
            
            data = response.json()
            latency_ms = (time.time() - start_time) * 1000
            
            usage = data.get("usage", {})
            total_tokens = usage.get("total_tokens", 0)
            
            telemetry.track_call("groq", success=True, latency_ms=latency_ms, tokens=total_tokens)
            return data
            
    except Exception as e:
        latency_ms = (time.time() - start_time) * 1000
        logger.error(f"Error invoking Groq LLM: {str(e)}")
        telemetry.track_call("groq", success=False, latency_ms=latency_ms)
        return None
