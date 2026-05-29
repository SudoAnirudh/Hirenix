import os
import logging
import json
from typing import Optional
from models.roadmap import CareerRoadmap
from services.skill_gap import detect_skill_gap
from services.nvidia_client import invoke_nvidia_llm
from services.groq_client import invoke_groq_llm
from utils.link_validator import validate_links, get_fallback_url
from config import settings

logger = logging.getLogger(__name__)

SCRAPED_ROADMAPS_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "roadmaps")

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

    async def generate_roadmap(
        self, 
        resume_text: str, 
        github_username: str, 
        target_role: str, 
        user_id: str,
        github_data: Optional[dict] = None,
        linkedin_data: Optional[dict] = None
    ) -> CareerRoadmap:
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

        # 0. Check for Scraped Context
        scraped_context = ""
        try:
            role_norm = target_role.lower().replace(" ", "-")
            folders = [f for f in os.listdir(SCRAPED_ROADMAPS_DIR) if os.path.isdir(os.path.join(SCRAPED_ROADMAPS_DIR, f))]
            matched = next((f for f in folders if f in role_norm or role_norm in f), None)
            if matched:
                c_path = os.path.join(SCRAPED_ROADMAPS_DIR, matched, "content.json")
                if os.path.exists(c_path):
                    with open(c_path, 'r') as f:
                        scraped_data = json.load(f)
                        keys = list(scraped_data.keys())[:20]
                        scraped_context = f"This roadmap should be inspired by roadmap.sh. Key topics to include: {', '.join(keys)}."
        except Exception as e:
            logger.warning(f"Failed to load scraped context: {e}")

        prompt = f"""
        You are a world-class AI Career Strategist. Generate a highly personalized, HIERARCHICAL career roadmap to help a user become a {target_role}.
        
        {scraped_context}
        
        USER CONTEXT:
        - Resume (truncated): {resume_context}
        - GitHub Analysis: {gh_context}
        - Target Role: {target_role}

        YOUR TASK:
        1. Design a vertical 'spine-and-branch' roadmap like roadmap.sh.
        2. Group related skills into parent nodes (e.g., 'Frontend Fundamentals' -> ['HTML', 'CSS', 'JS']).
        3. For EACH skill node, provide:
           - id: unique slug (e.g., 'frontend-fundamentals')
           - name: clear title
           - description: 1-2 sentences of context.
           - children: nested skills (recursive structure).
           - resources: 2-3 REAL, high-quality links (YouTube, MDN, Coursera).
        4. Analyze their current skills (Matched: {", ".join(gaps["matched_skills"])}) and set 'status' to 'completed' if they already know it.
        
        5. Return ONLY a raw JSON object matching this structure:
        {{
            "target_role": "{target_role}",
            "current_level": "junior/mid/senior based on context",
            "overall_progress": 0-100,
            "next_step": "One actionable sentence",
            "skills": [
                {{
                    "id": "skill-id",
                    "name": "Skill Name",
                    "description": "...",
                    "status": "completed" | "in_progress" | "to_learn",
                    "priority": "high" | "medium" | "low",
                    "difficulty": "easy" | "medium" | "hard",
                    "estimated_time": "e.g., 2 weeks",
                    "children": [ ... recursive RoadmapSkill objects ... ],
                    "resources": [
                        {{ "title": "Resource Title", "url": "valid_url", "type": "video/course/article", "is_free": true }}
                    ]
                }}
            ],
            "future_opportunities": ["Opportunity 1", "Opportunity 2"]
        }}

        IMPORTANT:
        - Use deep hierarchy (3-4 levels) for complex topics.
        - NO MOCK DATA. Use real educational platforms.
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
                
                # Recursive link validation
                async def validate_recursive(skills_list):
                    urls_to_check = []
                    for s in skills_list:
                        for r in s.get("resources", []):
                            urls_to_check.append(r["url"])
                        if s.get("children"):
                            urls_to_check.extend(await get_urls_recursive(s["children"]))
                    return urls_to_check

                async def get_urls_recursive(skills_list):
                    urls = []
                    for s in skills_list:
                        for r in s.get("resources", []):
                            urls.append(r["url"])
                        if s.get("children"):
                            urls.extend(await get_urls_recursive(s["children"]))
                    return urls

                async def apply_validation_recursive(skills_list, v_map):
                    for s in skills_list:
                        original_resources = s.get("resources", [])
                        valid_resources = [r for r in original_resources if v_map.get(r["url"], False)]
                        if not valid_resources and original_resources:
                            valid_resources = [{
                                "title": f"Mastering {s['name']} (Verified Search)",
                                "url": get_fallback_url(s["name"]),
                                "type": "video",
                                "is_free": True
                            }]
                        s["resources"] = valid_resources
                        if s.get("children"):
                            await apply_validation_recursive(s["children"], v_map)

                all_urls = await get_urls_recursive(roadmap_dict.get("skills", []))
                validity_map = await validate_links(all_urls)
                await apply_validation_recursive(roadmap_dict.get("skills", []), validity_map)

                # Ensure user_id is injected
                roadmap_dict["user_id"] = user_id
                return CareerRoadmap(**roadmap_dict)
        except Exception as e:
            logger.error(f"AI Roadmap generation failed: {str(e)}")
            raise Exception(f"Failed to generate AI roadmap: {str(e)}")

        raise Exception("AI roadmap generation failed: No provider (NVIDIA/Groq) responded.")

roadmap_engine = RoadmapEngine()
