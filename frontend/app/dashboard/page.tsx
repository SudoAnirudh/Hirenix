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

      <div className="animate-fade-up w-full flex flex-col gap-6 pb-12 relative overflow-hidden">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border relative z-10 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
              <Sparkles size={14} />
              Career Command Center
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight font-heading text-foreground">
              Hello, {fullName.split(" ")[0]}
            </h1>
            <p className="text-muted-foreground text-sm max-w-xl leading-relaxed">
              Target Role:{" "}
              <strong className="text-foreground capitalize">
                {targetRole}
              </strong>
            </p>
          </div>

          {loading ? (
            <div className="h-12 w-60 rounded-lg bg-slate-100 dark:bg-slate-900 animate-pulse border border-border" />
          ) : (
            <Link
              href="/dashboard/settings"
              className="p-1 px-1.5 rounded-lg bg-card border border-border shadow-xs flex items-center gap-3 pr-4 hover:border-slate-300 dark:hover:border-slate-800 transition-all cursor-pointer"
            >
              <div className="h-9 w-9 rounded-md bg-primary flex items-center justify-center text-white font-bold text-sm">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch relative z-10">
          {/* Profile Readiness Column */}
          <div className="lg:col-span-1 border border-border bg-card rounded-xl p-5 flex flex-col justify-between shadow-xs">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                Career Readiness Index
              </h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-extrabold font-heading text-foreground leading-none">
                  {loading ? "—" : overallReadiness}
                </span>
                <span className="text-sm font-semibold text-muted-foreground">
                  / 100
                </span>
                <span className="ml-auto text-xs font-bold px-2.5 py-0.5 rounded-md bg-primary/10 text-primary uppercase">
                  {loading
                    ? "—"
                    : overallReadiness >= 85
                      ? "Expert"
                      : overallReadiness >= 75
                        ? "Strong"
                        : "Developing"}
                </span>
              </div>

              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-6">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-1000"
                  style={{ width: `${loading ? 0 : overallReadiness}%` }}
                />
              </div>
            </div>

            <div className="space-y-3.5">
              {performanceMetrics.map((m) => (
                <div
                  key={m.name}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <m.icon size={14} className="text-slate-400" />
                    <span>{m.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-400 dark:bg-slate-600 rounded-full"
                        style={{ width: `${loading ? 0 : m.score || 50}%` }}
                      />
                    </div>
                    <span className="font-bold text-foreground w-8 text-right">
                      {loading ? "—" : m.score || 50}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Column */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Recommended Next Action */}
            <div className="p-5 rounded-xl border border-primary/20 bg-primary/5 flex flex-col justify-between h-full gap-4">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Zap size={12} /> RECOMMENDED NEXT ACTION
                </span>
                <h3 className="font-bold text-lg text-foreground leading-tight">
                  {nextStep.label}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {nextStep.desc}
                </p>
              </div>
              <Link href={nextStep.href}>
                <button className="btn-primary flex items-center gap-1.5 py-2.5 px-5 text-xs w-fit">
                  Practice Now <ArrowRight size={14} />
                </button>
              </Link>
            </div>

            {/* Quick Summary / Status */}
            <div className="p-4 rounded-xl border border-border bg-slate-50 dark:bg-slate-900/30 text-xs text-muted-foreground leading-relaxed">
              Your profile is matched against requirements for a standard{" "}
              <strong className="text-foreground">{targetRole}</strong> role.
              High compatibility scores correlate with higher interview
              conversion rates.
            </div>
          </div>
        </div>

        {/* Launchpad Shortcuts */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
            System Shortcuts
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              {
                name: "Resume Workspace",
                href: "/dashboard/career/resume",
                icon: FileText,
                color:
                  "text-slate-700 dark:text-slate-300 border-border bg-card",
              },
              {
                name: "GitHub Intel",
                href: "/dashboard/career/github",
                icon: Github,
                color:
                  "text-slate-700 dark:text-slate-300 border-border bg-card",
              },
              {
                name: "Job Matching",
                href: "/dashboard/opportunities/discover",
                icon: Briefcase,
                color:
                  "text-slate-700 dark:text-slate-300 border-border bg-card",
              },
              {
                name: "AI Interviews",
                href: "/dashboard/preparation/interviews",
                icon: Mic,
                color:
                  "text-slate-700 dark:text-slate-300 border-border bg-card",
              },
              {
                name: "LinkedIn Opt",
                href: "/dashboard/career/linkedin",
                icon: User,
                color:
                  "text-slate-700 dark:text-slate-300 border-border bg-card",
              },
              {
                name: "Skill Roadmap",
                href: "/dashboard/preparation/roadmap",
                icon: MapIcon,
                color:
                  "text-slate-700 dark:text-slate-300 border-border bg-card",
              },
            ].map((tool) => (
              <Link
                key={tool.name}
                href={tool.href}
                className="group flex flex-col justify-between p-4 rounded-xl bg-card border border-border hover:border-slate-300 dark:hover:border-slate-800 transition-all shadow-xs h-32"
              >
                <div
                  className={`w-8 h-8 rounded-md flex items-center justify-center border border-border ${tool.color} shrink-0`}
                >
                  <tool.icon size={16} strokeWidth={2} />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-foreground leading-tight block">
                    {tool.name}
                  </span>
                  <span className="text-[10px] font-semibold text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-0.5">
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
