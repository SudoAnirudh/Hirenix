"use client";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

interface CareerPulseChartProps {
  data: {
    subject: string;
    A: number;
    fullMark: number;
  }[];
}

export default function CareerPulseChart({ data }: CareerPulseChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full h-full flex items-center justify-center min-h-[300px]"
    >
      <ResponsiveContainer width="100%" height={350}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <defs>
            <linearGradient id="radarGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#a855f7" stopOpacity={0.1} />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <PolarGrid
            stroke="#e2e8f0"
            strokeDasharray="3 3"
            className="dark:stroke-slate-700"
          />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          <Radar
            name="Skills"
            dataKey="A"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#radarGradient)"
            fillOpacity={1}
            animationBegin={500}
            animationDuration={1500}
            style={{ filter: "url(#glow)" }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
