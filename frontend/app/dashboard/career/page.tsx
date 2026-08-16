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
        console.error("Failed to load overview data:", err);
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

  return (
    <div className="animate-fade-up flex flex-col gap-8 w-full max-w-6xl">
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
        <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full shadow-sm text-xs font-semibold">
          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
          <span className="text-muted-foreground">
            Target Role:{" "}
            <strong className="text-foreground">{targetRole}</strong>
          </span>
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7 h-64 rounded-3xl bg-slate-100 dark:bg-slate-900 animate-pulse border border-border" />
          <div className="md:col-span-5 h-64 rounded-3xl bg-slate-100 dark:bg-slate-900 animate-pulse border border-border" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          {/* Circular Readiness Index (Col span 7) */}
          <section className="md:col-span-7 bg-card border border-border rounded-2xl p-6 flex flex-col sm:flex-row gap-8 items-center relative overflow-hidden shadow-sm">
            {/* Decorative soft backdrop glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>

            <div className="flex-shrink-0 flex flex-col items-center justify-center w-36 h-36 rounded-full border-8 border-slate-100 dark:border-slate-800/40 relative">
              <svg
                className="absolute inset-0 w-full h-full -rotate-90"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  fill="none"
                  r="46"
                  stroke="transparent"
                  strokeWidth="8"
                ></circle>
                <circle
                  className="text-primary transition-all duration-1000"
                  cx="50"
                  cy="50"
                  fill="none"
                  r="46"
                  stroke="currentColor"
                  strokeDasharray="289"
                  strokeDashoffset={289 - (289 * overallReadiness) / 100}
                  strokeWidth="8"
                ></circle>
              </svg>
              <span className="font-heading text-4xl font-extrabold text-primary leading-none z-10">
                {overallReadiness}
              </span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 z-10">
                {matchRating}
              </span>
            </div>

            <div className="flex flex-col gap-3 text-center sm:text-left z-10 flex-1">
              <h2 className="font-heading text-lg font-bold text-foreground">
                Career Readiness Score
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your profile is highly competitive for{" "}
                <strong>{targetRole}</strong> roles. You have a strong
                foundation in core technologies, but fine-tuning your{" "}
                {lowestMetric.name.toLowerCase()} dimensions will bridge the
                final gap to top-tier offers.
              </p>
              <div className="mt-2">
                <Link href="/dashboard/progress">
                  <button className="bg-card hover:bg-slate-50 dark:hover:bg-slate-900 border border-border text-foreground text-xs font-bold py-2 px-5 rounded-xl transition-colors shadow-sm">
                    View Progress Analytics
                  </button>
                </Link>
              </div>
            </div>
          </section>

          {/* Component Breakdown (Col span 5) */}
          <section className="md:col-span-5 bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-4">
            <h2 className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Award size={14} /> Component Breakdown
            </h2>
            <div className="space-y-4">
              {[
                {
                  name: "Resume Match",
                  score: resumeScore,
                  color: "bg-emerald-500",
                  text: "bg-emerald-500/10 text-emerald-500",
                  desc: "Keyword density & ATS parsing check.",
                },
                {
                  name: "GitHub / Projects",
                  score: githubScore,
                  color: "bg-primary",
                  text: "bg-primary/10 text-primary",
                  desc: "Complexity and commits frequency.",
                },
                {
                  name: "LinkedIn Presence",
                  score: linkedinScore,
                  color: "bg-amber-500",
                  text: "bg-amber-500/10 text-amber-500",
                  desc: "Audience target & headline alignment.",
                },
                {
                  name: "Interview Readiness",
                  score: interviewScore,
                  color: "bg-rose-500",
                  text: "bg-rose-500/10 text-rose-500",
                  desc: "System design & behavioral analysis.",
                },
              ].map((item) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex justify-between items-end text-xs font-bold">
                    <span className="text-foreground">{item.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] ${item.text}`}
                    >
                      {item.score || 50}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                      style={{ width: `${item.score || 50}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* AI Recommendation CTA Banner (Col span 12) */}
          <section className="md:col-span-12 bg-purple-50/20 dark:bg-purple-950/10 border border-purple-100 dark:border-purple-900/50 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="flex gap-4 items-start text-center md:text-left flex-col md:flex-row">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center text-purple-500 shrink-0 mx-auto md:mx-0">
                <Sparkles size={20} />
              </div>
              <div className="space-y-1">
                <h3 className="font-heading text-base font-bold text-foreground">
                  AI Recommendation: Improve {lowestMetric.name} Readiness
                </h3>
                <p className="text-xs text-muted-foreground max-w-3xl leading-relaxed">
                  {lowestMetric.desc} Focusing on this dimension represents your
                  highest return on investment to raise your overall Readiness
                  Score.
                </p>
              </div>
            </div>
            <Link href={lowestMetric.href} className="w-full md:w-auto">
              <button className="w-full md:w-auto btn-primary shrink-0 py-2.5 px-6 flex items-center justify-center gap-1.5 text-xs">
                <Mic size={14} /> {lowestMetric.action}
              </button>
            </Link>
          </section>

          {/* Skill Intelligence Grid (Col span 8) */}
          <section className="md:col-span-8 bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-4">
            <h2 className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <UserCheck size={14} /> Skill Intelligence
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Strongest Areas */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
                  <CheckCircle size={14} /> Strongest Competencies
                </h4>
                <div className="space-y-2">
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border border-border rounded-xl flex justify-between items-center text-xs">
                    <span className="font-semibold text-foreground">
                      Python &amp; PyTorch
                    </span>
                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-lg">
                      Expert
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border border-border rounded-xl flex justify-between items-center text-xs">
                    <span className="font-semibold text-foreground">
                      RAG Architectures
                    </span>
                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-lg">
                      Advanced
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border border-border rounded-xl flex justify-between items-center text-xs">
                    <span className="font-semibold text-foreground">
                      FastAPI Frameworks
                    </span>
                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-lg">
                      Advanced
                    </span>
                  </div>
                </div>
              </div>

              {/* Focus Areas */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-amber-500 flex items-center gap-1.5">
                  <AlertTriangle size={14} /> Development Targets
                </h4>
                <div className="space-y-2">
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border border-border rounded-xl flex justify-between items-center text-xs">
                    <span className="font-semibold text-foreground">
                      System Design (Scale)
                    </span>
                    <Link
                      href="/dashboard/preparation/roadmap"
                      className="text-primary hover:underline font-bold text-[10px] uppercase"
                    >
                      Open Tech Tree
                    </Link>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border border-border rounded-xl flex justify-between items-center text-xs">
                    <span className="font-semibold text-foreground">
                      Kubernetes &amp; AWS SageMaker
                    </span>
                    <Link
                      href="/dashboard/career/resume"
                      className="text-primary hover:underline font-bold text-[10px] uppercase"
                    >
                      Audit Resume
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Recent Timeline activity (Col span 4) */}
          <section className="md:col-span-4 bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-4">
            <h2 className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <History size={14} /> Recent Activities
            </h2>
            <div className="relative border-l border-border pl-4 ml-1 space-y-6">
              <div className="relative">
                <span className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-primary ring-4 ring-card"></span>
                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
                  Today
                </p>
                <p className="text-xs font-bold text-foreground">
                  GitHub repositories analyzed
                </p>
                <p className="text-[10px] text-emerald-500 font-bold mt-0.5">
                  +4 pts to readiness rating
                </p>
              </div>
              <div className="relative">
                <span className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-muted-foreground ring-4 ring-card"></span>
                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
                  2 days ago
                </p>
                <p className="text-xs font-bold text-foreground">
                  Resume parsed and ATS verified
                </p>
              </div>
              <div className="relative">
                <span className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-muted-foreground ring-4 ring-card"></span>
                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
                  Last week
                </p>
                <p className="text-xs font-bold text-foreground">
                  Completed Mock Interview session
                </p>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
