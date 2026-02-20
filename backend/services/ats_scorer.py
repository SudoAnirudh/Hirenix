import re
from typing import Tuple, List
from models.resume import ResumeSection
from utils.text_cleaner import has_measurable_achievement, extract_keywords
from utils.scoring_weights import (
    ATS_RULE_WEIGHT, ATS_SEMANTIC_WEIGHT,
    ATS_RULES, REQUIRED_SECTIONS,
)

# Common tech keywords to check for density
TECH_KEYWORDS = {
    "python", "java", "javascript", "typescript", "react", "node", "sql",
    "aws", "docker", "kubernetes", "fastapi", "django", "flask", "machine learning",
    "deep learning", "tensorflow", "pytorch", "git", "agile", "rest", "api",
    "mongodb", "postgresql", "redis", "linux", "ci/cd", "microservices",
}


def _section_completeness_score(sections: List[ResumeSection]) -> float:
    present = {s.section_type for s in sections}
    matched = len(REQUIRED_SECTIONS & present)
    return matched / len(REQUIRED_SECTIONS)


def _keyword_density_score(raw_text: str) -> float:
    words = extract_keywords(raw_text)
    if not words:
        return 0.0
    tech_count = sum(1 for w in words if w in TECH_KEYWORDS)
    density = tech_count / len(words) * 100  # per-100 density
    # Ideal range: 3–10%, normalise to 0–1
    return min(density / 10.0, 1.0)


def _measurable_achievements_score(sections: List[ResumeSection]) -> float:
    exp_sections = [s for s in sections if s.section_type in ("experience", "projects")]
    if not exp_sections:
        return 0.0
    hits = sum(1 for s in exp_sections if has_measurable_achievement(s.content))
    return hits / len(exp_sections)


def _formatting_quality_score(raw_text: str) -> float:
    """Penalise extremely long lines and excessive capitalisation."""
    lines = [l for l in raw_text.split("\n") if l.strip()]
    if not lines:
        return 0.0
    avg_len = sum(len(l) for l in lines) / len(lines)
    all_caps_ratio = sum(1 for l in lines if l.isupper() and len(l) > 5) / len(lines)
    len_score = 1.0 - min(max(avg_len - 80, 0) / 120, 1.0)
    caps_score = 1.0 - min(all_caps_ratio * 3, 1.0)
    return (len_score + caps_score) / 2


def _rule_based_score(sections: List[ResumeSection], raw_text: str) -> Tuple[float, dict]:
    sc = _section_completeness_score(sections)
    kd = _keyword_density_score(raw_text)
    ma = _measurable_achievements_score(sections)
    fq = _formatting_quality_score(raw_text)

    breakdown = {
        "section_completeness": round(sc * 100, 1),
        "keyword_density": round(kd * 100, 1),
        "measurable_achievements": round(ma * 100, 1),
        "formatting_quality": round(fq * 100, 1),
    }

    weighted = (
        sc * ATS_RULES["section_completeness"]
        + kd * ATS_RULES["keyword_density"]
        + ma * ATS_RULES["measurable_achievements"]
        + fq * ATS_RULES["formatting_quality"]
    )
    return weighted, breakdown


def compute_ats_score(
    sections: List[ResumeSection],
    raw_text: str,
    semantic_similarity: float = 0.5,  # default until embedding is run
) -> Tuple[float, dict, List[str]]:
    """
    Compute ATS score using hybrid approach.
    Returns (final_score 0-100, breakdown dict, feedback list).
    """
    rule_score, breakdown = _rule_based_score(sections, raw_text)
    final = (rule_score * ATS_RULE_WEIGHT + semantic_similarity * ATS_SEMANTIC_WEIGHT) * 100
    final = round(min(final, 100.0), 1)

    breakdown["semantic_similarity"] = round(semantic_similarity * 100, 1)
    breakdown["final_ats_score"] = final

    feedback: List[str] = []
    if breakdown["section_completeness"] < 75:
        missing = REQUIRED_SECTIONS - {s.section_type for s in sections}
        feedback.append(f"Add missing sections: {', '.join(missing)}")
    if breakdown["keyword_density"] < 30:
        feedback.append("Increase relevant technical keywords in your resume.")
    if breakdown["measurable_achievements"] < 50:
        feedback.append("Add quantified achievements (e.g., 'Improved throughput by 40%').")
    if breakdown["formatting_quality"] < 60:
        feedback.append("Improve formatting: avoid all-caps lines and keep lines concise.")
    if not feedback:
        feedback.append("Great resume! Consider tailoring keywords for each specific job.")

    return final, breakdown, feedback
