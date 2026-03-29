import asyncio
import logging
import sys
import os

# Ensure the backend directory is in the path
sys.path.append(os.path.join(os.getcwd(), "backend"))

from services.interview_engine import evaluate_answer
from config import settings

# Configure logging to see the output
logging.basicConfig(level=logging.INFO)

async def test_live_evaluation():
    print("\n🚀 Starting Live NVIDIA API Test...\n")
    
    if not settings.nvidia_api_key:
        print("❌ Error: NVIDIA_API_KEY not found in settings. Check your .env file.")
        return

    question = "Explain the difference between REST and GraphQL and when you would choose each in a production backend."
    answer = (
        "REST is a mature architectural style based on HTTP methods like GET and POST. It uses fixed endpoints. "
        "GraphQL is a query language that allows clients to request exactly the data they need from a single endpoint. "
        "I'd choose REST for simple public APIs with high cacheability, while GraphQL is better for complex frontend "
        "requirements where multiple resources need to be fetched in one go."
    )
    category = "technical"
    expected_topics = ["REST", "GraphQL", "API design", "tradeoffs"]

    print(f"Question: {question}")
    print(f"Answer: {answer}\n")
    print("⏳ Waiting for API response...")

    try:
        feedback = await evaluate_answer(
            question_id="test_live_123",
            question=question,
            answer=answer,
            category=category,
            expected_topics=expected_topics
        )

        print("\n✅ API Response Received!\n")
        print(f"Overall Score: {feedback.score}/10")
        print("\nStrengths:")
        for s in feedback.strengths:
            print(f" - {s}")
        
        print("\nImprovements:")
        for i in feedback.improvements:
            print(f" - {i}")

        print(f"\nCoaching Tip: {feedback.coaching_tip}")
        print(f"\nModel Answer: {feedback.model_answer}")
        
    except Exception as e:
        print(f"\n❌ Test Failed with error: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_live_evaluation())
