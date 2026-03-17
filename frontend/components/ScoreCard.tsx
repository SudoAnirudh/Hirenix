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
    <div className="glass-card p-8 flex flex-col items-center text-center gap-4 rounded-none bg-(--bg-surface) border-2 border-(--border) shadow-[6px_6px_0px_var(--border)]">
      <div className="relative flex items-center justify-center">
        <svg width="140" height="140" className="transform -rotate-90">
          {/* Track */}
          <circle
            cx="70"
            cy="70"
            r={R}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="12"
          />
          {/* Progress */}
          <circle
            cx="70"
            cy="70"
            r={R}
            fill="none"
            stroke={stroke}
            strokeWidth="12"
            strokeLinecap="butt"
            strokeDasharray={CIRC}
            strokeDashoffset={progress}
            style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display font-black text-4xl tracking-tighter text-(--text-primary)">
            {Math.round(score)}
          </span>
          <span
            className="text-[10px] font-mono font-bold uppercase tracking-widest"
            style={{ color: stroke }}
          >
            {label}
          </span>
        </div>
      </div>
      <div>
        <div className="font-display font-black text-sm uppercase tracking-tight text-(--text-primary)">
          {title}
        </div>
        {subtitle && (
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest mt-1 text-(--text-muted)">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}
