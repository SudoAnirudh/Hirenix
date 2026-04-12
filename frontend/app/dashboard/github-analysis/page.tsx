"use client";
import { useState } from "react";
import { analyzeGithub } from "@/lib/api";
import ScoreCard from "@/components/ScoreCard";
import { Github, Search } from "lucide-react";
import ImpactStoryteller from "@/components/github/ImpactStoryteller";

interface AnalysisResult {
  gpi_score: number;
  metrics: {
    consistency_score: number;
    project_depth_score: number;
    stack_diversity_score: number;
    production_readiness_score: number;
    languages: string[];
    language_distribution: Record<string, number>;
    total_repos: number;
    total_stars: number;
    ai_summary?: string;
    top_repos: {
      name: string;
      description?: string;
      language?: string;
      stars: number;
      forks: number;
      commits_last_90_days: number;
    }[];
  };
  strengths: string[];
  recommendations: string[];
}

export default function GitHubAnalysisPage() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");

  async function handleAnalyze() {
    if (!username.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await analyzeGithub(username.trim());
      setResult(data as AnalysisResult);
    } catch (e: unknown) {
      // Improved error message for user
      const msg =
        e instanceof Error ? e.message : "An unexpected error occurred";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const gpiMetrics = result
    ? [
        { label: "Consistency", value: result.metrics.consistency_score },
        { label: "Project Depth", value: result.metrics.project_depth_score },
        {
          label: "Stack Diversity",
          value: result.metrics.stack_diversity_score,
        },
        {
          label: "Production Ready",
          value: result.metrics.production_readiness_score,
        },
      ]
    : [];

  return (
    <div className="animate-fade-up w-full max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-4xl mb-2">
            GitHub Intelligence
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Deep forensic analysis of GitHub profiles using AI and GPI metrics.
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-widest font-bold opacity-50 mb-1">
            Status
          </p>
          <div className="flex items-center gap-2 text-sm font-medium">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            AI Service Online
          </div>
        </div>
      </div>

      <div className="glass-card p-8 mb-8 border-violet/20 border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Github
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-violet"
            />
            <input
              id="github-username"
              className="input-base pl-12 h-12 text-lg bg-white/5"
              placeholder="Enter GitHub username (e.g. SudoAnirudh)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            />
          </div>
          <button
            id="github-analyze-btn"
            className="btn-primary px-8 h-12 flex items-center justify-center gap-3 font-semibold text-lg"
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analysing...
              </>
            ) : (
              <>
                <Search size={20} /> Full Analysis
              </>
            )}
          </button>
        </div>
        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex gap-3 items-center">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            {error}
          </div>
        )}
      </div>

      {result && (
        <div className="animate-fade-up space-y-8 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Score Card */}
            <div className="lg:col-span-4 h-full">
              <ScoreCard
                title="GPI Score"
                score={result.gpi_score}
                subtitle="GitHub Performance Index"
              />
            </div>

            {/* AI Deep Dive */}
            <div className="lg:col-span-8 glass-card p-8 relative overflow-hidden group border-violet/10 border">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Github size={120} />
              </div>
              <h3 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
                <span className="text-violet">✦</span> AI Technical Deep Dive
              </h3>
              <p
                className="text-lg leading-relaxed relative z-10"
                style={{ color: "var(--text-secondary)" }}
              >
                {result.metrics.ai_summary ||
                  "Analyzing contribution patterns..."}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {result.metrics.languages.slice(0, 4).map((lang) => (
                  <div
                    key={lang}
                    className="px-3 py-1.5 rounded-full bg-violet/10 text-violet text-xs font-bold border border-violet/20"
                  >
                    {lang.toUpperCase()} EXPERT
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* New Impact Storyteller Section */}
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <ImpactStoryteller repos={result.metrics.top_repos} />
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Lang Breakdown */}
            <div className="glass-card p-8 border-cyan/10 border">
              <h3 className="font-bold text-sm uppercase tracking-wider mb-6 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan" /> Tech Stack
                Distribution
              </h3>
              <div className="space-y-6">
                {Object.entries(result.metrics.language_distribution || {})
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 6)
                  .map(([lang, pct]) => (
                    <div key={lang}>
                      <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-tighter">
                        <span className="opacity-70">{lang}</span>
                        <span>{Math.round(pct)}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-linear-to-r from-violet to-cyan transition-all duration-1000 ease-out"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* GPI Details */}
            <div className="glass-card p-8 border-violet/10 border">
              <h3 className="font-bold text-sm uppercase tracking-wider mb-6 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-violet" /> GPI
                Component Breakdown
              </h3>
              <div className="grid grid-cols-1 gap-6">
                {gpiMetrics.map(({ label, value }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-tighter">
                      <span className="opacity-70">{label}</span>
                      <span>{Math.round(value)}%</span>
                    </div>
                    <div className="h-4 rounded bg-white/5 p-1">
                      <div
                        className="h-full rounded-sm bg-violet transition-all duration-1000 ease-out flex items-center px-2 text-[8px] text-white font-black overflow-hidden"
                        style={{ width: `${value}%` }}
                      >
                        {value > 20 && "PERFORMANCE UNIT"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Repos */}
          <div className="glass-card p-8 border-white/5 border">
            <h3 className="font-display font-bold text-xl mb-6">
              Flagship Repositories
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(result.metrics.top_repos || []).map((repo) => (
                <div
                  key={repo.name}
                  className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-violet/30 transition-all group"
                >
                  <h4 className="font-bold text-lg mb-2 group-hover:text-violet transition-colors truncate">
                    {repo.name}
                  </h4>
                  <p className="text-sm line-clamp-2 h-10 mb-4 opacity-60 leading-snug">
                    {repo.description || "No description provided."}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase opacity-40">
                        Stars
                      </p>
                      <p className="font-bold text-violet">{repo.stars}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase opacity-40">
                        Recent Commits
                      </p>
                      <p className="font-bold text-cyan">
                        {repo.commits_last_90_days}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 uppercase tracking-widest">
                      {repo.language || "Unknown"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-card p-8 border-emerald-500/10 border bg-emerald-500/2">
              <h3 className="font-bold text-sm uppercase tracking-wider mb-6 flex items-center gap-2 text-emerald-400">
                Strategic Strengths
              </h3>
              <div className="space-y-4">
                {result.strengths.map((s, i) => (
                  <div
                    key={i}
                    className="flex gap-3 text-sm leading-relaxed opacity-80"
                  >
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    {s}
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card p-8 border-amber-500/10 border bg-amber-500/2">
              <h3 className="font-bold text-sm uppercase tracking-wider mb-6 flex items-center gap-2 text-amber-400">
                Actionable Recommendations
              </h3>
              <div className="space-y-4">
                {result.recommendations.map((r, i) => (
                  <div
                    key={i}
                    className="flex gap-3 text-sm leading-relaxed opacity-80"
                  >
                    <div className="mt-1 w-4 h-4 rounded bg-amber-500/20 text-amber-500 flex items-center justify-center text-[10px] shrink-0 font-bold">
                      →
                    </div>
                    {r}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
