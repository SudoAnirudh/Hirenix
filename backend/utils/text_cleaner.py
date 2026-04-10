import re

# Pre-compile regexes to eliminate redundant compilation overhead
_PAGE_HEADER_PATTERN = re.compile(r"page\s+\d+\s+of\s+\d+", re.IGNORECASE)
_SPACES_PATTERN = re.compile(r"[ \t]{2,}")
_BLANK_LINES_PATTERN = re.compile(r"\n{3,}")
_NON_PRINTABLE_PATTERN = re.compile(r"[^\x20-\x7E\n]")

_KEYWORD_PATTERN = re.compile(r"\b[a-zA-Z][a-zA-Z0-9+#.]*\b")

_ACHIEVEMENT_PATTERNS = [
    re.compile(r"\d+\s*%", re.IGNORECASE),  # percentages
    re.compile(r"\$\s*\d+", re.IGNORECASE),  # dollar amounts
    re.compile(r"\d+\s*x\b", re.IGNORECASE),  # multipliers
    re.compile(r"\d+\s*(million|billion|k\b|users|clients|employees)", re.IGNORECASE),
    re.compile(r"increased|decreased|reduced|improved|grew|saved", re.IGNORECASE),
]


def clean_text(text: str) -> str:
    """Remove noise from extracted PDF text."""
    # Remove page headers/footers patterns (e.g., "Page 1 of 3")
    text = _PAGE_HEADER_PATTERN.sub("", text)
    # Normalize line endings first.
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    # Collapse excessive spaces/tabs while preserving newlines.
    text = _SPACES_PATTERN.sub(" ", text)
    # Collapse too many blank lines.
    text = _BLANK_LINES_PATTERN.sub("\n\n", text)
    # Remove non-printable characters
    text = _NON_PRINTABLE_PATTERN.sub("", text)
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
    tokens = _KEYWORD_PATTERN.findall(text)
    return [t.lower() for t in tokens if len(t) > 2 and t.lower() not in stopwords]


def has_measurable_achievement(text: str) -> bool:
    """Return True if the text contains quantified results."""
    for p in _ACHIEVEMENT_PATTERNS:
        if p.search(text):
            return True
    return False
