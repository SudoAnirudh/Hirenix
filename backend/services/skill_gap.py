import json
import os
from typing import List
from utils.text_cleaner import extract_keywords

_MATRIX_PATH = os.path.join(os.path.dirname(__file__), "../utils/role_skill_matrix.json")

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

    resume_keywords = {kw.lower() for kw in extract_keywords(resume_text)}
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
