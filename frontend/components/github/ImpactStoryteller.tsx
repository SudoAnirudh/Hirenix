"use client";
import { Copy, Check, Sparkles, BookOpen } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Repo {
  name: string;
  description?: string;
  language?: string;
  stars: number;
  forks: number;
  commits_last_90_days: number;
}

interface ImpactStorytellerProps {
  repos: Repo[];
}

export default function ImpactStoryteller({ repos }: ImpactStorytellerProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generatePoints = (repo: Repo) => {
    const points = [];

    // Pattern 1: Authority & Scale
    if (repo.stars > 10) {
      points.push(
        `Architected and scaled "${repo.name}" (${repo.language}), achieving a top-tier rating of ${repo.stars} stars through community-driven open source excellence.`,
      );
    } else {
      points.push(
        `Engineered a robust ${repo.language || "software"} ecosystem in "${repo.name}", focusing on modular architecture and production-ready code patterns.`,
      );
    }

    // Pattern 2: Velocity & Impact
    if (repo.commits_last_90_days > 5) {
      points.push(
        `Demonstrated high technical velocity with ${repo.commits_last_90_days} commits in a 90-day window, maintaining feature parity and resolving critical performance bottlenecks.`,
      );
    }

    // Pattern 3: Domain Expertise
    if (repo.description) {
      points.push(
        `Led development of technical solutions for ${repo.description.toLowerCase()}, leveraging ${repo.language} to deliver optimized performance and user value.`,
      );
    }

    return points;
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Impact statement copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-xl bg-violet-500/10 text-violet-500 border border-violet-500/20">
          <Sparkles size={20} />
        </div>
        <div>
          <h3 className="text-xl font-bold font-heading dark:text-white">
            Impact Storyteller™
          </h3>
          <p className="text-xs text-[#64748B]">
            Convert code velocity into resume impact
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {repos.slice(0, 3).map((repo, repoIdx) => (
          <div
            key={repo.name}
            className="glass-card p-6 border-violet-500/10 hover:border-violet-500/30 transition-all group"
          >
            <h4 className="flex items-center gap-2 font-bold text-sm text-violet-500 uppercase tracking-widest mb-4">
              <BookOpen size={14} />
              {repo.name}
            </h4>

            <div className="space-y-4">
              {generatePoints(repo).map((point, pointIdx) => {
                const globalIdx = repoIdx * 10 + pointIdx;
                return (
                  <div key={pointIdx} className="relative group/point">
                    <p className="text-sm leading-relaxed text-[#64748B] dark:text-slate-300 pr-10">
                      • {point}
                    </p>
                    <button
                      onClick={() => copyToClipboard(point, globalIdx)}
                      className="absolute right-0 top-0 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 opacity-0 group-hover/point:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 items-center justify-center transition-all hover:scale-105"
                      aria-label={copiedIndex === globalIdx ? "Copied" : "Copy impact statement"}
                      title={copiedIndex === globalIdx ? "Copied" : "Copy impact statement"}
                    >
                      {copiedIndex === globalIdx ? (
                        <Check size={14} className="text-emerald-500" />
                      ) : (
                        <Copy
                          size={14}
                          className="text-slate-400 group-hover:text-indigo-500"
                        />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
