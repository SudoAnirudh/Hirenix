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
      <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full blur-[120px] bg-[#7C9ADD]/10 pointer-events-none -z-10" />
      <div className="absolute top-1/4 -right-20 w-[500px] h-[500px] rounded-full blur-[150px] bg-[#B8C1EC]/10 pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[180px] bg-[#98C9A3]/5 pointer-events-none -z-10" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-(--border) relative z-10">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-500 font-bold text-xs uppercase tracking-[0.2em]">
            <Sparkles size={14} />
            Career Command Center
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-[#1E293B] font-heading dark:text-slate-100">
            {getGreeting()},{" "}
            <span className="text-indigo-500">{fullName.split(" ")[0]}</span>
          </h1>
          <p className="text-[#64748B] text-lg max-w-xl leading-relaxed italic animate-in fade-in slide-in-from-bottom-2 duration-1000">
            &quot;
            {quote || "Your career path is being optimized by Hirenix AI."}
            &quot;
          </p>
        </div>

        {loading ? (
          <div className="h-20 w-72 rounded-3xl bg-white/40 animate-pulse border border-white/60" />
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
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-[#1E293B] dark:text-white">
                Career Readiness
              </h3>
              <p className="text-xs text-[#64748B]">
                Balance across core domains
              </p>
            </div>
            <CareerPulseChart data={radarData} />
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
                          <span className="text-3xl font-black font-heading text-[#1E293B] dark:text-white">
                            {progressLoading ? "—" : m.score}
                          </span>
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
          <Link
            href="/dashboard/resume-analysis"
            className="lg:col-span-8 group relative overflow-hidden rounded-[32px] block outline-none active:scale-[0.99] transition-transform"
          >
            <div className="absolute inset-0 bg-linear-to-br from-indigo-500 to-violet-600 opacity-90 group-hover:opacity-100 transition-opacity" />
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-40 -mt-20 group-hover:scale-110 transition-transform duration-700" />

            <div className="relative h-full p-10 flex flex-col justify-between min-h-[320px] text-white">
              <div className="flex justify-between items-start">
                <div className="w-16 h-16 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-md flex items-center justify-center text-white shadow-xl">
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

          {/* GitHub Analysis */}
          <Link
            href="/dashboard/github-analysis"
            className="lg:col-span-4 group relative overflow-hidden rounded-[32px] block outline-none active:scale-[0.99] transition-transform"
          >
            <Card className="h-full p-10 flex flex-col justify-between border-white/80 bg-white/90 hover:bg-white group-hover:border-indigo-200">
              <div className="flex justify-between items-start mb-12">
                <div className="w-14 h-14 rounded-2xl bg-[#1E293B] flex items-center justify-center text-white shadow-lg">
                  <Github size={28} />
                </div>
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                  <ArrowRight size={20} className="text-indigo-500" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold font-heading text-[#1E293B] mb-2">
                  GitHub Intelligence
                </h3>
                <p className="text-[#64748B] text-sm leading-relaxed">
                  Analyze your code patterns and contribution velocity.
                </p>
              </div>
            </Card>
          </Link>

          {/* Job Match */}
          <Link
            href="/dashboard/job-match"
            className="lg:col-span-4 group relative overflow-hidden rounded-[32px] block outline-none active:scale-[0.99] transition-transform"
          >
            <Card className="h-full p-10 flex flex-col justify-between border-white/80 bg-white/90 hover:bg-white">
              <div className="flex justify-between items-start mb-8">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 border border-emerald-200">
                  <Briefcase size={28} />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold font-heading text-[#1E293B] mb-2">
                  Job Match
                </h3>
                <p className="text-[#64748B] text-sm italic mb-4">
                  &quot;98% match found for Google L4 Role&quot;
                </p>
                <Button
                  variant="ghost"
                  className="w-full text-xs h-10 rounded-xl border-emerald-100 group-hover:bg-emerald-50 text-emerald-600"
                >
                  Explore Matches
                </Button>
              </div>
            </Card>
          </Link>

          {/* Mock Interview */}
          <Link
            href="/dashboard/mock-interview"
            className="lg:col-span-4 group relative overflow-hidden rounded-[32px] block outline-none active:scale-[0.99] transition-transform shadow-premium shadow-indigo-500/5 hover:shadow-indigo-500/15"
          >
            <Card className="h-full p-10 flex flex-col justify-between border-indigo-100/50 bg-white/90 hover:bg-white">
              <div className="flex justify-between items-start mb-8">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 border border-indigo-100">
                  <Mic size={28} />
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-red-500 text-[10px] font-bold uppercase animate-pulse">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  Live AI
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold font-heading text-[#1E293B] mb-2">
                  AI Interview
                </h3>
                <p className="text-[#64748B] text-sm leading-relaxed">
                  Practice real-time technical interviews with vocal
                  recognition.
                </p>
              </div>
            </Card>
          </Link>

          {/* LinkedIn Optimization */}
          <Link
            href="/dashboard/linkedin-analysis"
            className="lg:col-span-4 group relative overflow-hidden rounded-[32px] block outline-none active:scale-[0.99] transition-transform"
          >
            <Card className="h-full p-10 flex flex-col justify-between border-blue-100/50 bg-white/90 hover:bg-white overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-br from-blue-50 to-indigo-50/30 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-[#0A66C2] flex items-center justify-center text-white shadow-lg">
                    <User size={28} />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                    <ArrowRight size={20} className="text-[#0A66C2]" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold font-heading text-[#1E293B] mb-2">
                    LinkedIn Optimizer
                  </h3>
                  <p className="text-[#64748B] text-sm leading-relaxed">
                    Improve your professional brand and search visibility.
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          {/* Career Roadmap */}
          <Link
            href="/dashboard/roadmap"
            className="lg:col-span-4 group relative overflow-hidden rounded-[32px] block outline-none active:scale-[0.99] transition-transform"
          >
            <Card className="h-full p-10 flex flex-col justify-between border-white/80 bg-white/90 hover:bg-white overflow-hidden">
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full -mb-12 -mr-12 blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
              <div className="flex justify-between items-start mb-8">
                <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-500 border border-violet-100">
                  <MapIcon size={28} />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold font-heading text-[#1E293B] mb-2">
                  Skill Roadmap
                </h3>
                <p className="text-[#64748B] text-sm leading-relaxed">
                  Personalized learning path based on your role goals.
                </p>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
