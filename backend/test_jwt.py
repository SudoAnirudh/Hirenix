import jwt
from config import settings

token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVheXpkamh0bXhzZ3R4ZnlyZ3V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MDc5NTksImV4cCI6MjA4NzA4Mzk1OX0.2sy8IvHWXpItEiq4BhVb89G1ON3RtgDo_2ZoJfg1BsY"

print("Header:", jwt.get_unverified_header(token))

try:
    decoded = jwt.decode(
        token,
        settings.jwt_secret,
        algorithms=[settings.jwt_algorithm, "HS256"],
        options={"verify_exp": False, "verify_aud": False}
    )
    print("Decoded!")
except Exception as e:
    print("Error:", type(e).__name__, "-", str(e))
