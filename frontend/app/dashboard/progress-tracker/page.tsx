"use client";
import { useEffect, useState } from "react";
import { getProgress } from "@/lib/api";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function ProgressTrackerPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProgress().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  const evolutionScore = data?.resume_evolution_score;
  const scoreColor = evolutionScore >= 75 ? "var(--emerald)" : evolutionScore >= 50 ? "var(--indigo)" : "var(--pink)";

  return (
    <div className="animate-fade-up max-w-4xl">
      <h1 className="font-display font-bold text-3xl mb-2">Progress Tracker</h1>
      <p className="mb-8" style={{ color: "var(--text-secondary)" }}>Track your career improvement over time via the Resume Evolution Score.</p>

      {loading && <div className="glass-card p-10 text-center" style={{ color: "var(--text-secondary)" }}>Loading your progress…</div>}

      {data && (
        <div className="space-y-6">
          {/* Evolution Score */}
          <div className="glass-card p-8 flex flex-col items-center text-center">
            <div className="text-6xl font-display font-bold mb-2" style={{ color: scoreColor }}>
              {evolutionScore !== null ? `${evolutionScore}` : "—"}
            </div>
            <div className="font-semibold text-lg mb-1">Resume Evolution Score</div>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Weighted composite: 40% ATS · 40% Interview · 20% GPI</p>
          </div>

          {/* ATS Trend */}
          {data.ats_trend?.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="font-semibold text-sm mb-4">ATS Score Trend</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data.ats_trend.map((p: any, i: number) => ({ name: `#${i+1}`, score: p.score }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "10px", fontSize: "12px" }} />
                  <Line type="monotone" dataKey="score" stroke="var(--indigo)" strokeWidth={2} dot={{ fill: "var(--indigo)", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Interview Trend */}
          {data.interview_trend?.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="font-semibold text-sm mb-4">Interview Score Trend</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data.interview_trend.map((p: any, i: number) => ({ name: `#${i+1}`, score: p.score }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "10px", fontSize: "12px" }} />
                  <Line type="monotone" dataKey="score" stroke="var(--violet)" strokeWidth={2} dot={{ fill: "var(--violet)", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {data.ats_trend?.length === 0 && data.interview_trend?.length === 0 && (
            <div className="glass-card p-10 text-center" style={{ color: "var(--text-secondary)" }}>
              No history yet. Upload a resume and complete an interview to see your trends.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
