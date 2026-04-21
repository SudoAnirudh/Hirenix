"use client";
import {
  RadarChart as RechartsRadar,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  PolarRadiusAxis,
} from "recharts";

interface Props {
  data: { subject: string; value: number }[];
  title?: string;
}

export default function RadarChart({ data, title }: Props) {
  return (
    <div className="glass-card p-8 rounded-[2rem] border-0 bg-white/70 shadow-xl shadow-indigo-500/5 h-full transition-all duration-500">
      {title && (
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#718096]">
            Skills Analysis
          </h3>
          <div className="h-px flex-1 bg-slate-200/50 ml-4"></div>
        </div>
      )}
      <div className="relative">
        <ResponsiveContainer width="100%" height={320}>
          <RechartsRadar data={data} cx="50%" cy="50%" outerRadius="80%">
            <PolarGrid stroke="#E2E8F0" strokeWidth={1} />
            <PolarAngleAxis
              dataKey="subject"
              tick={{
                fill: "#64748B",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.05em",
              }}
            />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="Score"
              dataKey="value"
              stroke="#4F46E5"
              fill="#4F46E5"
              fillOpacity={0.15}
              strokeWidth={2.5}
              dot={{
                fill: "#4F46E5",
                r: 4,
                strokeWidth: 2,
                stroke: "#fff",
              }}
              activeDot={{
                r: 6,
                strokeWidth: 0,
                fill: "#4F46E5",
              }}
            />
          </RechartsRadar>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
