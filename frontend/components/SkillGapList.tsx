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
    <div className="glass-card p-8 flex flex-col gap-6 rounded-none bg-(--bg-surface) border-2 border-(--border) shadow-[6px_6px_0px_var(--border)]">
      <h3 className="font-display font-black text-xl uppercase tracking-tight text-(--text-primary)">
        Skill Gap Analysis
      </h3>

      {skillGap.matched_skills.length > 0 && (
        <div className="space-y-3">
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-(--emerald) flex items-center gap-2">
            <div className="w-2 h-2 bg-(--emerald)" />
            Matched Skills ({skillGap.matched_skills.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {skillGap.matched_skills.map((s) => (
              <span
                key={s}
                className="px-3 py-1.5 border-2 border-(--emerald) bg-(--emerald)/5 text-xs font-mono font-bold text-(--text-primary) shadow-[2px_2px_0px_var(--emerald)] uppercase"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {skillGap.mandatory_missing.length > 0 && (
        <div className="space-y-3">
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-red-500 flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500" />
            Missing Mandatory Skills ({skillGap.mandatory_missing.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {skillGap.mandatory_missing.map((s) => (
              <span
                key={s}
                className="px-3 py-1.5 border-2 border-red-500 bg-red-500/5 text-xs font-mono font-bold text-(--text-primary) shadow-[2px_2px_0px_#ef4444] uppercase"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {skillGap.competitive_missing.length > 0 && (
        <div className="space-y-3">
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-(--indigo) flex items-center gap-2">
            <div className="w-2 h-2 bg-(--indigo)" />
            Competitive Skills to Add ({skillGap.competitive_missing.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {skillGap.competitive_missing.map((s) => (
              <span
                key={s}
                className="px-3 py-1.5 border-2 border-(--indigo) bg-(--indigo)/5 text-xs font-mono font-bold text-(--text-primary) shadow-[2px_2px_0px_var(--indigo)] uppercase"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {skillGap.mandatory_missing.length === 0 &&
        skillGap.competitive_missing.length === 0 && (
          <p className="text-sm font-mono font-bold text-(--emerald) p-4 border-2 border-(--emerald) bg-(--emerald)/5">
            🎉 EXCELLENT! YOU MATCH ALL REQUIRED SKILLS.
          </p>
        )}
    </div>
  );
}
