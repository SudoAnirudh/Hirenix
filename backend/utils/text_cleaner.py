import re

# Pre-compile regexes to eliminate redundant compilation overhead
_PAGE_HEADER_PATTERN = re.compile(r"page\s+\d+\s+of\s+\d+", re.IGNORECASE)
_SPACES_PATTERN = re.compile(r"[ \t]{2,}")
_BLANK_LINES_PATTERN = re.compile(r"\n{3,}")
_NON_PRINTABLE_PATTERN = re.compile(r"[^\x20-\x7E\n]")

_KEYWORD_PATTERN = re.compile(r"\b[a-zA-Z][a-zA-Z0-9+#.]*\b")

# PERFORMANCE OPTIMIZATION:
# Combined multiple achievement regex patterns into a single pattern using the `|` (OR) operator.
# This prevents the overhead of iterating through multiple regex patterns in a Python loop and
# allows the underlying C engine to optimize the search process.
_ACHIEVEMENT_PATTERN = re.compile(
    r"\d+\s*%|\$\s*\d+|\d+\s*x\b|\d+\s*(?:million|billion|k\b|users|clients|employees)|increased|decreased|reduced|improved|grew|saved",
    re.IGNORECASE
)

# PERFORMANCE OPTIMIZATION:
# Extracted the loop-invariant `stopwords` set to a module-level `frozenset` constant.
# This eliminates redundant memory allocation and set hashing on every function call.
_STOPWORDS = frozenset({
    "the", "and", "or", "a", "an", "to", "of", "in", "with", "for",
    "on", "at", "by", "is", "are", "was", "were",
})


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
    return [
        # PERFORMANCE OPTIMIZATION:
        # Using the walrus operator `:=` to evaluate `t.lower()` only once per token
        t_lower for t in _KEYWORD_PATTERN.findall(text)
        if len(t) > 2 and (t_lower := t.lower()) not in _STOPWORDS
    ]


def has_measurable_achievement(text: str) -> bool:
    """Return True if the text contains quantified results."""
    return bool(_ACHIEVEMENT_PATTERN.search(text))
