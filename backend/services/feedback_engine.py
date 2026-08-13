import json
import logging
from typing import List, Dict, Any, Optional
from models.resume import ParsedResumeSchema, BulletRewrite
from services.groq_client import invoke_groq_llm

logger = logging.getLogger("hirenix.feedback_engine")


async def generate_contextual_gap_analysis(
    schema: ParsedResumeSchema,
    ats_breakdown: Dict[str, float],
    target_role: str = "Software Engineer",
) -> List[str]:
    """
    Generates dynamic, context-aware resume gap analysis feedback.
    Identifies missing sub-skills, formatting deficits, and structural improvements.
    """
    feedback: List[str] = []

    # Rule-based contextual checks
    if ats_breakdown.get("section_completeness", 100) < 75:
        present_sections = set()
        if schema.skills: present_sections.add("skills")
        if schema.experiences: present_sections.add("experience")
        if schema.education: present_sections.add("education")
        if schema.projects: present_sections.add("projects")
        missing = sorted({"education", "experience", "skills", "projects"} - present_sections)
        if missing:
            feedback.append(f"Missing core section(s): {', '.join(missing).capitalize()}. Adding these increases ATS parseability.")

    if ats_breakdown.get("xyz_bullet_quality", 100) < 60:
        feedback.append("Bullet points lack quantified metrics. Upgrade bullets using Google's XYZ formula: 'Accomplished [X] as measured by [Y], by doing [Z]'.")

    if ats_breakdown.get("skill_recency_score", 100) < 65:
        feedback.append("Recent work experiences show lower skill density than older roles. Feature modern tools in your current/latest experience entries.")

    # LLM-based intelligent gap analysis
    prompt = f"""You are a senior technical hiring manager reviewing a candidate's parsed resume for a {target_role} position.
Extracted Resume Summary:
- Skills: {', '.join(schema.skills[:15]) or 'None specified'}
- Experiences: {len(schema.experiences)} roles parsed
- Projects: {len(schema.projects)} projects listed

Identify 2-3 specific, actionable advice points describing missing sub-skills or improvements needed for tech roles.
Output ONLY a JSON array of strings, e.g.:
["Your resume lists Python, but lacks explicit mention of production frameworks like FastAPI or Django.", "Consider specifying API throughput or latency metrics in your recent experience."]"""

    try:
        res = await invoke_groq_llm(
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=512,
        )
        if res and "choices" in res and res["choices"]:
            content = res["choices"][0]["message"]["content"].strip()
            if content.startswith("```json"): content = content[7:]
            if content.startswith("```"): content = content[3:]
            if content.endswith("```"): content = content[:-3]
            data = json.loads(content.strip())
            if isinstance(data, list):
                for item in data:
                    if isinstance(item, str) and item not in feedback:
                        feedback.append(item)
    except Exception as e:
        logger.warning(f"LLM gap analysis generation failed: {e}")

    if not feedback:
        feedback.append("Strong candidate profile! Consider tailoring technical keywords for each specific target position.")

    return feedback


async def generate_synthetic_bullet_rewrites(
    schema: ParsedResumeSchema,
    max_rewrites: int = 2,
) -> List[BulletRewrite]:
    """
    Selects low-scoring bullet points from the parsed resume and automatically generates
    before/after rewrites following Google's XYZ formula.
    """
    rewrites: List[BulletRewrite] = []
    weak_bullets: List[str] = []

    # Collect bullets with low XYZ scores
    for exp in schema.experiences:
        for b in exp.bullets:
            if b.xyz_score < 0.6 and len(b.content.split()) >= 4:
                weak_bullets.append(b.content)

    if not weak_bullets:
        return rewrites

    selected_bullets = weak_bullets[:max_rewrites]

    prompt = f"""You are an expert career coach and resume optimizer.
Transform the following weak resume bullet point(s) into high-impact, production-grade bullet points following Google's XYZ Formula:
Accomplished [X] as measured by [Y], by doing [Z].

Bullets to rewrite:
{json.dumps(selected_bullets)}

Output strict JSON array of objects:
[
  {{
    "original_bullet": "Original weak bullet text",
    "rewritten_bullet": "Accomplished X as measured by Y%, by implementing Z.",
    "explanation": "Added quantifiable impact metrics (Y%) and specified technology Z."
  }}
]
Return ONLY valid JSON."""

    try:
        res = await invoke_groq_llm(
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4,
            max_tokens=1024,
        )
        if res and "choices" in res and res["choices"]:
            content = res["choices"][0]["message"]["content"].strip()
            if content.startswith("```json"): content = content[7:]
            if content.startswith("```"): content = content[3:]
            if content.endswith("```"): content = content[:-3]
            data = json.loads(content.strip())
            if isinstance(data, list):
                for item in data:
                    if isinstance(item, dict) and "original_bullet" in item and "rewritten_bullet" in item:
                        rewrites.append(
                            BulletRewrite(
                                original_bullet=item["original_bullet"],
                                rewritten_bullet=item["rewritten_bullet"],
                                explanation=item.get("explanation", "Optimized with XYZ formula structure."),
                            )
                        )
    except Exception as e:
        logger.warning(f"Synthetic bullet rewrite generation failed: {e}")

    return rewrites
