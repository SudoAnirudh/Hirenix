import re

def sanitize_postgrest_filter(text: str) -> str:
    """
    Sanitizes user input for use in PostgREST filters like .or_().
    Commas and quotes in user input can cause filter injection vulnerabilities.
    This replaces commas, quotes, and parentheses with spaces.
    """
    if not text:
        return ""
    return re.sub(r'[,()"]', ' ', text).strip()
