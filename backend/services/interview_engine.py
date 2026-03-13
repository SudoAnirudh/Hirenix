import uuid
from typing import Dict, List

from models.interview import AnswerFeedback, InterviewPlan, InterviewQuestion


QUESTION_BANK: Dict[str, Dict[str, List[dict]]] = {
    "Backend Engineer": {
        "technical": [
            {
                "question": "Explain the difference between REST and GraphQL and when you would choose each in a production backend.",
                "topics": ["REST", "GraphQL", "API design", "tradeoffs"],
                "follow_up": "How would caching strategy differ between the two approaches?",
            },
            {
                "question": "How would you design retry logic for a backend service that depends on a flaky third-party API?",
                "topics": ["resilience", "timeouts", "backoff", "idempotency"],
                "follow_up": "What metrics would you watch after shipping that change?",
            },
            {
                "question": "A Django endpoint has become slow under load. Walk through how you would diagnose and improve it.",
                "topics": ["profiling", "database queries", "caching", "observability"],
                "follow_up": "How would you prove the optimization actually worked?",
            },
        ],
        "system_design": [
            {
                "question": "Design a notification service that can send email, SMS, and push notifications reliably.",
                "topics": ["queues", "retries", "delivery guarantees", "scalability"],
                "follow_up": "Where would you enforce idempotency in that system?",
            }
        ],
    },
    "Frontend Engineer": {
        "technical": [
            {
                "question": "How would you explain the difference between server components and client components in a modern React app?",
                "topics": ["rendering model", "hydration", "performance", "boundaries"],
                "follow_up": "What mistakes lead to unnecessary client-side bundles?",
            },
            {
                "question": "A page feels slow after adding several charts. Walk through how you would debug and improve it.",
                "topics": ["profiling", "render performance", "network waterfalls", "code splitting"],
                "follow_up": "How would you confirm the improvement for real users?",
            },
            {
                "question": "Explain how you would design a resilient form flow with optimistic UI and rollback handling.",
                "topics": ["state management", "error handling", "UX", "consistency"],
                "follow_up": "When would optimistic UI be the wrong choice?",
            },
        ],
        "system_design": [
            {
                "question": "Design the frontend architecture for a dashboard with live updates, role-based access, and offline support.",
                "topics": ["data fetching", "state", "caching", "realtime"],
                "follow_up": "How would you prevent the architecture from becoming hard to maintain?",
            }
        ],
    },
    "default": {
        "technical": [
            {
                "question": "Tell me about a technical project you built and the tradeoffs you had to make.",
                "topics": ["tradeoffs", "architecture", "delivery", "ownership"],
                "follow_up": "What would you change if you rebuilt it today?",
            },
            {
                "question": "How do you approach debugging a production issue when the cause is not obvious?",
                "topics": ["observability", "hypotheses", "experimentation", "communication"],
                "follow_up": "How do you balance speed with risk during incident response?",
            },
        ],
        "system_design": [
            {
                "question": "Design a scalable file-upload pipeline for a product used by thousands of users.",
                "topics": ["scalability", "storage", "processing", "security"],
                "follow_up": "Where are the main failure points in that design?",
            }
        ],
    },
}

BEHAVIORAL_QUESTIONS = [
    {
        "question": "Tell me about a time you had to make progress on a project with incomplete information.",
        "topics": ["ambiguity", "ownership", "decision making", "communication"],
        "follow_up": "What signals told you that your approach was working?",
    },
    {
        "question": "Describe a difficult bug or failure you owned and what you learned from it.",
        "topics": ["ownership", "debugging", "learning", "accountability"],
        "follow_up": "What changed in your process afterward?",
    },
    {
        "question": "Tell me about a disagreement with a teammate and how you resolved it.",
        "topics": ["collaboration", "conflict resolution", "empathy", "tradeoffs"],
        "follow_up": "What would you do differently in the next disagreement?",
    },
]

EXPERIENCE_OVERRIDES = {
    "junior": {"system_design_cap": 1, "behavioral_floor": 1},
    "mid": {"system_design_cap": 2, "behavioral_floor": 1},
    "senior": {"system_design_cap": 3, "behavioral_floor": 1},
}


def generate_interview_plan(
    target_role: str,
    difficulty: str = "medium",
    num_questions: int = 5,
    interview_type: str = "mixed",
    experience_level: str = "junior",
) -> InterviewPlan:
    interview_type = interview_type.lower()
    experience_level = experience_level.lower()
    overrides = EXPERIENCE_OVERRIDES.get(experience_level, EXPERIENCE_OVERRIDES["junior"])

    if interview_type == "technical":
        technical = num_questions
        behavioral = 0
        system_design = 0
    elif interview_type == "behavioral":
        technical = 0
        behavioral = num_questions
        system_design = 0
    elif interview_type == "system_design":
        technical = max(0, num_questions - 1)
        behavioral = 0
        system_design = min(1, num_questions)
    else:
        technical = max(1, int(num_questions * 0.6))
        behavioral = max(overrides["behavioral_floor"], int(num_questions * 0.2))
        system_design = num_questions - technical - behavioral

    system_design = min(system_design, overrides["system_design_cap"])
    allocated = technical + behavioral + system_design
    if allocated < num_questions:
        technical += num_questions - allocated
    elif allocated > num_questions:
        overflow = allocated - num_questions
        technical = max(0, technical - overflow)

    return InterviewPlan(
        role=target_role,
        experience_level=experience_level,
        interview_type=interview_type,
        difficulty=difficulty,
        num_questions=num_questions,
        technical=technical,
        behavioral=behavioral,
        system_design=system_design,
    )


def _pick_role_bank(target_role: str) -> Dict[str, List[dict]]:
    return QUESTION_BANK.get(target_role, QUESTION_BANK["default"])


async def generate_questions(
    resume_context: str,
    target_role: str,
    difficulty: str = "medium",
    num_questions: int = 5,
    interview_type: str = "mixed",
    experience_level: str = "junior",
) -> tuple[InterviewPlan, List[InterviewQuestion]]:
    """Generate a structured interview plan plus role-aware questions."""
    role_bank = _pick_role_bank(target_role)
    plan = generate_interview_plan(
        target_role=target_role,
        difficulty=difficulty,
        num_questions=num_questions,
        interview_type=interview_type,
        experience_level=experience_level,
    )
    questions: List[InterviewQuestion] = []

    def append_question(item: dict, category: str) -> None:
        question_text = item["question"]
        if resume_context and category != "behavioral":
            question_text = (
                f"{question_text} If relevant, relate your answer to projects or tools from the candidate's background."
            )

        questions.append(
            InterviewQuestion(
                question_id=str(uuid.uuid4()),
                question=question_text,
                category=category,
                difficulty=difficulty if category != "behavioral" else "medium",
                expected_topics=item["topics"],
                follow_up_prompt=item.get("follow_up"),
            )
        )

    for item in role_bank.get("technical", [])[: plan.technical]:
        append_question(item, "technical")

    for item in role_bank.get("system_design", [])[: plan.system_design]:
        append_question(item, "system_design")

    for item in BEHAVIORAL_QUESTIONS[: plan.behavioral]:
        append_question(item, "behavioral")

    if len(questions) < num_questions:
        fallback_pool = role_bank.get("technical", []) + QUESTION_BANK["default"]["technical"]
        for item in fallback_pool:
            if len(questions) >= num_questions:
                break
            append_question(item, "technical")

    return plan, questions[:num_questions]


def _normalized_term_hits(answer: str, topics: List[str]) -> float:
    answer_lower = answer.lower()
    topic_hits = sum(1 for topic in topics if topic.lower() in answer_lower)
    return min(topic_hits / max(len(topics), 1), 1.0)


def _score_answer(answer: str, category: str, expected_topics: List[str]) -> dict:
    """Heuristic coaching rubric. Replace with an LLM evaluator when available."""
    word_count = len(answer.split())

    clarity = min(word_count / 130.0, 1.0)
    depth = min(word_count / 180.0, 1.0)
    technical = _normalized_term_hits(answer, expected_topics)

    reasoning_terms = {
        "because",
        "tradeoff",
        "tradeoffs",
        "decision",
        "impact",
        "metric",
        "risk",
        "measure",
        "optimize",
        "rollback",
    }
    problem_solving = min(
        sum(1 for word in answer.lower().split() if word.strip(".,") in reasoning_terms) / 6.0,
        1.0,
    )

    fillers = {"um", "uh", "like", "basically", "literally"}
    filler_count = sum(1 for word in answer.lower().split() if word.strip(".,") in fillers)
    communication = max(1.0 - filler_count * 0.07, 0.35)

    if category == "behavioral":
        technical = max(technical, 0.65 if word_count >= 70 else 0.45)
    elif category == "system_design":
        problem_solving = max(problem_solving, 0.45 if word_count >= 90 else 0.3)

    avg = (clarity + technical + depth + communication + problem_solving) / 5.0
    overall = round(avg * 10, 1)

    return {
        "score": overall,
        "overall_score": overall,
        "clarity_score": round(clarity * 10, 1),
        "technical_score": round(technical * 10, 1),
        "depth_score": round(depth * 10, 1),
        "communication_score": round(communication * 10, 1),
        "problem_solving_score": round(problem_solving * 10, 1),
    }


def _build_strengths(scores: dict, category: str) -> List[str]:
    strengths: List[str] = []
    if scores["clarity_score"] >= 7:
        strengths.append("Your answer was clearly structured and easy to follow.")
    if scores["technical_score"] >= 7 and category != "behavioral":
        strengths.append("You covered relevant technical ideas instead of staying generic.")
    if scores["depth_score"] >= 7:
        strengths.append("You added enough detail to make the response convincing.")
    if scores["problem_solving_score"] >= 7:
        strengths.append("You explained reasoning and tradeoffs, not just the final answer.")
    return strengths or ["You attempted the question directly, which is the right practice habit."]


def _build_improvements(scores: dict, category: str, expected_topics: List[str]) -> List[str]:
    improvements: List[str] = []
    if scores["clarity_score"] < 7:
        improvements.append("Open with a short answer summary, then break the rest into 2-3 concrete points.")
    if scores["depth_score"] < 7:
        improvements.append("Add one concrete example, metric, or failure mode to make the answer more complete.")
    if scores["problem_solving_score"] < 7:
        improvements.append("Explain the tradeoffs behind your choice so the interviewer can see your reasoning.")
    if category != "behavioral" and scores["technical_score"] < 7 and expected_topics:
        improvements.append(f"Make sure you explicitly cover key topics such as {', '.join(expected_topics[:3])}.")
    return improvements[:3]


def _build_model_answer(question: str, category: str, expected_topics: List[str]) -> str:
    if category == "behavioral":
        return (
            "A strong behavioral answer should use the STAR format: describe the situation, clarify your task, "
            "walk through the actions you personally took, and end with a measurable result plus what you learned."
        )
    if category == "system_design":
        return (
            "A strong system design answer should define scope, estimate load, propose a high-level architecture, "
            "cover data flow, reliability, scaling bottlenecks, and explicitly discuss tradeoffs."
        )
    topics = ", ".join(expected_topics[:4]) if expected_topics else "core concepts, tradeoffs, and one example"
    return (
        f"A strong technical answer should define the concept, explain tradeoffs, cover {topics}, "
        "and finish with a practical production example."
    )


def _build_coaching_tip(category: str) -> str:
    if category == "behavioral":
        return "Use STAR: Situation, Task, Action, Result. Keep the Action section longest."
    if category == "system_design":
        return "State assumptions early, then move from architecture to bottlenecks to tradeoffs."
    return "A reliable structure is: definition, key tradeoffs, then a concrete example from practice."


async def evaluate_answer(
    question_id: str,
    question: str,
    answer: str,
    category: str,
    expected_topics: List[str],
) -> AnswerFeedback:
    """Evaluate an interview answer and return structured coaching feedback."""
    scores = _score_answer(answer, category, expected_topics)
    improvements = _build_improvements(scores, category, expected_topics)

    return AnswerFeedback(
        question_id=question_id,
        strengths=_build_strengths(scores, category),
        improvements=improvements,
        model_answer_hint=_build_coaching_tip(category),
        model_answer=_build_model_answer(question, category, expected_topics),
        coaching_tip=_build_coaching_tip(category),
        **scores,
    )
