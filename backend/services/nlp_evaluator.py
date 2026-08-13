import re
import math
import logging
from datetime import datetime
from typing import List, Tuple, Dict, Any
from models.resume import ParsedResumeSchema, ParsedExperience, ParsedBulletPoint

logger = logging.getLogger("hirenix.nlp_evaluator")

# Strong action verbs for XYZ formula evaluation
ACTION_VERBS = {
    "built", "architected", "optimized", "engineered", "designed", "implemented",
    "developed", "scaled", "led", "spearheaded", "reduced", "increased", "boosted",
    "improved", "launched", "created", "automated", "refactored", "deployed",
    "orchestrated", "migrated", "delivered", "generated", "saved", "accelerated"
}

# Regex patterns for Y (Metric) and Z (Impact/Method)
_METRIC_RE = re.compile(
    r"(\d+\s*%|\$\s*\d+|\d+\s*x\b|\d+\s*(million|billion|k\b|users|clients|ms|seconds|hrs|hours|requests))",
    re.IGNORECASE,
)
_IMPACT_RE = re.compile(
    r"\b(resulting in|improving|reducing|increasing|saving|enabling|slashing|cutting|doubling|tripling|by\s+\d+|to\s+\d+)\b",
    re.IGNORECASE,
)

# Half-life lambda for 3-year skill recency decay: lambda = ln(2) / 3 ≈ 0.231
DECAY_LAMBDA = 0.231


def evaluate_xyz_bullet(bullet_text: str) -> ParsedBulletPoint:
    """
    Evaluate a single bullet point against Google's XYZ formula:
    Accomplished [X] as measured by [Y], by doing [Z].
    """
    text = bullet_text.strip()
    if not text:
        return ParsedBulletPoint(content=bullet_text, xyz_score=0.0)

    words = text.lower().split()
    first_word = words[0].strip("•-* ") if words else ""

    # Detect X (Action Verb)
    action_verb = first_word if first_word in ACTION_VERBS else ""
    if not action_verb:
        for w in words[:3]:
            w_clean = w.strip("•-* ,.")
            if w_clean in ACTION_VERBS:
                action_verb = w_clean
                break

    # Detect Y (Metric)
    metric_match = _METRIC_RE.search(text)
    metric = metric_match.group(0) if metric_match else ""

    # Detect Z (Impact/Outcome)
    impact_match = _IMPACT_RE.search(text)
    impact = impact_match.group(0) if impact_match else ""

    # Calculate XYZ Score (0.0 to 1.0)
    # Action Verb: 0.35, Metric: 0.40, Impact: 0.25
    x_score = 0.35 if action_verb else (0.15 if len(words) > 4 else 0.0)
    y_score = 0.40 if metric else 0.0
    z_score = 0.25 if impact else (0.10 if len(words) > 10 else 0.0)

    xyz_score = min(round(x_score + y_score + z_score, 2), 1.0)

    return ParsedBulletPoint(
        content=bullet_text,
        action_verb=action_verb,
        metric=metric,
        impact=impact,
        xyz_score=xyz_score,
    )


def calculate_experience_recency_decay(exp: ParsedExperience, current_year: int = 2026) -> float:
    """
    Calculate recency time-decay factor (0.1 to 1.0) for an experience entry:
    decay = e^(-lambda * years_ago)
    """
    if exp.is_current or "present" in (exp.end_date or "").lower() or "current" in (exp.end_date or "").lower():
        return 1.0

    end_str = exp.end_date or exp.start_date or ""
    year_match = re.search(r"\b(20\d{2}|19\d{2})\b", end_str)
    
    if year_match:
        exp_year = int(year_match.group(1))
        years_ago = max(0, current_year - exp_year)
    else:
        years_ago = 2  # Default assumption if unspecified

    decay = math.exp(-DECAY_LAMBDA * years_ago)
    return round(max(0.15, min(decay, 1.0)), 2)


def evaluate_parsed_resume_nlp(schema: ParsedResumeSchema) -> Tuple[float, float, ParsedResumeSchema]:
    """
    Evaluates the parsed resume schema for:
    1. Overall XYZ Bullet Quality Score (0.0 to 100.0)
    2. Recency-Weighted Experience Score (0.0 to 100.0)
    Updates the schema in-place with scored bullets and decay factors.
    """
    total_xyz = 0.0
    bullet_count = 0
    decay_weighted_exp_score = 0.0
    exp_count = len(schema.experiences)

    for exp in schema.experiences:
        decay_factor = calculate_experience_recency_decay(exp)
        exp.recency_decay_factor = decay_factor

        exp_xyz = 0.0
        evaluated_bullets = []
        for b in exp.bullets:
            scored_b = evaluate_xyz_bullet(b.content)
            evaluated_bullets.append(scored_b)
            total_xyz += scored_b.xyz_score
            exp_xyz += scored_b.xyz_score
            bullet_count += 1

        exp.bullets = evaluated_bullets
        avg_exp_xyz = (exp_xyz / len(exp.bullets)) if exp.bullets else 0.5
        decay_weighted_exp_score += (avg_exp_xyz * decay_factor)

    overall_xyz_score = round((total_xyz / bullet_count * 100.0), 1) if bullet_count > 0 else 50.0
    recency_score = round((decay_weighted_exp_score / exp_count * 100.0), 1) if exp_count > 0 else 70.0

    return overall_xyz_score, recency_score, schema
