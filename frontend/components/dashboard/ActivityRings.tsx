"use client";

import { motion } from "framer-motion";

export interface RingData {
  name: string;
  score: number;
  color: string;
}

interface ActivityRingsProps {
  metrics: RingData[];
  size?: number;
  strokeWidth?: number;
}

export default function ActivityRings({
  metrics,
  size = 200,
  strokeWidth = 14,
}: ActivityRingsProps) {
  const center = size / 2;
  // Gap between rings
  const gap = 4;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <defs>
          <filter
            id="activity-glow"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        {metrics.map((metric, index) => {
          // outer ring starts near the edge
          const radius = center - strokeWidth / 2 - index * (strokeWidth + gap);
          const circumference = 2 * Math.PI * radius;
          // Safeguard the score between 0 and 100
          const clampedScore = Math.min(Math.max(metric.score, 0), 100);
          const targetOffset =
            circumference - (circumference * clampedScore) / 100;

          return (
            <g key={metric.name}>
              {/* Background Track */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={metric.color}
                strokeWidth={strokeWidth}
                opacity={0.15}
              />
              {/* Animated Progress Ring */}
              <motion.circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={metric.color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: targetOffset }}
                transition={{
                  duration: 1.5,
                  delay: index * 0.15,
                  ease: "easeOut",
                }}
                style={{ filter: "url(#activity-glow)" }}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
