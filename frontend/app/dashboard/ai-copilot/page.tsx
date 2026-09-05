"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Play,
  CheckCircle2,
  Clock,
  Terminal,
  Cpu,
  Send,
  Layers,
  ArrowRight,
  ShieldCheck,
  Bot,
  RefreshCw,
  Search,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function AICareerCopilotPage() {
  const [prompt, setPrompt] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);

  const agentPipeline = [
    {
      name: "Resume Parser Agent",
      status: "COMPLETED",
      detail: "Extracted 14 core technical skills and 4 project artifacts.",
    },
    {
      name: "Job Discovery Agent",
      status: "COMPLETED",
      detail: "Scraped 37 matching positions across 3 job boards.",
    },
    {
      name: "Match Scoring Engine",
      status: "IN_PROGRESS",
      detail:
        "Calculating hybrid sentence-transformer embeddings & keyword density.",
    },
    {
      name: "Outreach Generator",
      status: "PENDING",
      detail: "Waiting for top 3 match selections.",
    },
  ];

  const agentLogs = [
    "[14:28:10] [ResumeParser] Ingested candidate_resume_v2.pdf",
    "[14:28:12] [ResumeParser] Verified skills: Python, FastAPI, Docker, RAG, PostgreSQL",
    "[14:28:15] [JobDiscovery] Querying vector index for target role: Senior AI Engineer",
    "[14:28:18] [JobDiscovery] Retrieved 37 position candidates from Supabase vector storage",
    "[14:28:22] [MatchEngine] Executing pairwise similarity calculation (weights: 0.7 rule, 0.3 semantic)",
  ];

  const handleRunPipeline = () => {
    if (!prompt.trim()) return;
    setIsExecuting(true);
    setTimeout(() => setIsExecuting(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-xl bg-card border border-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-primary uppercase tracking-wider">
            <Cpu size={14} /> Multi-Agent Orchestration
          </div>
          <h1 className="text-2xl font-bold font-heading text-foreground mt-1">
            AI Career Copilot Command Center
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Run autonomous multi-agent pipelines for job discovery, match
            scoring, and outreach.
          </p>
        </div>
      </div>

      {/* Task Input Command Card */}
      <Card className="border-primary/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Sparkles size={16} className="text-primary" /> Autonomous Task
            Prompt
          </CardTitle>
          <CardDescription className="text-xs">
            Describe your career goal or command (e.g., &quot;Find AI Engineer
            roles in NYC and evaluate resume fit&quot;)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Find senior backend roles matching my Python/FastAPI profile and prepare cover letters..."
              className="flex-1 px-4 py-2.5 text-xs bg-muted/50 border border-border rounded-lg focus:outline-none focus:border-primary font-mono text-foreground"
            />
            <Button
              onClick={handleRunPipeline}
              disabled={isExecuting || !prompt.trim()}
              variant="primary"
              size="sm"
            >
              {isExecuting ? (
                <>
                  <RefreshCw size={14} className="mr-1.5 animate-spin" />{" "}
                  Executing Pipeline...
                </>
              ) : (
                <>
                  <Play size={14} className="mr-1.5" /> Execute Agent Workflow
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Status & Execution Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Agent Pipeline Stepper */}
        <div className="lg:col-span-6 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Layers size={16} className="text-primary" /> Active Agent
                Pipeline State
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time observable state of multi-agent execution steps
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {agentPipeline.map((step, idx) => (
                <div
                  key={step.name}
                  className="p-3 rounded-lg border border-border bg-card flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="font-semibold text-foreground flex items-center gap-2">
                      <span className="font-mono text-[10px] text-muted-foreground">
                        0{idx + 1}.
                      </span>
                      <span>{step.name}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {step.detail}
                    </p>
                  </div>
                  <span
                    className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${
                      step.status === "COMPLETED"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : step.status === "IN_PROGRESS"
                          ? "bg-primary/10 text-primary border-primary/20 animate-pulse"
                          : "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {step.status}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Execution Log Console */}
        <div className="lg:col-span-6 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Terminal size={16} className="text-primary" /> Agent Execution
                Log Terminal
              </CardTitle>
              <CardDescription className="text-xs">
                System telemetry and agent communication stream
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg bg-slate-950 text-slate-200 font-mono text-[11px] space-y-1.5 h-64 overflow-y-auto border border-slate-800">
                {agentLogs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed">
                    {log}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
