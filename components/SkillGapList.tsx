"use client";

interface SkillGap {
  mandatory_missing: string[];
  competitive_missing: string[];
  matched_skills: string[];
}

interface Props {
  skillGap: SkillGap;
}

export default function SkillGapList({ skillGap }: Props) {
  return (
    <div className="glass-card p-6 flex flex-col gap-5">
      <h3 className="font-semibold text-sm">Skill Gap Analysis</h3>

      {skillGap.matched_skills.length > 0 && (
        <div>
          <div className="text-xs font-medium mb-2" style={{ color: "var(--emerald)" }}>✓ Matched Skills ({skillGap.matched_skills.length})</div>
          <div className="flex flex-wrap gap-2">
            {skillGap.matched_skills.map(s => (
              <span key={s} className="px-2.5 py-1 rounded-lg text-xs font-medium" style={{ background: "rgba(16,185,129,0.12)", color: "var(--emerald)", border: "1px solid rgba(16,185,129,0.2)" }}>{s}</span>
            ))}
          </div>
        </div>
      )}

      {skillGap.mandatory_missing.length > 0 && (
        <div>
          <div className="text-xs font-medium mb-2" style={{ color: "#f87171" }}>⚠ Missing Mandatory Skills ({skillGap.mandatory_missing.length})</div>
          <div className="flex flex-wrap gap-2">
            {skillGap.mandatory_missing.map(s => (
              <span key={s} className="px-2.5 py-1 rounded-lg text-xs font-medium" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>{s}</span>
            ))}
          </div>
        </div>
      )}

      {skillGap.competitive_missing.length > 0 && (
        <div>
          <div className="text-xs font-medium mb-2" style={{ color: "var(--indigo)" }}>↑ Competitive Skills to Add ({skillGap.competitive_missing.length})</div>
          <div className="flex flex-wrap gap-2">
            {skillGap.competitive_missing.map(s => (
              <span key={s} className="px-2.5 py-1 rounded-lg text-xs font-medium" style={{ background: "rgba(99,102,241,0.1)", color: "var(--indigo)", border: "1px solid rgba(99,102,241,0.2)" }}>{s}</span>
            ))}
          </div>
        </div>
      )}

      {skillGap.mandatory_missing.length === 0 && skillGap.competitive_missing.length === 0 && (
        <p className="text-sm" style={{ color: "var(--emerald)" }}>🎉 Excellent! You match all required and competitive skills for this role.</p>
      )}
    </div>
  );
}
