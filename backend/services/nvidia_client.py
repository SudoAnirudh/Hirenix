import httpx
import logging
import time
import json
from typing import List, Dict, Any, Optional
from config import settings
from services.telemetry_service import telemetry

logger = logging.getLogger("hirenix.core_ai")

async def invoke_nvidia_llm(
    messages: List[Dict[str, str]],
    model: str = "meta/llama-3.1-70b-instruct",
    temperature: float = 0.6,
    max_tokens: int = 4096,
) -> Optional[Dict[str, Any]]:
    """
    Invokes the Hirenix AI engine for text generation and reasoning.
    Returns the JSON response or None if the request fails.
    """
    if not settings.nvidia_api_key:
        logger.warning("Core AI API key is not set.")
        telemetry.track_call("nvidia", success=False, latency_ms=0)
        return None

    invoke_url = "https://integrate.api.nvidia.com/v1/chat/completions"
    
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
        "stream": False,
    }

    start_time = time.time()
    try:
        async with httpx.AsyncClient(timeout=90.0) as client:
            response = await client.post(invoke_url, headers=headers, json=payload)
            response.raise_for_status()
            
            data = response.json()
            latency_ms = (time.time() - start_time) * 1000
            
            usage = data.get("usage", {})
            total_tokens = usage.get("total_tokens", 0)
            
            telemetry.track_call("nvidia", success=True, latency_ms=latency_ms, tokens=total_tokens)
            return data
            
    except Exception as e:
        latency_ms = (time.time() - start_time) * 1000
        logger.error(f"Error invoking Hirenix AI: {str(e)}")
        telemetry.track_call("nvidia", success=False, latency_ms=latency_ms)
        return None


async def stream_nvidia_llm(
    messages: List[Dict[str, str]],
    model: str = "meta/llama-3.1-70b-instruct",
    temperature: float = 0.6,
    max_tokens: int = 4096,
):
    """
    Streams response chunks from NVIDIA inference API.
    Yields string content chunks.
    """
    if not settings.nvidia_api_key:
        logger.warning("Core AI API key is not set for streaming.")
        yield "Error: NVIDIA_API_KEY is not set."
        return

    invoke_url = "https://integrate.api.nvidia.com/v1/chat/completions"
    
    headers = {
        "Authorization": f"Bearer {settings.nvidia_api_key}",
        "Content-Type": "application/json",
        "Accept": "text/event-stream"
    }

    payload = {
        "model": model,
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": temperature,
        "stream": True,
    }

    start_time = time.time()
    try:
        async with httpx.AsyncClient(timeout=90.0) as client:
            async with client.stream("POST", invoke_url, headers=headers, json=payload) as response:
                response.raise_for_status()
                
                async for line in response.aiter_lines():
                    if line.startswith("data:"):
                        data_str = line[5:].strip()
                        if data_str == "[DONE]":
                            break
                        try:
                            data_json = json.loads(data_str)
                            chunk = data_json["choices"][0]["delta"].get("content", "")
                            if chunk:
                                yield chunk
                        except Exception:
                            pass
        latency_ms = (time.time() - start_time) * 1000
        telemetry.track_call("nvidia_stream", success=True, latency_ms=latency_ms)
    except Exception as e:
        latency_ms = (time.time() - start_time) * 1000
        logger.error(f"Error in NVIDIA LLM streaming: {str(e)}")
        telemetry.track_call("nvidia_stream", success=False, latency_ms=latency_ms)
        yield f"Error during streaming: {str(e)}"

