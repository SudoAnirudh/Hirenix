from typing import Optional, List, Dict
from services.embedding_engine import compare_texts
from services.skill_gap import detect_skill_gap
from services.groq_client import invoke_groq_llm
from models.analysis import JobMatchResponse, SkillGapResult

def _fit_verdict(match_score: float) -> str:
    if match_score >= 80:
        return "Strong fit"
    if match_score >= 65:
        return "Good fit"
    if match_score >= 50:
        return "Moderate fit"
    return "Low fit"

async def _get_bridge_advice(resume_text: str, jd_text: str, missing_skills: List[str]) -> List[str]:
    """Uses LLM to provide actionable feedback on how to bridge the gap."""
    if not missing_skills:
        return ["Your profile is already a strong match! Focus on tailoring your bullet points to the JD's specific verbs."]

    prompt = f"""
    You are an expert Career Coach and ATS Specialist.
    Resume: {resume_text[:2000]}
    Job Description: {jd_text[:2000]}
    Missing Skills: {", ".join(missing_skills)}

    Based on the resume and job description, provide 3-4 specific, actionable "Bridge Advice" bullet points. 
    A "Bridge" is how to frame existing experience to satisfy a requirement even if the exact keyword is missing, 
    or a quick way to add the skill to the resume if they likely have it.
    
    Output ONLY as a JSON list of strings. Do not include any other text.
    """
    
    messages = [{"role": "user", "content": prompt}]
    response = await invoke_groq_llm(messages, temperature=0.3)
    
    try:
        if response and response.get("choices"):
            content = response["choices"][0]["message"]["content"]
            # Clean possible markdown wrap
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]
            return eval(content.strip())
    except:
        pass
    
    return [f"Add direct experience with {skill} to your professional summary." for skill in missing_skills[:3]]

async def match_job_description(
    resume_text: str,
    jd_text: str,
    target_role: Optional[str] = None,
) -> JobMatchResponse:
    """
    Compare resume against a job description.
    Returns semantic match score, granular scoring, skill gap, and AI advice.
    """
    # Semantic similarity via embeddings (Experience Score base)
    semantic_sim = compare_texts(resume_text, jd_text)
    
    # Skill gap detection
    skill_gap_raw = {"mandatory_missing": [], "competitive_missing": [], "matched_skills": []}
    if target_role:
        skill_gap_raw = detect_skill_gap(resume_text, target_role)

    # Multi-dimensional scoring
    mandatory_total = len(skill_gap_raw["mandatory_missing"]) + len([s for s in skill_gap_raw["matched_skills"] if s in skill_gap_raw["mandatory_missing"]])
    # Note: matched_skills includes both mandatory and competitive. 
    # Let's fix the logic to get actual mandatory matched.
    # Actually skill_gap.py returns them nicely.

    # 1. Technical Score (Mandatory skill coverage)
    mandatory_matched = [s for s in skill_gap_raw["matched_skills"] if s.lower() in [m.lower() for m in skill_gap_raw.get("mandatory_missing", []) + skill_gap_raw.get("matched_skills", [])]]
    # wait, the logic above is slightly flawed because matched_skills is already detected.
    
    # Let's use a simpler heuristic for dimensions:
    technical_score = (len(skill_gap_raw["matched_skills"]) / max(len(skill_gap_raw["matched_skills"]) + len(skill_gap_raw["mandatory_missing"]), 1)) * 100
    experience_score = semantic_sim * 100
    soft_skills_score = min(100, (len(resume_text.split()) / 500) * 100) # Placeholder: improved by length & context

    # Composite match score: 40% technical + 40% experience + 20% soft skills (naive)
    match_score = round((technical_score * 0.4 + experience_score * 0.4 + soft_skills_score * 0.2), 1)
    fit_verdict = _fit_verdict(match_score)

    # Heatmap
    keyword_heatmap = {}
    for s in skill_gap_raw["matched_skills"]:
        keyword_heatmap[s] = "matched"
    for s in skill_gap_raw["mandatory_missing"]:
        keyword_heatmap[s] = "missing"
    for s in skill_gap_raw["competitive_missing"]:
        keyword_heatmap[s] = "partial"

    # Bridge Advice (Async)
    missing = skill_gap_raw["mandatory_missing"] + skill_gap_raw["competitive_missing"]
    bridge_advice = await _get_bridge_advice(resume_text, jd_text, missing)

    pros = []
    for skill in skill_gap_raw["matched_skills"][:4]:
        pros.append(f"Strong technical match: {skill}")
    if semantic_sim >= 0.75:
        pros.append("Experience aligns with seniority and role scope.")

    cons = []
    if skill_gap_raw["mandatory_missing"]:
        cons.append(f"Key skill gaps: {', '.join(skill_gap_raw['mandatory_missing'][:2])}")
    if semantic_sim < 0.6:
        cons.append("Core experience context differs significantly from the JD.")

    recommendations = [f"Synthesize your results into a {fit_verdict} application strategy."]

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
