"use client";
import { useState } from "react";
import ResumeUploader from "@/components/ResumeUploader";
import ScoreCard from "@/components/ScoreCard";

interface Section {
  section_type: string;
}

interface AnalysisResult {
  resume_id?: string;
  ats_score: number;
  ats_breakdown: Record<string, number>;
  sections: Section[];
  feedback: string[];
}

export default function ResumeAnalysisPage() {
  const [result, setResult] = useState<AnalysisResult | null>(() => {
    if (typeof window === "undefined") return null;
    const latest = localStorage.getItem("latest_resume");
    if (!latest) return null;
    try {
      return JSON.parse(latest) as AnalysisResult;
    } catch {
      return null;
    }
  });

  return (
    <div className="animate-fade-up max-w-4xl">
      <h1 className="font-display font-bold text-4xl mb-3 text-[#2D3748] tracking-tight">
        Resume Analysis
      </h1>
      <p className="mb-10 text-lg font-medium text-[#718096]">
        Upload your resume to get an ATS score and actionable improvement tips.
      </p>

      <ResumeUploader
        onResult={(res) => {
          const parsed = res as AnalysisResult;
          setResult(parsed);
          localStorage.setItem("latest_resume", JSON.stringify(parsed));
        }}
      />

      {result && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-up">
          <ScoreCard
            title="ATS Score"
            score={result.ats_score}
            subtitle="Overall ATS compatibility"
          />
          <div className="glass-card p-8 flex flex-col justify-center rounded-[32px] border border-white/60 bg-white/40 shadow-glass">
            <h3 className="font-display font-bold text-xs uppercase tracking-widest text-[#A0AEC0] mb-3">
              Resume ID
            </h3>
            <p className="text-sm font-mono font-bold text-[#2D3748] break-all">
              {result.resume_id ?? "Not available"}
            </p>
            <p className="text-xs mt-4 font-medium text-[#718096]">
              Use this ID for JD matching if you choose the Resume ID workflow.
            </p>
          </div>

          {/* Breakdown */}
          <div className="glass-card p-8 flex flex-col gap-5 rounded-[40px] border border-white/60 bg-white/40 shadow-glass">
            <h3 className="font-display font-bold text-xs uppercase tracking-widest text-[#A0AEC0] mb-2">
              Score Breakdown
            </h3>
            {result.ats_breakdown &&
              Object.entries(result.ats_breakdown)
                .filter(([k]) => k !== "final_ats_score")
                .map(([key, val]) => (
                  <div key={key} className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-[#718096]">
                      <span>{key.replace(/_/g, " ")}</span>
                      <span className="text-[#2D3748]">{Math.round(val)}%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden bg-slate-200/50 p-[1px]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Number(val)}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-[#7C9ADD] to-[#98C9A3]"
                      />
                    </div>
                  </div>
                ))}
          </div>

          {/* Sections found */}
          <div className="glass-card p-8 rounded-[40px] border border-white/60 bg-white/40 shadow-glass">
            <h3 className="font-display font-bold text-xs uppercase tracking-widest text-[#A0AEC0] mb-5">
              Sections Detected ({result.sections?.length ?? 0})
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {result.sections?.map((s: Section, i: number) => (
                <span
                  key={`${s.section_type}-${i}`}
                  className="px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-white/60 text-[#718096] border border-white shadow-sm backdrop-blur-sm"
                >
                  {s.section_type}
                </span>
              ))}
            </div>
          </div>

          {/* Feedback */}
          <div className="glass-card p-8 rounded-[40px] border border-white/60 bg-white/40 shadow-glass">
            <h3 className="font-display font-bold text-xs uppercase tracking-widest text-[#A0AEC0] mb-5">
              Improvement Tips
            </h3>
            <ul className="flex flex-col gap-4">
              {result.feedback?.map((tip: string, i: number) => (
                <li
                  key={i}
                  className="flex gap-4 text-sm font-medium text-[#718096] leading-relaxed group"
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-[#7C9ADD]/10 text-[#7C9ADD] flex items-center justify-center text-[10px] font-black group-hover:scale-110 transition-transform">
                    {i + 1}
                  </span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
