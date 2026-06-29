## 2024-05-27 - [Timing Attack Vulnerability in Token Comparison]
**Vulnerability:** Found a timing attack vulnerability in `backend/routers/jobs_board.py` where a security-sensitive string (authentication token) was compared using the standard equality operator (`!=`).
**Learning:** Standard equality operators fail fast, which means the time it takes to compare two strings depends on how many characters match. This can allow an attacker to guess a secret token character by character based on the response time.
**Prevention:** Always use `secrets.compare_digest` for comparing security-sensitive strings, API keys, or tokens in Python. This function performs a constant-time comparison, mitigating timing attacks.
## 2025-01-08 - PostgREST Filter Injection Prevention
**Vulnerability:** User input was being directly interpolated into Supabase PostgREST `.or_()` clauses.
**Learning:** Commas and parentheses in strings are interpreted as syntactic boundaries in PostgREST filters, leading to injection vulnerabilities.
**Prevention:** Added a `sanitize_postgrest_filter` utility function to strip out commas, parentheses, and double-quotes from user input before usage in these clauses.
## 2025-01-09 - Information Disclosure via Exception Leakage
**Vulnerability:** Raw exception messages (`str(e)`) were being exposed to the client in HTTP 500 responses and unhandled OS file exceptions were not caught, risking information disclosure.
**Learning:** Returning `str(e)` directly in an `HTTPException` can leak sensitive internal details, paths, or logic if an unhandled error occurs.
**Prevention:** Always log the detailed error internally using a logger and return a sanitized, generic error message in the API response. Catch broad `Exception` in OS-level file operations and log them securely.
