from typing import Optional
from services.embedding_engine import compare_texts
from services.skill_gap import detect_skill_gap
from models.analysis import JobMatchResponse, SkillGapResult


def _fit_verdict(match_score: float) -> str:
    if match_score >= 80:
        return "Strong fit"
    if match_score >= 65:
        return "Good fit"
    if match_score >= 50:
        return "Moderate fit"
    return "Low fit"


async def match_job_description(
    resume_text: str,
    jd_text: str,
    target_role: Optional[str] = None,
) -> JobMatchResponse:
    """
    Compare resume against a job description.
    Returns semantic match score, skill gap, and recommendations.
    """
    # Semantic similarity via embeddings
    semantic_sim = compare_texts(resume_text, jd_text)  # 0–1

    # Skill gap detection
    skill_gap_raw = {"mandatory_missing": [], "competitive_missing": [], "matched_skills": []}
    if target_role:
        skill_gap_raw = detect_skill_gap(resume_text, target_role)

    # Composite match score: 60% semantic + 40% skill coverage
    total_skills = (
        len(skill_gap_raw["matched_skills"])
        + len(skill_gap_raw["mandatory_missing"])
        + len(skill_gap_raw["competitive_missing"])
    )
    skill_coverage = (
        len(skill_gap_raw["matched_skills"]) / max(total_skills, 1)
    )
    match_score = round((semantic_sim * 0.6 + skill_coverage * 0.4) * 100, 1)
    fit_verdict = _fit_verdict(match_score)

    pros = []
    for skill in skill_gap_raw["matched_skills"][:4]:
        pros.append(f"Matches required skill: {skill}")
    if semantic_sim >= 0.75:
        pros.append("Resume experience aligns well with the overall job context.")
    if not pros:
        pros.append("Resume has partial overlap with the job requirements.")

    cons = []
    for skill in skill_gap_raw["mandatory_missing"][:3]:
        cons.append(f"Missing mandatory skill: {skill}")
    for skill in skill_gap_raw["competitive_missing"][:2]:
        cons.append(f"Missing competitive edge skill: {skill}")
    if semantic_sim < 0.55:
        cons.append("Resume content is not closely aligned with the job description.")
    if not cons:
        cons.append("No major weaknesses detected from the provided JD.")

    # Recommendations
    recommendations = []
    for skill in skill_gap_raw["mandatory_missing"][:3]:
        recommendations.append(f"Add '{skill}' — mandatory for {target_role or 'this role'}.")
    for skill in skill_gap_raw["competitive_missing"][:2]:
        recommendations.append(f"Consider gaining '{skill}' to stand out competitively.")
    if not recommendations:
        recommendations.append("Your profile is a strong match. Tailor keywords for the specific JD.")

    return JobMatchResponse(
        match_id="",        # filled by router
        resume_id="",       # filled by router
        match_score=match_score,
        semantic_similarity=round(semantic_sim * 100, 1),
        fit_verdict=fit_verdict,
        pros=pros,
        cons=cons,
        skill_gap=SkillGapResult(**skill_gap_raw),
        recommendations=recommendations,
    )
