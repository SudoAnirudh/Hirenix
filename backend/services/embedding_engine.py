"""
sentence-transformers wrapper for generating and comparing embeddings.
Optimized for production with API-based embeddings and lightweight fallbacks.
"""
import logging
import numpy as np
import httpx
from typing import Optional, List
from config import settings

logger = logging.getLogger("hirenix.embeddings")

_model = None
MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

async def _get_nvidia_embedding(text: str) -> Optional[List[float]]:
    """Fetch embedding from NVIDIA's API to save local RAM."""
    if not settings.nvidia_api_key:
        return None
    
    url = "https://integrate.api.nvidia.com/v1/embeddings"
    headers = {
        "Authorization": f"Bearer {settings.nvidia_api_key}",
        "Accept": "application/json",
    }
    # Using a common retrieval model
    payload = {
        "input": [text[:2000]], # NVIDIA embeddings usually have a token limit
        "model": "nvidia/llama-3.2-nv-embedqa-1b-v2",
        "input_type": "query",
        "encoding_format": "float"
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(url, headers=headers, json=payload)
            if response.status_code == 200:
                data = response.json()
                return data["data"][0]["embedding"]
            else:
                logger.warning(f"NVIDIA Embedding API failed: {response.status_code} {response.text}")
    except Exception as e:
        logger.error(f"NVIDIA Embedding Error: {str(e)}")
    
    return None

def _get_lightweight_similarity(text_a: str, text_b: str) -> float:
    """Simple Jaccard similarity as an ultra-light local fallback."""
    from utils.text_cleaner import extract_keywords
    set_a = set(extract_keywords(text_a))
    set_b = set(extract_keywords(text_b))
    
    if not set_a or not set_b:
        return 0.5
    
    intersection = set_a.intersection(set_b)
    union = set_a.union(set_b)
    return len(intersection) / len(union)

def _load_local_model():
    """Lazy load sentence-transformers only when necessary."""
    global _model
    if _model is None:
        try:
            logger.info(f"Attempting to load local model {MODEL_NAME} (High RAM usage)...")
            from sentence_transformers import SentenceTransformer
            _model = SentenceTransformer(MODEL_NAME)
        except Exception as e:
            logger.error(f"Failed to load local embedding model: {e}")
            _model = "FAILED"
    return _model if _model != "FAILED" else None

async def get_embedding(text: str) -> Optional[List[float]]:
    """Return an embedding vector, preferring API to local model."""
    # 1. Try NVIDIA API first
    nvidia_emb = await _get_nvidia_embedding(text)
    if nvidia_emb:
        return nvidia_emb

    # 2. Try local model as fallback (will fail/slow in production)
    model = _load_local_model()
    if model:
        try:
            embedding = model.encode(text, convert_to_numpy=True)
            return embedding.tolist()
        except Exception as e:
            logger.error(f"Local model encoding failed: {e}")
    
    return None

def cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
    """Compute cosine similarity between two embedding vectors."""
    a = np.array(vec_a)
    b = np.array(vec_b)
    
    # Handle dimension mismatch (API vs Local)
    if a.shape != b.shape:
        logger.warning(f"Vector dimension mismatch: {a.shape} vs {b.shape}. Returning average.")
        return 0.5

    denom = np.linalg.norm(a) * np.linalg.norm(b)
    if denom == 0:
        return 0.0
    return float(np.dot(a, b) / denom)

async def compare_texts(text_a: str, text_b: str, precomputed_emb_a: Optional[List[float]] = None) -> float:
    """
    Compute semantic similarity between two texts.
    Returns a float in [0, 1]. Falls back to Jaccard similarity if needed.
    """
    # Prefer vector comparison (API-first)
    emb_a = precomputed_emb_a if precomputed_emb_a is not None else await get_embedding(text_a)
    emb_b = await get_embedding(text_b)
    
    if emb_a is not None and emb_b is not None:
        return cosine_similarity(emb_a, emb_b)
    
    # Lightweight local fallback
    logger.info("Using lightweight Jaccard similarity fallback.")
    return _get_lightweight_similarity(text_a, text_b)
