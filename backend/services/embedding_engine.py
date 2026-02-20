"""
sentence-transformers wrapper for generating and comparing embeddings.
Falls back gracefully when the model is not installed.
"""
from typing import Optional
import numpy as np

_model = None
MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"


def _load_model():
    global _model
    if _model is None:
        try:
            from sentence_transformers import SentenceTransformer
            _model = SentenceTransformer(MODEL_NAME)
        except ImportError:
            _model = None
    return _model


def get_embedding(text: str) -> Optional[list[float]]:
    """Return a 384-dim embedding vector, or None if model unavailable."""
    model = _load_model()
    if model is None:
        return None
    embedding = model.encode(text, convert_to_numpy=True)
    return embedding.tolist()


def cosine_similarity(vec_a: list[float], vec_b: list[float]) -> float:
    """Compute cosine similarity between two embedding vectors."""
    a = np.array(vec_a)
    b = np.array(vec_b)
    denom = np.linalg.norm(a) * np.linalg.norm(b)
    if denom == 0:
        return 0.0
    return float(np.dot(a, b) / denom)


def compare_texts(text_a: str, text_b: str) -> float:
    """
    Compute semantic similarity between two texts.
    Returns a float in [0, 1]. Falls back to 0.5 if model unavailable.
    """
    emb_a = get_embedding(text_a)
    emb_b = get_embedding(text_b)
    if emb_a is None or emb_b is None:
        return 0.5  # neutral fallback
    return cosine_similarity(emb_a, emb_b)
