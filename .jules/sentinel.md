## 2024-05-27 - [Timing Attack Vulnerability in Token Comparison]
**Vulnerability:** Found a timing attack vulnerability in `backend/routers/jobs_board.py` where a security-sensitive string (authentication token) was compared using the standard equality operator (`!=`).
**Learning:** Standard equality operators fail fast, which means the time it takes to compare two strings depends on how many characters match. This can allow an attacker to guess a secret token character by character based on the response time.
**Prevention:** Always use `secrets.compare_digest` for comparing security-sensitive strings, API keys, or tokens in Python. This function performs a constant-time comparison, mitigating timing attacks.
## 2025-01-08 - PostgREST Filter Injection Prevention
**Vulnerability:** User input was being directly interpolated into Supabase PostgREST `.or_()` clauses.
**Learning:** Commas and parentheses in strings are interpreted as syntactic boundaries in PostgREST filters, leading to injection vulnerabilities.
**Prevention:** Added a `sanitize_postgrest_filter` utility function to strip out commas, parentheses, and double-quotes from user input before usage in these clauses.
## 2025-01-21 - Exception Detail Leakage in FastAPI Routes
**Vulnerability:** Raw exception strings (`str(e)`) were being exposed to clients in 500 internal server error responses via FastAPI `HTTPException`.
**Learning:** Exposing detailed exceptions can leak sensitive internal information, stack traces, paths, or database configurations, which can aid an attacker in reconnaissance.
**Prevention:** Catch generic exceptions and log the detailed error internally. Return a sanitized, generic error message (e.g., "An error occurred during the operation") in the HTTP response to clients.
