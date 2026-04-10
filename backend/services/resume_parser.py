import re
from typing import Tuple, List
from models.resume import ResumeSection
from utils.pdf_extractor import extract_pdf_text
from utils.text_cleaner import clean_text

# Pre-compile regexes to eliminate redundant compilation overhead
_CLEAN_LINE_PATTERN = re.compile(r"\s+")
_INLINE_STRIP_PATTERN = re.compile(r"^[:\-\s]+")

# Section headers to detect (case-insensitive)
SECTION_PATTERNS = {
    "education": re.compile(r"\b(education|academics?|qualifications?)\b", re.IGNORECASE),
    "experience": re.compile(r"\b(experience|work history|employment|internship)\b", re.IGNORECASE),
    "skills": re.compile(r"\b(skills?|technologies|tech stack|competencies|expertise)\b", re.IGNORECASE),
    "projects": re.compile(r"\b(projects?|portfolio|personal projects?)\b", re.IGNORECASE),
    "certifications": re.compile(r"\b(certifications?|certificates?|licenses?|credentials)\b", re.IGNORECASE),
    "summary": re.compile(r"\b(summary|profile|objective|about me)\b", re.IGNORECASE),
}


def _clean_line(line: str) -> str:
    return _CLEAN_LINE_PATTERN.sub(" ", line).strip()


def parse_resume(content: bytes) -> Tuple[List[ResumeSection], str]:
    """
    Extract text and split into labelled sections.
    Returns (sections, raw_text).
    """
    raw_text = clean_text(extract_pdf_text(content))
    if not raw_text.strip():
        return [ResumeSection(section_type="body", content="")], ""

    lines = [_clean_line(l) for l in raw_text.split("\n") if _clean_line(l)]

    sections: List[ResumeSection] = []
    current_section: str | None = None
    current_lines: List[str] = []
    preamble_lines: List[str] = []

    def flush():
        if current_section and current_lines:
            sections.append(
                ResumeSection(
                    section_type=current_section,
                    content="\n".join(current_lines),
                )
            )

    for line in lines:
        detected = None
        for label, pattern in SECTION_PATTERNS.items():
            if pattern.search(line) and len(line) < 60:
                detected = label
                break
        if detected:
            flush()
            current_section = detected
            current_lines = []
            # Keep inline text when header and content are on same line
            inline = SECTION_PATTERNS[detected].sub("", line)
            inline = _INLINE_STRIP_PATTERN.sub("", inline).strip()
            if inline:
                current_lines.append(inline)
        else:
            if current_section:
                current_lines.append(line)
            else:
                preamble_lines.append(line)

    flush()

    if preamble_lines:
        sections.insert(
            0,
            ResumeSection(section_type="summary", content="\n".join(preamble_lines)),
        )

    # If no sections detected, treat entire text as a generic body
    if not sections:
        sections.append(ResumeSection(section_type="body", content=raw_text))

    return sections, raw_text
