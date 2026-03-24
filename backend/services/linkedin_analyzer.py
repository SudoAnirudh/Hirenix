import httpx
from typing import Optional
from config import settings
from models.linkedin import LinkedInAnalysisResponse, LinkedInMetrics

PROXYCURL_API = "https://nubela.co/proxycurl/api/v2/linkedin"

async def analyze_linkedin_profile(linkedin_url: str) -> LinkedInAnalysisResponse:
    if not settings.proxycurl_api_key:
        raise ValueError("Proxycurl API key is not configured in environment variables.")

    headers = {"Authorization": f"Bearer {settings.proxycurl_api_key}"}
    params = {
        "url": linkedin_url,
        "fallback_to_cache": "on-error",
        "use_cache": "if-present",
        "skills": "include",
    }

    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.get(PROXYCURL_API, params=params, headers=headers)
        r.raise_for_status()
        data = r.json()

    # Calculate Metrics
    # Completeness
    has_pic = bool(data.get("profile_pic_url"))
    has_headline = bool(data.get("headline"))
    has_summary = bool(data.get("summary"))
    
    completeness = (has_pic * 20) + (has_headline * 20) + (has_summary * 20)
    if data.get("experiences"): 
        completeness += 20
    if data.get("education"): 
        completeness += 20
    
    # Experience
    experiences = data.get("experiences") or []
    exp_score = min(len(experiences) * 20, 100)

    # Education
    educations = data.get("education") or []
    edu_score = min(len(educations) * 33 + 34, 100) if educations else 0

    # Network Presence
    network_score = 50
    if has_pic and has_headline:
        network_score += 25
    skills = data.get("skills") or []
    if len(skills) > 5:
        network_score += 25

    metrics = LinkedInMetrics(
        completeness_score=completeness,
        experience_score=exp_score,
        network_presence_score=network_score,
        education_score=edu_score
    )

    # Weights: completeness: 40%, experience: 30%, network: 20%, education: 10%
    lpi = (completeness * 0.4) + (exp_score * 0.3) + (network_score * 0.2) + (edu_score * 0.1)

    strengths = []
    recs = []

    if completeness == 100:
        strengths.append("Profile is fully complete and visually engaging.")
    else:
        if not has_summary: 
            recs.append("Add a compelling summary/about section.")
        if not has_pic: 
            recs.append("Upload a professional profile picture.")
        if not has_headline: 
            recs.append("Add a descriptive headline.")

    if len(experiences) >= 3:
        strengths.append(f"Strong track record with {len(experiences)} roles listed.")
    elif len(experiences) == 0:
        recs.append("Add your work experience to highlight your achievements.")

    if len(skills) > 10:
        strengths.append(f"Demonstrated diverse skill set with {len(skills)} skills listed.")
    else:
        recs.append("Add more relevant skills to increase discoverability.")
        
    if not strengths:
        strengths.append("Active professional presence.")

    return LinkedInAnalysisResponse(
        analysis_id="",  # filled by router
        linkedin_url=linkedin_url,
        lpi_score=round(lpi, 1),
        metrics=metrics,
        strengths=strengths,
        recommendations=recs,
        raw_data=data
    )
