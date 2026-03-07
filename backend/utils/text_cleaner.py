import re


def clean_text(text: str) -> str:
    """Remove noise from extracted PDF text."""
    # Remove page headers/footers patterns (e.g., "Page 1 of 3")
    text = re.sub(r"page\s+\d+\s+of\s+\d+", "", text, flags=re.IGNORECASE)
    # Normalize line endings first.
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    # Collapse excessive spaces/tabs while preserving newlines.
    text = re.sub(r"[ \t]{2,}", " ", text)
    # Collapse too many blank lines.
    text = re.sub(r"\n{3,}", "\n\n", text)
    # Remove non-printable characters
    text = re.sub(r"[^\x20-\x7E\n]", "", text)
    return text.strip()


def extract_keywords(text: str) -> list[str]:
    """Extract candidate keywords by removing stopwords and short tokens."""
    stopwords = {
        "the",
        "and",
        "or",
        "a",
        "an",
        "to",
        "of",
        "in",
        "with",
        "for",
        "on",
        "at",
        "by",
        "is",
        "are",
        "was",
        "were",
    }
    tokens = re.findall(r"\b[a-zA-Z][a-zA-Z0-9+#.]*\b", text)
    return [t.lower() for t in tokens if len(t) > 2 and t.lower() not in stopwords]


def has_measurable_achievement(text: str) -> bool:
    """Return True if the text contains quantified results."""
    patterns = [
        r"\d+\s*%",  # percentages
        r"\$\s*\d+",  # dollar amounts
        r"\d+\s*x\b",  # multipliers
        r"\d+\s*(million|billion|k\b|users|clients|employees)",
        r"increased|decreased|reduced|improved|grew|saved",
    ]
    for p in patterns:
        if re.search(p, text, re.IGNORECASE):
            return True
    return False
