1. **Fix Exception Information Leakage in `backend/routers/jobs_board.py`**
   - Use `replace_with_git_merge_diff` to log the error using `logger.error` and return a generic error message instead of exposing the stack trace via `str(e)`.
   ```
   <<<<<<< SEARCH
       except Exception as e:
           raise HTTPException(status_code=500, detail=str(e))
   =======
       except Exception as e:
           logger.error(f"Jobs sync error: {e}")
           raise HTTPException(status_code=500, detail="An error occurred during job synchronization.")
   >>>>>>> REPLACE
   ```
   - Verify changes using `sed -n '75,85p' backend/routers/jobs_board.py`.

2. **Fix Exception Information Leakage in `backend/routers/agent.py`**
   - Use `replace_with_git_merge_diff` to remove `str(e)` from `HTTPException` details in two places.
   ```
   <<<<<<< SEARCH
       except Exception as e:
           logger.error(f"Error in agentic chat route: {e}")
           raise HTTPException(
               status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
               detail=f"Agent execution failed: {str(e)}"
           )
   =======
       except Exception as e:
           logger.error(f"Error in agentic chat route: {e}")
           raise HTTPException(
               status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
               detail="Agent execution failed due to an internal error."
           )
   >>>>>>> REPLACE
   <<<<<<< SEARCH
       except Exception as e:
           logger.error(f"Error resuming graph execution: {e}")
           raise HTTPException(
               status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
               detail=f"Resuming agent execution failed: {str(e)}"
           )
   =======
       except Exception as e:
           logger.error(f"Error resuming graph execution: {e}")
           raise HTTPException(
               status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
               detail="Resuming agent execution failed due to an internal error."
           )
   >>>>>>> REPLACE
   ```
   - Verify changes using `sed -n '115,130p' backend/routers/agent.py` and `sed -n '200,215p' backend/routers/agent.py`.

3. **Fix Exception Information Leakage in `backend/routers/interview.py`**
   - Use `replace_with_git_merge_diff` to remove `str(e)` from `HTTPException` detail.
   ```
   <<<<<<< SEARCH
       except Exception as e:
           logger.error(f"Transcription route failure: {e}")
           raise HTTPException(status_code=500, detail=str(e))
   =======
       except Exception as e:
           logger.error(f"Transcription route failure: {e}")
           raise HTTPException(status_code=500, detail="Transcription failed due to an internal error.")
   >>>>>>> REPLACE
   ```
   - Verify changes using `sed -n '385,400p' backend/routers/interview.py`.

4. **Update Sentinel Journal**
   - Use `run_in_bash_session` to append a new entry to `.jules/sentinel.md` documenting the fix for exception information leakage.
   ```bash
   cat << 'EOF' >> .jules/sentinel.md
   ## 2025-01-08 - [Exception Information Leakage in API Responses]
   **Vulnerability:** Raw exception strings (`str(e)`) were being returned directly to clients in FastAPI `HTTPException` responses (e.g., `detail=str(e)`).
   **Learning:** Exposing internal exception details or stack traces to clients can leak sensitive information about the system's architecture, database structure, or internal paths, aiding attackers in further exploitation.
   **Prevention:** Always log detailed error messages internally using a logger and return a sanitized, generic error message (e.g., "An error occurred") in HTTP responses to adhere to the "fail securely" principle.
   EOF
   ```
   - Verify using `cat .jules/sentinel.md`.

5. **Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.**
   - Run backend tests using `cd backend && PYENV_VERSION=3.10.20 pip install -r requirements.txt pytest pytest-asyncio httpx && SUPABASE_URL=test SUPABASE_KEY=test SUPABASE_SERVICE_KEY=test JWT_SECRET=test PYTHONPATH=. python -m pytest tests/`
   - Run linter using `cd backend && PYENV_VERSION=3.10.20 pip install flake8 && python -m flake8 routers/`

6. **Submit PR**
   - Submit the PR with the branch name `fix-exception-leakage` and title `🛡️ Sentinel: [MEDIUM] Fix Exception Information Leakage in API Responses`.
