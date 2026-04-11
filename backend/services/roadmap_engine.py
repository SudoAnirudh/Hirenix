import json
import logging
from typing import Optional
from models.roadmap import Roadmap
from services.skill_gap import detect_skill_gap
from services.nvidia_client import invoke_nvidia_llm
from services.groq_client import invoke_groq_llm
from services.cache_manager import cache_manager
from config import settings

logger = logging.getLogger(__name__)

class RoadmapEngine:
    def __init__(self):
        pass

    async def _get_llm_career_advice(
        self, target_role: str, gaps: dict, github_languages: dict
    ) -> Optional[dict]:
        """Uses NVIDIA LLM to provide personalized career advice for the roadmap."""
        prompt = f"""
        You are a senior career advisor and engineering manager. 
        Provide career advice for a candidate aiming to be a {target_role}.
        
        Matched Skills: {", ".join(gaps["matched_skills"])}
        Mandatory Missing Skills: {", ".join(gaps["mandatory_missing"])}
        Competitive Missing Skills: {", ".join(gaps["competitive_missing"])}
        GitHub Top Languages: {", ".join(github_languages.keys())}
        
        Provide your response in JSON format with the following fields:
        - next_step: A concrete, actionable next step for their career (1 sentence).
        - current_level: Estimate their level ('junior', 'mid', or 'senior') based on skills.
        - future_opportunities: A list of 3-4 future career paths or roles they could grow into.
        
        Return ONLY the raw JSON object. No markdown, no preamble.
        """
        
        try:
            response_data = await invoke_nvidia_llm([{"role": "user", "content": prompt}])
            if not response_data:
                logger.info("NVIDIA LLM failed for advice, falling back to Groq...")
                response_data = await invoke_groq_llm([{"role": "user", "content": prompt}])
            
            if not response_data:
                return None
            
            content = response_data.get("choices", [{}])[0].get("message", {}).get("content", "")
            cleaned_response = content.strip().lstrip("```json").rstrip("```").strip()
            return json.loads(cleaned_response)
        except Exception as e:
            logger.error(f"Error getting LLM career advice: {str(e)}")
            return None

    @cache_manager.cache_llm_result(provider="nvidia")
    async def generate_roadmap(
        self, 
        resume_text: str, 
        github_username: str, 
        target_role: str, 
        user_id: str,
        github_data: Optional[dict] = None,
        linkedin_data: Optional[dict] = None
    ) -> Roadmap:
        """
        Generate a comprehensive, AI-powered career roadmap.
        Synthesizes Resume, GitHub, and LinkedIn analysis to create a personalized path.
        """
        
        # 1. Fallback to keyword-based gaps if LLM fails or is disabled
        gaps = detect_skill_gap(resume_text, target_role)
        
        # Truncate context to avoid token limits
        resume_context = resume_text[:2000] if resume_text else "No resume provided."
        
        gh_context = "No GitHub data."
        if github_data:
            gh_metrics = github_data.get("metrics", {})
            gh_context = f"GPI Score: {github_data.get('gpi_score')}. Top Languages: {', '.join(gh_metrics.get('languages', []))}. Strengths: {', '.join(github_data.get('strengths', []))}."

        li_context = "No LinkedIn data."
        if linkedin_data:
            li_context = f"Summary: {linkedin_data.get('profile_summary')}. Suggested Roles: {', '.join(linkedin_data.get('raw_data', {}).get('suggested_roles', []))}. Strengths: {', '.join(linkedin_data.get('strengths', []))}."

        prompt = f"""
        You are a world-class AI Career Strategist. Generate a highly personalized career roadmap to help a user become a {target_role}.
        
        USER CONTEXT:
        - Resume: {resume_context}
        - GitHub Analysis: {gh_context}
        - LinkedIn Analysis: {li_context}
        - Target Role: {target_role}

        YOUR TASK:
        1. Analyze their current skill set (Matched Skills: {", ".join(gaps["matched_skills"])}) vs the target role.
        2. Identify the most critical gaps (Missing Skills: {", ".join(gaps["mandatory_missing"] + gaps["competitive_missing"])}).
        3. Create a multi-step roadmap with EXACTLY 5-8 specific skills to master.
        4. For EACH skill, provide 2-3 high-quality, REAL learning resources (YouTube, Official Docs, Coursera, FreeCodeCamp).
        5. Return ONLY a raw JSON object matching this structure:
        {{
            "target_role": "{target_role}",
            "current_level": "junior/mid/senior based on context",
            "overall_progress": 0-100,
            "next_step": "One actionable sentence (e.g., 'Master React Hooks next')",
            "skills": [
                {{
                    "name": "Skill Name",
                    "status": "completed" | "in_progress" | "to_learn",
                    "priority": "high" | "medium" | "low",
                    "difficulty": "easy" | "medium" | "hard",
                    "estimated_time": "e.g., 2 weeks",
                    "resources": [
                        {{ "title": "Resource Title", "url": "valid_url", "type": "video/course/article", "is_free": true/false }}
                    ]
                }}
            ],
            "future_opportunities": ["Opportunity 1", "Opportunity 2", "Opportunity 3"]
        }}

        IMPORTANT:
        - NO MOCK DATA. Use real educational platforms.
        - Be realistic about 'completed' skills based on the Resume and GitHub context.
        - If the target role is very different from their history, focus on bridge skills first.
        - Return ONLY JSON. No preamble.
        """

        try:
            response_data = None
            if settings.nvidia_api_key:
                response_data = await invoke_nvidia_llm([{"role": "user", "content": prompt}])
            
            if not response_data and settings.groq_api_key:
                logger.info("NVIDIA LLM failed for roadmap, falling back to Groq...")
                response_data = await invoke_groq_llm([{"role": "user", "content": prompt}])
            
            if response_data:
                content = response_data["choices"][0]["message"]["content"]
                cleaned_json = content.strip().lstrip("```json").rstrip("```").strip()
                roadmap_dict = json.loads(cleaned_json)
                
                # Ensure user_id is injected
                roadmap_dict["user_id"] = user_id
                return Roadmap(**roadmap_dict)
        except Exception as e:
            logger.error(f"AI Roadmap generation failed: {str(e)}")
            raise Exception(f"Failed to generate AI roadmap: {str(e)}")

        raise Exception("AI roadmap generation failed: No provider (NVIDIA/Groq) responded.")

roadmap_engine = RoadmapEngine()
