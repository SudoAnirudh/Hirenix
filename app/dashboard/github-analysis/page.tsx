"use client";
import { useState } from "react";
import { analyzeGithub } from "@/lib/api";
import ScoreCard from "@/components/ScoreCard";
import { Github, Search } from "lucide-react";

export default function GitHubAnalysisPage() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  async function handleAnalyze() {
    if (!username.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const data = await analyzeGithub(username.trim());
      setResult(data);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  const metrics = result ? [
    { label: "Consistency",        value: result.metrics.consistency_score },
    { label: "Project Depth",      value: result.metrics.project_depth_score },
    { label: "Stack Diversity",    value: result.metrics.stack_diversity_score },
    { label: "Production Ready",   value: result.metrics.production_readiness_score },
  ] : [];

  return (
    <div className="animate-fade-up max-w-4xl">
      <h1 className="font-display font-bold text-3xl mb-2">GitHub Intelligence</h1>
      <p className="mb-8" style={{ color: "var(--text-secondary)" }}>Analyse any GitHub profile and compute a GitHub Performance Index (GPI).</p>

      <div className="glass-card p-6 mb-8">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Github size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
            <input id="github-username" className="input-base pl-9" placeholder="GitHub username" value={username} onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAnalyze()} />
          </div>
          <button id="github-analyze-btn" className="btn-primary flex items-center gap-2" onClick={handleAnalyze} disabled={loading}>
            <Search size={14} /> {loading ? "Analysing…" : "Analyse"}
          </button>
        </div>
        {error && <p className="text-sm mt-3" style={{ color: "#f87171" }}>{error}</p>}
        <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>⚠ GitHub deep analysis requires a Pro plan.</p>
      </div>

      {result && (
        <div className="animate-fade-up space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ScoreCard title="GPI Score" score={result.gpi_score} subtitle="GitHub Performance Index" />

            {/* Languages */}
            <div className="glass-card p-6 md:col-span-2">
              <h3 className="font-semibold text-sm mb-3">Tech Stack</h3>
              <div className="flex flex-wrap gap-2">
                {result.metrics.languages.map((lang: string) => (
                  <span key={lang} className="px-2 py-1 rounded text-xs font-medium" style={{ background: "rgba(139,92,246,0.15)", color: "var(--violet)" }}>{lang}</span>
                ))}
              </div>
              <div className="flex gap-6 mt-4">
                <div><div className="text-xl font-bold gradient-text">{result.metrics.total_repos}</div><div className="text-xs" style={{ color: "var(--text-secondary)" }}>Repositories</div></div>
                <div><div className="text-xl font-bold gradient-text">{result.metrics.total_stars}</div><div className="text-xs" style={{ color: "var(--text-secondary)" }}>Total Stars</div></div>
              </div>
            </div>
          </div>

          {/* 4 Metric bars */}
          <div className="glass-card p-6">
            <h3 className="font-semibold text-sm mb-4">GPI Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {metrics.map(({ label, value }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: "var(--text-secondary)" }}>{label}</span>
                    <span className="font-medium">{Math.round(value)}%</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: "var(--bg-elevated)" }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, background: "linear-gradient(90deg, var(--violet), var(--cyan))" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths + Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--emerald)" }}>Strengths</h3>
              {result.strengths.map((s: string, i: number) => <p key={i} className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>✓ {s}</p>)}
            </div>
            <div className="glass-card p-6">
              <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--indigo)" }}>Recommendations</h3>
              {result.recommendations.map((r: string, i: number) => <p key={i} className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>→ {r}</p>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
