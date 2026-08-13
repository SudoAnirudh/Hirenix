import re
import json
import logging
from typing import Tuple, List, Optional
from models.resume import ResumeSection, ParsedResumeSchema, ParsedExperience, ParsedBulletPoint
from utils.markdown_extractor import extract_pdf_markdown
from utils.text_cleaner import clean_text
from services.groq_client import invoke_groq_llm

logger = logging.getLogger("hirenix.resume_parser")

_CLEAN_LINE_PATTERN = re.compile(r"\s+")
_INLINE_STRIP_PATTERN = re.compile(r"^[:\-\s]+")

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


def _regex_parse_sections(raw_text: str) -> List[ResumeSection]:
    """Deterministic fallback section segmentation."""
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

    if not sections:
        sections.append(ResumeSection(section_type="body", content=raw_text))

    return sections


async def _llm_parse_resume_schema(raw_text: str) -> Optional[ParsedResumeSchema]:
    """Parse resume Markdown/Text into structured JSON schema using fast LLM inference."""
    prompt = f"""You are a specialized enterprise ATS resume parser.
Extract structured information from the candidate resume below and output strict JSON matching this exact structure:
{{
  "summary": "Professional summary or objective",
  "skills": ["Skill 1", "Skill 2"],
  "experiences": [
    {{
      "title": "Software Engineer",
      "company": "Tech Corp",
      "start_date": "2021",
      "end_date": "Present",
      "is_current": true,
      "bullets": [
        {{
          "content": "Built high-throughput API microservices."
        }}
      ]
    }}
  ],
  "education": ["B.S. Computer Science - University X"],
  "projects": ["Project A: Built a distributed cache system"],
  "certifications": ["AWS Certified Solutions Architect"]
}}

Candidate Resume Text:
```
{raw_text[:4000]}
```
Return ONLY valid JSON. No markdown codeblock wrappers, no preamble, no extra explanation."""

    try:
        res = await invoke_groq_llm(
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=2048,
        )
        if res and "choices" in res and res["choices"]:
            content = res["choices"][0]["message"]["content"].strip()
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
            content = content.strip()
            
            data = json.loads(content)
            experiences = []
            for exp in data.get("experiences", []):
                bullets = [
                    ParsedBulletPoint(content=b.get("content", ""))
                    for b in exp.get("bullets", [])
                    if b.get("content")
                ]
                experiences.append(
                    ParsedExperience(
                        title=exp.get("title", ""),
                        company=exp.get("company", ""),
                        start_date=exp.get("start_date", ""),
                        end_date=exp.get("end_date", ""),
                        is_current=exp.get("is_current", False),
                        bullets=bullets,
                    )
                )

            return ParsedResumeSchema(
                summary=data.get("summary", ""),
                skills=data.get("skills", []),
                experiences=experiences,
                education=data.get("education", []),
                projects=data.get("projects", []),
                certifications=data.get("certifications", []),
            )
    except Exception as e:
        logger.warning(f"LLM JSON schema parsing failed: {e}")

    return None


def _schema_to_sections(schema: ParsedResumeSchema, raw_text: str) -> List[ResumeSection]:
    """Convert a ParsedResumeSchema into standard ResumeSection objects."""
    sections: List[ResumeSection] = []

    if schema.summary:
        sections.append(ResumeSection(section_type="summary", content=schema.summary))

    if schema.experiences:
        exp_lines = []
        for exp in schema.experiences:
            header = f"{exp.title} | {exp.company} ({exp.start_date} - {exp.end_date or 'Present'})"
            exp_lines.append(header)
            for b in exp.bullets:
                exp_lines.append(f"• {b.content}")
        sections.append(ResumeSection(section_type="experience", content="\n".join(exp_lines)))

    if schema.skills:
        sections.append(ResumeSection(section_type="skills", content=", ".join(schema.skills)))

    if schema.projects:
        sections.append(ResumeSection(section_type="projects", content="\n".join(schema.projects)))

    if schema.education:
        sections.append(ResumeSection(section_type="education", content="\n".join(schema.education)))

    if schema.certifications:
        sections.append(ResumeSection(section_type="certifications", content="\n".join(schema.certifications)))

    if not sections:
        sections = _regex_parse_sections(raw_text)

    return sections


async def parse_resume(content: bytes) -> Tuple[List[ResumeSection], str, ParsedResumeSchema]:
    """
    Extract text/markdown and parse into structured sections and Pydantic JSON schema.
    Returns (sections, raw_text, parsed_schema).
    """
    raw_text = extract_pdf_markdown(content)
    if not raw_text.strip():
        empty_schema = ParsedResumeSchema()
        return [ResumeSection(section_type="body", content="")], "", empty_schema

    # Attempt LLM JSON Schema Parsing
    schema = await _llm_parse_resume_schema(raw_text)

    if schema and (schema.skills or schema.experiences or schema.education):
        sections = _schema_to_sections(schema, raw_text)
    else:
        # Fallback to regex segmentation and build basic schema
        sections = _regex_parse_sections(raw_text)
        schema = ParsedResumeSchema(
            summary=next((s.content for s in sections if s.section_type == "summary"), ""),
            skills=[s.content for s in sections if s.section_type == "skills"],
            education=[s.content for s in sections if s.section_type == "education"],
            projects=[s.content for s in sections if s.section_type == "projects"],
            certifications=[s.content for s in sections if s.section_type == "certifications"],
        )

    return sections, raw_text, schema

