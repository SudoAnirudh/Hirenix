import functools
import logging
import hashlib
import json
from typing import Any, Callable, Dict

logger = logging.getLogger("hirenix.cache")

class CacheManager:
    """
    Utility for caching expensive LLM or data processing results.
    Initially implements in-memory caching.
    """
    def __init__(self):
        self._cache: Dict[str, Any] = {}
        logger.info("CacheManager initialized.")

    def _generate_key(self, func_name: str, *args, **kwargs) -> str:
        """
        Generates a unique deterministic key based on function inputs.
        """
        # Convert args/kwargs to a stable string representation
        # We use str() for complex objects but for our LLM calls, args are typically simple lists/dicts
        try:
            args_str = json.dumps(args, sort_keys=True)
            kwargs_str = json.dumps(kwargs, sort_keys=True)
        except (TypeError, OverflowError):
            args_str = str(args)
            kwargs_str = str(kwargs)
            
        combined = f"{func_name}:{args_str}:{kwargs_str}"
        return hashlib.sha256(combined.encode()).hexdigest()

    def cache_llm_result(self, provider: str = "nvidia"):
        """
        A decorator to cache LLM results.
        """
        def decorator(func: Callable):
            @functools.wraps(func)
            async def wrapper(*args, **kwargs):
                key = self._generate_key(f"{provider}:{func.__name__}", *args, **kwargs)
                
                if key in self._cache:
                    logger.info(f"[{provider}] Cache HIT for {func.__name__}")
                    return self._cache[key]
                
                logger.debug(f"[{provider}] Cache MISS for {func.__name__}")
                result = await func(*args, **kwargs)
                
                if result is not None:
                    self._cache[key] = result
                    logger.info(f"[{provider}] Cached result for {func.__name__}")
                
                return result
            return wrapper
        return decorator

# Global singleton
cache_manager = CacheManager()
