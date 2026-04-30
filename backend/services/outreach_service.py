import json
import logging
import asyncio
from typing import Optional, Any
from services.nvidia_client import invoke_nvidia_llm
from models.analysis import OutreachDraftsResponse

logger = logging.getLogger("hirenix.services.outreach")

async def generate_outreach_drafts(
    user_id: str,
    match_id: str,
    db: Any,
    tone: str = "Formal"
) -> Optional[OutreachDraftsResponse]:
    """
    Generates personalized LinkedIn and Email outreach drafts using Hirenix AI.
    """
    try:
        # What: Database query optimizations by wrapping synchronous calls in asyncio.to_thread
        # Why: Supabase-py is synchronous and blocks the event loop.
        # Impact: Improves concurrency and unblocks the main event loop.
        match_query = await asyncio.to_thread(lambda: db.table("job_matches").select("*").eq("id", match_id).eq("user_id", user_id).single().execute())

        if not match_query.data:
            logger.error(f"Job match {match_id} not found for user {user_id}")
            return None
        
        li_query = await asyncio.to_thread(lambda: db.table("linkedin_analyses").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(1).execute())

        # Note: resume_query is kept lazy and fetched only as a fallback.
        resume_query = None

        match_data = match_query.data
        jd_text = match_data.get("jd_text", "")
        target_role = match_data.get("target_role", "Professional")
        match_score = match_data.get("match_score", 0)
        skill_gap = match_data.get("skill_gap", {})
        bridge_advice = match_data.get("metadata", {}).get("bridge_advice", [])

        # 2. Extract LinkedIn Profile Summary or Resume Fallback (for personalization)
        profile_context = ""
        if li_query.data:
            li_data = li_query.data[0]
            # Use raw_data as a fallback for profile context if columns are missing
            raw_data = li_data.get("raw_data", {})
            profile_summary = li_data.get("profile_summary") or raw_data.get("about", {}).get("improved", "")
            strengths = li_data.get("strengths") or []
            
            profile_context = f"User Profile Summary: {profile_summary}\nKey Strengths: {', '.join(strengths)}"
        else:
            # Fallback to resume if LinkedIn not available
            resume_query = await asyncio.to_thread(lambda: db.table("resumes").select("raw_text").eq("user_id", user_id).order("created_at", desc=True).limit(1).execute())
            if resume_query and resume_query.data:
                profile_context = f"Candidate Background: {resume_query.data[0].get('raw_text', '')[:1000]}"

        # 3. Construct Prompt for Hirenix AI
        prompt = f"""
        Generate two personalized outreach drafts for a {target_role} position.
        
        CONTEXT:
        Role: {target_role}
        JD Match: {match_score}%
        JD Core: {jd_text[:500]}
        
        CANDIDATE:
        {profile_context[:700]}
        
        MATCH ANALYTICS:
        Skills: {', '.join(skill_gap.get('matched_skills', []))}
        Missing: {', '.join(skill_gap.get('mandatory_missing', []))}
        Strategy: {'. '.join(bridge_advice[:2])}
        
        TONE: {tone}
        
        REQUIRED OUTPUT:
        1. LinkedIn (Max 280 chars): High-impact, non-generic, professional.
        2. Cold Email: Include Subject, Salutation, 1-2 strengths, and a growth-mindset CTA.
        
        FORMAT:
        Return ONLY valid JSON: {{"linkedin_request": "...", "cold_email": "..."}}
        """

        messages = [
            {"role": "system", "content": "You are a professional outreach generator. Return only JSON."},
            {"role": "user", "content": prompt}
        ]

        # 4. Invoke LLM
        response = await invoke_nvidia_llm(messages, temperature=0.7)
        
        if not response:
            logger.error("Failed to get response from Hirenix AI")
            return None

        content = response['choices'][0]['message']['content']
        # Strip potential markdown code blocks
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()

        drafts = json.loads(content)

        # 5. Extract Company Name for the response model (best effort)
        company_name = "[Company Name]"
        # Simple heuristic to find company name in JD text
        if "at " in jd_text[:200]:
             # e.g. "Software Engineer at Google"
             idx = jd_text.lower().find("at ")
             parts = jd_text[idx+3:].split()
             if parts:
                 company_name = parts[0].strip(",. ")

        def format_draft(draft_content):
            if isinstance(draft_content, dict):
                # Flatten dict to string (common for email with subject/body)
                subject = draft_content.get("subject", draft_content.get("Subject", ""))
                body = draft_content.get("body", draft_content.get("Body", draft_content.get("content", "")))
                if not body and not subject:
                    # If it's a dict but we don't recognize the keys, just dump it
                    return json.dumps(draft_content, indent=2)
                if subject:
                    return f"Subject: {subject}\n\n{body}"
                return body
            return str(draft_content)

        return OutreachDraftsResponse(
            match_id=match_id,
            linkedin_request=format_draft(drafts.get("linkedin_request", "")),
            cold_email=format_draft(drafts.get("cold_email", "")),
            company_name=company_name
        )

    except Exception as e:
        logger.error(f"Error generating outreach drafts: {str(e)}")
        return None
