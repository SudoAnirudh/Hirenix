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
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { getProgress } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import ActivityRings from "@/components/dashboard/ActivityRings";
import OnboardingWizard from "@/components/dashboard/OnboardingWizard";

const QUOTES = [
  "The only way to do great work is to love what you do. — Steve Jobs",
  "Success is not final, failure is not fatal: it is the courage to continue that counts. — Winston Churchill",
  "Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work. — Steve Jobs",
  "Believe you can and you're halfway there. — Theodore Roosevelt",
  "Expertise is not a destination, it's a journey of continuous improvement.",
  "The future belongs to those who learn more skills and combine them in creative ways.",
  "Don't wait for opportunity. Create it.",
  "Your next big break is just one optimization away.",
];

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
  const [quote, setQuote] = useState<string>("");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [targetRole, setTargetRole] = useState("AI Engineer");

  useEffect(() => {
    async function fetchData() {
      try {
        const [sess, prog] = await Promise.all([
          getSession(),
          getProgress().catch(() => null),
        ]);
        setSession(sess);
        setProgress(prog as ProgressData);

        setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);

        // Onboarding Check
        if (typeof window !== "undefined") {
          const role = localStorage.getItem("hirenix_target_role");
          if (role) setTargetRole(role);

          const isOnboarded = localStorage.getItem("hirenix_onboarded_v1");
          if (!isOnboarded) {
            setShowOnboarding(true);
          }
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const fullName = session?.user?.user_metadata?.full_name || "Guest User";
  const email = session?.user?.email || "Not signed in";
  const plan = session?.user?.user_metadata?.plan || "free";

  const resumeScore = progress?.ats_trend?.at(-1)?.score || 0;
  const githubScore = progress?.github_trend?.at(-1)?.gpi || 0;
  const linkedinScore = progress?.linkedin_trend?.at(-1)?.score || 0;
  const interviewScore = progress?.interview_trend?.at(-1)?.score || 0;

  // Composite Readiness Score
  const overallReadiness = Math.round(
    ((resumeScore || 50) +
      (githubScore || 50) +
      (linkedinScore || 50) +
      (interviewScore || 50)) /
      4,
  );

  const performanceMetrics = [
    { name: "Resume", score: resumeScore, color: "#6366f1", icon: FileText },
    {
      name: "LinkedIn",
      score: linkedinScore || 50,
      color: "#0A66C2",
      icon: User,
    },
    { name: "Interview", score: interviewScore, color: "#8b5cf6", icon: Mic },
    {
      name: "GitHub",
      score: githubScore || 50,
      color: "#64748B",
      icon: Github,
    },
  ];

  // Best next step decision matrix matching career overview
  let nextStep = {
    label: "Analyze your resume",
    desc: "Your resume is currently unscored. Upload it to run ATS diagnostic checks.",
    href: "/dashboard/career/resume",
  };
  if (resumeScore > 0 && resumeScore < 75) {
    nextStep = {
      label: "Improve Resume Keywords",
      desc: "ATS analysis shows missing technical skills for: " + targetRole,
      href: "/dashboard/career/resume",
    };
  } else if (resumeScore >= 75 && (!interviewScore || interviewScore < 75)) {
    nextStep = {
      label: "Practice Mock Interview",
      desc: "Prepare system design or behavioral answers for: " + targetRole,
      href: "/dashboard/preparation/interviews",
    };
  } else if (resumeScore >= 75 && githubScore < 75) {
    nextStep = {
      label: "Audit GitHub Repositories",
      desc: "Enhance git hygiene levels and extract portfolio metrics.",
      href: "/dashboard/career/github",
    };
  } else if (overallReadiness >= 75) {
    nextStep = {
      label: "Apply for matched jobs",
      desc: "Ready to launch! Explore scraped openings that fit your profile score.",
      href: "/dashboard/opportunities/discover",
    };
  }

  return (
    <>
      <AnimatePresence>
        {showOnboarding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 pointer-events-auto"
          >
            <OnboardingWizard
              onComplete={(data) => {
                localStorage.setItem("hirenix_onboarded_v1", "true");
                if (data.role) {
                  localStorage.setItem("hirenix_target_role", data.role);
                  setTargetRole(data.role);
                }
                setShowOnboarding(false);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="animate-fade-up w-full flex flex-col gap-8 pb-12 relative overflow-hidden">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border relative z-10 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-500 font-bold text-xs uppercase tracking-widest">
              <Sparkles size={14} />
              Career Command Center
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight font-heading text-foreground">
              Hello, {fullName.split(" ")[0]}
            </h1>
            <p className="text-muted-foreground text-sm max-w-xl leading-relaxed italic">
              &quot;{quote || "Your career trajectory is guided by Hirenix AI."}
              &quot;
            </p>
          </div>

          {loading ? (
            <div className="h-14 w-60 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse border border-border" />
          ) : (
            <Link
              href="/dashboard/settings"
              className="p-1 px-1.5 rounded-2xl bg-card border border-border shadow-sm flex items-center gap-3 pr-4 hover:border-slate-300 dark:hover:border-slate-800 transition-all cursor-pointer"
            >
              <div className="h-10 w-10 rounded-xl bg-linear-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-sm font-bold text-sm">
                {fullName[0]}
              </div>
              <div className="flex flex-col">
                <div className="text-xs font-bold text-foreground">
                  {fullName}
                </div>
                <div className="text-[10px] text-muted-foreground leading-none">
                  {email}
                </div>
              </div>
            </Link>
          )}
        </div>

        {/* Readiness Overview Panel */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch relative z-10">
          {/* Circular Readiness Index */}
          <div className="md:col-span-5 glass-card rounded-[28px] p-6 flex flex-col items-center justify-center text-center">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
              Career Readiness Index
            </h3>
            {loading ? (
              <div className="w-[180px] h-[180px] rounded-full bg-slate-100 dark:bg-slate-900 animate-pulse" />
            ) : (
              <ActivityRings
                metrics={performanceMetrics}
                size={180}
                strokeWidth={14}
              />
            )}
            <div className="mt-4 flex flex-col items-center">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                Benchmarking target
              </span>
              <span className="text-sm font-bold text-foreground capitalize mt-0.5">
                {targetRole}
              </span>
            </div>
          </div>

          {/* Action and Recent Activity */}
          <div className="md:col-span-7 flex flex-col justify-between gap-6">
            {/* Contextual Action Card */}
            <div className="p-6 rounded-[28px] border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/20 dark:bg-indigo-950/10 flex flex-col justify-between h-full gap-4">
              <div className="space-y-2">
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap size={12} className="animate-pulse" /> RECOMMENDED NEXT
                  ACTION
                </span>
                <h3 className="font-bold text-xl text-foreground leading-tight">
                  {nextStep.label}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {nextStep.desc}
                </p>
              </div>
              <Link href={nextStep.href}>
                <button className="btn-primary flex items-center gap-1.5 py-2.5 px-6 text-xs w-fit">
                  Practice Now <ArrowRight size={14} />
                </button>
              </Link>
            </div>

            {/* Quick Metrics grid */}
            <div className="grid grid-cols-2 gap-4">
              {performanceMetrics.map((m) => (
                <div
                  key={m.name}
                  className="p-4 rounded-[20px] bg-slate-50 dark:bg-slate-900/50 border border-border flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center border border-border"
                      style={{
                        backgroundColor: `${m.color}10`,
                        color: m.color,
                      }}
                    >
                      <m.icon size={16} />
                    </div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {m.name}
                    </span>
                  </div>
                  <span className="text-sm font-black text-foreground">
                    {loading ? "—" : m.score}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Launchpad Shortcuts */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground px-1">
            System Shortcuts
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              {
                name: "Resume Workspace",
                href: "/dashboard/career/resume",
                icon: FileText,
                color:
                  "text-indigo-500 border-indigo-100 bg-indigo-50/20 dark:bg-indigo-500/5",
              },
              {
                name: "GitHub Intel",
                href: "/dashboard/career/github",
                icon: Github,
                color:
                  "text-slate-700 dark:text-slate-300 border-slate-200 bg-slate-50/20 dark:bg-slate-800/10",
              },
              {
                name: "Job Matching",
                href: "/dashboard/opportunities/discover",
                icon: Briefcase,
                color:
                  "text-emerald-500 border-emerald-100 bg-emerald-50/20 dark:bg-emerald-500/5",
              },
              {
                name: "AI Interviews",
                href: "/dashboard/preparation/interviews",
                icon: Mic,
                color:
                  "text-violet-500 border-violet-100 bg-violet-50/20 dark:bg-violet-500/5",
              },
              {
                name: "LinkedIn Opt",
                href: "/dashboard/career/linkedin",
                icon: User,
                color:
                  "text-blue-500 border-blue-100 bg-blue-50/20 dark:bg-blue-500/5",
              },
              {
                name: "Skill Roadmap",
                href: "/dashboard/preparation/roadmap",
                icon: MapIcon,
                color:
                  "text-rose-500 border-rose-100 bg-rose-50/20 dark:bg-rose-500/5",
              },
            ].map((tool) => (
              <Link
                key={tool.name}
                href={tool.href}
                className="group flex flex-col justify-between p-5 rounded-[24px] bg-card border border-border hover:border-slate-300 dark:hover:border-slate-800 transition-all shadow-sm h-36"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border ${tool.color} shrink-0`}
                >
                  <tool.icon size={20} strokeWidth={2} />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-black text-foreground leading-tight block">
                    {tool.name}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-indigo-500 transition-colors flex items-center gap-0.5">
                    Launch <ArrowRight size={10} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
