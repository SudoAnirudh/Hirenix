import httpx
import feedparser
import re
import json
import logging
import asyncio
from datetime import datetime
from typing import List, Dict, Any, Optional

from config import settings
from dependencies import get_supabase_admin
from services.nvidia_client import invoke_nvidia_llm
from services.groq_client import invoke_groq_llm

logger = logging.getLogger("hirenix.twitter_job_aggregator")

NITTER_INSTANCES = [
    "https://nitter.privacydev.net",
    "https://nitter.moomoo.me",
    "https://nitter.cz",
    "https://nitter.space",
    "https://nitter.soopy.moe",
    "https://nitter.perennialte.ch",
    "https://nitter.salast.us",
    "https://nitter.catsarch.com",
    "https://nitter.tiekoetter.com",
    "https://nitter.d420.de",
]

def _clean_tweet_text(text: str) -> str:
    if not text: return ""
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()

def _extract_tweet_id(guid: str) -> str:
    match = re.search(r"status/(\d+)", guid)
    return match.group(1) if match else str(hash(guid))

async def _fetch_rss_feed(url: str) -> Optional[str]:
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/rss+xml, application/xml, text/xml, */*"
    }
    async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
        response = await client.get(url, headers=headers)
        return response.text if response.status_code == 200 else None

async def fetch_tweets_feed(handle: str) -> Optional[List[Dict[str, Any]]]:
    if settings.twitter_rss_override:
        feed_xml = await _fetch_rss_feed(settings.twitter_rss_override)
        if feed_xml:
            feed = feedparser.parse(feed_xml)
            if feed.entries: return feed.entries

    for instance in NITTER_INSTANCES:
        url = f"{instance}/{handle}/rss"
        try:
            feed_xml = await _fetch_rss_feed(url)
            if not feed_xml or "xml" not in feed_xml: continue
            feed = feedparser.parse(feed_xml)
            if feed.entries: return feed.entries
        except Exception as e:
            logger.error(f"Error fetching from Nitter instance {instance}: {e}")
    return None

async def parse_tweet_with_llm(tweet_text: str) -> Optional[Dict[str, Any]]:
    prompt = f"""
Analyze the following tweet text about a job opening and extract details into a structured JSON format.
Tweet text: \"\"\"{tweet_text}\"\"\"

Output MUST be a valid JSON object matching this schema:
{{
  "title": "Job Title (e.g. Frontend Engineer, SDE Intern, etc.)",
  "company": "Company Name (use 'Unknown' if not mentioned)",
  "location": "Location (City/State in India, or 'Remote')",
  "apply_url": "Direct application URL found in text, or null if none",
  "description": "A clean 1-2 sentence overview of the role, requirements, or package",
  "requirements": ["Skill 1", "Skill 2"] (list of key skills/qualifications as short tags)
}}
ONLY return the JSON object. Do not include conversational text or markdown blocks.
"""
    messages = [{"role": "user", "content": prompt}]
    response_json = None

    try:
        if settings.nvidia_api_key:
            res = await invoke_nvidia_llm(messages, temperature=0.2)
            if res and res.get("choices"):
                response_json = _clean_llm_json(res["choices"][0]["message"]["content"])
    except Exception as e:
        logger.warning(f"NVIDIA parsing failed: {e}")

    if not response_json:
        try:
            if settings.groq_api_key:
                res = await invoke_groq_llm(messages, temperature=0.2)
                if res and res.get("choices"):
                    response_json = _clean_llm_json(res["choices"][0]["message"]["content"])
        except Exception as e:
            logger.error(f"Groq parsing failed: {e}")
    return response_json

def _clean_llm_json(content: str) -> Optional[Dict[str, Any]]:
    try:
        cleaned = content.strip()
        if cleaned.startswith("```"):
            cleaned = re.sub(r"^```(?:json)?\n", "", cleaned)
            cleaned = re.sub(r"\n```$", "", cleaned)
        data = json.loads(cleaned.strip())
        if isinstance(data, dict) and "title" in data and "company" in data:
            return data
    except Exception as e:
        logger.warning(f"Failed to parse LLM JSON: {e}")
    return None

async def sync_twitter_jobs() -> int:
    handles = settings.twitter_handles_list
    if not handles:
        logger.warning("No Twitter handles configured for scraping.")
        return 0

    all_entries: List[Dict[str, Any]] = []
    for handle in handles:
        entries = await fetch_tweets_feed(handle)
        if entries:
            all_entries.extend(entries)
        else:
            logger.warning(f"No RSS feed entries found for Twitter handle: {handle}")

    if not all_entries:
        return 0

    db = get_supabase_admin()
    new_jobs_count = 0

    for entry in all_entries:
        try:
            guid = getattr(entry, "id", getattr(entry, "link", ""))
            tweet_id = _extract_tweet_id(guid)
            tweet_text = _clean_tweet_text(getattr(entry, "description", getattr(entry, "title", "")))
            if not tweet_text: continue

            existing = db.table("job_posts").select("id").eq("tweet_id", tweet_id).execute()
            if existing.data: continue

            job_data = await parse_tweet_with_llm(tweet_text)
            if not job_data: continue

            posted_at = datetime.utcnow().isoformat()
            if hasattr(entry, "published_parsed") and entry.published_parsed:
                try:
                    posted_at = datetime(*entry.published_parsed[:6]).isoformat()
                except Exception: pass

            db.table("job_posts").insert({
                "title": job_data["title"],
                "company": job_data["company"],
                "location": job_data["location"],
                "apply_url": job_data.get("apply_url"),
                "description": job_data.get("description") or tweet_text[:500],
                "requirements": job_data.get("requirements", []),
                "tweet_id": tweet_id,
                "posted_at": posted_at
            }).execute()

            new_jobs_count += 1
            await asyncio.sleep(1.0)
        except Exception as e:
            logger.error(f"Error processing RSS entry: {e}")
    return new_jobs_count
