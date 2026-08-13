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
GPI_CATEGORY_WEIGHTS = {
    "code_quality_score": 0.30,       # Code Quality & Architecture Metrics
    "git_hygiene_score": 0.25,        # Workflow & Git Hygiene Metrics
    "collaboration_score": 0.25,      # Open Source & Collaboration Metrics
    "longevity_impact_score": 0.20,   # Project Longevity & Impact Metrics
}

# Legacy mapping for backwards compatibility
GPI_WEIGHTS = GPI_CATEGORY_WEIGHTS

# ─── Resume Evolution Score ───────────────────────────────────────────────────
EVOLUTION_WEIGHTS = {
    "ats_score": 0.40,
    "interview_score": 0.40,
    "gpi_score": 0.20,
}

