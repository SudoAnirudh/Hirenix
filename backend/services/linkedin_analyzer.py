import json
import logging
from typing import Optional
from models.linkedin import LinkedInAnalysisResponse
from utils.pdf_extractor import extract_pdf_text
from utils.text_cleaner import clean_text
from services.groq_client import invoke_groq_llm

logger = logging.getLogger("hirenix.linkedin_analyzer")

LINKEDIN_PROMPT = """
You are an expert LinkedIn Profile Optimizer and Career Coach. 
Analyze the following LinkedIn Profile text extracted from a PDF export.
Provide a comprehensive evaluation and actionable improvement suggestions.

Return the result STRICTLY as a JSON object matching this structure:
{{
    "overall_score": 85,
    "headline": {{
        "score": 90,
        "current": "Software Engineer at Google",
        "improved": "Senior Full-Stack Architect | Next.js & Python Expert | Building scalable SaaS",
        "tips": ["Add more specific tech stack keywords", "Highlight your leadership role"],
        "missing_keywords": ["Scalability", "System Design"]
    }},
    "about": {{
        "score": 75,
        "current": "Experienced developer with a passion for coding.",
        "improved": "Results-driven Software Architect with 10+ years experience...",
        "tips": ["Expand on your recent projects", "Add a clear call to action"],
        "missing_keywords": ["Mentorship", "Cloud Architecture"]
    }},
    "experience": {{
        "score": 80,
        "current": "Built several features for our internal dashboard.",
        "tips": ["Quantify your impact (e.g., improved performance by 20%)", "Use stronger action verbs"],
        "missing_keywords": ["Agile", "CI/CD"]
    }},
    "skills": {{
        "score": 95,
        "current": "JavaScript, React, Python, SQL",
        "tips": ["Group skills by category", "Add specialized tools like Docker or AWS"],
        "missing_keywords": ["Kubernetes", "GraphQL"]
    }},
    "completeness_score": 90,
    "general_tips": ["Complete your certification section", "Add a professional profile picture"],
    "suggested_roles": ["Senior Software Engineer", "Tech Lead"]
}}

Focus on:
1. Headline: Should be high-impact, keyword-rich, and clearly state current role/value proposition.
2. About: Should tell a compelling professional story, include achievements, and have a clear call to action.
3. Experience: Should focus on measurable outcomes (numbers, percentages) rather than just duties.
4. Keywords: Identify missing industry-standard terms.

Profile Text:
---
{profile_text}
---
"""

async def analyze_linkedin_profile(content: bytes) -> Optional[LinkedInAnalysisResponse]:
    """
    Extracts text from LinkedIn PDF and uses LLM for structured analysis.
    """
    try:
        raw_text = clean_text(extract_pdf_text(content))
        if not raw_text.strip():
            logger.error("No text could be extracted from LinkedIn PDF.")
            return None

        # Truncate to avoid context window issues
        truncated_text = raw_text[:12000]

        messages = [
            {"role": "system", "content": "You are a professional career advisor and LinkedIn expert. You always respond with valid JSON."},
            {"role": "user", "content": LINKEDIN_PROMPT.format(profile_text=truncated_text)}
        ]

        response_data = await invoke_groq_llm(messages, temperature=0.1)  # Lower temperature for better JSON
        if not response_data:
            return None

        content_str = response_data["choices"][0]["message"]["content"]
        
        # Log the first 100 chars of content for debugging
        logger.info(f"LLM Response starts with: {content_str[:100]}...")

        # Extract JSON from potential markdown markers or raw text
        # Try to find the first '{' and last '}'
        start_idx = content_str.find("{")
        end_idx = content_str.rfind("}")
        
        if start_idx != -1 and end_idx != -1:
            json_str = content_str[start_idx : end_idx + 1]
            try:
                content_json = json.loads(json_str)
                return LinkedInAnalysisResponse(**content_json)
            except json.JSONDecodeError as je:
                logger.error(f"JSON Decode Error: {str(je)}. Raw captured: {json_str[:200]}")
                return None
            except Exception as pe:
                logger.error(f"Pydantic/Model Error: {str(pe)}")
                return None
        
        logger.error(f"No JSON block found in LLM response: {content_str[:500]}")
        return None

    except Exception:
        logger.exception("Unexpected error in analyze_linkedin_profile")
        return None
