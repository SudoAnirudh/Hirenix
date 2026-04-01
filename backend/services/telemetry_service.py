import logging
from typing import Dict, Any

logger = logging.getLogger("hirenix.telemetry")

class TelemetryService:
    """
    Service for tracking performance and health metrics of external API integrations.
    """
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(TelemetryService, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        self.metrics = {
            "nvidia_total_calls": 0,
            "nvidia_success_calls": 0,
            "nvidia_fallback_calls": 0,
            "nvidia_total_latency_ms": 0,
            "nvidia_estimated_tokens": 0,
            "groq_total_calls": 0,
            "groq_success_calls": 0,
            "groq_fallback_calls": 0,
            "groq_total_latency_ms": 0,
            "groq_estimated_tokens": 0,
        }
        logger.info("TelemetryService initialized.")

    def track_call(self, provider: str, success: bool, latency_ms: float, tokens: int = 0):
        """
        Record a provider API call.
        """
        prefix = f"{provider}_"
        self.metrics[f"{prefix}total_calls"] += 1
        if success:
            self.metrics[f"{prefix}success_calls"] += 1
        else:
            self.metrics[f"{prefix}fallback_calls"] += 1
        
        self.metrics[f"{prefix}total_latency_ms"] += latency_ms
        self.metrics[f"{prefix}estimated_tokens"] += tokens
        
        status = "SUCCESS" if success else "FALLBACK"
        logger.info(f"[{provider}] {status} | Latency: {latency_ms:.2f}ms | Est. Tokens: {tokens}")

    def get_summary(self, provider: str) -> Dict[str, Any]:
        """
        Return a summary of metrics for a specific provider.
        """
        prefix = f"{provider}_"
        total = self.metrics.get(f"{prefix}total_calls", 0)
        if total == 0:
            return {"status": "no_data"}
        
        return {
            "total_calls": total,
            "success_rate": (self.metrics[f"{prefix}success_calls"] / total) * 100,
            "fallback_rate": (self.metrics[f"{prefix}fallback_calls"] / total) * 100,
            "avg_latency_ms": self.metrics[f"{prefix}total_latency_ms"] / total,
            "total_estimated_tokens": self.metrics[f"{prefix}estimated_tokens"]
        }

# Singleton instance
telemetry = TelemetryService()
