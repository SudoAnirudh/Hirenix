import json
import os
import logging
from typing import List, Optional
from models.roadmap import Roadmap, RoadmapSkill, Resource
from services.skill_gap import detect_skill_gap
from services.github_analyzer import analyze_github_profile
from services.nvidia_client import invoke_nvidia_llm
from services.cache_manager import cache_manager
from config import settings

logger = logging.getLogger(__name__)

class RoadmapEngine:
    def __init__(self):
        self.role_resources = {
            "React": [
                Resource(title="React Documentation", url="https://react.dev", type="article", is_free=True),
                Resource(title="Epic React by Kent C. Dodds", url="https://epicreact.dev", type="course", is_free=False),
                Resource(title="React Crash Course", url="https://www.youtube.com/watch?v=w7ejDZ8SWv8", type="video", is_free=True)
            ],
            "TypeScript": [
                Resource(title="TypeScript Handbook", url="https://www.typescriptlang.org/docs/handbook/intro.html", type="article", is_free=True),
                Resource(title="Total TypeScript", url="https://www.totaltypescript.com", type="course", is_free=False)
            ],
            "Node.js": [
                Resource(title="Node.js Design Patterns", url="https://www.nodejsdesignpatterns.com", type="course", is_free=False),
                Resource(title="Node.js Official Docs", url="https://nodejs.org/en/docs", type="article", is_free=True)
            ],
            "Docker": [
                Resource(title="Getting Started with Docker", url="https://docs.docker.com/get-started/", type="article", is_free=True),
                Resource(title="Docker Official Guide", url="https://docs.docker.com/get-started", type="article", is_free=True)
            ],
            "Kubernetes": [
                Resource(title="Kubernetes Up & Running", url="https://www.oreilly.com/library/view/kubernetes-up-and/9781492043058", type="article", is_free=False),
                Resource(title="CKA Certification Course", url="https://kodekloud.com/courses/certified-kubernetes-administrator-cka", type="course", is_free=False)
            ],
            "Python": [
                Resource(title="Fluent Python", url="https://www.oreilly.com/library/view/fluent-python-2nd/9781492056348", type="article", is_free=False),
                Resource(title="Python Crash Course", url="https://nostarch.com/pythoncrashcourse2e", type="article", is_free=False)
            ],
            "FastAPI": [
                Resource(title="FastAPI Tutorial", url="https://fastapi.tiangolo.com/tutorial", type="article", is_free=True),
                Resource(title="TestDriven.io FastAPI courses", url="https://testdriven.io/courses/fastapi-composite", type="course", is_free=False)
            ],
            "SQL": [
                Resource(title="SQL for Data Analysis", url="https://www.udacity.com/course/sql-for-data-analysis--ud198", type="course", is_free=True),
                Resource(title="Use The Index, Luke", url="https://use-the-index-luke.com", type="article", is_free=True)
            ],
            "System Design": [
                Resource(title="Grokking the System Design Interview", url="https://www.designgurus.io/course/grokking-the-system-design-interview", type="course", is_free=False),
                Resource(title="System Design Primer", url="https://github.com/donnemartin/system-design-primer", type="article", is_free=True)
            ],
        }
        
        self.role_opportunities = {
            "Frontend Engineer": [
                "Growth into Senior Frontend/Architect roles",
                "Transition to Full Stack development",
                "Opportunities in UI/UX Engineering",
                "High demand in SaaS and Tech companies"
            ],
            "Backend Engineer": [
                "Specialization in Distributed Systems",
                "Cloud Architecture opportunities",
                "DevOps/SRE transitions",
                "High demand for scalable system experts"
            ],
            "Full Stack Engineer": [
                "Versatile roles in startups",
                "Engineering Leadership/CTO paths",
                "Product Engineering focus",
                "High market flexibility"
            ],
            "Data Scientist": [
                "AI/ML Research opportunities",
                "Biotech and Financial analysis",
                "Chief Data Officer path",
                "Growing field with high compensation"
            ],
        }

    def _get_resources(self, skill: str) -> List[Resource]:
        return self.role_resources.get(skill, [
            Resource(title=f"{skill} Documentation", url=f"https://www.google.com/search?q={skill.replace(' ', '+')}+documentation", type="article", is_free=True),
            Resource(title=f"Learn {skill} on Coursera", url="https://www.coursera.org", type="course", is_free=False)
        ])

    def _get_opportunities(self, role: str) -> List[str]:
        # Fuzzy match for opportunities
        for key in self.role_opportunities:
            if key.lower() in role.lower() or role.lower() in key.lower():
                return self.role_opportunities[key]
        return ["High demand for skilled professionals", "Opportunities for growth and leadership", "Competitive salary packages"]

    def _estimate_time(self, skill: str, difficulty: str) -> str:
        estimates = {"easy": "1 week", "medium": "2-3 weeks", "hard": "1-2 months"}
        return estimates.get(difficulty, "2 weeks")

    def _get_difficulty(self, skill: str) -> str:
        hard_skills = ["Kubernetes", "System Design", "Deep Learning", "Microservices"]
        medium_skills = ["Docker", "TypeScript", "FastAPI", "Next.js", "GraphQL"]
        if skill in hard_skills: return "hard"
        if skill in medium_skills: return "medium"
        return "easy"

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
                return None
            
            content = response_data.get("choices", [{}])[0].get("message", {}).get("content", "")
            cleaned_response = content.strip().lstrip("```json").rstrip("```").strip()
            return json.loads(cleaned_response)
        except Exception as e:
            logger.error(f"Error getting LLM career advice: {str(e)}")
            return None

    @cache_manager.cache_llm_result(provider="nvidia")
    async def generate_roadmap(self, resume_text: str, github_username: str, target_role: str, user_id: str) -> Roadmap:
        # 1. Get Skill Gaps
        gaps = detect_skill_gap(resume_text, target_role)
        
        # 2. Get GitHub Profile Data
        github_data = await analyze_github_profile(github_username)
        github_languages = github_data.metrics.languages

        roadmap_skills = []

        # Process Completed Skills
        for skill in gaps["matched_skills"]:
            roadmap_skills.append(RoadmapSkill(
                name=skill,
                status="completed",
                priority="low",
                difficulty=self._get_difficulty(skill),
                estimated_time="Completed",
                resources=self._get_resources(skill)
            ))

        # Process Missing Skills (High Priority)
        for skill in gaps["mandatory_missing"]:
            diff = self._get_difficulty(skill)
            roadmap_skills.append(RoadmapSkill(
                name=skill,
                status="to_learn",
                priority="high",
                difficulty=diff,
                estimated_time=self._estimate_time(skill, diff),
                resources=self._get_resources(skill)
            ))

        # Process Missing Skills (Medium Priority)
        for skill in gaps["competitive_missing"]:
            diff = self._get_difficulty(skill)
            roadmap_skills.append(RoadmapSkill(
                name=skill,
                status="to_learn",
                priority="medium",
                difficulty=diff,
                estimated_time=self._estimate_time(skill, diff),
                resources=self._get_resources(skill)
            ))

        # Calculate Progress
        total_skills = len(roadmap_skills)
        completed_skills = len([s for s in roadmap_skills if s.status == "completed"])
        progress = (completed_skills / total_skills * 100) if total_skills > 0 else 0

        # Heuristic Defaults
        next_step = f"Focus on mastering {gaps['mandatory_missing'][0]}" if gaps["mandatory_missing"] else "Analyze GitHub more deeply"
        current_level = "junior"
        future_opportunities = self._get_opportunities(target_role)

        # 3. Enhance with LLM if available
        if settings.nvidia_api_key:
            advice = await self._get_llm_career_advice(target_role, gaps, github_languages)
            if advice:
                next_step = advice.get("next_step", next_step)
                current_level = advice.get("current_level", current_level)
                future_opportunities = advice.get("future_opportunities", future_opportunities)

        return Roadmap(
            user_id=user_id,
            target_role=target_role,
            current_level=current_level,
            skills=roadmap_skills,
            next_step=next_step,
            overall_progress=round(progress, 1),
            future_opportunities=future_opportunities
        )

roadmap_engine = RoadmapEngine()
