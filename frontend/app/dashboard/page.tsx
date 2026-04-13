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
import { motion } from "framer-motion";
import CareerPulseChart from "@/components/dashboard/CareerPulseChart";

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
      color: "var(--indigo)",
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
      color: "var(--violet)",
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
      color: "#1E293B",
      icon: Github,
    },
  ];

  const radarData = performanceMetrics.map((m) => ({
    subject: m.name,
    A: m.score,
    fullMark: 100,
  }));

  return (
    <div className="animate-fade-up w-full mx-auto space-y-12 pb-20 relative">
      {/* Decorative background orbs */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-20 -left-20 w-96 h-96 rounded-full blur-[120px] bg-[#7C9ADD]/10 pointer-events-none -z-10"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute top-1/4 -right-20 w-[500px] h-[500px] rounded-full blur-[150px] bg-[#B8C1EC]/10 pointer-events-none -z-10"
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.3, 0.1] }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[180px] bg-[#98C9A3]/5 pointer-events-none -z-10"
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-(--border) relative z-10">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-500 font-bold text-xs uppercase tracking-[0.2em]">
            <Sparkles size={14} />
            Career Command Center
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight font-heading">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-slate-100 dark:to-slate-400">
              {getGreeting()},{" "}
            </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-500">
              {fullName.split(" ")[0]}
            </span>
          </h1>
          <p className="text-[#64748B] text-lg max-w-xl leading-relaxed italic animate-in fade-in slide-in-from-bottom-2 duration-1000">
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
            className="p-1 px-1.5 rounded-[40px] bg-white/50 dark:bg-slate-900/40 border border-white/80 dark:border-slate-800 shadow-premium backdrop-blur-xl flex items-center gap-4 pr-6 group hover:bg-white/80 dark:hover:bg-slate-900/60 hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 cursor-pointer"
          >
            <div className="h-14 w-14 rounded-full bg-linear-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg overflow-hidden border-2 border-white">
              <User size={24} />
            </div>
            <div className="flex flex-col">
              <div className="text-sm font-bold text-[#1E293B] dark:text-slate-200 flex items-center gap-2">
                {fullName}
              </div>
              <div className="text-xs text-[#64748B] opacity-70">{email}</div>
            </div>
          </Link>
        )}
      </div>

      {/* Performance Pulse Hub */}
      <div className="relative z-10 space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-bold font-heading flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-500" />
            Skill Equilibrium
          </h2>
          <Link
            href="/dashboard/progress-tracker"
            className="text-xs font-bold text-indigo-500 hover:text-indigo-600 transition-colors"
          >
            Detailed Analytics →
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Radar Chart Section */}
          <div className="lg:col-span-5 glass-card rounded-[40px] p-8 flex flex-col items-center justify-center overflow-hidden">
            <div className="text-center mb-4 relative z-10 w-full flex flex-col items-center">
              <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
                Career Readiness
              </h3>
              <p className="text-xs text-[#64748B] mt-1">
                Balance across core domains
              </p>
            </div>
            {progressLoading ? (
              <div className="w-64 h-64 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse mt-4" />
            ) : (
              <CareerPulseChart data={radarData} />
            )}
          </div>

          {/* Metric Cards Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {performanceMetrics.map((m, i) => {
              const trend = getScoreTrend(m.score, m.base);
              const TrendIcon = trend.icon;
              return (
                <motion.div
                  key={m.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="relative group h-full"
                >
                  <Card className="p-6 h-full flex flex-col justify-between glass-card group-hover:bg-white/60 dark:group-hover:bg-slate-800/60 transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#64748B] mb-1">
                          {m.name}
                        </span>
                        <div className="flex items-center gap-2">
                          {progressLoading ? (
                            <div className="h-9 w-12 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                          ) : (
                            <span className="text-3xl font-black font-heading bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-500 dark:from-white dark:to-slate-400">
                              {m.score}
                            </span>
                          )}
                          {!progressLoading && (
                            <div
                              className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-[10px] font-bold ${trend.color} shadow-xs`}
                            >
                              <TrendIcon size={10} />
                              {trend.text}
                            </div>
                          )}
                        </div>
                      </div>
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center border border-white dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900 text-slate-400 group-hover:scale-110 transition-transform"
                        style={{ color: m.color }}
                      >
                        <m.icon size={20} />
                      </div>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="relative w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${m.score}%` }}
                        transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                        className="h-full rounded-full shadow-sm"
                        style={{ backgroundColor: m.color }}
                      />
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <h2 className="text-2xl font-bold font-heading px-2">
          Ready to evolve?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 pb-12">
          {/* Resume Analysis - Featured */}
          <motion.div
            whileHover={{ y: -5, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="lg:col-span-8 shadow-premium shadow-indigo-500/10 hover:shadow-indigo-500/20 rounded-[32px] transition-all duration-500"
          >
            <Link
              href="/dashboard/resume-analysis"
              className="group relative overflow-hidden rounded-[32px] block outline-none h-full w-full"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-violet-600 opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-40 -mt-20 group-hover:scale-110 transition-transform duration-700" />

              <div className="relative h-full p-10 flex flex-col justify-between min-h-[320px] text-white">
                <div className="flex justify-between items-start">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-md flex items-center justify-center text-white shadow-xl group-hover:scale-105 transition-transform duration-300">
                    <FileText size={32} />
                  </div>
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                    <ArrowRight size={24} />
                  </div>
                </div>

                <div className="max-w-md">
                  <h3 className="text-3xl font-black font-heading mb-4 leading-tight">
                    Resume Studio™
                  </h3>
                  <p className="text-white/80 text-lg leading-relaxed font-medium">
                    Our advanced AI scanner analyzes 50+ career metrics to help
                    you bypass ATS filters and land more interviews.
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* GitHub Analysis */}
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="lg:col-span-4 shadow-glass rounded-[32px] transition-all duration-500"
          >
            <Link
              href="/dashboard/github-analysis"
              className="group relative overflow-hidden rounded-[32px] block outline-none h-full w-full"
            >
              <Card className="h-full p-10 flex flex-col justify-between border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-900 group-hover:border-indigo-200 dark:group-hover:border-indigo-500/30 transition-colors">
                <div className="flex justify-between items-start mb-12">
                  <div className="w-14 h-14 rounded-2xl bg-[#1E293B] dark:bg-slate-800 border border-slate-700 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                    <Github size={28} />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <ArrowRight
                      size={20}
                      className="text-indigo-500 dark:text-indigo-400"
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold font-heading text-[#1E293B] dark:text-slate-100 mb-2">
                    GitHub Intelligence
                  </h3>
                  <p className="text-[#64748B] dark:text-slate-400 text-sm leading-relaxed">
                    Analyze your code patterns and contribution velocity.
                  </p>
                </div>
              </Card>
            </Link>
          </motion.div>

          {/* Job Match */}
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="lg:col-span-4 shadow-glass rounded-[32px] transition-all duration-500"
          >
            <Link
              href="/dashboard/job-match"
              className="group relative overflow-hidden rounded-[32px] block outline-none h-full w-full"
            >
              <Card className="h-full p-10 flex flex-col justify-between border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-900 group-hover:border-emerald-200 dark:group-hover:border-emerald-500/30 transition-colors">
                <div className="flex justify-between items-start mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 group-hover:scale-105 transition-transform duration-300">
                    <Briefcase size={28} />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold font-heading text-[#1E293B] dark:text-slate-100 mb-2">
                    Job Match
                  </h3>
                  <p className="text-[#64748B] dark:text-slate-400 text-sm italic mb-4">
                    &quot;98% match found for Google L4 Role&quot;
                  </p>
                  <Button
                    variant="ghost"
                    className="w-full text-xs h-10 rounded-xl border-emerald-100 dark:border-emerald-500/30 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  >
                    Explore Matches
                  </Button>
                </div>
              </Card>
            </Link>
          </motion.div>

          {/* Mock Interview */}
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="lg:col-span-4 shadow-glass rounded-[32px] transition-all duration-500 shadow-premium shadow-indigo-500/5 hover:shadow-indigo-500/15"
          >
            <Link
              href="/dashboard/mock-interview"
              className="group relative overflow-hidden rounded-[32px] block outline-none h-full w-full"
            >
              <Card className="h-full p-10 flex flex-col justify-between border-indigo-100/50 dark:border-indigo-500/20 bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-900 transition-colors">
                <div className="flex justify-between items-start mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/30 group-hover:scale-105 transition-transform duration-300">
                    <Mic size={28} />
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 border border-red-100 dark:border-red-500/20 text-[10px] font-bold uppercase animate-pulse">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-400" />
                    Live AI
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold font-heading text-[#1E293B] dark:text-slate-100 mb-2">
                    AI Interview
                  </h3>
                  <p className="text-[#64748B] dark:text-slate-400 text-sm leading-relaxed">
                    Practice real-time technical interviews with vocal
                    recognition.
                  </p>
                </div>
              </Card>
            </Link>
          </motion.div>

          {/* LinkedIn Optimization */}
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="lg:col-span-4 shadow-glass rounded-[32px] transition-all duration-500"
          >
            <Link
              href="/dashboard/linkedin-analysis"
              className="group relative overflow-hidden rounded-[32px] block outline-none h-full w-full"
            >
              <Card className="h-full p-10 flex flex-col justify-between border-blue-100/50 dark:border-blue-900/30 bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-900 overflow-hidden transition-colors">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50/30 dark:from-blue-900/10 dark:to-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-[#0A66C2] flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                      <User size={28} />
                    </div>
                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <ArrowRight
                        size={20}
                        className="text-[#0A66C2] dark:text-blue-400"
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-heading text-[#1E293B] dark:text-slate-100 mb-2">
                      LinkedIn Optimizer
                    </h3>
                    <p className="text-[#64748B] dark:text-slate-400 text-sm leading-relaxed">
                      Improve your professional brand and search visibility.
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>

          {/* Career Roadmap */}
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="lg:col-span-4 shadow-glass rounded-[32px] transition-all duration-500"
          >
            <Link
              href="/dashboard/roadmap"
              className="group relative overflow-hidden rounded-[32px] block outline-none h-full w-full"
            >
              <Card className="h-full p-10 flex flex-col justify-between border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-900 overflow-hidden transition-colors">
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full -mb-12 -mr-12 blur-2xl group-hover:bg-indigo-500/10 dark:group-hover:bg-indigo-500/20 transition-colors duration-500" />
                <div className="flex justify-between items-start mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center text-violet-500 dark:text-violet-400 border border-violet-100 dark:border-violet-500/20 group-hover:scale-105 transition-transform duration-300">
                    <MapIcon size={28} />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold font-heading text-[#1E293B] dark:text-slate-100 mb-2">
                    Skill Roadmap
                  </h3>
                  <p className="text-[#64748B] dark:text-slate-400 text-sm leading-relaxed">
                    Personalized learning path based on your role goals.
                  </p>
                </div>
              </Card>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
