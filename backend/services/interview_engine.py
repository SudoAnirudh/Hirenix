import uuid
import json
import logging
from typing import Dict, List, Optional, Any

from models.interview import AnswerFeedback, InterviewPlan, InterviewQuestion
from services.nvidia_client import invoke_nvidia_llm
from services.groq_client import invoke_groq_llm
from config import settings

logger = logging.getLogger(__name__)


async def _invoke_llm_json(messages: List[Dict[str, str]]) -> Optional[Any]:
    content = None
    # 1. Try Groq
    if settings.groq_api_key:
        try:
            logger.info("Invoking Groq LLM...")
            res = await invoke_groq_llm(messages, model="llama-3.3-70b-versatile", temperature=0.7)
            if res:
                content = res.get("choices", [{}])[0].get("message", {}).get("content", "")
        except Exception as e:
            logger.warning(f"Groq LLM invocation failed: {e}")

    # 2. Try NVIDIA fallback
    if not content and settings.nvidia_api_key:
        try:
            logger.info("Invoking NVIDIA LLM fallback...")
            res = await invoke_nvidia_llm(messages, model="meta/llama-3.1-70b-instruct", temperature=0.7)
            if res:
                content = res.get("choices", [{}])[0].get("message", {}).get("content", "")
        except Exception as e:
            logger.warning(f"NVIDIA LLM invocation failed: {e}")

    if not content:
        return None

    try:
        cleaned = content.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
        return json.loads(cleaned)
    except Exception as e:
        logger.error(f"Failed to parse LLM response as JSON: {e}. Raw content: {content}")
        return None


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


def determine_next_category(plan: InterviewPlan, history: List[Dict[str, str]]) -> str:
    """
    Given the interview plan and history of questions asked so far,
    determine the category of the next question.
    """
    technical_asked = sum(1 for h in history if h.get("category") == "technical")
    behavioral_asked = sum(1 for h in history if h.get("category") == "behavioral")
    system_design_asked = sum(1 for h in history if h.get("category") == "system_design")

    technical_remaining = max(0, plan.technical - technical_asked)
    behavioral_remaining = max(0, plan.behavioral - behavioral_asked)
    system_design_remaining = max(0, plan.system_design - system_design_asked)

    remaining = {
        "technical": technical_remaining,
        "system_design": system_design_remaining,
        "behavioral": behavioral_remaining,
    }
    # Find keys with value > 0
    available = {k: v for k, v in remaining.items() if v > 0}
    if not available:
        return "technical"
    # Return the one with highest remaining count
    return max(available, key=available.get)


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
    normalized = (target_role or "").strip().lower()
    if "intern" in normalized:
        if "front" in normalized:
            return QUESTION_BANK.get("Frontend Engineer", QUESTION_BANK["default"])
        if "back" in normalized:
            return QUESTION_BANK.get("Backend Engineer", QUESTION_BANK["default"])
        if "full" in normalized or "stack" in normalized:
            return QUESTION_BANK.get("default", QUESTION_BANK["default"])
        if "data" in normalized:
            return QUESTION_BANK.get("default", QUESTION_BANK["default"])
        if "ml" in normalized:
            return QUESTION_BANK.get("default", QUESTION_BANK["default"])
        if "devops" in normalized:
            return QUESTION_BANK.get("default", QUESTION_BANK["default"])
        return QUESTION_BANK["default"]

    if "fresher" in normalized or "entry" in normalized or "junior" in normalized:
        if "front" in normalized:
            return QUESTION_BANK.get("Frontend Engineer", QUESTION_BANK["default"])
        if "back" in normalized:
            return QUESTION_BANK.get("Backend Engineer", QUESTION_BANK["default"])
        return QUESTION_BANK["default"]

    return QUESTION_BANK.get(target_role, QUESTION_BANK["default"])


async def _generate_questions_llm(
    resume_context: str,
    target_role: str,
    difficulty: str,
    interview_type: str,
    experience_level: str,
    num_questions: int,
    required_category: Optional[str] = None,
) -> Optional[List[InterviewQuestion]]:
    """
    Generate role-specific questions using the available LLM (Groq with NVIDIA fallback).
    Returns InterviewQuestion list on success, otherwise None.
    """
    system = (
        "You are an expert interviewer. Generate concise, role-appropriate mock interview questions. "
        "Return ONLY valid JSON."
    )

    context_hint = resume_context.strip() if resume_context else ""
    if context_hint:
        # Bound context so we don't explode prompt size
        context_hint = context_hint[:2500]

    user = f"""
Generate {num_questions} interview questions for:
- target_role: {target_role}
- experience_level: {experience_level}
- interview_type: {interview_type}  (technical | behavioral | system_design | mixed)
- difficulty: {difficulty} (easy | medium | hard)
- variation_seed: {uuid.uuid4()} (Use this to ensure high variety and distinct focus areas compared to previous sessions)
"""
    if required_category:
        user += f"- required_question_category: {required_category} (You MUST generate questions of category \"{required_category}\")\n"

    user += f"""
If resume_context is provided, lightly tailor 1-2 questions to it without copying text verbatim.

resume_context:
{context_hint if context_hint else "(none)"}

Return JSON as an array of objects. Each object MUST contain:
- question (string)
- category (one of: "technical", "behavioral", "system_design")
- expected_topics (array of 3-6 short strings)
- follow_up_prompt (string or null)

Rules:
- Questions should be realistic for {experience_level} candidates (intern/fresher friendly when applicable).
- Avoid overly senior prompts unless experience_level is senior/lead.
- Keep each question under 35 words.
- Do NOT include markdown fences.
"""

    try:
        raw = await _invoke_llm_json(
            [
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ]
        )
        if not isinstance(raw, list) or not raw:
            return None

        questions: List[InterviewQuestion] = []
        for item in raw[:num_questions]:
            if not isinstance(item, dict):
                continue
            question_text = item.get("question")
            category = item.get("category")
            if required_category:
                category = required_category
            elif category not in {"technical", "behavioral", "system_design"}:
                category = "technical"
            expected_topics = item.get("expected_topics") or []
            follow_up = item.get("follow_up_prompt", None)
            if not isinstance(question_text, str) or not question_text.strip():
                continue
            if not isinstance(expected_topics, list):
                expected_topics = []
            expected_topics = [str(t).strip() for t in expected_topics if str(t).strip()][:8]
            questions.append(
                InterviewQuestion(
                    question_id=str(uuid.uuid4()),
                    question=question_text.strip(),
                    category=category,
                    difficulty=difficulty if category != "behavioral" else "medium",
                    expected_topics=expected_topics,
                    follow_up_prompt=follow_up if isinstance(follow_up, str) or follow_up is None else None,
                )
            )

        if len(questions) < max(1, min(3, num_questions)):
            return None
        return questions[:num_questions]
    except Exception as e:
        logger.warning(f"LLM question generation failed, falling back. err={e}")
        return None


async def generate_questions(
    resume_context: str,
    target_role: str,
    difficulty: str = "medium",
    num_questions: int = 5,
    interview_type: str = "mixed",
    experience_level: str = "junior",
) -> tuple[InterviewPlan, List[InterviewQuestion]]:
    """Generate a structured interview plan plus role-aware questions."""
    plan = generate_interview_plan(
        target_role=target_role,
        difficulty=difficulty,
        num_questions=num_questions,
        interview_type=interview_type,
        experience_level=experience_level,
    )

    first_cat = determine_next_category(plan, [])

    llm_questions = await _generate_questions_llm(
        resume_context=resume_context,
        target_role=target_role,
        difficulty=difficulty,
        interview_type=interview_type,
        experience_level=experience_level,
        num_questions=1,
        required_category=first_cat,
    )
    if llm_questions:
        return plan, llm_questions

    role_bank = _pick_role_bank(target_role)
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

    import random
    tech_pool = list(role_bank.get("technical", []))
    sys_pool = list(role_bank.get("system_design", []))
    beh_pool = list(BEHAVIORAL_QUESTIONS)
    random.shuffle(tech_pool)
    random.shuffle(sys_pool)
    random.shuffle(beh_pool)

    for item in tech_pool[: plan.technical]:
        append_question(item, "technical")

    for item in sys_pool[: plan.system_design]:
        append_question(item, "system_design")

    for item in beh_pool[: plan.behavioral]:
        append_question(item, "behavioral")

    if len(questions) < num_questions:
        fallback_pool = list(role_bank.get("technical", [])) + list(QUESTION_BANK["default"]["technical"])
        random.shuffle(fallback_pool)
        for item in fallback_pool:
            if len(questions) >= num_questions:
                break
            append_question(item, "technical")

    # Filter to find the first question matching first_cat
    first_q = next((q for q in questions if q.category == first_cat), None)
    if not first_q and questions:
        first_q = questions[0]

    return plan, [first_q] if first_q else questions[:1]


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


async def _evaluate_with_llm(
    question: str,
    answer: str,
    category: str,
    expected_topics: List[str],
) -> Optional[dict]:
    """Uses LLM (Groq with NVIDIA fallback) to evaluate the answer."""
    prompt = f"""
    You are an expert technical interviewer and career coach. 
    Evaluate the following interview answer for a {category} question.
    
    Question: {question}
    Candidate Answer: {answer}
    Expected Topics to cover: {", ".join(expected_topics)}
    
    Provide a detailed evaluation in JSON format with the following fields:
    - score: Overall score from 0.0 to 10.0
    - overall_score: Same as score
    - clarity_score: Score for clarity and structure (0.0 to 10.0)
    - technical_score: Score for technical accuracy and depth (0.0 to 10.0)
    - depth_score: Score for how well they explained the "why" (0.0 to 10.0)
    - communication_score: Score for professional tone and flow (0.0 to 10.0)
    - problem_solving_score: Score for reasoning and tradeoff analysis (0.0 to 10.0)
    - strengths: A list of 2-3 specific strengths of the answer.
    - improvements: A list of 2-3 specific areas for improvement.
    - model_answer_hint: A short (1 sentence) coaching tip for this type of question.
    - model_answer: A concise (2-3 sentences) version of what a Great answer would look like.
    - coaching_tip: A separate specific tip for the candidate to improve their delivery.

    Return ONLY the raw JSON object. No markdown, no preamble.
    """

    try:
        data = await _invoke_llm_json([{"role": "user", "content": prompt}])
        if not data or not isinstance(data, dict):
            return None
        
        # Ensure all required fields are present
        required_fields = [
            "score", "overall_score", "clarity_score", "technical_score", 
            "depth_score", "communication_score", "problem_solving_score",
            "strengths", "improvements", "model_answer_hint", "model_answer", "coaching_tip"
        ]
        if all(field in data for field in required_fields):
            return data
        
        logger.warning(f"LLM response missing fields: {data.keys()}")
        return None
    except Exception as e:
        logger.error(f"Error parsing LLM evaluation: {str(e)}")
        return None


async def stream_evaluate_answer(
    question_id: str,
    question: str,
    answer: str,
    category: str,
    expected_topics: List[str] = None,
):
    """
    Streams the interview evaluation from NVIDIA LLM.
    """
    if not settings.nvidia_api_key:
        yield "Error: NVIDIA_API_KEY is not set. Falling back to static feedback..."
        return

    expected_str = ", ".join(expected_topics) if expected_topics else "N/A"
    
    messages = [
        {
            "role": "system",
            "content": "You are an expert technical interviewer. Evaluate answers accurately and provide constructive feedback."
        },
        {
            "role": "user",
            "content": f"""
            Evaluate this interview answer:
            Question: {question}
            Category: {category}
            Expected Topics: {expected_str}
            User Answer: {answer}

            Return a VALID JSON object with scores (0-10) and detailed feedback.
            """
        }
    ]

    from services.nvidia_client import stream_nvidia_llm
    async for chunk in stream_nvidia_llm(messages):
        yield chunk


async def evaluate_answer(
    question_id: str,
    question: str,
    answer: str,
    category: str,
    expected_topics: List[str],
) -> AnswerFeedback:
    """Evaluate an interview answer and return structured coaching feedback."""
    
    # Try LLM evaluation first if configured
    if settings.nvidia_api_key:
        llm_feedback = await _evaluate_with_llm(question, answer, category, expected_topics)
        if llm_feedback:
            return AnswerFeedback(
                question_id=question_id,
                **llm_feedback
            )
        logger.info("LLM evaluation failed or incomplete, falling back to heuristics.")

    # Fallback to heuristic scoring
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


async def generate_next_question(
    resume_context: str,
    target_role: str,
    difficulty: str,
    experience_level: str,
    interview_type: str,
    plan: InterviewPlan,
    history: List[Dict[str, str]],
) -> Optional[InterviewQuestion]:
    """
    Generate the next follow-up or new question in a conversational manner.
    """
    system = (
        "You are an expert technical interviewer conducting a live, active face-to-face mock interview. "
        "Your task is to generate the next single interview question for the candidate. "
        "The question must be highly dynamic and conversational. It should either follow up directly on the candidate's previous answer (delving deeper into their projects, tech stack, or reasoning) or transition to a new relevant topic as defined by the interview plan.\n\n"
        "Return ONLY valid JSON."
    )

    next_cat = determine_next_category(plan, history)

    context_hint = resume_context.strip() if resume_context else ""
    if context_hint:
        # Bound context so we don't explode prompt size
        context_hint = context_hint[:2500]

    user = f"""
We are conducting an interview for:
- Target Role: {target_role}
- Experience Level: {experience_level}
- Interview Type: {interview_type}
- Difficulty: {difficulty}
- variation_seed: {uuid.uuid4()}

Candidate's Resume Context:
{context_hint if context_hint else "(none)"}

Interview Plan:
- Technical Questions: {plan.technical}
- Behavioral Questions: {plan.behavioral}
- System Design Questions: {plan.system_design}
- Total Questions: {plan.num_questions}

Conversational History (Previous Questions & Candidate's Answers):
"""
    for i, h in enumerate(history, 1):
        user += f"\nRound {i}:\nQuestion [{h.get('category')}]: {h.get('question')}\nCandidate Answer: {h.get('answer')}\n"

    user += f"""
Please generate the next question.
You MUST generate a question of category: {next_cat}.

Rules:
1. Do not ask the same question or repeat topics already covered.
2. The question should follow up actively and conversationally on the candidate's previous answers if possible, or pivot smoothly.
3. Expected category of this question MUST be "{next_cat}".
4. Keep the question concise (under 35 words).
5. Do not include markdown formatting or backticks.

Return a JSON object with:
- question (string)
- category (must be: "{next_cat}")
- expected_topics (array of 3-6 short strings)
- follow_up_prompt (string or null)
"""

    try:
        data = await _invoke_llm_json([
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ])
        if data and isinstance(data, dict):
            question_text = data.get("question")
            category = next_cat  # Force the correct plan category
            expected_topics = data.get("expected_topics") or []
            follow_up = data.get("follow_up_prompt", None)

            if isinstance(question_text, str) and question_text.strip():
                if not isinstance(expected_topics, list):
                    expected_topics = []
                expected_topics = [str(t).strip() for t in expected_topics if str(t).strip()][:8]

                return InterviewQuestion(
                    question_id=str(uuid.uuid4()),
                    question=question_text.strip(),
                    category=category,
                    difficulty=difficulty if category != "behavioral" else "medium",
                    expected_topics=expected_topics,
                    follow_up_prompt=follow_up if isinstance(follow_up, str) or follow_up is None else None,
                )
    except Exception as e:
        logger.error(f"Error generating next question: {e}")

    # Fallback if LLM fails
    logger.info("LLM next question generation failed, falling back to static bank.")
    role_bank = _pick_role_bank(target_role)
    asked_questions = {h.get("question", "").lower() for h in history}

    pool = []
    if next_cat == "technical":
        pool = role_bank.get("technical", []) + QUESTION_BANK["default"]["technical"]
    elif next_cat == "system_design":
        pool = role_bank.get("system_design", [])
    elif next_cat == "behavioral":
        pool = BEHAVIORAL_QUESTIONS

    import random
    pool_shuffled = list(pool)
    random.shuffle(pool_shuffled)

    for item in pool_shuffled:
        q_text = item["question"]
        if q_text.lower() not in asked_questions:
            return InterviewQuestion(
                question_id=str(uuid.uuid4()),
                question=q_text,
                category=next_cat,
                difficulty=difficulty if next_cat != "behavioral" else "medium",
                expected_topics=item["topics"],
                follow_up_prompt=item.get("follow_up"),
            )

    # Absolute fallback
    default_q = "Can you explain some key challenges you've faced on technical projects and how you resolved them?"
    return InterviewQuestion(
        question_id=str(uuid.uuid4()),
        question=default_q,
        category=next_cat,
        difficulty=difficulty,
        expected_topics=["problem solving", "conflict resolution"],
        follow_up_prompt=None,
    )
