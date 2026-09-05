"use client";

import React, { useState } from "react";
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  RefreshCw,
  Edit3,
  Award,
  BookOpen,
  Briefcase,
  Code,
  Zap,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import ResumeUploader from "@/components/ResumeUploader";
import { ResumeEditor } from "@/components/ResumeEditor";

export default function ResumeWorkspacePage() {
  const [activeTab, setActiveTab] = useState<"workspace" | "diagnostic">(
    "workspace",
  );
  const [parsedData, setParsedData] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Mock ATS Diagnostic Data for Explainability
  const atsResult = {
    overallScore: 84,
    ruleScore: 88,
    semanticScore: 76,
    categories: [
      {
        name: "Section Completeness",
        score: 95,
        status: "PASS",
        detail:
          "All standard sections present (Summary, Experience, Skills, Education).",
      },
      {
        name: "Keyword Density",
        score: 82,
        status: "PASS",
        detail:
          "Strong density for Python, FastAPI, and Docker. Missing AWS and Kubernetes.",
      },
      {
        name: "Measurable Achievements",
        score: 78,
        status: "WARNING",
        detail:
          "4 out of 6 bullet points contain quantified metrics (%, $, user count).",
      },
      {
        name: "Formatting Quality",
        score: 90,
        status: "PASS",
        detail:
          "Standard font hierarchy, single column layout, parseable date formats.",
      },
    ],
    matchedSkills: [
      "Python",
      "FastAPI",
      "RAG Pipelines",
      "PostgreSQL",
      "Docker",
      "PyTorch",
      "Git",
    ],
    missingSkills: [
      "AWS Bedrock / S3",
      "Kubernetes",
      "Redis Caching",
      "CI/CD Pipelines",
    ],
    traceableEvidence: [
      {
        claim: "Demonstrates production AI/Backend experience",
        source: "Experience - Hirenix RAG Feature",
        detail:
          "Engineered hybrid ATS scoring engine reducing retrieval latency by 35%.",
      },
      {
        claim: "High data engineering competency",
        source: "Projects - Vector Search Engine",
        detail:
          "Indexed 100k+ documents with pgvector & sentence-transformers.",
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header Workspace Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-xl bg-card border border-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-primary uppercase tracking-wider">
            <FileText size={14} /> Resume Intelligence Workstation
          </div>
          <h1 className="text-2xl font-bold font-heading text-foreground mt-1">
            Resume Parser & ATS Diagnostic Workspace
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Upload your resume, inspect parsed data schema, and review
            explainable ATS score rules.
          </p>
        </div>

        <div className="flex items-center gap-2 border border-border rounded-lg p-1 bg-muted/50 text-xs shrink-0">
          <button
            onClick={() => setActiveTab("workspace")}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === "workspace"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Source & Editor
          </button>
          <button
            onClick={() => setActiveTab("diagnostic")}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === "diagnostic"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            ATS Diagnostic (84%)
          </button>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload & Parsed Content */}
        <div className="lg:col-span-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Upload size={16} className="text-primary" /> Source Resume
                Upload
              </CardTitle>
              <CardDescription className="text-xs">
                Upload PDF or DOCX file to extract technical skills, metrics,
                and work experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResumeUploader
                onUploadComplete={(data) => {
                  setParsedData(data);
                  setActiveTab("diagnostic");
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Edit3 size={16} className="text-primary" /> Structured Resume
                Fields
              </CardTitle>
              <CardDescription className="text-xs">
                Edit extracted information before running targeted job matching
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResumeEditor
                initialData={parsedData}
                onSave={(updated) => setParsedData(updated)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: ATS Diagnostic Analysis */}
        <div className="lg:col-span-6 space-y-6">
          {/* Diagnostic Overview Card */}
          <Card className="border-primary/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  ATS Score Diagnostic Result
                </CardTitle>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  HYBRID VERIFIED
                </span>
              </div>
              <div className="flex items-baseline gap-3 mt-2">
                <span className="text-5xl font-extrabold font-mono text-foreground">
                  {atsResult.overallScore}
                </span>
                <span className="text-xs text-muted-foreground">
                  / 100 Overall Score
                </span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 text-xs">
              {/* Formula explanation */}
              <div className="p-3 rounded-lg bg-muted/60 border border-border space-y-1 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    70% Rule-Based Completeness:
                  </span>
                  <span className="font-bold text-foreground">
                    {atsResult.ruleScore}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    30% Semantic Embeddings Similarity:
                  </span>
                  <span className="font-bold text-foreground">
                    {atsResult.semanticScore}%
                  </span>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="space-y-2.5 pt-2">
                <div className="font-bold uppercase text-[10px] font-mono text-muted-foreground">
                  Category Rules Compliance
                </div>
                {atsResult.categories.map((c) => (
                  <div
                    key={c.name}
                    className="p-3 rounded-lg border border-border bg-card space-y-1"
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-foreground">{c.name}</span>
                      <span className="font-mono font-bold">{c.score}%</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {c.detail}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Matched vs Missing Skills */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">
                Skills Extraction & Target Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div>
                <div className="font-mono text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 mb-2">
                  Verified Skills Detected ({atsResult.matchedSkills.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {atsResult.matchedSkills.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-mono text-[11px] border border-emerald-500/20"
                    >
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="font-mono text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400 mb-2">
                  Recommended Missing Keywords ({atsResult.missingSkills.length}
                  )
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {atsResult.missingSkills.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 font-mono text-[11px] border border-amber-500/20"
                    >
                      ! {s}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Traceable Evidence behind score */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <ShieldCheck size={16} className="text-primary" /> Traceable
                Evidence Lineage
              </CardTitle>
              <CardDescription className="text-xs">
                How Hirenix derived recommendations from your resume text
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              {atsResult.traceableEvidence.map((ev, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-border bg-slate-50/50 dark:bg-slate-900/50 space-y-1"
                >
                  <div className="font-semibold text-foreground">
                    {ev.claim}
                  </div>
                  <div className="text-[11px] text-primary font-mono">
                    {ev.source}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    &quot;{ev.detail}&quot;
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
