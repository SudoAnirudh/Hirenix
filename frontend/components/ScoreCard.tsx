"use client";

interface Props {
  title: string;
  score: number;
  subtitle?: string;
}

function getScoreColors(score: number) {
  if (score >= 75)
    return {
      stroke: "#10b981",
      glow: "rgba(16,185,129,0.4)",
      label: "Excellent",
    };
  if (score >= 55)
    return { stroke: "#6366f1", glow: "rgba(99,102,241,0.4)", label: "Good" };
  if (score >= 35)
    return { stroke: "#f59e0b", glow: "rgba(245,158,11,0.4)", label: "Fair" };
  return {
    stroke: "#ef4444",
    glow: "rgba(239,68,68,0.4)",
    label: "Needs Work",
  };
}

const R = 54;
const CIRC = 2 * Math.PI * R;

export default function ScoreCard({ title, score, subtitle }: Props) {
  const { stroke, label } = getScoreColors(score);
  const progress = CIRC - (score / 100) * CIRC;

  return (
    <div className="glass-card p-8 flex flex-col items-center text-center gap-7 rounded-[40px] bg-white/60 backdrop-blur-xl border border-white/60 shadow-glass relative overflow-hidden transition-all">
      <div className="relative flex items-center justify-center group/score">
        <div
          className="absolute inset-0 rounded-full scale-125 blur-3xl opacity-20 transition-all duration-500 group-hover/score:opacity-30"
          style={{ background: stroke }}
        />
        <svg
          width="150"
          height="150"
          className="transform -rotate-90 relative z-10 drop-shadow-[0_0_12px_rgba(0,0,0,0.05)]"
        >
          {/* Track */}
          <circle
            cx="75"
            cy="75"
            r={R}
            fill="none"
            stroke="rgba(0,0,0,0.02)"
            strokeWidth="10"
          />
          {/* Progress */}
          <circle
            cx="75"
            cy="75"
            r={R}
            fill="none"
            stroke={stroke}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={progress}
            className="transition-all duration-1000 ease-out"
            style={{ filter: `drop-shadow(0 0 10px ${stroke}66)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pt-1">
          <span className="font-display font-bold text-5xl tracking-tight text-[#2D3748]">
            {Math.round(score)}
          </span>
          <div
            className="mt-1 text-[10px] font-bold uppercase tracking-[0.15em] px-3 py-1 rounded-full border shadow-sm"
            style={{
              backgroundColor: `${stroke}10`,
              color: stroke,
              borderColor: `${stroke}20`,
            }}
          >
            {label}
          </div>
        </div>
      </div>
      <div className="relative z-10">
        <div className="font-display font-bold text-[15px] text-[#2D3748] tracking-tight mb-2">
          {title}
        </div>
        {subtitle && (
          <div className="text-[11px] font-medium text-[#718096] uppercase tracking-widest bg-white/40 px-3 py-1.5 rounded-full border border-white/60 inline-block shadow-xs">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}
