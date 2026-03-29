import json
import httpx
import logging
import time
from typing import List, Dict, Any, Optional
from config import settings
from services.telemetry_service import telemetry

logger = logging.getLogger("hirenix.nvidia")

async def invoke_nvidia_llm(
    messages: List[Dict[str, str]],
    model: str = "moonshotai/kimi-k2.5",
    temperature: float = 1.0,
    max_tokens: int = 16384,
) -> Optional[Dict[str, Any]]:
    """
    Invokes the NVIDIA inference API with the provided messages and parameters.
    Returns the JSON response or None if the request fails.
    """
    if not settings.nvidia_api_key:
        logger.warning("NVIDIA_API_KEY is not set. Falling back to heuristics.")
        telemetry.track_call("nvidia", success=False, latency_ms=0)
        return None

    invoke_url = "https://integrate.api.nvidia.com/v1/chat/completions"
    
    headers = {
        "Authorization": f"Bearer {settings.nvidia_api_key}",
        "Accept": "application/json"
    }

    payload = {
        "model": model,
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": temperature,
        "top_p": 1.0,
        "stream": False,
    }

    start_time = time.time()
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(invoke_url, headers=headers, json=payload)
            response.raise_for_status()
            
            data = response.json()
            latency_ms = (time.time() - start_time) * 1000
            
            # Estimate tokens
            usage = data.get("usage", {})
            total_tokens = usage.get("total_tokens", 0)
            
            telemetry.track_call("nvidia", success=True, latency_ms=latency_ms, tokens=total_tokens)
            return data
            
    except Exception as e:
        latency_ms = (time.time() - start_time) * 1000
        logger.error(f"Error invoking NVIDIA LLM: {str(e)}")
        telemetry.track_call("nvidia", success=False, latency_ms=latency_ms)
        return None

async def stream_nvidia_llm(
    messages: List[Dict[str, str]],
    model: str = "moonshotai/kimi-k2.5",
    temperature: float = 1.0,
    max_tokens: int = 16384,
):
    """
    Asynchronous generator that streams responses from the NVIDIA API.
    """
    if not settings.nvidia_api_key:
        logger.warning("NVIDIA_API_KEY is not set. Streaming not supported.")
        yield "Error: NVIDIA_API_KEY is missing."
        return

    invoke_url = "https://integrate.api.nvidia.com/v1/chat/completions"
    
    headers = {
        "Authorization": f"Bearer {settings.nvidia_api_key}",
        "Accept": "text/event-stream"
    }

    payload = {
        "model": model,
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": temperature,
        "top_p": 1.0,
        "stream": True,
    }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            async with client.stream("POST", invoke_url, headers=headers, json=payload) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if not line or line.strip() == "data: [DONE]":
                        continue
                    
                    if line.startswith("data: "):
                        try:
                            chunk = json.loads(line[6:])
                            content = chunk.get("choices", [{}])[0].get("delta", {}).get("content", "")
                            if content:
                                yield content
                        except json.JSONDecodeError:
                            continue
    except Exception as e:
        logger.error(f"Error streaming NVIDIA LLM: {str(e)}")
        yield f"Error: {str(e)}"
