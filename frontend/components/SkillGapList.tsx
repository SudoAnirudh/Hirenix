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
    <div className="glass-card p-10 flex flex-col gap-10 rounded-[40px] bg-white/60 backdrop-blur-xl border border-white/60 shadow-glass">
      <h3 className="font-display font-bold text-2xl text-[#2D3748] tracking-tight">
        Analysis <span className="text-[#7C9ADD]">Correlation</span>
      </h3>

      {skillGap.matched_skills.length > 0 && (
        <div className="space-y-5">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A0AEC0] flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#98C9A3] shadow-[0_0_8px_rgba(152,201,163,0.5)]" />
            Validated Competencies ({skillGap.matched_skills.length})
          </div>
          <div className="flex flex-wrap gap-3">
            {skillGap.matched_skills.map((s) => (
              <span
                key={s}
                className="px-5 py-2 bg-white/40 text-[#4A5568] text-[11px] font-bold rounded-full border border-white/60 shadow-xs hover:bg-[#98C9A3]/10 hover:border-[#98C9A3]/20 transition-all cursor-default"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {skillGap.mandatory_missing.length > 0 && (
        <div className="space-y-5">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A0AEC0] flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#F28C8C] shadow-[0_0_8px_rgba(242,140,140,0.5)]" />
            Critical Core Gaps ({skillGap.mandatory_missing.length})
          </div>
          <div className="flex flex-wrap gap-3">
            {skillGap.mandatory_missing.map((s) => (
              <span
                key={s}
                className="px-5 py-2 bg-[#F28C8C]/5 text-[#F28C8C] text-[11px] font-bold rounded-full border border-[#F28C8C]/20 shadow-xs hover:bg-[#F28C8C]/10 transition-all cursor-default"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {skillGap.competitive_missing.length > 0 && (
        <div className="space-y-5">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A0AEC0] flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#7C9ADD] shadow-[0_0_8px_rgba(124,154,221,0.5)]" />
            Growth Opportunities ({skillGap.competitive_missing.length})
          </div>
          <div className="flex flex-wrap gap-3">
            {skillGap.competitive_missing.map((s) => (
              <span
                key={s}
                className="px-5 py-2 bg-[#7C9ADD]/5 text-[#7C9ADD] text-[11px] font-bold rounded-full border border-[#7C9ADD]/20 shadow-xs hover:bg-[#7C9ADD]/10 transition-all cursor-default"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {skillGap.mandatory_missing.length === 0 &&
        skillGap.competitive_missing.length === 0 && (
          <div className="flex items-center gap-5 p-8 rounded-[32px] bg-white/40 border border-white/60 shadow-glass">
            <div className="w-14 h-14 rounded-2xl bg-[#98C9A3]/10 flex items-center justify-center text-2xl shadow-inner border border-[#98C9A3]/20">
              🎉
            </div>
            <p className="text-sm font-bold text-[#4A5568] uppercase tracking-wider leading-relaxed">
              OPTIMAL ALIGNMENT DETECTED.
              <br />
              <span className="text-[#98C9A3]">
                ALL CORE COMPETENCIES VERIFIED.
              </span>
            </p>
          </div>
        )}
    </div>
  );
}
