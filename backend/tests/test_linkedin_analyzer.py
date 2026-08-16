import unittest
from unittest.mock import patch, AsyncMock
from services.linkedin_analyzer import analyze_linkedin_profile
from models.linkedin import LinkedInAnalysisResponse


class TestLinkedInAnalyzer(unittest.IsolatedAsyncioTestCase):

    @patch("services.linkedin_analyzer.invoke_groq_llm")
    @patch("services.linkedin_analyzer.extract_pdf_text")
    async def test_analyze_linkedin_profile_success(self, mock_extract, mock_groq):
        mock_extract.return_value = "Mock LinkedIn PDF Profile Text"
        
        mock_groq.return_value = {
            "choices": [{
                "message": {
                    "content": """
                    {
                        "overall_score": 88,
                        "headline": {
                            "score": 92,
                            "current": "Software Engineer at Google",
                            "improved": "Senior Full-Stack Architect | Next.js & Python Expert",
                            "tips": ["Add tech keywords"],
                            "missing_keywords": ["Scalability"]
                        },
                        "headline_variations": {
                            "seo_specialist": "Senior Full-Stack Architect | Next.js, Python, AWS",
                            "impact_leader": "Senior Full-Stack Architect | Scaling API Performance by 40%",
                            "tech_evangelist": "Senior Full-Stack Architect | Building high-throughput SaaS"
                        },
                        "about": {
                            "score": 80,
                            "current": "Passionate developer.",
                            "improved": "Results-driven Software Architect with 10+ years experience...",
                            "tips": ["Add CTA"],
                            "missing_keywords": ["Cloud"]
                        },
                        "experience": {
                            "score": 85,
                            "current": "Worked on features.",
                            "tips": ["Quantify impact"],
                            "missing_keywords": ["Agile"]
                        },
                        "skills": {
                            "score": 90,
                            "current": "JS, Python",
                            "tips": ["Add Docker"],
                            "missing_keywords": ["GraphQL"]
                        },
                        "completeness_score": 95,
                        "general_tips": ["Complete certification"],
                        "suggested_roles": ["Tech Lead"],
                        "keyword_density": [
                            {
                                "keyword": "System Design",
                                "current_count": 0,
                                "recommended_count": 3,
                                "priority": "High"
                            }
                        ],
                        "xyz_bullet_audits": [
                            {
                                "weak_bullet": "Fixed bugs.",
                                "xyz_rewritten": "Resolved 50+ bugs, improving platform uptime by 12%.",
                                "impact_metric_tip": "Include performance numbers."
                            }
                        ],
                        "recruiter_checklist": [
                            {
                                "label": "Certifications Section",
                                "completed": false,
                                "tip": "Add AWS certification."
                            }
                        ]
                    }
                    """
                }
            }]
        }

        res = await analyze_linkedin_profile(b"dummy pdf bytes")
        self.assertIsNotNone(res)
        self.assertEqual(res.overall_score, 88)
        self.assertEqual(res.headline.score, 92)
        
        # Verify new fields exist and parse correctly
        self.assertIsNotNone(res.headline_variations)
        self.assertEqual(res.headline_variations.seo_specialist, "Senior Full-Stack Architect | Next.js, Python, AWS")
        self.assertEqual(len(res.keyword_density), 1)
        self.assertEqual(res.keyword_density[0].keyword, "System Design")
        self.assertEqual(res.keyword_density[0].priority, "High")
        self.assertEqual(len(res.xyz_bullet_audits), 1)
        self.assertEqual(res.xyz_bullet_audits[0].weak_bullet, "Fixed bugs.")
        self.assertEqual(len(res.recruiter_checklist), 1)
        self.assertEqual(res.recruiter_checklist[0].completed, False)

    @patch("services.linkedin_analyzer.invoke_groq_llm")
    @patch("services.linkedin_analyzer.extract_pdf_text")
    async def test_analyze_linkedin_profile_malformed_json(self, mock_extract, mock_groq):
        mock_extract.return_value = "Mock LinkedIn PDF Profile Text"
        mock_groq.return_value = {
            "choices": [{
                "message": {
                    "content": "This is not valid json content"
                }
            }]
        }

        res = await analyze_linkedin_profile(b"dummy pdf bytes")
        self.assertIsNone(res)


if __name__ == "__main__":
    unittest.main()
