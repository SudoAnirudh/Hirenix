"use client";
import { useState } from "react";
import ResumeUploader from "@/components/ResumeUploader";
import ScoreCard from "@/components/ScoreCard";
import SkillGapList from "@/components/SkillGapList";

export default function ResumeAnalysisPage() {
  const [result, setResult] = useState<any>(null);

  return (
    <div className="animate-fade-up max-w-4xl">
      <h1 className="font-display font-bold text-3xl mb-2">Resume Analysis</h1>
      <p className="mb-8" style={{ color: "var(--text-secondary)" }}>Upload your resume to get an ATS score and actionable improvement tips.</p>

      <ResumeUploader onResult={setResult} />

      {result && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-up">
          <ScoreCard title="ATS Score" score={result.ats_score} subtitle="Overall ATS compatibility" />

          {/* Breakdown */}
          <div className="glass-card p-6 flex flex-col gap-3">
            <h3 className="font-semibold text-sm mb-2">Score Breakdown</h3>
            {result.ats_breakdown && Object.entries(result.ats_breakdown)
              .filter(([k]) => k !== "final_ats_score")
              .map(([key, val]: any) => (
                <div key={key} className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs">
                    <span style={{ color: "var(--text-secondary)" }}>{key.replace(/_/g, " ")}</span>
                    <span>{Math.round(val)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-elevated)" }}>
                    <div className="h-full rounded-full" style={{ width: `${val}%`, background: "linear-gradient(90deg, var(--indigo), var(--violet))" }} />
                  </div>
                </div>
              ))}
          </div>

          {/* Sections found */}
          <div className="glass-card p-6">
            <h3 className="font-semibold text-sm mb-3">Sections Detected ({result.sections?.length ?? 0})</h3>
            <div className="flex flex-wrap gap-2">
              {result.sections?.map((s: any) => (
                <span key={s.section_type} className="px-2 py-1 rounded text-xs font-medium" style={{ background: "rgba(99,102,241,0.15)", color: "var(--indigo)" }}>
                  {s.section_type}
                </span>
              ))}
            </div>
          </div>

          {/* Feedback */}
          <div className="glass-card p-6">
            <h3 className="font-semibold text-sm mb-3">Improvement Tips</h3>
            <ul className="flex flex-col gap-2">
              {result.feedback?.map((tip: string, i: number) => (
                <li key={i} className="flex gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                  <span style={{ color: "var(--indigo)" }}>→</span> {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
