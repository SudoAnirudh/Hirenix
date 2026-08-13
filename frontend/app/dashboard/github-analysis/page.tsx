"use client";
import { useState } from "react";
import { analyzeGithub } from "@/lib/api";
import ScoreCard from "@/components/ScoreCard";
import {
  Github,
  Search,
  CheckCircle2,
  Filter,
  Flame,
  Activity,
  Code2,
  GitCommit,
  Users,
  Clock,
  ShieldCheck,
  PackageCheck,
  GitBranch,
  Star,
  GitFork,
  ExternalLink,
} from "lucide-react";
import ImpactStoryteller from "@/components/github/ImpactStoryteller";

interface Repo {
  name: string;
  description?: string;
  language?: string;
  stars: number;
  forks: number;
  commits_last_90_days: number;
  is_fork: boolean;
  has_tests: boolean;
  dependency_health_score: number;
  maintenance_lifespan_days: number;
  semantic_commit_ratio: number;
  atomic_commit_ratio: number;
  uses_branches: boolean;
}

interface AnalysisResult {
  gpi_score: number;
  metrics: {
    code_quality_score: number;
    git_hygiene_score: number;
    collaboration_score: number;
    longevity_impact_score: number;

    original_repos_count: number;
    total_repos_scanned: number;
    stack_focus_score: number;
    testing_density_score: number;
    dependency_health_score: number;
    semantic_commit_ratio: number;
    atomic_commit_ratio: number;
    branching_hygiene_score: number;
    pr_description_quality_score: number;
    external_contributions_count: number;
    avg_maintenance_lifespan_days: number;

    languages: string[];
    language_distribution: Record<string, number>;
    total_repos: number;
    total_stars: number;
    ai_summary?: string;
    top_repos: Repo[];
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
      const msg =
        e instanceof Error ? e.message : "An unexpected error occurred";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const categoryMetrics = result
    ? [
        {
          label: "Code Quality & Architecture",
          value: result.metrics.code_quality_score,
          icon: Code2,
          color: "from-cyan-500 to-blue-500",
          details: `Testing Density: ${Math.round(result.metrics.testing_density_score)}% • Dep Health: ${Math.round(result.metrics.dependency_health_score)}/100`,
        },
        {
          label: "Workflow & Git Hygiene",
          value: result.metrics.git_hygiene_score,
          icon: GitCommit,
          color: "from-violet-500 to-purple-500",
          details: `Semantic Commits: ${Math.round(result.metrics.semantic_commit_ratio)}% • Atomic Granularity: ${Math.round(result.metrics.atomic_commit_ratio)}%`,
        },
        {
          label: "Open Source & Collaboration",
          value: result.metrics.collaboration_score,
          icon: Users,
          color: "from-emerald-500 to-teal-500",
          details: `External Contribs: ${result.metrics.external_contributions_count} repos • PR Desc Quality: ${Math.round(result.metrics.pr_description_quality_score)}/100`,
        },
        {
          label: "Project Longevity & Impact",
          value: result.metrics.longevity_impact_score,
          icon: Clock,
          color: "from-amber-500 to-orange-500",
          details: `Avg Lifespan: ${result.metrics.avg_maintenance_lifespan_days} days • Original Stars: ${result.metrics.total_stars}`,
        },
      ]
    : [];

  return (
    <div className="animate-fade-up w-full max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20 uppercase tracking-widest">
              Forensic Framework v2.0
            </span>
          </div>
          <h1 className="font-display font-bold text-4xl mb-2">
            GitHub Intelligence Engine
          </h1>
          <p
            style={{ color: "var(--text-secondary)" }}
            className="max-w-2xl text-sm leading-relaxed"
          >
            Anti-gaming technical audit isolating original work, flagship
            repository depth, git hygiene, test density, and project longevity.
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs uppercase tracking-widest font-bold opacity-50 mb-1">
            Engine Status
          </p>
          <div className="flex items-center gap-2 text-sm font-medium">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            4-Category Audit Active
          </div>
        </div>
      </div>

      {/* Username Search Input */}
      <div className="glass-card p-6 md:p-8 border-violet-500/20 border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Github
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400"
            />
            <input
              id="github-username"
              className="input-base pl-12 h-14 text-lg bg-white/5 border border-white/10 rounded-xl focus:border-violet-500 focus:ring-1 focus:ring-violet-500 w-full"
              placeholder="Enter GitHub username (e.g. SudoAnirudh)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            />
          </div>
          <button
            id="github-analyze-btn"
            className="btn-primary px-8 h-14 flex items-center justify-center gap-3 font-semibold text-lg shrink-0 rounded-xl"
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Auditing Profile...
              </>
            ) : (
              <>
                <Search size={20} /> Perform Forensic Audit
              </>
            )}
          </button>
        </div>
        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex gap-3 items-center">
            <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
            {error}
          </div>
        )}
      </div>

      {result && (
        <div className="animate-fade-up space-y-8 pb-20">
          {/* 3-Step Pipeline Status Banner */}
          <div className="glass-card p-6 border-cyan-500/20 border bg-cyan-500/5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-4 flex items-center gap-2">
              <Filter size={14} /> 3-Step Analysis Pipeline Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                    Isolated Original Work{" "}
                    <CheckCircle2 size={14} className="text-emerald-400" />
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Filtered out forks. Analyzed{" "}
                    {result.metrics.original_repos_count} original repos owned
                    by{" "}
                    {result.metrics.total_repos_scanned > 0
                      ? "user"
                      : "profile"}
                    .
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-500/20 text-violet-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                    Identified Flagship Repos{" "}
                    <Flame size={14} className="text-violet-400" />
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Focused 80% evaluation on top{" "}
                    {Math.min(3, result.metrics.top_repos.length)} flagship
                    repos by stars, forks, and size.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                    90-Day Activity Audit{" "}
                    <Activity size={14} className="text-cyan-400" />
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Audited pushes, PR reviews, PR description quality, and
                    external OS contributions.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Level Score + AI Forensic Deep Dive */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 h-full">
              <ScoreCard
                title="GPI Score"
                score={result.gpi_score}
                subtitle="GitHub Performance Index (Weighted 4-Category Audit)"
              />
            </div>

            <div className="lg:col-span-8 glass-card p-8 relative overflow-hidden group border-violet-500/10 border flex flex-col justify-between">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Github size={140} />
              </div>
              <div>
                <h3 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
                  <span className="text-violet-400">✦</span> AI Forensic
                  Assessment
                </h3>
                <p className="text-base md:text-lg leading-relaxed relative z-10 text-slate-300">
                  {result.metrics.ai_summary ||
                    "Performing forensic analysis..."}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-white/5">
                <div className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold border border-cyan-500/20">
                  {result.metrics.original_repos_count} ORIGINAL REPOS
                </div>
                <div className="px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 text-xs font-bold border border-violet-500/20">
                  {result.metrics.avg_maintenance_lifespan_days}d AVG LIFESPAN
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                  {result.metrics.external_contributions_count} EXTERNAL
                  CONTRIBS
                </div>
              </div>
            </div>
          </div>

          {/* 4 Core Metric Categories Cards */}
          <div>
            <h3 className="font-display font-bold text-2xl mb-6 flex items-center gap-3">
              <ShieldCheck className="text-violet-400" size={24} /> 4 Core
              Evaluation Metric Categories
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categoryMetrics.map((cat) => {
                const IconComponent = cat.icon;
                return (
                  <div
                    key={cat.label}
                    className="glass-card p-6 border-white/10 border relative overflow-hidden group hover:border-violet-500/30 transition-all"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2.5 rounded-xl bg-linear-to-br ${cat.color} text-white shadow-lg`}
                        >
                          <IconComponent size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-base text-white">
                            {cat.label}
                          </h4>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {cat.details}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black font-display text-white">
                          {Math.round(cat.value)}
                        </span>
                        <span className="text-xs text-slate-400">/100</span>
                      </div>
                    </div>

                    <div className="h-2 rounded-full bg-white/5 overflow-hidden mt-4">
                      <div
                        className={`h-full rounded-full bg-linear-to-r ${cat.color} transition-all duration-1000 ease-out`}
                        style={{
                          width: `${Math.min(100, Math.max(5, cat.value))}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Impact Storyteller Component */}
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <ImpactStoryteller repos={result.metrics.top_repos} />
          </section>

          {/* Flagship Repositories Grid */}
          <div className="glass-card p-8 border-white/10 border">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-display font-bold text-2xl">
                  Flagship Repositories (Original Work)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Deep inspection of testing density, dependency health,
                  maintenance lifespan, and git hygiene.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                Top {result.metrics.top_repos.length} Repos
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(result.metrics.top_repos || []).map((repo) => (
                <div
                  key={repo.name}
                  className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-violet-500/30 transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h4 className="font-bold text-lg text-white group-hover:text-violet-400 transition-colors truncate flex items-center gap-2">
                        {repo.name}
                      </h4>
                      {repo.is_fork && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 shrink-0">
                          FORK
                        </span>
                      )}
                    </div>
                    <p className="text-xs line-clamp-2 h-8 text-slate-400 leading-relaxed mb-4">
                      {repo.description || "No project description available."}
                    </p>

                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                          <Star size={10} className="text-amber-400" /> Stars /
                          Forks
                        </span>
                        <span className="font-bold text-white mt-0.5 block">
                          {repo.stars} ★ / {repo.forks}{" "}
                          <GitFork size={10} className="inline ml-0.5" />
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                          <Clock size={10} className="text-cyan-400" /> Lifespan
                        </span>
                        <span className="font-bold text-cyan-400 mt-0.5 block">
                          {repo.maintenance_lifespan_days} days
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                          <ShieldCheck
                            size={12}
                            className={
                              repo.has_tests
                                ? "text-emerald-400"
                                : "text-slate-500"
                            }
                          />
                          Tests Suite:
                        </span>
                        <span
                          className={`font-bold text-[11px] ${repo.has_tests ? "text-emerald-400" : "text-amber-400"}`}
                        >
                          {repo.has_tests ? "Detected" : "None"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                          <PackageCheck size={12} className="text-blue-400" />
                          Dep Health:
                        </span>
                        <span className="font-bold text-blue-400 text-[11px]">
                          {Math.round(repo.dependency_health_score)}/100
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                          <GitBranch size={12} className="text-violet-400" />
                          Semantic Commits:
                        </span>
                        <span className="font-bold text-violet-400 text-[11px]">
                          {Math.round(repo.semantic_commit_ratio)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-white/10 text-slate-300 uppercase tracking-wider">
                      {repo.language || "Multi-stack"}
                    </span>
                    <a
                      href={`https://github.com/${username}/${repo.name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1 transition-colors"
                    >
                      Repo <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strategic Strengths & Actionable Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-card p-8 border-emerald-500/20 border bg-emerald-500/5">
              <h3 className="font-bold text-sm uppercase tracking-wider mb-6 flex items-center gap-2 text-emerald-400">
                <CheckCircle2 size={16} /> Forensic Engineering Strengths
              </h3>
              <div className="space-y-4">
                {result.strengths.map((s, i) => (
                  <div
                    key={i}
                    className="flex gap-3 text-sm leading-relaxed text-slate-300"
                  >
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    {s}
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-8 border-amber-500/20 border bg-amber-500/5">
              <h3 className="font-bold text-sm uppercase tracking-wider mb-6 flex items-center gap-2 text-amber-400">
                Actionable Engineering Recommendations
              </h3>
              <div className="space-y-4">
                {result.recommendations.map((r, i) => (
                  <div
                    key={i}
                    className="flex gap-3 text-sm leading-relaxed text-slate-300"
                  >
                    <div className="mt-1 w-4 h-4 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] shrink-0 font-bold">
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
