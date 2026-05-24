import httpx
import logging
from config import settings

logger = logging.getLogger("hirenix.audio")

async def transcribe_audio_with_groq(file_bytes: bytes, filename: str) -> str:
    """
    Transcribes audio bytes using Groq's whisper-large-v3 model.
    """
    if not settings.groq_api_key:
        logger.warning("GROQ_API_KEY is not configured for transcription.")
        raise ValueError("Groq API key is not configured")

    url = "https://api.groq.com/openai/v1/audio/transcriptions"
    headers = {
        "Authorization": f"Bearer {settings.groq_api_key}",
    }
    
    # Send as multipart/form-data
    files = {
        "file": (filename, file_bytes, "audio/wav"),
    }
    data = {
        "model": "whisper-large-v3",
    }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, headers=headers, files=files, data=data)
            response.raise_for_status()
            text = response.json().get("text", "")
            return text.strip()
    except Exception as e:
        logger.error(f"Error transcribing audio with Groq: {e}")
        raise e
