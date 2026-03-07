import re
from typing import Tuple, List
from models.resume import ResumeSection
from utils.pdf_extractor import extract_pdf_text
from utils.text_cleaner import clean_text

# Section headers to detect (case-insensitive)
SECTION_PATTERNS = {
    "education": r"\b(education|academics?|qualifications?)\b",
    "experience": r"\b(experience|work history|employment|internship)\b",
    "skills": r"\b(skills?|technologies|tech stack|competencies|expertise)\b",
    "projects": r"\b(projects?|portfolio|personal projects?)\b",
    "certifications": r"\b(certifications?|certificates?|licenses?|credentials)\b",
    "summary": r"\b(summary|profile|objective|about me)\b",
}


def _clean_line(line: str) -> str:
    return re.sub(r"\s+", " ", line).strip()


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
            if re.search(pattern, line, re.IGNORECASE) and len(line) < 60:
                detected = label
                break
        if detected:
            flush()
            current_section = detected
            current_lines = []
        else:
            current_lines.append(line)

    flush()

    # If no sections detected, treat entire text as a generic body
    if not sections:
        sections.append(ResumeSection(section_type="body", content=raw_text))

    return sections, raw_text
