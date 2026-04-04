import logging
from typing import Optional, List, Any
from services.embedding_engine import compare_texts
from services.skill_gap import detect_skill_gap
from services.groq_client import invoke_groq_llm
from services.nvidia_client import invoke_nvidia_llm
from models.analysis import JobMatchResponse, SkillGapResult
import json

logger = logging.getLogger("hirenix.jd_matcher")

def _fit_verdict(match_score: float) -> str:
    if match_score >= 85: return "Exceptional fit"
    if match_score >= 75: return "Strong fit"
    if match_score >= 60: return "Good fit"
    if match_score >= 40: return "Moderate fit"
    return "Low fit"

async def _get_bridge_advice(resume_text: str, jd_text: str, missing_skills: List[str]) -> List[str]:
    """Uses LLM to provide actionable feedback on how to bridge the gap."""
    if not missing_skills:
        return ["Your profile is already a strong match! Focus on tailoring your bullet points to the JD's specific verbs."]

    prompt = f"""
    You are a Strategic Career Advisor.
    Resume: {resume_text[:1500]}
    Job Description: {jd_text[:1500]}
    Specific Missing Skills: {", ".join(missing_skills)}

    Provide 3 high-impact, brief "Bridge Advice" points. 
    Explain how to pivot existing experience to cover these gaps or what specific micro-project to add.
    Output ONLY as a JSON list of strings.
    """
    
    # Use NVIDIA for high-quality advice if possible
    response = await invoke_nvidia_llm([{"role": "user", "content": prompt}], temperature=0.3)
    if not response:
        response = await invoke_groq_llm([{"role": "user", "content": prompt}], temperature=0.3)
    
    try:
        if response and response.get("choices"):
            content = response["choices"][0]["message"]["content"]
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            return json.loads(content.strip())
    except:
        pass
    
    return [f"Highlight your transferable proficiency in {skill} via recent projects." for skill in missing_skills[:3]]

async def match_job_description(
    resume_text: str,
    jd_text: str,
    target_role: Optional[str] = None,
    user_id: Optional[str] = None,
    db: Optional[Any] = None
) -> JobMatchResponse:
    """
    Compare resume against a job description.
    Returns semantic match score, granular scoring, skill gap, and AI advice.
    Incorporates 'Growth Potential' if user context is provided.
    """
    # 1. Semantic similarity (Experience base)
    semantic_sim = await compare_texts(resume_text, jd_text)
    
    # 2. Skill gap detection
    skill_gap_raw = {"mandatory_missing": [], "competitive_missing": [], "matched_skills": []}
    if target_role:
        skill_gap_raw = detect_skill_gap(resume_text, target_role)

    # 3. Technical Score (Skill Coverage)
    total_relevant = len(skill_gap_raw["matched_skills"]) + len(skill_gap_raw["mandatory_missing"])
    technical_score = (len(skill_gap_raw["matched_skills"]) / max(total_relevant, 1)) * 100
    
    # 4. Experience Score (Semantic + Keywords)
    experience_score = semantic_sim * 100
    
    # 5. Soft Skills (Contextual Analysis - Placeholder for deeper NLP)
    soft_skills_score = min(100, (len(resume_text.split()) / 450) * 100)

    # 6. Growth Alignment (Verified via Progress)
    growth_score = 0.0
    progress_notes = []
    if user_id and db:
        from services.job_suggester import get_user_readiness_context
        ctx = await get_user_readiness_context(user_id, db)
        
        ready_skills = ctx.get("ready_skills", [])
        verified_matches = [s for s in ready_skills if s.lower() in jd_text.lower() or s.lower() in [ms.lower() for ms in skill_gap_raw["matched_skills"]]]
        
        if verified_matches:
            growth_score = min(100, (len(verified_matches) / 3) * 100)
            progress_notes.append(f"Matching Verified Skills: {', '.join(verified_matches)}")
        
        if ctx.get("gpi_score", 0) > 70:
            growth_score = (growth_score + 100) / 2
            progress_notes.append("High GitHub Production Index detected.")

    # Composite Score Logic
    if user_id:
        # Weighted: 35% Tech, 35% Exp, 10% Soft, 20% Growth
        match_score = round((technical_score * 0.35 + experience_score * 0.35 + soft_skills_score * 0.10 + growth_score * 0.20), 1)
    else:
        # Standard: 40% Tech, 40% Exp, 20% Soft
        match_score = round((technical_score * 0.4 + experience_score * 0.4 + soft_skills_score * 0.2), 1)

    fit_verdict = _fit_verdict(match_score)
    keyword_heatmap = {s: "matched" for s in skill_gap_raw["matched_skills"]}
    keyword_heatmap.update({s: "missing" for s in skill_gap_raw["mandatory_missing"]})
    keyword_heatmap.update({s: "partial" for s in skill_gap_raw["competitive_missing"]})

    # AI Bridge Advice
    missing = skill_gap_raw["mandatory_missing"] + skill_gap_raw["competitive_missing"]
    bridge_advice = await _get_bridge_advice(resume_text, jd_text, missing)

    pros = [f"Direct match found for {s}" for s in skill_gap_raw["matched_skills"][:3]]
    if semantic_sim > 0.7: pros.append("Strong narrative alignment with role requirements.")
    if growth_score > 60: pros.append("Proven domain readiness from recent interview/coding activity.")

    cons = [f"Missing critical skill: {s}" for s in skill_gap_raw["mandatory_missing"][:2]]
    if semantic_sim < 0.5: cons.append("Significant gap in core industry experience.")

    recommendations = [
        f"Leverage your {fit_verdict.lower()} to target this opening.",
        "Apply the bridge advice to your resume before submitting."
    ]

    logger.info(f"Job Match complete: {match_score}% (Role: {target_role or 'Unknown'})")

    return JobMatchResponse(
        match_id="",
        resume_id="",
        match_score=match_score,
        technical_score=round(technical_score, 1),
        experience_score=round(experience_score, 1),
        soft_skills_score=round(soft_skills_score, 1),
        semantic_similarity=round(semantic_sim * 100, 1),
        fit_verdict=fit_verdict,
        pros=pros,
        cons=cons,
        skill_gap=SkillGapResult(**skill_gap_raw),
        keyword_heatmap=keyword_heatmap,
        recommendations=recommendations,
        bridge_advice=bridge_advice
    )
