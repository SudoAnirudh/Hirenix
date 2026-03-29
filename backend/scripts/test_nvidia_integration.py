import asyncio
import json
import unittest
from unittest.mock import patch, AsyncMock, MagicMock

# Mocking settings before importing interview_engine
import sys
from types import ModuleType

mock_config = ModuleType("config")
mock_config.settings = MagicMock()
sys.modules["config"] = mock_config

# Now import the components to test
from services.interview_engine import evaluate_answer, _score_answer
from models.interview import AnswerFeedback

class TestNvidiaIntegration(unittest.IsolatedAsyncioTestCase):
    
    async def test_evaluate_answer_llm_success(self):
        """Test that LLM evaluation is used when API key is present and call succeeds."""
        mock_config.settings.nvidia_api_key = "fake_key"
        
        mock_response = {
            "score": 8.5,
            "overall_score": 8.5,
            "clarity_score": 9.0,
            "technical_score": 8.0,
            "depth_score": 8.5,
            "communication_score": 9.0,
            "problem_solving_score": 8.0,
            "strengths": ["Strong technical explanation", "Clear structure"],
            "improvements": ["Could add more examples"],
            "model_answer_hint": "Focus on tradesoffs.",
            "model_answer": "A great answer would cover...",
            "coaching_tip": "Slow down a bit."
        }
        
        with patch("services.interview_engine.invoke_nvidia_llm", new_callable=AsyncMock) as mock_invoke:
            mock_invoke.return_value = json.dumps(mock_response)
            
            result = await evaluate_answer(
                "q1", "What is REST?", "REST is an architectural style...", "technical", ["HTTP", "Stateless"]
            )
            
            self.assertIsInstance(result, AnswerFeedback)
            self.assertEqual(result.score, 8.5)
            self.assertEqual(result.strengths[0], "Strong technical explanation")
            mock_invoke.assert_called_once()

    async def test_evaluate_answer_fallback_no_key(self):
        """Test fallback to heuristics when API key is missing."""
        mock_config.settings.nvidia_api_key = None
        
        with patch("services.interview_engine.invoke_nvidia_llm", new_callable=AsyncMock) as mock_invoke:
            # We don't expect mock_invoke to be called
            result = await evaluate_answer(
                "q1", "What is REST?", "REST is an architectural style...", "technical", ["HTTP", "Stateless"]
            )
            
            self.assertIsInstance(result, AnswerFeedback)
            # Heuristic score for this short answer should be low
            self.assertTrue(result.score < 10.0)
            mock_invoke.assert_not_called()

    async def test_evaluate_answer_fallback_llm_failure(self):
        """Test fallback to heuristics when LLM call fails."""
        mock_config.settings.nvidia_api_key = "fake_key"
        
        with patch("services.interview_engine.invoke_nvidia_llm", new_callable=AsyncMock) as mock_invoke:
            mock_invoke.return_value = None # Simulate failure
            
            result = await evaluate_answer(
                "q1", "What is REST?", "REST is an architectural style...", "technical", ["HTTP", "Stateless"]
            )
            
            self.assertIsInstance(result, AnswerFeedback)
            # Should have fallen back to heuristics
            self.assertTrue(result.score < 10.0)
            mock_invoke.assert_called_once()

if __name__ == "__main__":
    unittest.main()
