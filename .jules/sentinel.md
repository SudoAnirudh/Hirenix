## 2024-05-27 - [Timing Attack Vulnerability in Token Comparison]
**Vulnerability:** Found a timing attack vulnerability in `backend/routers/jobs_board.py` where a security-sensitive string (authentication token) was compared using the standard equality operator (`!=`).
**Learning:** Standard equality operators fail fast, which means the time it takes to compare two strings depends on how many characters match. This can allow an attacker to guess a secret token character by character based on the response time.
**Prevention:** Always use `secrets.compare_digest` for comparing security-sensitive strings, API keys, or tokens in Python. This function performs a constant-time comparison, mitigating timing attacks.
## 2025-01-08 - PostgREST Filter Injection Prevention
**Vulnerability:** User input was being directly interpolated into Supabase PostgREST `.or_()` clauses.
**Learning:** Commas and parentheses in strings are interpreted as syntactic boundaries in PostgREST filters, leading to injection vulnerabilities.
**Prevention:** Added a `sanitize_postgrest_filter` utility function to strip out commas, parentheses, and double-quotes from user input before usage in these clauses.
## 2025-02-09 - Information Disclosure in File Deletion
**Vulnerability:** A temporary file cleanup function caught `FileNotFoundError` but allowed other OS-level exceptions (like `PermissionError`) to propagate, potentially leaking sensitive internal paths or stack traces in unhandled 500 server errors.
**Learning:** File operations are fragile and can fail for many reasons beyond the file missing. Failing to catch and suppress unexpected errors during cleanup violates the "fail securely" principle and creates information disclosure risks.
**Prevention:** Always use broad exception handling (`except Exception as e:`) for non-critical cleanup operations to log errors securely without disrupting the application flow or leaking system details to users.
