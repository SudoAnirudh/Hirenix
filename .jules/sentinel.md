## 2024-05-27 - [Timing Attack Vulnerability in Token Comparison]
**Vulnerability:** Found a timing attack vulnerability in `backend/routers/jobs_board.py` where a security-sensitive string (authentication token) was compared using the standard equality operator (`!=`).
**Learning:** Standard equality operators fail fast, which means the time it takes to compare two strings depends on how many characters match. This can allow an attacker to guess a secret token character by character based on the response time.
**Prevention:** Always use `secrets.compare_digest` for comparing security-sensitive strings, API keys, or tokens in Python. This function performs a constant-time comparison, mitigating timing attacks.
## 2025-01-08 - PostgREST Filter Injection Prevention
**Vulnerability:** User input was being directly interpolated into Supabase PostgREST `.or_()` clauses.
**Learning:** Commas and parentheses in strings are interpreted as syntactic boundaries in PostgREST filters, leading to injection vulnerabilities.
**Prevention:** Added a `sanitize_postgrest_filter` utility function to strip out commas, parentheses, and double-quotes from user input before usage in these clauses.
## 2025-01-08 - [Fail Securely in OS File Operations]
**Vulnerability:** OS-level file operations (like `os.remove`) during cleanup were only catching `FileNotFoundError`. Other exceptions could propagate and leak internal paths or stack traces in 500 responses.
**Learning:** System operations can fail for many reasons (e.g., permissions, locks). Unhandled exceptions in cleanup routines break the "fail securely" principle and risk information disclosure.
**Prevention:** Always catch broad exceptions like `Exception` in cleanup/teardown routines, log them securely, and prevent them from propagating to the client.
## 2025-01-08 - [Error Message Information Leakage]
**Vulnerability:** Raw exception strings (`str(e)`) were being returned directly to the user in HTTP 500 error responses from FastAPI endpoints (`backend/routers/interview.py`, `backend/routers/jobs_board.py`).
**Learning:** Returning unhandled exception details directly in HTTP responses can inadvertently leak sensitive internal system details, stack traces, database schema information, or third-party API configurations to potential attackers, breaking the "fail securely" principle.
**Prevention:** Always log the full exception detail internally using the application logger (e.g., `logger.error(f"Error: {e}")`) and return a sanitized, generic error message (e.g., "An error occurred.") to the client via `HTTPException`.
## 2024-05-27 - Information Disclosure via Exception Strings
**Vulnerability:** The API routes in `backend/routers/agent.py` and `backend/routers/linkedin.py` were passing raw exception strings directly into `HTTPException(detail=str(e))` responses, leaking internal system implementation details or full stack traces to the end client on HTTP 500 errors.
**Learning:** This existed because developers used `str(e)` as a quick way to bubble up errors during development without realizing that those raw strings leak internal backend structure/database errors when presented to end users.
**Prevention:** For FastAPI applications, never return `str(e)` in an `HTTPException`. Instead, log the raw error internally (e.g. `logger.error(f"... {e}")`) and return a generic, static user-friendly string (e.g. "An error occurred. Please try again.") in the HTTP response.
