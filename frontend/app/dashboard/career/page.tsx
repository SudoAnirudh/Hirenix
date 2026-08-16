"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProgress } from "@/lib/api";
import { getSession } from "@/lib/auth";
import {
  Sparkles,
  TrendingUp,
  Award,
  AlertTriangle,
  History,
  CheckCircle,
  HelpCircle,
  Mic,
  FileText,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";

interface ProgressData {
  ats_trend?: { score: number; date: string }[];
  resume_evolution_score?: number | string;
  interview_trend?: { score: number; role: string; date: string }[];
  github_trend?: { gpi: number; date: string }[];
  linkedin_trend?: { score: number; date: string }[];
}

export default function CareerOverviewPage() {
  const [session, setSession] = useState<any>(null);
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [targetRole, setTargetRole] = useState("AI Engineer");

  useEffect(() => {
    async function fetchData() {
      try {
        const [sess, prog] = await Promise.all([
          getSession(),
          getProgress().catch(() => null),
        ]);
        setSession(sess);
        setData(prog as ProgressData);

        if (typeof window !== "undefined") {
          const role = localStorage.getItem("hirenix_target_role");
          if (role) setTargetRole(role);
        }
      } catch (err) {
        // Log telemetry cleanups
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const fullName = session?.user?.user_metadata?.full_name || "Anirudh";

  // Dynamic values
  const resumeScore = data?.ats_trend?.at(-1)?.score || 0;
  const githubScore = data?.github_trend?.at(-1)?.gpi || 0;
  const linkedinScore = data?.linkedin_trend?.at(-1)?.score || 0;
  const interviewScore = data?.interview_trend?.at(-1)?.score || 0;

  // Composite Readiness
  const overallReadiness = Math.round(
    ((resumeScore || 50) +
      (githubScore || 50) +
      (linkedinScore || 50) +
      (interviewScore || 50)) /
      4,
  );

  // Match rating text
  const matchRating =
    overallReadiness >= 85
      ? "Expert"
      : overallReadiness >= 75
        ? "Strong"
        : "Developing";

  // Dynamic recommendation based on lowest score
  let lowestMetric = {
    name: "Resume",
    score: resumeScore || 50,
    href: "/dashboard/career/resume",
    action: "Optimize Resume",
    desc: "Upload and scan your resume to align technical keywords.",
  };
  const metrics = [
    {
      name: "Resume",
      score: resumeScore,
      href: "/dashboard/career/resume",
      action: "Optimize Resume",
      desc: "Scan and align technical keywords to target role standards.",
    },
    {
      name: "GitHub",
      score: githubScore,
      href: "/dashboard/career/github",
      action: "Audit Projects",
      desc: "Run repository scans and verify code complexity stats.",
    },
    {
      name: "LinkedIn",
      score: linkedinScore,
      href: "/dashboard/career/linkedin",
      action: "Refine Identity",
      desc: "Add industry keywords to headline and summary blocks.",
    },
    {
      name: "Interview",
      score: interviewScore,
      href: "/dashboard/preparation/interviews",
      action: "Practice Interview",
      desc: "Focus on architectural system design questions.",
    },
  ];

  metrics.forEach((m) => {
    if (m.score < lowestMetric.score) {
      lowestMetric = m;
    }
  });

  if (loading) {
    return (
      <main
        className="animate-fade-up flex flex-col gap-8 w-full max-w-6xl"
        aria-busy="true"
        aria-label="Loading Career Overview"
      >
        {/* Header Skeleton */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-4">
          <div className="space-y-2">
            <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse" />
            <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse" />
          </div>
          <div className="h-8 w-44 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
        </header>

        {/* Readiness Overview Panel Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          {/* Circular Readiness Index Skeleton */}
          <section className="md:col-span-7 bg-card border border-border rounded-2xl p-6 flex flex-col sm:flex-row gap-8 items-center relative overflow-hidden shadow-sm h-[220px]">
            <div className="flex-shrink-0 w-36 h-36 rounded-full border-8 border-slate-100 dark:border-slate-800/40 flex items-center justify-center animate-pulse">
              <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="flex flex-col gap-3 flex-1 w-full space-y-2">
              <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse" />
              <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse" />
              <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse" />
              <div className="h-9 w-40 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse mt-1" />
            </div>
          </section>

          {/* Component Breakdown Skeleton */}
          <section className="md:col-span-5 bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-4 h-[220px]">
            <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse" />
            <div className="space-y-3.5 flex-1 flex flex-col justify-center">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between">
                    <div className="h-3.5 w-24 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse" />
                    <div className="h-3.5 w-8 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse" />
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden" />
                </div>
              ))}
            </div>
          </section>

          {/* AI Recommendation Banner Skeleton */}
          <section className="md:col-span-12 bg-card border border-border rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm h-[110px]">
            <div className="flex gap-4 items-start w-full">
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-5 w-72 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse" />
                <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse" />
              </div>
            </div>
            <div className="h-10 w-44 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse shrink-0" />
          </section>

          {/* Skill Intelligence Skeleton */}
          <section className="md:col-span-8 bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-4 h-[240px]">
            <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1 items-center">
              <div className="space-y-2.5">
                <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse" />
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-10 w-full bg-slate-100 dark:bg-slate-900 rounded-xl animate-pulse border border-border"
                  />
                ))}
              </div>
              <div className="space-y-2.5">
                <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse" />
                {[...Array(2)].map((_, i) => (
                  <div
                    key={i}
                    className="h-10 w-full bg-slate-100 dark:bg-slate-900 rounded-xl animate-pulse border border-border"
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Recent Activity Skeleton */}
          <section className="md:col-span-4 bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-4 h-[240px]">
            <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse" />
            <div className="relative border-l border-border pl-4 ml-1 space-y-6 flex-1 flex flex-col justify-center">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="relative space-y-1">
                  <span className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-800" />
                  <div className="h-3 w-14 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse" />
                  <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse" />
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="animate-fade-up flex flex-col gap-6 w-full max-w-6xl">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-4">
        <div>
          <p className="text-xs uppercase font-bold tracking-wider text-muted-foreground mb-1">
            Overview
          </p>
          <h1 className="font-heading text-3xl font-extrabold text-foreground">
            Good morning, {fullName.split(" ")[0]}.
          </h1>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-lg shadow-xs text-xs font-semibold">
          <span
            className="w-2 h-2 rounded-full bg-primary"
            aria-hidden="true"
          ></span>
          <span className="text-muted-foreground">
            Target Role:{" "}
            <strong className="text-foreground">{targetRole}</strong>
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        {/* Profile Readiness Score Card (Col span 7) */}
        <section
          className="md:col-span-7 bg-card border border-border rounded-xl p-6 flex flex-col sm:flex-row gap-8 items-center relative overflow-hidden shadow-xs"
          aria-label="Overall Career Readiness"
        >
          <div
            className="flex-shrink-0 flex flex-col items-center justify-center w-36 h-36 border border-border bg-slate-50 dark:bg-slate-900 rounded-xl relative"
            role="progressbar"
            aria-valuenow={overallReadiness}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Overall career readiness score percentage"
          >
            <span className="font-heading text-5xl font-extrabold text-primary leading-none">
              {overallReadiness}%
            </span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-2">
              {matchRating} Profile
            </span>
          </div>

          <div className="flex flex-col gap-3 text-center sm:text-left z-10 flex-1">
            <h2 className="font-heading text-lg font-bold text-foreground">
              Career Readiness Score
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your profile is highly competitive for{" "}
              <strong>{targetRole}</strong> roles. You have a strong foundation
              in core technologies, but fine-tuning your{" "}
              <strong>{lowestMetric.name.toLowerCase()}</strong> dimensions will
              bridge the final gap to top-tier offers.
            </p>
            <div className="mt-2">
              <Link href="/dashboard/progress">
                <button className="bg-card hover:bg-slate-50 dark:hover:bg-slate-900 border border-border text-foreground text-xs font-bold py-2 px-4 rounded-lg transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
                  View Progress Analytics
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Component Breakdown (Col span 5) */}
        <section
          className="md:col-span-5 bg-card border border-border rounded-xl p-6 shadow-xs flex flex-col justify-between gap-4"
          aria-label="Readiness Breakdown metrics"
        >
          <h2 className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Award size={14} strokeWidth={2} /> Component Breakdown
          </h2>
          <div className="space-y-3.5">
            {[
              {
                name: "Resume Match",
                score: resumeScore,
                color: "bg-emerald-600 dark:bg-emerald-500",
                text: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400",
                desc: "Keyword density & ATS parsing check.",
              },
              {
                name: "GitHub / Projects",
                score: githubScore,
                color: "bg-primary dark:bg-primary",
                text: "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground",
                desc: "Complexity and commits frequency.",
              },
              {
                name: "LinkedIn Presence",
                score: linkedinScore,
                color: "bg-amber-600 dark:bg-amber-500",
                text: "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400",
                desc: "Audience target & headline alignment.",
              },
              {
                name: "Interview Readiness",
                score: interviewScore,
                color: "bg-purple-600 dark:bg-purple-500",
                text: "bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400",
                desc: "System design & behavioral analysis.",
              },
            ].map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex justify-between items-end text-xs font-bold">
                  <span className="text-foreground">{item.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] ${item.text}`}
                  >
                    {item.score || 50}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                    style={{ width: `${item.score || 50}%` }}
                    role="progressbar"
                    aria-valuenow={item.score || 50}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${item.name} score percentage`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* AI Recommendation CTA Banner (Col span 12) */}
        <section
          className="md:col-span-12 bg-purple-50/20 dark:bg-purple-950/5 border border-purple-100 dark:border-purple-900/30 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs"
          aria-label="AI Recommendation Action"
        >
          <div className="flex gap-4 items-start text-center md:text-left flex-col md:flex-row">
            <div className="w-9 h-9 rounded-md bg-purple-50 dark:bg-purple-950/45 flex items-center justify-center text-purple-600 shrink-0 mx-auto md:mx-0">
              <Sparkles size={18} strokeWidth={2} />
            </div>
            <div className="space-y-1">
              <h3 className="font-heading text-sm font-bold text-foreground">
                AI Recommendation: Improve {lowestMetric.name} Readiness
              </h3>
              <p className="text-xs text-muted-foreground max-w-3xl leading-relaxed">
                {lowestMetric.desc} Focusing on this dimension represents your
                highest return on investment to raise your overall Readiness
                Score.
              </p>
            </div>
          </div>
          <Link href={lowestMetric.href} className="w-full md:w-auto shrink-0">
            <button className="w-full md:w-auto btn-primary py-2 px-5 flex items-center justify-center gap-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
              <Mic size={14} strokeWidth={2} /> {lowestMetric.action}
            </button>
          </Link>
        </section>

        {/* Skill Intelligence Grid (Col span 8) */}
        <section
          className="md:col-span-8 bg-card border border-border rounded-xl p-6 shadow-xs flex flex-col justify-between gap-4"
          aria-label="Skill Intelligence"
        >
          <h2 className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <UserCheck size={14} strokeWidth={2} /> Skill Intelligence
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Strongest Areas */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                <CheckCircle size={14} strokeWidth={2} /> Strongest Competencies
              </h3>
              <div className="space-y-2">
                <div className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-border rounded-lg flex justify-between items-center text-xs">
                  <span className="font-semibold text-foreground">
                    Python &amp; PyTorch
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    Expert
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-border rounded-lg flex justify-between items-center text-xs">
                  <span className="font-semibold text-foreground">
                    RAG Architectures
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    Advanced
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-border rounded-lg flex justify-between items-center text-xs">
                  <span className="font-semibold text-foreground">
                    FastAPI Frameworks
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    Advanced
                  </span>
                </div>
              </div>
            </div>

            {/* Focus Areas */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-amber-600 flex items-center gap-1.5">
                <AlertTriangle size={14} strokeWidth={2} /> Development Targets
              </h3>
              <div className="space-y-2">
                <div className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-border rounded-lg flex justify-between items-center text-xs">
                  <span className="font-semibold text-foreground">
                    System Design (Scale)
                  </span>
                  <Link
                    href="/dashboard/preparation/roadmap"
                    className="text-primary hover:underline font-bold text-[10px] uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    Open Tech Tree
                  </Link>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-border rounded-lg flex justify-between items-center text-xs">
                  <span className="font-semibold text-foreground">
                    Kubernetes &amp; AWS SageMaker
                  </span>
                  <Link
                    href="/dashboard/career/resume"
                    className="text-primary hover:underline font-bold text-[10px] uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    Audit Resume
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Timeline activity (Col span 4) */}
        <section
          className="md:col-span-4 bg-card border border-border rounded-xl p-6 shadow-xs flex flex-col justify-between gap-4"
          aria-label="Recent Activities Log"
        >
          <h2 className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <History size={14} strokeWidth={2} /> Recent Activities
          </h2>
          <div className="relative border-l border-border pl-4 ml-1 space-y-6 flex-1 flex flex-col justify-center">
            <div className="relative">
              <span className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-primary"></span>
              <time className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5 block">
                Today
              </time>
              <p className="text-xs font-bold text-foreground">
                GitHub repositories analyzed
              </p>
              <p className="text-[10px] text-emerald-600 font-bold mt-0.5">
                +4 pts to readiness rating
              </p>
            </div>
            <div className="relative">
              <span className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-slate-400"></span>
              <time className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5 block">
                2 days ago
              </time>
              <p className="text-xs font-semibold text-foreground">
                Resume parsed and ATS verified
              </p>
            </div>
            <div className="relative">
              <span className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-slate-400"></span>
              <time className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5 block">
                Last week
              </time>
              <p className="text-xs font-semibold text-foreground">
                Completed Mock Interview session
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
