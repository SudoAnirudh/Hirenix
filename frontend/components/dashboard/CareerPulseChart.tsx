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
          <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
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
            fill="#6366f1"
            fillOpacity={0.3}
            animationBegin={500}
            animationDuration={1500}
          />
        </RadarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
