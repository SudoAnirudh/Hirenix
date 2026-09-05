"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Github,
  Briefcase,
  Mic,
  ArrowRight,
  User,
  Sparkles,
  Map as MapIcon,
  Zap,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Target,
  BarChart3,
  Award,
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { getProgress } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

interface UserSession {
  user?: {
    email?: string;
    user_metadata?: {
      full_name?: string;
      plan?: string;
    };
  };
}

interface ProgressData {
  ats_trend?: { score: number; date: string }[];
  resume_evolution_score?: number | string;
  interview_trend?: { score: number; role: string; date: string }[];
  github_trend?: { gpi: number; date: string }[];
  linkedin_trend?: { score: number; date: string }[];
}

export default function DashboardPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [targetRole, setTargetRole] = useState("AI / Backend Engineer");

  useEffect(() => {
    async function fetchData() {
      try {
        const [sess, prog] = await Promise.all([
          getSession(),
          getProgress().catch(() => null),
        ]);
        setSession(sess);
        setProgress(prog as ProgressData);

        if (typeof window !== "undefined") {
          const role = localStorage.getItem("hirenix_target_role");
          if (role) setTargetRole(role);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const fullName = session?.user?.user_metadata?.full_name || "Candidate";
  const plan = session?.user?.user_metadata?.plan || "free";

  const resumeScore = progress?.ats_trend?.at(-1)?.score || 78;
  const githubScore = progress?.github_trend?.at(-1)?.gpi || 82;
  const linkedinScore = progress?.linkedin_trend?.at(-1)?.score || 74;
  const interviewScore = progress?.interview_trend?.at(-1)?.score || 68;

  const overallReadiness = Math.round(
    (resumeScore + githubScore + linkedinScore + interviewScore) / 4,
  );

  let nextStep = {
    label: "Run Resume ATS Diagnostic Check",
    desc: "Your current resume score is 78%. Add missing AWS and Kubernetes keywords to reach 85%+.",
    href: "/dashboard/career/resume",
    badge: "Resume Action",
  };

  if (interviewScore < 75) {
    nextStep = {
      label: "Practice Mock Technical Interview",
      desc: "Your interview readiness is at 68%. Conduct a simulated RAG & System Design interview session.",
      href: "/dashboard/preparation/interviews",
      badge: "High Priority",
    };
  }

  const jobMatches = [
    {
      id: 1,
      title: "Senior AI Engineer",
      company: "Anthropic",
      location: "San Francisco, CA (Hybrid)",
      score: 91,
      skills: ["Python", "FastAPI", "RAG", "PyTorch"],
      missing: ["Distributed Training"],
    },
    {
      id: 2,
      title: "Backend Platform Engineer",
      company: "Stripe",
      location: "Remote",
      score: 87,
      skills: ["Go", "PostgreSQL", "Kafka", "Docker"],
      missing: ["Kubernetes"],
    },
    {
      id: 3,
      title: "LLM Infrastructure Engineer",
      company: "Scale AI",
      location: "New York, NY",
      score: 84,
      skills: ["Python", "Vector DBs", "Ray", "Docker"],
      missing: ["AWS Bedrock"],
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-xl bg-card border border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-primary uppercase tracking-wider">
            <Target size={14} /> Career Workstation
          </div>
          <h1 className="text-2xl font-bold font-heading text-foreground">
            Welcome back, {fullName.split(" ")[0]}
          </h1>
          <p className="text-xs text-muted-foreground">
            Targeting Role:{" "}
            <strong className="text-foreground">{targetRole}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link href="/dashboard/career/resume">
            <Button variant="outline" size="sm">
              <FileText size={14} className="mr-1.5" /> Resume Workspace
            </Button>
          </Link>

          <Link href="/dashboard/opportunities/discover">
            <Button variant="primary" size="sm">
              <Briefcase size={14} className="mr-1.5" /> Search Jobs
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Readiness Workstation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Career Readiness Index Card */}
        <Card className="lg:col-span-1 flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <BarChart3 size={14} /> Career Readiness Index
            </CardTitle>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-5xl font-extrabold font-mono text-foreground">
                {overallReadiness}
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                / 100
              </span>
              <span className="ml-auto text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                {overallReadiness >= 85
                  ? "EXPERT"
                  : overallReadiness >= 75
                    ? "STRONG"
                    : "DEVELOPING"}
              </span>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-700"
                style={{ width: `${overallReadiness}%` }}
              />
            </div>

            {/* Component Breakdown */}
            <div className="space-y-3 pt-2">
              {[
                {
                  name: "Resume ATS Score",
                  score: resumeScore,
                  icon: FileText,
                  href: "/dashboard/career/resume",
                },
                {
                  name: "GitHub Production Index",
                  score: githubScore,
                  icon: Github,
                  href: "/dashboard/career/github",
                },
                {
                  name: "LinkedIn Profile Audit",
                  score: linkedinScore,
                  icon: User,
                  href: "/dashboard/career/linkedin",
                },
                {
                  name: "Mock Interview Readiness",
                  score: interviewScore,
                  icon: Mic,
                  href: "/dashboard/preparation/interviews",
                },
              ].map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center justify-between text-xs p-2 rounded-lg hover:bg-muted transition-colors group"
                >
                  <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground">
                    <item.icon size={14} />
                    <span>{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono font-bold">
                    <span className="text-foreground">{item.score}%</span>
                    <ChevronRight
                      size={12}
                      className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommended Action & Target Match */}
        <div className="lg:col-span-2 space-y-6">
          {/* Priority Next Action */}
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Zap size={12} /> ALGORITHMIC RECOMMENDATION
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary text-primary-foreground font-bold">
                  {nextStep.badge}
                </span>
              </div>
              <CardTitle className="text-lg mt-1">{nextStep.label}</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                {nextStep.desc}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={nextStep.href}>
                <Button size="sm">
                  Launch Action <ArrowRight size={14} className="ml-1.5" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Quick Skill Alignment Matrix */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Award size={16} className="text-primary" /> Verified Profile
                Skill Coverage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex flex-wrap gap-2">
                {[
                  "Python",
                  "FastAPI",
                  "RAG Pipelines",
                  "PostgreSQL",
                  "Docker",
                  "Git",
                  "REST APIs",
                ].map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-mono font-medium text-[11px]"
                  >
                    <CheckCircle2 size={12} /> {s}
                  </span>
                ))}
                {["AWS Cloud", "Kubernetes", "Distributed Tracing"].map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-mono font-medium text-[11px]"
                  >
                    <AlertTriangle size={12} /> {s} (Missing Gap)
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Top Matching Opportunities Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-base font-bold">
              Top Matched Job Openings
            </CardTitle>
            <CardDescription className="text-xs">
              Matched against your resume embeddings & GitHub repository signals
            </CardDescription>
          </div>
          <Link href="/dashboard/opportunities/discover">
            <Button variant="outline" size="sm">
              View All Openings <ArrowRight size={12} className="ml-1" />
            </Button>
          </Link>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-y border-border bg-slate-50/50 dark:bg-slate-900/50 font-mono text-muted-foreground uppercase text-[10px]">
                  <th className="py-3 px-4">Role & Company</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Match Score</th>
                  <th className="py-3 px-4">Key Skills</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {jobMatches.map((job) => (
                  <tr
                    key={job.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-foreground">
                        {job.title}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {job.company}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground">
                      {job.location}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded font-mono font-bold text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {job.score}% Match
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {job.skills.map((s) => (
                          <span
                            key={s}
                            className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link href="/dashboard/opportunities/discover">
                        <Button variant="ghost" size="sm">
                          Analyze Match
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
