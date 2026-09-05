"use client";

import React, { useState } from "react";
import {
  Github,
  GitBranch,
  Star,
  GitFork,
  Code2,
  CheckCircle2,
  FileCode,
  ShieldAlert,
  ArrowUpRight,
  RefreshCw,
  ExternalLink,
  BookOpen,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function GitHubIntelligencePage() {
  const [syncing, setSyncing] = useState(false);

  const githubMetrics = {
    username: "sudo-anirudh",
    gpiScore: 82,
    syncDate: "2026-09-02 14:20 UTC",
    metrics: [
      {
        name: "Engineering Quality",
        score: 85,
        status: "Strong",
        detail: "Clean modular code structure and test presence.",
      },
      {
        name: "Stack Diversity",
        score: 88,
        status: "High",
        detail: "TypeScript, Python, Go, SQL, Docker.",
      },
      {
        name: "Project Depth",
        score: 80,
        status: "Strong",
        detail: "Multi-service backend monorepos and CLI tools.",
      },
      {
        name: "Documentation Signal",
        score: 75,
        status: "Moderate",
        detail: "README files present with setup & architecture guides.",
      },
    ],
    repositories: [
      {
        name: "Hirenix",
        language: "TypeScript / Python",
        stars: 42,
        forks: 8,
        depth: "High",
        impact: "High",
        docSignal: "Excellent (Architecture + OpenAPI)",
        commitHygiene: "94% structured commits",
        url: "https://github.com/sudo-anirudh/Hirenix",
      },
      {
        name: "VectorStore-Engine",
        language: "Python",
        stars: 128,
        forks: 34,
        depth: "High",
        impact: "High",
        docSignal: "Good (Benchmarks included)",
        commitHygiene: "89% structured commits",
        url: "https://github.com/sudo-anirudh/VectorStore-Engine",
      },
      {
        name: "KubeDeploy-CLI",
        language: "Go",
        stars: 19,
        forks: 3,
        depth: "Medium",
        impact: "Medium",
        docSignal: "Moderate",
        commitHygiene: "82% structured commits",
        url: "https://github.com/sudo-anirudh/KubeDeploy-CLI",
      },
    ],
  };

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-xl bg-card border border-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-primary uppercase tracking-wider">
            <Github size={14} /> Engineering Intelligence
          </div>
          <h1 className="text-2xl font-bold font-heading text-foreground mt-1">
            GitHub Production Index (GPI)
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Evaluating repository quality, commit frequency, documentation
            signals, and code architecture depth.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={syncing}
          >
            <RefreshCw
              size={14}
              className={`mr-1.5 ${syncing ? "animate-spin" : ""}`}
            />
            {syncing ? "Syncing Repositories..." : "Sync GitHub Data"}
          </Button>
        </div>
      </div>

      {/* Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GPI Score Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Production Index Score
            </CardTitle>
            <div className="flex items-baseline gap-3 mt-2">
              <span className="text-5xl font-extrabold font-mono text-foreground">
                {githubMetrics.gpiScore}
              </span>
              <span className="text-xs text-muted-foreground">/ 100 GPI</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-muted/60 border border-border text-[11px] font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">GitHub Handle:</span>
                <span className="font-bold text-foreground">
                  @{githubMetrics.username}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Audited:</span>
                <span className="text-foreground">
                  {githubMetrics.syncDate}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="font-mono text-[10px] font-bold uppercase text-muted-foreground">
                Metric Evaluation
              </div>
              {githubMetrics.metrics.map((m) => (
                <div
                  key={m.name}
                  className="p-3 rounded-lg border border-border bg-card space-y-1"
                >
                  <div className="flex justify-between font-semibold">
                    <span className="text-foreground">{m.name}</span>
                    <span className="font-mono font-bold text-primary">
                      {m.score}% ({m.status})
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {m.detail}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Repository Performance Breakdown */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold">
                Public Repository Audit
              </CardTitle>
              <CardDescription className="text-xs">
                Deep static analysis of open-source projects, architecture
                quality, and documentation
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-y border-border bg-slate-50/50 dark:bg-slate-900/50 font-mono text-muted-foreground uppercase text-[10px]">
                    <th className="py-3 px-4">Repository</th>
                    <th className="py-3 px-4">Tech Stack</th>
                    <th className="py-3 px-4">Stars / Forks</th>
                    <th className="py-3 px-4">Depth Rating</th>
                    <th className="py-3 px-4">Doc Signal</th>
                    <th className="py-3 px-4 text-right">Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {githubMetrics.repositories.map((repo) => (
                    <tr
                      key={repo.name}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-foreground flex items-center gap-1.5">
                          <Code2 size={14} className="text-primary" />{" "}
                          {repo.name}
                        </div>
                        <div className="text-[10px] font-mono text-muted-foreground mt-0.5">
                          {repo.commitHygiene}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-muted-foreground">
                        {repo.language}
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Star size={12} className="text-amber-500" />{" "}
                            {repo.stars}
                          </span>
                          <span className="flex items-center gap-1">
                            <GitFork size={12} className="text-slate-400" />{" "}
                            {repo.forks}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                          {repo.depth}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground">
                        {repo.docSignal}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <a
                          href={repo.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline font-mono text-[11px]"
                        >
                          View <ExternalLink size={12} />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
