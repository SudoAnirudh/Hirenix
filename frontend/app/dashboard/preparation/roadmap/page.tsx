"use client";

import React from "react";
import {
  Map as MapIcon,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  BookOpen,
  Code2,
  Layers,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import Link from "next/link";

export default function CareerRoadmapPage() {
  const milestones = [
    {
      id: 1,
      step: "01",
      title: "Current Profile Baseline",
      status: "COMPLETED",
      desc: "Python, FastAPI, RAG embeddings, Docker, PostgreSQL.",
      impact: "78% Resume ATS Score",
    },
    {
      id: 2,
      step: "02",
      title: "Close Critical Skill Gaps",
      status: "IN_PROGRESS",
      desc: "Master AWS Bedrock, S3 SDK, and Kubernetes deployment manifests.",
      impact: "+12% Target Role Compatibility",
    },
    {
      id: 3,
      step: "03",
      title: "Portfolio Project Enhancement",
      status: "UPCOMING",
      desc: "Build & deploy a distributed vector store with benchmarks and CI/CD pipelines.",
      impact: "+15% GitHub Production Index",
    },
    {
      id: 4,
      step: "04",
      title: "Target Role Application Launch",
      status: "UPCOMING",
      desc: "Apply for Senior AI Engineer openings at Anthropic, Stripe, and Scale AI.",
      impact: "Expected 3x Interview Conversion Rate",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-xl bg-card border border-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-primary uppercase tracking-wider">
            <MapIcon size={14} /> Career Growth Path
          </div>
          <h1 className="text-2xl font-bold font-heading text-foreground mt-1">
            Actionable Career Skill Roadmap
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Step-by-step milestone path to bridge technical skill gaps and reach
            your target role.
          </p>
        </div>
      </div>

      {/* Roadmap Milestone Progression */}
      <div className="space-y-4">
        {milestones.map((m) => (
          <Card
            key={m.id}
            className={`border ${
              m.status === "IN_PROGRESS"
                ? "border-primary/40 bg-primary/5"
                : m.status === "COMPLETED"
                  ? "border-border bg-card"
                  : "border-border bg-muted/30"
            }`}
          >
            <CardHeader className="py-4 px-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="h-9 w-9 rounded-lg bg-muted border border-border font-mono font-extrabold text-xs flex items-center justify-center text-foreground shrink-0">
                    {m.step}
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold">
                      {m.title}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-0.5">
                      {m.desc}
                    </CardDescription>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span
                    className={`font-mono text-[10px] font-bold px-2.5 py-0.5 rounded border ${
                      m.status === "COMPLETED"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : m.status === "IN_PROGRESS"
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {m.status}
                  </span>
                  <span className="font-mono text-[11px] font-bold text-primary">
                    {m.impact}
                  </span>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
