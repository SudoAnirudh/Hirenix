import logging
from typing import Tuple, List, Optional, Dict, Any
from models.resume import ResumeSection, ParsedResumeSchema, BulletRewrite
from utils.text_cleaner import has_measurable_achievement, extract_keywords
from services.embedding_engine import compare_texts
from services.nlp_evaluator import evaluate_parsed_resume_nlp
from services.semantic_scorer import compute_multi_aspect_scores
from services.feedback_engine import generate_contextual_gap_analysis, generate_synthetic_bullet_rewrites
from utils.scoring_weights import (
    ATS_RULE_WEIGHT, ATS_SEMANTIC_WEIGHT,
    ATS_RULES, REQUIRED_SECTIONS,
)

logger = logging.getLogger("hirenix.ats")

TECH_KEYWORDS = {
    "python", "java", "javascript", "typescript", "react", "node", "sql",
    "aws", "docker", "kubernetes", "fastapi", "django", "flask", "machine learning",
    "deep learning", "tensorflow", "pytorch", "git", "agile", "rest", "api",
    "mongodb", "postgresql", "redis", "linux", "ci/cd", "microservices",
}
ATS_BASELINE_PROFILE = (
    "Professional resume with clear summary, strong experience, measurable achievements, "
    "modern technical skills, projects, and concise formatting."
)


def _section_completeness_score(sections: List[ResumeSection]) -> float:
    present = {s.section_type for s in sections}
    matched = len(REQUIRED_SECTIONS & present)
    return matched / len(REQUIRED_SECTIONS)


def _keyword_density_score(raw_text: str) -> float:
    words = extract_keywords(raw_text)
    if not words:
        return 0.0
    tech_count = sum(1 for w in words if w in TECH_KEYWORDS)
    density = tech_count / len(words) * 100
    return min(density / 10.0, 1.0)


def _measurable_achievements_score(sections: List[ResumeSection]) -> float:
    exp_sections = [s for s in sections if s.section_type in ("experience", "projects")]
    if not exp_sections:
        return 0.0
    hits = sum(1 for s in exp_sections if has_measurable_achievement(s.content))
    return hits / len(exp_sections)


def _formatting_quality_score(raw_text: str) -> float:
    lines = [l for l in raw_text.split("\n") if l.strip()]
    if not lines:
        return 0.0
    avg_len = sum(len(l) for l in lines) / len(lines)
    all_caps_ratio = sum(1 for l in lines if l.isupper() and len(l) > 5) / len(lines)
    len_score = 1.0 - min(max(avg_len - 80, 0) / 120, 1.0)
    caps_score = 1.0 - min(all_caps_ratio * 3, 1.0)
    return (len_score + caps_score) / 2


def _rule_based_score(
    sections: List[ResumeSection],
    raw_text: str,
    xyz_score: float = 50.0,
    recency_score: float = 70.0,
) -> Tuple[float, dict]:
    sc = _section_completeness_score(sections)
    kd = _keyword_density_score(raw_text)
    ma = _measurable_achievements_score(sections)
    fq = _formatting_quality_score(raw_text)

    # Convert XYZ and recency (0-100) to 0.0-1.0
    xyz_norm = xyz_score / 100.0
    recency_norm = recency_score / 100.0

    breakdown = {
        "section_completeness": round(sc * 100, 1),
        "keyword_density": round(kd * 100, 1),
        "measurable_achievements": round(ma * 100, 1),
        "formatting_quality": round(fq * 100, 1),
        "xyz_bullet_quality": round(xyz_score, 1),
        "skill_recency_score": round(recency_score, 1),
    }

    # Combined NLP Rule Score (weights: 25% section, 20% keyword, 20% achievement, 15% format, 10% xyz, 10% recency)
    weighted = (
        sc * 0.25 +
        kd * 0.20 +
        ma * 0.20 +
        fq * 0.15 +
        xyz_norm * 0.10 +
        recency_norm * 0.10
    )
    return weighted, breakdown


async def compute_ats_score(
    sections: List[ResumeSection],
    raw_text: str,
    semantic_similarity: float | None = None,
    schema: Optional[ParsedResumeSchema] = None,
    target_role: Optional[str] = None,
) -> Tuple[float, dict, List[str], float, dict, List[str], List[BulletRewrite]]:
    """
    Compute ATS score using upgraded hybrid approach:
    NLP Rule Evaluation + Multi-Aspect Semantic Embeddings + Dynamic LLM Feedback & Rewriting.
    Returns:
    (final_score, breakdown_dict, feedback_list, xyz_score, multi_aspect_scores, gap_analysis, synthetic_bullet_rewrites)
    """
    active_schema = schema or ParsedResumeSchema()

    # 1. Intelligent NLP & XYZ Bullet Evaluation
    xyz_score, recency_score, active_schema = evaluate_parsed_resume_nlp(active_schema)

    # 2. Rule-Based Score Calculation
    rule_score, breakdown = _rule_based_score(sections, raw_text, xyz_score, recency_score)

    # 3. Multi-Aspect Semantic Vector Similarity
    multi_aspect_comb_score, multi_aspect_breakdown = await compute_multi_aspect_scores(active_schema, raw_text)

    effective_semantic = (
        semantic_similarity
        if semantic_similarity is not None
        else multi_aspect_comb_score
    )

    # Final Combined ATS Score (60% Rule + 40% Semantic)
    final = (rule_score * ATS_RULE_WEIGHT + effective_semantic * ATS_SEMANTIC_WEIGHT) * 100
    final = round(min(max(final, 0.0), 100.0), 1)

    breakdown["semantic_similarity"] = round(effective_semantic * 100, 1)
    breakdown["final_ats_score"] = final
    breakdown.update(multi_aspect_breakdown)

    # 4. Dynamic LLM Gap Analysis & Synthetic Rewriting
    gap_analysis = await generate_contextual_gap_analysis(active_schema, breakdown, target_role=target_role)
    synthetic_rewrites = await generate_synthetic_bullet_rewrites(active_schema)

    feedback = gap_analysis

    logger.info(f"Enterprise ATS Score computed: {final} (Rule: {rule_score*100:.1f}%, Semantic: {effective_semantic*100:.1f}%)")

    return final, breakdown, feedback, xyz_score, multi_aspect_breakdown, gap_analysis, synthetic_rewrites

