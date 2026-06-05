import httpx
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


def _clean_tweet_text(text: str) -> str:
    if not text:
        return ""
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


async def fetch_tweets_via_apify(
    handles: List[str], max_items: int = 15
) -> Optional[List[Dict[str, Any]]]:
    """
    Triggers the apidojo/twitter-scraper-lite actor via Apify API,
    polls the run status until completion, and returns the dataset items.
    """
    token = settings.apify_token
    if not token:
        logger.error(
            "APIFY_TOKEN environment variable is not set. Cannot run Apify Twitter Scraper."
        )
        return None

    # Replace slash with tilde for Apify Acts endpoint: apidojo~twitter-scraper-lite
    actor_id = "apidojo~twitter-scraper-lite"
    run_url = f"https://api.apify.com/v2/acts/{actor_id}/runs?token={token}"

    payload = {
        "twitterHandles": handles,
        "maxItems": max_items,
        "sort": "Latest",
    }

    logger.info(f"Triggering Apify Actor {actor_id} for handles: {handles}")
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            # 1. Trigger the run
            response = await client.post(run_url, json=payload)
            if response.status_code != 201:
                logger.error(
                    f"Failed to start Apify actor run. Status: {response.status_code}. Response: {response.text}"
                )
                return None

            run_data = response.json().get("data", {})
            run_id = run_data.get("id")
            default_dataset_id = run_data.get("defaultDatasetId")

            if not run_id or not default_dataset_id:
                logger.error(
                    f"Apify response missing run_id or default_dataset_id: {run_data}"
                )
                return None

            # 2. Poll the status of the run (maximum 3 minutes wait time)
            status_url = (
                f"https://api.apify.com/v2/actor-runs/{run_id}?token={token}"
            )
            max_wait_seconds = 180
            poll_interval_seconds = 5
            elapsed_seconds = 0

            logger.info(f"Apify run started. Run ID: {run_id}. Polling...")
            while elapsed_seconds < max_wait_seconds:
                await asyncio.sleep(poll_interval_seconds)
                elapsed_seconds += poll_interval_seconds

                status_res = await client.get(status_url)
                if status_res.status_code == 200:
                    run_info = status_res.json().get("data", {})
                    status = run_info.get("status")
                    logger.info(
                        f"Apify run status: {status} (elapsed: {elapsed_seconds}s)"
                    )

                    if status == "SUCCEEDED":
                        break
                    elif status in ["FAILED", "ABORTED", "TIMED-OUT"]:
                        logger.error(
                            f"Apify run finished with non-success status: {status}"
                        )
                        return None
                else:
                    logger.warning(
                        f"Error checking Apify run status. Status code: {status_res.status_code}"
                    )
            else:
                logger.error("Apify run timed out waiting for completion.")
                # Attempt to abort the run to avoid cost overrun
                try:
                    await client.post(
                        f"https://api.apify.com/v2/actor-runs/{run_id}/abort?token={token}"
                    )
                except Exception:
                    pass
                return None

            # 3. Retrieve results from dataset
            items_url = f"https://api.apify.com/v2/datasets/{default_dataset_id}/items?token={token}"
            items_res = await client.get(items_url)
            if items_res.status_code == 200:
                tweets = items_res.json()
                if isinstance(tweets, list):
                    logger.info(
                        f"Successfully retrieved {len(tweets)} tweets from Apify dataset."
                    )
                    return tweets
                else:
                    logger.error(
                        f"Unexpected data format returned from dataset: {type(tweets)}"
                    )
                    return None
            else:
                logger.error(
                    f"Failed to fetch dataset items. Status: {items_res.status_code}. Response: {items_res.text}"
                )
                return None

        except Exception as e:
            logger.error(f"Exception during Apify run: {e}")
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
                response_json = _clean_llm_json(
                    res["choices"][0]["message"]["content"]
                )
    except Exception as e:
        logger.warning(f"NVIDIA parsing failed: {e}")

    if not response_json:
        try:
            if settings.groq_api_key:
                res = await invoke_groq_llm(messages, temperature=0.2)
                if res and res.get("choices"):
                    response_json = _clean_llm_json(
                        res["choices"][0]["message"]["content"]
                    )
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

    if not settings.apify_token:
        logger.error(
            "APIFY_TOKEN environment variable is not set. Skipping Twitter jobs sync."
        )
        return 0

    tweets = await fetch_tweets_via_apify(handles, max_items=15)
    if not tweets:
        logger.warning("No tweets retrieved from Apify.")
        return 0

    # Check for Apify Free tier demo mode restriction
    if all(t.get("demo") for t in tweets):
        logger.warning(
            "Apify returned only demo/placeholder items. This typically means your Apify account is on the Free tier and subject to limitations for this actor. To scrape real data, please upgrade your Apify account to a paid plan."
        )
        return 0

    db = get_supabase_admin()
    new_jobs_count = 0

    for tweet in tweets:
        try:
            tweet_id = tweet.get("id")
            if not tweet_id:
                continue

            # Standardized tweet content field in apidojo/twitter-scraper-lite
            tweet_text = _clean_tweet_text(
                tweet.get("text") or tweet.get("fullText") or ""
            )
            if not tweet_text:
                continue

            existing = (
                db.table("job_posts")
                .select("id")
                .eq("tweet_id", str(tweet_id))
                .execute()
            )
            if existing.data:
                continue

            job_data = await parse_tweet_with_llm(tweet_text)
            if not job_data:
                continue

            posted_at = tweet.get("createdAt")
            if not posted_at:
                posted_at = datetime.utcnow().isoformat()

            db.table("job_posts").insert(
                {
                    "title": job_data["title"],
                    "company": job_data["company"],
                    "location": job_data["location"],
                    "apply_url": job_data.get("apply_url"),
                    "description": job_data.get("description")
                    or tweet_text[:500],
                    "requirements": job_data.get("requirements", []),
                    "tweet_id": str(tweet_id),
                    "posted_at": posted_at,
                }
            ).execute()

            new_jobs_count += 1
            await asyncio.sleep(1.0)
        except Exception as e:
            logger.error(f"Error processing Apify tweet: {e}")

    return new_jobs_count
