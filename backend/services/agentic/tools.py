import re
import logging
from typing import Optional, List, Dict, Any

from langchain_core.tools import tool
from models.resume import ResumeSection
from dependencies import get_supabase_admin

# Import existing core business services
from services.ats_scorer import compute_ats_score
from services.jd_matcher import match_job_description
from services.github_analyzer import analyze_github_profile
from services.roadmap_engine import roadmap_engine
from services.interview_engine import evaluate_answer, generate_questions
from services.outreach_service import generate_outreach_drafts

logger = logging.getLogger(__name__)

# Section headers to detect (case-insensitive)
SECTION_PATTERNS = {
    "education": re.compile(r"\b(education|academics?|qualifications?)\b", re.IGNORECASE),
    "experience": re.compile(r"\b(experience|work history|employment|internship)\b", re.IGNORECASE),
    "skills": re.compile(r"\b(skills?|technologies|tech stack|competencies|expertise)\b", re.IGNORECASE),
    "projects": re.compile(r"\b(projects?|portfolio|personal projects?)\b", re.IGNORECASE),
    "certifications": re.compile(r"\b(certifications?|certificates?|licenses?|credentials)\b", re.IGNORECASE),
    "summary": re.compile(r"\b(summary|profile|objective|about me)\b", re.IGNORECASE),
}

def parse_text_to_sections(raw_text: str) -> List[ResumeSection]:
    """Helper to parse raw resume string into structured sections for rule-based scoring."""
    lines = [l.strip() for l in raw_text.split("\n") if l.strip()]
    sections: List[ResumeSection] = []
    current_section: Optional[str] = None
    current_lines: List[str] = []

    def flush():
        if current_section and current_lines:
            sections.append(
                ResumeSection(
                    section_type=current_section,
                    content="\n".join(current_lines)
                )
            )

    for line in lines:
        detected = None
        for label, pattern in SECTION_PATTERNS.items():
            if pattern.search(line) and len(line) < 60:
                detected = label
                break
        if detected:
            flush()
            current_section = detected
            current_lines = []
        else:
            if current_section:
                current_lines.append(line)
            else:
                # If no section is yet detected, treat it as part of summary/preamble
                current_section = "summary"
                current_lines.append(line)
    flush()

    if not sections:
        sections.append(ResumeSection(section_type="body", content=raw_text))
    return sections


@tool
async def ats_score_tool(resume_text: str) -> str:
    """
    Computes an ATS score for the user's resume text, scoring its keyword density, 
    completeness, measurable achievements, and formatting.
    Input:
      resume_text: The raw text of the resume.
    Returns:
      A JSON string containing the final_ats_score, breakdown, and suggested feedback items.
    """
    logger.info("Tool invocation: ats_score_tool")
    try:
        sections = parse_text_to_sections(resume_text)
        score, breakdown, feedback = await compute_ats_score(sections, resume_text)
        import json
        return json.dumps({
            "score": score,
            "breakdown": breakdown,
            "feedback": feedback
        })
    except Exception as e:
        logger.error(f"Error in ats_score_tool: {e}")
        return f"Error computing ATS score: {str(e)}"


@tool
async def job_match_tool(resume_text: str, jd_text: str, target_role: Optional[str] = None, user_id: Optional[str] = None) -> str:
    """
    Evaluates how well a resume matches a target job description (JD).
    Input:
      resume_text: Raw text of the candidate's resume.
      jd_text: Target job description text.
      target_role: Optional role title (e.g. 'Senior Frontend Engineer').
      user_id: Optional User UUID to fetch additional skills and repository metrics.
    Returns:
      A JSON string with the match score, technical score, experience score, pros, cons, heatmap, and bridge advice.
    """
    logger.info("Tool invocation: job_match_tool")
    try:
        db = get_supabase_admin()
        res = await match_job_description(
            resume_text=resume_text,
            jd_text=jd_text,
            target_role=target_role,
            user_id=user_id,
            db=db
        )
        return res.model_dump_json()
    except Exception as e:
        logger.error(f"Error in job_match_tool: {e}")
        return f"Error executing job matching: {str(e)}"


@tool
async def github_analyze_tool(username: str) -> str:
    """
    Performs a deep analysis of a developer's public GitHub profile.
    Input:
      username: The GitHub username.
    Returns:
      A JSON string containing the GitHub Production Index (GPI), repository metrics, strengths, and recommendations.
    """
    logger.info(f"Tool invocation: github_analyze_tool for {username}")
    try:
        res = await analyze_github_profile(username)
        return res.model_dump_json()
    except Exception as e:
        logger.error(f"Error in github_analyze_tool: {e}")
        return f"Error performing GitHub analysis: {str(e)}"


@tool
async def roadmap_generation_tool(resume_text: str, github_username: str, target_role: str, user_id: str) -> str:
    """
    Generates a hierarchical career learning roadmap to bridge gaps for a target role, 
    incorporating the candidate's current resume and GitHub history.
    Input:
      resume_text: Text of the resume.
      github_username: GitHub username.
      target_role: The role the user is aiming for.
      user_id: User UUID.
    Returns:
      A JSON string containing the vertical roadmap tree, priorities, and verified learning resources.
    """
    logger.info("Tool invocation: roadmap_generation_tool")
    try:
        # Fetch mock or real github data first if needed to pass to generator
        db = get_supabase_admin()
        gh_query = db.table("github_analyses") \
            .select("*") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True) \
            .limit(1) \
            .execute()
        
        gh_data = gh_query.data[0] if gh_query.data else None
        
        res = await roadmap_engine.generate_roadmap(
            resume_text=resume_text,
            github_username=github_username,
            target_role=target_role,
            user_id=user_id,
            github_data=gh_data
        )
        return res.model_dump_json()
    except Exception as e:
        logger.error(f"Error in roadmap_generation_tool: {e}")
        return f"Error generating roadmap: {str(e)}"


@tool
async def interview_evaluation_tool(question_id: str, question: str, answer: str, category: str, expected_topics: List[str]) -> str:
    """
    Evaluates a user's mock interview answer, providing a professional score (0-10) and career coaching advice.
    Input:
      question_id: Unique question UUID.
      question: The interview question asked.
      answer: The candidate's text answer.
      category: Category of the question (e.g. 'technical', 'behavioral', 'system_design').
      expected_topics: List of topics expected to be covered.
    Returns:
      A JSON string containing overall score, rubrics, strengths, and coaching improvements.
    """
    logger.info("Tool invocation: interview_evaluation_tool")
    try:
        res = await evaluate_answer(
            question_id=question_id,
            question=question,
            answer=answer,
            category=category,
            expected_topics=expected_topics
        )
        return res.model_dump_json()
    except Exception as e:
        logger.error(f"Error in interview_evaluation_tool: {e}")
        return f"Error evaluating interview answer: {str(e)}"


@tool
async def interview_question_tool(resume_context: str, target_role: str, difficulty: str, experience_level: str, interview_type: str) -> str:
    """
    Generates a single tailored, conversational mock interview question based on user profile and role specifications.
    Input:
      resume_context: Resume profile context.
      target_role: The role being interviewed for.
      difficulty: Question difficulty ('easy' | 'medium' | 'hard').
      experience_level: 'junior' | 'mid' | 'senior'.
      interview_type: 'technical' | 'behavioral' | 'system_design' | 'mixed'.
    Returns:
      A JSON string containing the question text, question_id, expected topics, and follow-up prompt.
    """
    logger.info("Tool invocation: interview_question_tool")
    try:
        plan, questions = await generate_questions(
            resume_context=resume_context,
            target_role=target_role,
            difficulty=difficulty,
            num_questions=1,
            interview_type=interview_type,
            experience_level=experience_level
        )
        import json
        if questions:
            q = questions[0]
            return json.dumps({
                "question_id": q.question_id,
                "question": q.question,
                "category": q.category,
                "difficulty": q.difficulty,
                "expected_topics": q.expected_topics,
                "follow_up_prompt": q.follow_up_prompt
            })
        return json.dumps({"error": "No questions generated"})
    except Exception as e:
        logger.error(f"Error in interview_question_tool: {e}")
        return f"Error generating question: {str(e)}"


@tool
async def outreach_draft_tool(user_id: str, match_id: str, tone: str = "Formal") -> str:
    """
    Generates tailored cold emails and LinkedIn request drafts to connect with recruiters or hiring managers.
    Input:
      user_id: Candidate User UUID.
      match_id: Job Match UUID (associates the target job requirements).
      tone: Tone of communication ('Formal' | 'Casual' | 'Assertive').
    Returns:
      A JSON string with the LinkedIn message and cold email draft.
    """
    logger.info("Tool invocation: outreach_draft_tool")
    try:
        db = get_supabase_admin()
        res = await generate_outreach_drafts(
            user_id=user_id,
            match_id=match_id,
            db=db,
            tone=tone
        )
        if res:
            return res.model_dump_json()
        return '{"error": "Failed to generate outreach drafts"}'
    except Exception as e:
        logger.error(f"Error in outreach_draft_tool: {e}")
        return f"Error generating outreach draft: {str(e)}"
