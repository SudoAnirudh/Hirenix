"use client";
import { useState } from "react";
import { matchJob } from "@/lib/api";
import ScoreCard from "@/components/ScoreCard";
import SkillGapList from "@/components/SkillGapList";

const ROLES = ["Software Engineer", "Frontend Engineer", "Backend Engineer", "Full Stack Engineer", "Data Scientist", "Data Engineer", "ML Engineer", "DevOps Engineer"];

export default function JobMatchPage() {
  const [resumeId, setResumeId] = useState("");
  const [jdText, setJdText] = useState("");
  const [role, setRole] = useState(ROLES[0]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  async function handleMatch() {
    if (!resumeId || !jdText) return;
    setLoading(true); setError(""); setResult(null);
    try { setResult(await matchJob(resumeId, jdText, role)); }
    catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="animate-fade-up max-w-4xl">
      <h1 className="font-display font-bold text-3xl mb-2">Job Description Matching</h1>
      <p className="mb-8" style={{ color: "var(--text-secondary)" }}>Paste a job description to get a match score and skill gap analysis.</p>

      <div className="glass-card p-6 mb-8 flex flex-col gap-4">
        <div>
          <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>Resume ID</label>
          <input id="jm-resume-id" className="input-base" placeholder="Paste your resume ID from the analysis page" value={resumeId} onChange={e => setResumeId(e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>Target Role</label>
          <select id="jm-role" className="input-base" value={role} onChange={e => setRole(e.target.value)} style={{ cursor: "pointer" }}>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>Job Description</label>
          <textarea id="jm-jd-text" className="input-base min-h-[140px] resize-y" placeholder="Paste the full job description here…" value={jdText} onChange={e => setJdText(e.target.value)} />
        </div>
        {error && <p className="text-sm" style={{ color: "#f87171" }}>{error}</p>}
        <button id="jm-match-btn" className="btn-primary self-start" onClick={handleMatch} disabled={loading || !resumeId || !jdText}>
          {loading ? "Matching…" : "Analyse Match"}
        </button>
      </div>

      {result && (
        <div className="animate-fade-up space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ScoreCard title="Match Score" score={result.match_score} subtitle={`vs ${role}`} />
            <ScoreCard title="Semantic Similarity" score={result.semantic_similarity} subtitle="Embedding cosine similarity" />
          </div>
          <SkillGapList skillGap={result.skill_gap} />
          <div className="glass-card p-6">
            <h3 className="font-semibold text-sm mb-3">Recommendations</h3>
            {result.recommendations.map((r: string, i: number) => (
              <p key={i} className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>→ {r}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
