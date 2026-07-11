import json
import os
import functools

_MATRIX_PATH = os.path.join(os.path.dirname(__file__), "../utils/role_skill_matrix.json")

# ⚡ Bolt Optimization
# What: Cache the role skill matrix using lru_cache and removed unused keyword extraction.
# Why: Re-reading and parsing the JSON file from disk on every skill gap detection adds unnecessary I/O and parsing overhead. Also removed an expensive regex-based keyword extraction that wasn't being used.
# Impact: Eliminates repetitive disk I/O and expensive regex tokenization, significantly speeding up skill gap calculation, particularly when invoked frequently (like in quick matches).
@functools.lru_cache(maxsize=1)
def _load_matrix() -> dict:
    with open(_MATRIX_PATH, "r") as f:
        return json.load(f)


def detect_skill_gap(resume_text: str, target_role: str) -> dict:
    """
    Compare resume keywords against the role-skill matrix.
    Returns mandatory_missing, competitive_missing, matched_skills.
    """
    matrix = _load_matrix()

    # Try exact match first, then fuzzy (substring)
    role_data = matrix.get(target_role)
    if not role_data:
        for key in matrix:
            if target_role.lower() in key.lower():
                role_data = matrix[key]
                break

    if not role_data:
        return {"mandatory_missing": [], "competitive_missing": [], "matched_skills": []}

    resume_text_lower = resume_text.lower()

    def is_present(skill: str) -> bool:
        # Check both word tokens and full skill name substring
        return skill.lower() in resume_text_lower

    mandatory_missing = [s for s in role_data["mandatory"] if not is_present(s)]
    competitive_missing = [s for s in role_data["competitive"] if not is_present(s)]
    matched = [s for s in role_data["mandatory"] + role_data["competitive"] if is_present(s)]

    return {
        "mandatory_missing": mandatory_missing,
        "competitive_missing": competitive_missing,
        "matched_skills": matched,
    }
