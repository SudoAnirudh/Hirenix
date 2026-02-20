"use client";

interface Props {
  title: string;
  score: number;
  subtitle?: string;
}

function getScoreColors(score: number) {
  if (score >= 75) return { stroke: "#10b981", glow: "rgba(16,185,129,0.4)", label: "Excellent" };
  if (score >= 55) return { stroke: "#6366f1", glow: "rgba(99,102,241,0.4)", label: "Good" };
  if (score >= 35) return { stroke: "#f59e0b", glow: "rgba(245,158,11,0.4)", label: "Fair" };
  return { stroke: "#ef4444", glow: "rgba(239,68,68,0.4)", label: "Needs Work" };
}

const R = 54;
const CIRC = 2 * Math.PI * R;

export default function ScoreCard({ title, score, subtitle }: Props) {
  const { stroke, glow, label } = getScoreColors(score);
  const progress = CIRC - (score / 100) * CIRC;

  return (
    <div className="glass-card p-6 flex flex-col items-center text-center gap-3">
      <svg width="140" height="140" className="score-ring" style={{ filter: `drop-shadow(0 0 14px ${glow})` }}>
        {/* Track */}
        <circle cx="70" cy="70" r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        {/* Progress */}
        <circle
          cx="70" cy="70" r={R}
          fill="none"
          stroke={stroke}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={progress}
          transform="rotate(-90 70 70)"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
        {/* Score text */}
        <text x="70" y="65" textAnchor="middle" fill="var(--text-primary)" fontSize="22" fontWeight="700" fontFamily="Outfit, sans-serif">{Math.round(score)}</text>
        <text x="70" y="82" textAnchor="middle" fill={stroke} fontSize="10" fontWeight="500">{label}</text>
      </svg>
      <div>
        <div className="font-semibold text-base">{title}</div>
        {subtitle && <div className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{subtitle}</div>}
      </div>
    </div>
  );
}
