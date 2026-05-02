import os
import json
import requests
from typing import List, Dict, Any, Optional
from concurrent.futures import ThreadPoolExecutor

# Configuration
REPO_OWNER = "kamranahmedse"
REPO_NAME = "developer-roadmap"
BASE_PATH = "src/data/roadmaps"
GITHUB_API_URL = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/contents"
RAW_URL_BASE = f"https://raw.githubusercontent.com/{REPO_OWNER}/{REPO_NAME}/master/{BASE_PATH}"

# For simplicity, we use the master branch
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

def get_headers():
    headers = {"Accept": "application/vnd.github+json"}
    if GITHUB_TOKEN:
        headers["Authorization"] = f"token {GITHUB_TOKEN}"
    return headers

def fetch_json(url: str) -> Optional[Any]:
    try:
        response = requests.get(url, headers=get_headers(), timeout=10)
        if response.status_code == 200:
            return response.json()
        print(f"Failed to fetch {url}: {response.status_code}")
    except Exception as e:
        print(f"Error fetching {url}: {e}")
    return None

def fetch_raw_text(url: str) -> Optional[str]:
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            return response.text
        print(f"Failed to fetch raw text {url}: {response.status_code}")
    except Exception as e:
        print(f"Error fetching raw text {url}: {e}")
    return None

def download_content(cf, content_map):
    if cf['name'].endswith('.md'):
        name_parts = cf['name'].replace('.md', '').split('@')
        if len(name_parts) > 1:
            node_id = name_parts[1]
            content = fetch_raw_text(cf['download_url'])
            if content:
                content_map[node_id] = content

def process_roadmap(job_name: str, limit_content: int = None):
    print(f"Processing roadmap: {job_name}...")
    
    # 1. Fetch the main roadmap.json
    json_url = f"{RAW_URL_BASE}/{job_name}/{job_name}.json"
    roadmap_data = fetch_json(json_url)
    if not roadmap_data:
        dir_url = f"{GITHUB_API_URL}/{BASE_PATH}/{job_name}"
        files = fetch_json(dir_url)
        if files:
            for f in files:
                if f['name'].endswith('.json') and not f['name'].endswith('-beginner.json') and f['name'] != 'migration-mapping.json':
                    roadmap_data = fetch_json(f['download_url'])
                    break
    
    if not roadmap_data:
        print(f"Could not find roadmap JSON for {job_name}")
        return

    # 2. Fetch all content files from the 'content' directory
    content_dir_url = f"{GITHUB_API_URL}/{BASE_PATH}/{job_name}/content"
    content_files = fetch_json(content_dir_url)
    content_map = {}
    
    if content_files and isinstance(content_files, list):
        if limit_content:
            content_files = content_files[:limit_content]
            
        print(f"Fetching {len(content_files)} content files...")
        with ThreadPoolExecutor(max_workers=10) as executor:
            for cf in content_files:
                executor.submit(download_content, cf, content_map)

    # 3. Save the results
    output_dir = os.path.join("backend", "data", "roadmaps", job_name)
    os.makedirs(output_dir, exist_ok=True)
    
    with open(os.path.join(output_dir, "roadmap.json"), "w") as f:
        json.dump(roadmap_data, f, indent=2)
        
    with open(os.path.join(output_dir, "content.json"), "w") as f:
        json.dump(content_map, f, indent=2)
        
    print(f"Successfully scraped {job_name}! Nodes with content: {len(content_map)}")

if __name__ == "__main__":
    import sys
    # Default roles to scrape
    roles = ["frontend", "backend", "devops"]
    if len(sys.argv) > 1:
        roles = [r for r in sys.argv[1:] if not r.startswith("--")]
    
    limit = None
    if "--test" in sys.argv:
        limit = 5
        
    for role in roles:
        process_roadmap(role, limit_content=limit)
