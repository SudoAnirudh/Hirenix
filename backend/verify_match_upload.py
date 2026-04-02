import jwt
import time
import requests
from io import BytesIO
from reportlab.pdfgen import canvas
import base64

# Configuration
JWT_SECRET = "WkoK70GNHb449fq7Mbg9qMYRmNXdZUUug77/qwQZqgnWNQEtEHCPXE12cTHjnWP1uZ6JjFApkyLIiFbB3my6WQ=="
API_URL = "http://127.0.0.1:8000"

def generate_token(user_id="test-user-123", email="test@example.com"):
    payload = {
        "sub": user_id,
        "email": email,
        "aud": "authenticated",
        "iss": "https://hirenix.supabase.co/auth/v1", # Should match settings.supabase_url/auth/v1
        "iat": int(time.time()),
        "exp": int(time.time()) + 3600,
        "user_metadata": {"plan": "elite"}
    }
    # Dependencies.py decodes base64 secret if possible
    try:
        secret = base64.b64decode(JWT_SECRET)
    except:
        secret = JWT_SECRET
        
    return jwt.encode(payload, secret, algorithm="HS256")

def create_dummy_pdf(text):
    buffer = BytesIO()
    p = canvas.Canvas(buffer)
    p.drawString(100, 750, text)
    p.showPage()
    p.save()
    return buffer.getvalue()

def verify_endpoint():
    token = generate_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # Files
    resume_pdf = create_dummy_pdf("John Doe\nExperience: Python, FastAPI, React, Node.js")
    jd_pdf = create_dummy_pdf("We need a Senior Software Engineer skilled in Python and React.")
    
    # 1. Test with JD Text
    print("--- Test 1: Uploading Resume + JD Text ---")
    files = {'resume_file': ('resume.pdf', resume_pdf, 'application/pdf')}
    data = {'jd_text': 'Python, FastAPI, React Engineer', 'target_role': 'Software Engineer'}
    
    try:
        resp = requests.post(f"{API_URL}/jobs/match-job-upload", headers=headers, files=files, data=data)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            print("Success! Match Score:", resp.json().get("match_score"))
        else:
            print("Error:", resp.text)
    except Exception as e:
        print("Request failed:", e)

    # 2. Test with JD File
    print("\n--- Test 2: Uploading Resume + JD File ---")
    files = {
        'resume_file': ('resume.pdf', resume_pdf, 'application/pdf'),
        'jd_file': ('job_desc.pdf', jd_pdf, 'application/pdf')
    }
    data = {'target_role': 'Frontend Developer'}
    
    try:
        resp = requests.post(f"{API_URL}/jobs/match-job-upload", headers=headers, files=files, data=data)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            print("Success! Match Score:", resp.json().get("match_score"))
        else:
            print("Error:", resp.text)
    except Exception as e:
        print("Request failed:", e)

if __name__ == "__main__":
    verify_endpoint()
