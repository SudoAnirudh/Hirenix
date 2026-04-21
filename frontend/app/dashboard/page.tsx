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
  TrendingDown,
  Minus,
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { getProgress } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  "Code is like humor. When you have to explain it, it’s bad.",
  "Infrastructure as Code, Career as an Algorithm.",
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
  const [progressLoading, setProgressLoading] = useState(true);
  const [quote, setQuote] = useState<string>("");
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [sess, prog] = await Promise.all([
          getSession(),
          getProgress().catch(() => null),
        ]);
        setSession(sess);
        setProgress(prog as ProgressData);

        // Set random quote
        setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);

        // Onboarding Check
        if (typeof window !== "undefined") {
          const isOnboarded = localStorage.getItem("hirenix_onboarded_v1");
          if (!isOnboarded) {
            setShowOnboarding(true);
          }
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
        setProgressLoading(false);
      }
    }
    fetchData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    if (hour >= 17 && hour < 21) return "Good Evening";
    return "Good Night";
  };

  const fullName = session?.user?.user_metadata?.full_name || "Guest User";
  const email = session?.user?.email || "Not signed in";
  const plan = session?.user?.user_metadata?.plan || "free";

  const getScoreTrend = (current: number, baseline: number) => {
    const diff = current - baseline;
    if (diff > 0)
      return { icon: TrendingUp, color: "text-emerald-500", text: `+${diff}` };
    if (diff < 0)
      return { icon: TrendingDown, color: "text-pink-500", text: `${diff}` };
    return { icon: Minus, color: "text-slate-400", text: "0" };
  };

  const performanceMetrics = [
    {
      name: "Resume",
      score:
        typeof progress?.ats_trend?.at(-1)?.score === "number"
          ? progress.ats_trend.at(-1)!.score
          : 0,
      base:
        typeof progress?.ats_trend?.at(0)?.score === "number"
          ? progress.ats_trend.at(0)!.score
          : 0,
      color: "#6366f1",
      icon: FileText,
    },
    {
      name: "LinkedIn",
      score:
        typeof progress?.linkedin_trend?.at(-1)?.score === "number"
          ? progress.linkedin_trend.at(-1)!.score
          : 50,
      base:
        typeof progress?.linkedin_trend?.at(0)?.score === "number"
          ? progress.linkedin_trend.at(0)!.score
          : 50,
      color: "#0A66C2",
      icon: User,
    },
    {
      name: "Interview",
      score:
        typeof progress?.interview_trend?.at(-1)?.score === "number"
          ? progress.interview_trend.at(-1)!.score
          : 0,
      base:
        typeof progress?.interview_trend?.at(0)?.score === "number"
          ? progress.interview_trend.at(0)!.score
          : 0,
      color: "#8b5cf6",
      icon: Mic,
    },
    {
      name: "GitHub",
      score:
        typeof progress?.github_trend?.at(-1)?.gpi === "number"
          ? progress.github_trend.at(-1)!.gpi
          : 50,
      base:
        typeof progress?.github_trend?.at(0)?.gpi === "number"
          ? progress.github_trend.at(0)!.gpi
          : 50,
      color: "#64748B",
      icon: Github,
    },
  ];

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
                }
                setShowOnboarding(false);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="animate-fade-up w-full h-[calc(100vh-4rem)] md:h-[calc(100vh-6rem)] flex flex-col mx-auto pb-6 relative overflow-hidden">
        {/* Decorative background orbs */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -left-20 w-96 h-96 rounded-full blur-[120px] bg-brand-blue/10 pointer-events-none -z-10"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute top-1/4 -right-20 w-[500px] h-[500px] rounded-full blur-[150px] bg-brand-purple/10 pointer-events-none -z-10"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.3, 0.1] }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[180px] bg-brand-green/5 pointer-events-none -z-10"
        />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-(--border) relative z-10 shrink-0">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-500 font-bold text-xs uppercase tracking-[0.2em]">
              <Sparkles size={14} />
              Career Command Center
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight font-heading">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-slate-100 dark:to-slate-400">
                {getGreeting()},{""}
              </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-500">
                {fullName.split("")[0]}
              </span>
            </h1>
            <p className="text-slate-500 text-lg max-w-xl leading-relaxed italic animate-in fade-in slide-in-from-bottom-2 duration-1000">
              &quot;
              {quote || "Your career path is being optimized by Hirenix AI."}
              &quot;
            </p>
          </div>

          {loading ? (
            <div className="h-16 w-64 rounded-[40px] bg-slate-100/50 dark:bg-slate-800/50 animate-pulse border border-slate-200/50 dark:border-slate-700/50" />
          ) : (
            <Link
              href="/dashboard/account"
              className="p-1 px-1.5 rounded-[40px] bg-white/50 dark:bg-slate-900/40 border border-white/80 dark:border-slate-800 shadow-premium backdrop-blur-xl flex items-center gap-4 pr-6 group dark: active:scale-[0.98] transition-all duration-500 cursor-pointer"
            >
              <div className="h-14 w-14 rounded-full bg-linear-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg overflow-hidden border-2 border-white">
                <User size={24} />
              </div>
              <div className="flex flex-col">
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  {fullName}
                </div>
                <div className="text-xs text-slate-500 opacity-70">{email}</div>
              </div>
            </Link>
          )}
        </div>

        {/* Performance Pulse Hub */}
        <div className="relative z-10 flex flex-col shrink-0">
          <div className="flex items-center justify-between px-2 mb-4">
            <h2 className="text-xl font-bold font-heading flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-500" />
              Skill Equilibrium
            </h2>
            <Link
              href="/dashboard/progress-tracker"
              className="text-xs font-bold text-indigo-500 transition-colors"
            >
              Detailed Analytics →
            </Link>
          </div>

          <div className="glass-card rounded-[32px] p-4 lg:p-6 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-12 w-full">
            {/* Left: SVG Activity Rings */}
            <div className="flex-shrink-0 relative">
              <div className="text-center mb-6 w-full flex flex-col items-center">
                <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
                  Career Readiness
                </h3>
                <p className="text-xs text-slate-500 mt-1 lg:hidden block">
                  Balance across core domains
                </p>
              </div>

              {progressLoading ? (
                <div className="w-[200px] h-[200px] rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse mx-auto" />
              ) : (
                <ActivityRings
                  metrics={performanceMetrics}
                  size={220}
                  strokeWidth={16}
                />
              )}

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none mt-14">
                <div className="w-16 h-16 rounded-full bg-indigo-500/5 blur-xl" />
              </div>
            </div>

            {/* Right: Compact Dense Metric Pills */}
            <div className="flex-1 w-full grid grid-cols-2 gap-3">
              {performanceMetrics.map((m, i) => {
                const trend = getScoreTrend(m.score, m.base);
                const TrendIcon = trend.icon;
                return (
                  <motion.div
                    key={m.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-white/80 dark:border-slate-800 dark: shadow-sm transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex shrink-0 items-center justify-center border border-white dark:border-slate-800 shadow-sm transition-transform"
                        style={{
                          backgroundColor: `${m.color}15`,
                          color: m.color,
                        }}
                      >
                        <m.icon size={18} strokeWidth={2} />
                      </div>
                      <div>
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500 block mb-0.5">
                          {m.name}
                        </span>
                        <div className="flex items-end gap-2">
                          {progressLoading ? (
                            <div className="w-8 h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                          ) : (
                            <span className="text-xl sm:text-2xl leading-none font-black font-heading text-slate-800 dark:text-slate-100">
                              {m.score}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Trend Pill Right Attached */}
                    {!progressLoading && (
                      <div
                        className={`flex flex-col sm:items-end mt-2 sm:mt-0 shrink-0 ${trend.color}`}
                      >
                        <div className="flex items-center gap-1 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md px-2 py-1 rounded-full shadow-sm border border-slate-100 dark:border-slate-800">
                          <TrendIcon size={12} strokeWidth={3} />
                          <span className="text-[10px] sm:text-xs font-bold">
                            {trend.text}
                          </span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-end mt-4 lg:mt-8 min-h-0">
          <h2 className="text-lg md:text-xl font-bold font-heading px-2 mb-3 lg:mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            Launchpad
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 lg:gap-4 overflow-y-auto pr-1">
            {[
              {
                name: "Resume Studio",
                href: "/dashboard/resume-analysis",
                icon: FileText,
                color: "text-indigo-500",
                bg: "bg-indigo-50",
                darkBg: "dark:bg-indigo-500/10",
                border: "border-indigo-100 dark:border-indigo-500/20",
                desc: "ATS Optimizer",
              },
              {
                name: "GitHub Intel",
                href: "/dashboard/github-analysis",
                icon: Github,
                color: "text-slate-700 dark:text-slate-300",
                bg: "bg-slate-100",
                darkBg: "dark:bg-slate-800",
                border: "border-slate-200 dark:border-slate-700",
                desc: "Code Analyzer",
              },
              {
                name: "Job Match",
                href: "/dashboard/job-match",
                icon: Briefcase,
                color: "text-emerald-500",
                bg: "bg-emerald-50",
                darkBg: "dark:bg-emerald-500/10",
                border: "border-emerald-100 dark:border-emerald-500/20",
                desc: "Role Target",
              },
              {
                name: "AI Interview",
                href: "/dashboard/mock-interview",
                icon: Mic,
                color: "text-violet-500",
                bg: "bg-violet-50",
                darkBg: "dark:bg-violet-500/10",
                border: "border-violet-100 dark:border-violet-500/20",
                desc: "Live Practice",
              },
              {
                name: "LinkedIn Opt",
                href: "/dashboard/linkedin-analysis",
                icon: User,
                color: "text-blue-500",
                bg: "bg-blue-50",
                darkBg: "dark:bg-blue-500/10",
                border: "border-blue-100 dark:border-blue-500/20",
                desc: "Profile Boost",
              },
              {
                name: "Skill Roadmap",
                href: "/dashboard/roadmap",
                icon: MapIcon,
                color: "text-rose-500",
                bg: "bg-rose-50",
                darkBg: "dark:bg-rose-500/10",
                border: "border-rose-100 dark:border-rose-500/20",
                desc: "Career Path",
              },
            ].map((tool, i) => (
              <motion.div
                key={tool.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 + 0.2 }}
              >
                <Link
                  href={tool.href}
                  className={`group flex items-center lg:flex-col lg:justify-center gap-3 p-3 lg:p-4 rounded-[24px] bg-white/70 dark:bg-slate-900/70 border border-white/80 dark:border-slate-800 dark: shadow-sm transition-all duration-300 h-full`}
                >
                  <div
                    className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center shrink-0 border ${tool.border} ${tool.bg} ${tool.darkBg} ${tool.color} transition-transform`}
                  >
                    <tool.icon
                      size={20}
                      strokeWidth={2}
                      className="lg:w-6 lg:h-6"
                    />
                  </div>
                  <div className="flex flex-col lg:text-center">
                    <span className="text-[13px] font-bold text-slate-800 dark:text-slate-100 leading-tight block">
                      {tool.name}
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                      {tool.desc}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
