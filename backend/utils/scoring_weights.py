"""
Scoring weights used throughout the ATS and GitHub scoring engines.
Centralising here makes tuning trivial.
"""

# ─── ATS Scorer ───────────────────────────────────────────────────────────────
ATS_RULE_WEIGHT = 0.60      # Proportion of score from rule-based checks
ATS_SEMANTIC_WEIGHT = 0.40  # Proportion of score from embedding similarity

# Rule-based sub-weights (must sum to 1.0)
ATS_RULES = {
    "section_completeness": 0.30,   # All key sections present
    "keyword_density": 0.25,         # Relevant keywords per 100 words
    "measurable_achievements": 0.25, # Quantified results (%, $, ×)
    "formatting_quality": 0.20,      # Avg line length, no excessive caps
}

# Required sections for full score
REQUIRED_SECTIONS = {"education", "experience", "skills", "projects"}

# ─── GitHub Performance Index ─────────────────────────────────────────────────
GPI_WEIGHTS = {
    "consistency_score": 0.25,
    "project_depth_score": 0.25,
    "stack_diversity_score": 0.25,
    "production_readiness_score": 0.25,
}

# ─── Resume Evolution Score ───────────────────────────────────────────────────
EVOLUTION_WEIGHTS = {
    "ats_score": 0.40,
    "interview_score": 0.40,
    "gpi_score": 0.20,
}
