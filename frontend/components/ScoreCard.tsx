"use client";
import { useEffect, useState } from "react";

interface Props {
  score: number | null;
  label: string;
  subtext?: string;
}

function getScoreColors(score: number) {
  if (score >= 90) return { stroke: "#10b981", glow: "#10b981", label: "Elite" };
  if (score >= 75) return { stroke: "#34d399", glow: "#34d399", label: "Strong" };
  if (score >= 60) return { stroke: "#facc15", glow: "#facc15", label: "Good" };
  if (score >= 40) return { stroke: "#fb923c", glow: "#fb923c", label: "Fair" };
  return { stroke: "#ef4444", glow: "#ef4444", label: "Weak" };
}

export default function ScoreCard({ score, label, subtext }: Props) {
  const [progress, setProgress] = useState(0);
  const R = 70;
  const CIRC = 2 * Math.PI * R;

  useEffect(() => {
    // Animate after mount
    const timer = setTimeout(() => setProgress(score ?? 0), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const offset = CIRC - (progress / 100) * CIRC;
  const { stroke, glow, label: tier } = getScoreColors(progress);

  return (
    <div className="glass-card p-6 flex flex-col items-center justify-center relative group hover:border-indigo-500/30 transition-colors">
      <div className="relative mb-4">
        {/* Glow effect behind */}
        <div className="absolute inset-0 rounded-full blur-2xl opacity-20 transition-all duration-1000 group-hover:opacity-40" style={{ background: stroke }} />
        
        <svg width="160" height="160" className="transform -rotate-90">
          {/* Background track */}
          <circle cx="80" cy="80" r={R} fill="none" stroke="var(--bg-elevated)" strokeWidth="12" />
          
          {/* Progress circle */}
          <circle
            cx="80" cy="80" r={R}
            fill="none"
            stroke={stroke}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.5s ease" }}
          />
        </svg>
        
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-display font-bold text-4xl tabular-nums tracking-tight animate-fade-in">
            {Math.round(progress)}
          </span>
          <span className="text-xs font-medium uppercase tracking-wider mt-1 opacity-80" style={{ color: stroke }}>
            {score ? tier : "No Data"}
          </span>
        </div>
      </div>
      
      <div className="text-center z-10 w-full">
        <div className="font-semibold text-lg mb-1">{label}</div>
        {subtext && <div className="text-sm text-gray-400 font-light truncate px-2">{subtext}</div>}
      </div>
    </div>
  );
}
