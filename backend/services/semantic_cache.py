import logging
from typing import Optional, Dict, Any
from dependencies import get_supabase_admin
from services.embedding_engine import get_embedding

logger = logging.getLogger("hirenix.semantic_cache")

# Minimum similarity threshold to consider a cache hit
SIMILARITY_THRESHOLD = 0.95

async def check_semantic_cache(document_type: str, text: str) -> Optional[Dict[str, Any]]:
    """
    Check if a semantically similar text was recently processed.
    If similarity > threshold, returns the cached llm_response.
    """
    embedding = await get_embedding(text)
    if not embedding:
        return None
        
    try:
        supabase = get_supabase_admin()
        
        response = supabase.rpc(
            "match_semantic_cache",
            {
                "query_embedding": embedding,
                "match_threshold": SIMILARITY_THRESHOLD,
                "match_count": 1,
                "doc_type": document_type
            }
        ).execute()
        
        data = response.data
        if data and len(data) > 0:
            match = data[0]
            logger.info(f"✅ Semantic Cache Hit for {document_type} (Similarity: {match['similarity']:.3f})")
            return match['llm_response']
            
        return None
    except Exception as e:
        logger.error(f"Error checking semantic cache: {e}")
        return None

async def set_semantic_cache(document_type: str, text: str, llm_response: Dict[str, Any]) -> None:
    """
    Store an LLM response in the semantic cache.
    """
    embedding = await get_embedding(text)
    if not embedding:
        return
        
    try:
        supabase = get_supabase_admin()
        
        supabase.table("llm_semantic_cache").insert({
            "document_type": document_type,
            "content_text": text,
            "embedding": embedding,
            "llm_response": llm_response
        }).execute()
        
        logger.info(f"💾 Semantic Cache Set for {document_type}")
    except Exception as e:
        logger.error(f"Error setting semantic cache: {e}")
