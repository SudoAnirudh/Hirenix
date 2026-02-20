import uuid
import json
from typing import List
from models.interview import InterviewQuestion, AnswerFeedback

# --------------------------------------------------------------------------- #
# Question generation templates (LLM-ready; mocked here with structured rules)  #
# --------------------------------------------------------------------------- #

TECHNICAL_QUESTIONS = {
    "Software Engineer": [
        "Explain the difference between a stack and a queue. When would you use each?",
        "What is the time complexity of binary search, and how does it work?",
        "Describe a situation where you had to optimise a slow database query.",
        "What is the CAP theorem, and how does it affect distributed system design?",
        "Walk me through your approach to designing a RESTful API.",
    ],
    "Data Scientist": [
        "What is the bias-variance tradeoff, and how do you manage it?",
        "Explain how gradient boosting works.",
        "How do you handle missing data in a dataset?",
        "What metrics would you use to evaluate a binary classification model?",
        "Describe a machine learning project you've worked on end-to-end.",
    ],
    "default": [
        "Tell me about a challenging technical problem you solved.",
        "How do you approach learning a new technology?",
        "Describe your experience with version control and collaboration tools.",
        "What is your approach to code review?",
        "How do you ensure the quality of your code?",
    ],
}

BEHAVIORAL_QUESTIONS = [
    "Tell me about a time you led a project under a tight deadline.",
    "Describe a conflict with a teammate and how you resolved it.",
    "Give an example of a time you failed and what you learned.",
    "How do you prioritise tasks when multiple deadlines overlap?",
    "Describe a time when you had to adapt to a significant change at work.",
]


async def generate_questions(
    resume_context: str,
    target_role: str,
    difficulty: str = "medium",
    num_questions: int = 5,
) -> List[InterviewQuestion]:
    """Generate interview questions. In production, replace with an LLM call."""
    tech_pool = TECHNICAL_QUESTIONS.get(target_role, TECHNICAL_QUESTIONS["default"])
    questions: List[InterviewQuestion] = []

    # Mix: 60% technical, 40% behavioural
    tech_count = max(1, int(num_questions * 0.6))
    behav_count = num_questions - tech_count

    for q_text in tech_pool[:tech_count]:
        questions.append(InterviewQuestion(
            question_id=str(uuid.uuid4()),
            question=q_text,
            category="technical",
            difficulty=difficulty,
        ))

    for q_text in BEHAVIORAL_QUESTIONS[:behav_count]:
        questions.append(InterviewQuestion(
            question_id=str(uuid.uuid4()),
            question=q_text,
            category="behavioral",
            difficulty="medium",
        ))

    return questions


# --------------------------------------------------------------------------- #
# Answer evaluation (LLM-ready; structured heuristic mock here)                #
# --------------------------------------------------------------------------- #

def _score_answer(answer: str, category: str) -> dict:
    """Heuristic scoring for demonstration. Replace with LLM evaluation prompt."""
    word_count = len(answer.split())

    # Clarity: based on sentence structure and length
    clarity = min(word_count / 150.0, 1.0)

    # Technical depth: presence of technical terms
    tech_terms = {"algorithm", "complexity", "database", "api", "data", "model",
                  "performance", "scale", "architecture", "design", "pattern"}
    term_hits = sum(1 for w in answer.lower().split() if w in tech_terms)
    technical = min(term_hits / 5.0, 1.0) if category == "technical" else 0.7

    # Depth: answer length relative to 200 words
    depth = min(word_count / 200.0, 1.0)

    # Communication: no filler words, coherent length
    fillers = {"um", "uh", "like", "basically", "literally", "you know"}
    filler_count = sum(1 for w in answer.lower().split() if w in fillers)
    communication = max(1.0 - filler_count * 0.1, 0.3)

    avg = (clarity + technical + depth + communication) / 4.0
    score = round(avg * 10, 1)  # 0–10

    return {
        "score": score,
        "clarity_score": round(clarity * 10, 1),
        "technical_score": round(technical * 10, 1),
        "depth_score": round(depth * 10, 1),
        "communication_score": round(communication * 10, 1),
    }


async def evaluate_answer(question: str, answer: str, category: str) -> AnswerFeedback:
    """Evaluate an interview answer and return structured feedback."""
    scores = _score_answer(answer, category)

    strengths, improvements = [], []

    if scores["clarity_score"] >= 7:
        strengths.append("Clear and concise communication")
    else:
        improvements.append("Structure your answer with a clear beginning, middle, and end (STAR method)")

    if scores["technical_score"] >= 7:
        strengths.append("Good use of technical terminology")
    elif category == "technical":
        improvements.append("Support your answer with specific technical details or examples")

    if scores["depth_score"] >= 7:
        strengths.append("Thorough and well-developed response")
    else:
        improvements.append("Elaborate more — aim for 100–200 word answers with concrete examples")

    if not strengths:
        strengths.append("You attempted the question — keep practising!")

    return AnswerFeedback(
        question_id="",   # filled by caller
        model_answer_hint=f"A strong answer to '{question[:60]}...' should include specific examples, metrics, and technical depth.",
        strengths=strengths,
        improvements=improvements,
        **scores,
    )
