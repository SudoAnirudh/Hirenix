import asyncio
import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), "backend"))

from services.nvidia_client import invoke_nvidia_llm, stream_nvidia_llm
from services.telemetry_service import telemetry
from services.cache_manager import cache_manager
from services.roadmap_engine import RoadmapEngine

async def test_telemetry():
    print("\n--- Testing Telemetry ---")
    # Simulate a call
    telemetry.track_call("nvidia", success=True, latency_ms=150.5, tokens=100)
    summary = telemetry.get_summary("nvidia")
    print(f"Telemetry Summary: {summary}")
    assert summary["total_calls"] >= 1
    assert summary["success_rate"] == 100.0

async def test_caching():
    print("\n--- Testing Caching ---")
    engine = RoadmapEngine()
    
    # Mocking dependencies for a localized test if needed, 
    # but here we just want to see the decorator behavior in logs.
    print("First call (should be MISS)...")
    
    # Mocking invoke_nvidia_llm and analyze_github_profile inside the test
    import services.roadmap_engine
    import services.github_analyzer
    from unittest.mock import MagicMock
    
    original_invoke = services.roadmap_engine.invoke_nvidia_llm
    original_analyze = services.roadmap_engine.analyze_github_profile
    
    call_count = 0
    async def mock_invoke(*args, **kwargs):
        nonlocal call_count
        call_count += 1
        return {"choices": [{"message": {"content": "{\"next_step\": \"Mock Step\", \"current_level\": \"mid\", \"future_opportunities\": [\"A\", \"B\"]}"}}]}
    
    async def mock_analyze(*args, **kwargs):
        mock_data = MagicMock()
        mock_data.metrics.languages = {"Python": 100}
        return mock_data

    services.roadmap_engine.invoke_nvidia_llm = mock_invoke
    services.roadmap_engine.analyze_github_profile = mock_analyze
    
    try:
        print("Calling generate_roadmap twice...")
        result1 = await engine.generate_roadmap("Python Developer with 5 years experience", "testuser", "Backend Engineer", "user123")
        result2 = await engine.generate_roadmap("Python Developer with 5 years experience", "testuser", "Backend Engineer", "user123")
        
        print(f"Call count (should be 1): {call_count}")
        assert call_count == 1
        print("Caching verified!")
    finally:
        services.roadmap_engine.invoke_nvidia_llm = original_invoke
        services.roadmap_engine.analyze_github_profile = original_analyze

async def test_streaming():
    print("\n--- Testing Streaming ---")
    messages = [{"role": "user", "content": "Say 'Streaming Start' and then 'Streaming End'."}]
    
    print("Streaming chunks:")
    has_chunks = False
    async for chunk in stream_nvidia_llm(messages):
        print(f"Chunk: {chunk}")
        has_chunks = True
    
    if has_chunks:
        print("Streaming verified!")
    else:
        print("Streaming failed to yield chunks (check API key/logs).")

async def main():
    await test_telemetry()
    await test_caching()
    # Only run streaming if API key is present
    from config import settings
    if settings.nvidia_api_key:
        await test_streaming()
    else:
        print("\nSkipping live streaming test (NVIDIA_API_KEY not set).")

if __name__ == "__main__":
    asyncio.run(main())
