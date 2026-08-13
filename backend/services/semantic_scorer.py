import logging
from typing import Dict, Any, Optional, Tuple
from models.resume import ParsedResumeSchema
from services.embedding_engine import get_embedding, cosine_similarity, compare_texts

logger = logging.getLogger("hirenix.semantic_scorer")

# Default target profile benchmarks for multi-aspect alignment
DEFAULT_SKILLS_BENCHMARK = (
    "Proficient in Python, JavaScript, TypeScript, React, Node.js, SQL, PostgreSQL, "
    "Docker, Kubernetes, AWS, FastAPI, REST APIs, Git, Microservices, CI/CD pipelines."
)

DEFAULT_EXPERIENCE_BENCHMARK = (
    "Proven track record of designing, building, and deploying scalable software applications. "
    "Experience leading cross-functional teams, optimizing database queries, improving API throughput, "
    "reducing system latency, and delivering production-ready code under agile methodologies."
)


async def compute_multi_aspect_scores(
    schema: ParsedResumeSchema,
    raw_text: str,
    target_skills: Optional[str] = None,
    target_experience: Optional[str] = None,
) -> Tuple[float, Dict[str, float]]:
    """
    Computes multi-aspect semantic similarity:
    1. Skills Vector Match (50% weight)
    2. Experience Vector Match (30% weight)
    3. Full Resume Context Vector Match (20% weight)

    Returns (combined_semantic_score_0_to_1, breakdown_dict).
    """
    bench_skills = target_skills or DEFAULT_SKILLS_BENCHMARK
    bench_exp = target_experience or DEFAULT_EXPERIENCE_BENCHMARK

    # 1. Skills Vector Matching
    resume_skills_text = ", ".join(schema.skills) if schema.skills else raw_text[:500]
    skills_sim = await compare_texts(resume_skills_text, bench_skills)

    # 2. Experience Vector Matching
    exp_texts = []
    for exp in schema.experiences:
        exp_texts.append(f"{exp.title} at {exp.company}: " + " ".join(b.content for b in exp.bullets))
    resume_exp_text = "\n".join(exp_texts) if exp_texts else raw_text
    exp_sim = await compare_texts(resume_exp_text, bench_exp)

    # 3. Overall Full Text Context Match
    overall_sim = await compare_texts(raw_text, f"{bench_skills}\n{bench_exp}")

    # Weighted combination
    combined_score = (skills_sim * 0.50) + (exp_sim * 0.30) + (overall_sim * 0.20)
    combined_score = round(min(max(combined_score, 0.0), 1.0), 3)

    breakdown = {
        "skills_vector_sim": round(skills_sim * 100, 1),
        "experience_vector_sim": round(exp_sim * 100, 1),
        "overall_context_sim": round(overall_sim * 100, 1),
        "combined_multi_aspect_score": round(combined_score * 100, 1),
    }

    return combined_score, breakdown
