"use client";
import { RadarChart as RechartsRadar, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis } from "recharts";

interface Props {
  data: { subject: string; value: number }[];
  title?: string;
}

export default function RadarChart({ data, title }: Props) {
  return (
    <div className="glass-card p-6">
      {title && <h3 className="font-semibold text-sm mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={280}>
        <RechartsRadar data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="rgba(255,255,255,0.08)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--text-secondary)", fontSize: 11 }} />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Score"
            dataKey="value"
            stroke="var(--indigo)"
            fill="var(--indigo)"
            fillOpacity={0.2}
            strokeWidth={2}
            dot={{ fill: "var(--indigo)", r: 3 }}
          />
        </RechartsRadar>
      </ResponsiveContainer>
    </div>
  );
}
