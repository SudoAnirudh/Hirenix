"use client";
import { motion } from "framer-motion";
import { CheckCircle, AlertCircle, Sparkles, TrendingUp } from "lucide-react";

interface SkillGap {
  mandatory_missing: string[];
  competitive_missing: string[];
  matched_skills: string[];
}

interface Props {
  skillGap: SkillGap;
}

export default function SkillGapList({ skillGap }: Props) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1 },
  };

  return (
    <div className="glass-card p-10 flex flex-col gap-12 rounded-[3rem] bg-white/70 backdrop-blur-xl border border-white/80 shadow-2xl relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#7C9ADD]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between relative z-10">
        <h3 className="font-display font-black text-2xl text-[#2D3748] tracking-tight flex items-center gap-3">
          <TrendingUp className="text-[#7C9ADD]" size={24} />
          Skill <span className="text-[#7C9ADD]">Correlation</span>
        </h3>
        <div className="px-4 py-1.5 rounded-full bg-white border border-gray-100 text-[10px] font-bold text-[#A0AEC0] uppercase tracking-widest shadow-sm">
          Market Benchmark
        </div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-12 relative z-10"
      >
        {skillGap.matched_skills.length > 0 && (
          <div className="space-y-6">
            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-[#A0AEC0] flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#98C9A3] shadow-[0_0_8px_rgba(152,201,163,0.6)]" />
              Validated Competencies ({skillGap.matched_skills.length})
            </div>
            <div className="flex flex-wrap gap-3">
              {skillGap.matched_skills.map((s) => (
                <motion.span
                  variants={item}
                  key={s}
                  className="px-6 py-2.5 bg-white/80 text-[#4A5568] text-[11px] font-bold rounded-xl border border-white shadow-sm hover:border-[#98C9A3]/30 hover:bg-[#98C9A3]/5 transition-all cursor-default"
                >
                  {s}
                </motion.span>
              ))}
            </div>
          </div>
        )}

        {skillGap.mandatory_missing.length > 0 && (
          <div className="space-y-6">
            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-[#A0AEC0] flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#F28C8C] shadow-[0_0_8px_rgba(242,140,140,0.6)]" />
              Critical Core Gaps ({skillGap.mandatory_missing.length})
            </div>
            <div className="flex flex-wrap gap-3">
              {skillGap.mandatory_missing.map((s) => (
                <motion.span
                  variants={item}
                  key={s}
                  className="px-6 py-2.5 bg-[#F28C8C]/5 text-[#F28C8C] text-[11px] font-extrabold rounded-xl border border-[#F28C8C]/20 shadow-sm hover:bg-[#F28C8C]/10 transition-all cursor-default"
                >
                  {s}
                </motion.span>
              ))}
            </div>
          </div>
        )}

        {skillGap.competitive_missing.length > 0 && (
          <div className="space-y-6">
            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-[#A0AEC0] flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#7C9ADD] shadow-[0_0_8px_rgba(124,154,221,0.6)]" />
              Growth Opportunities ({skillGap.competitive_missing.length})
            </div>
            <div className="flex flex-wrap gap-3">
              {skillGap.competitive_missing.map((s) => (
                <motion.span
                  variants={item}
                  key={s}
                  className="px-6 py-2.5 bg-[#7C9ADD]/5 text-[#7C9ADD] text-[11px] font-bold rounded-xl border border-[#7C9ADD]/20 shadow-sm hover:bg-[#7C9ADD]/10 transition-all cursor-default"
                >
                  {s}
                </motion.span>
              ))}
            </div>
          </div>
        )}

        {skillGap.mandatory_missing.length === 0 &&
          skillGap.competitive_missing.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-6 p-10 rounded-[2.5rem] bg-gradient-to-br from-white to-[#F0FFF4] border border-[#98C9A3]/30 shadow-xl overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 p-8 text-[#98C9A3]/10">
                <Sparkles size={100} />
              </div>
              <div className="w-16 h-16 rounded-2xl bg-[#98C9A3] flex items-center justify-center text-3xl shadow-lg shadow-[#98C9A3]/20 relative z-10">
                🚀
              </div>
              <div className="relative z-10">
                <p className="text-[10px] font-black text-[#98C9A3] uppercase tracking-[0.3em] mb-1">
                  Perfect Harmony
                </p>
                <p className="text-lg font-display font-bold text-[#2D3748] tracking-tight">
                  High Performance Alignment Detected
                </p>
              </div>
            </motion.div>
          )}
      </motion.div>
    </div>
  );
}
