"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface MatchGaugeProps {
  score: number;
  label: string;
  size?: number;
}

const MatchGauge: React.FC<MatchGaugeProps> = ({
  score,
  label,
  size = 200,
}) => {
  const [displayScore, setDisplayScore] = useState(0);
  const radius = size * 0.4;
  const strokeWidth = size * 0.08;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  useEffect(() => {
    const timeout = setTimeout(() => setDisplayScore(score), 200);
    return () => clearTimeout(timeout);
  }, [score]);

  const getColor = (val: number) => {
    if (val >= 80) return "#10B981"; // Emerald
    if (val >= 60) return "#7C9ADD"; // Hirenix Blue
    if (val >= 40) return "#F59E0B"; // Amber
    return "#EF4444"; // Red
  };

  const currentColor = getColor(score);

  return (
    <div className="relative flex flex-col items-center justify-center select-none group">
      {/* Background Glow */}
      <div
        className="absolute w-full h-full rounded-full blur-[40px] opacity-10 transition-all duration-1000 group-hover:opacity-20"
        style={{ backgroundColor: currentColor }}
      />

      <svg
        height={size}
        width={size}
        className="transform -rotate-90 filter drop-shadow-[0_0_8px_rgba(0,0,0,0.05)]"
      >
        {/* Track Ring */}
        <circle
          stroke="rgba(0,0,0,0.03)"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress Ring */}
        <motion.circle
          stroke={currentColor}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference + " " + circumference}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>

      {/* Inner Label and Score */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-display font-black tracking-tight text-[#2D3748]"
        >
          {Math.round(displayScore)}%
        </motion.span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A0AEC0] mt-1"
        >
          {label}
        </motion.span>
      </div>
    </div>
  );
};

export default MatchGauge;
