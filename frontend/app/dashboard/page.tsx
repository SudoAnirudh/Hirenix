"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Github,
  Briefcase,
  Mic,
  TrendingUp,
  ArrowRight,
  User,
  Clock,
  CheckCircle2,
  Sparkles,
  Map as MapIcon,
  Zap,
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { getProgress } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

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
  ats_trend?: any[];
  resume_evolution_score?: number | string;
  interview_trend?: any[];
  github_trend?: any[];
}

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
  ats_trend?: any[];
  resume_evolution_score?: number | string;
  interview_trend?: any[];
  github_trend?: any[];
}

export default function DashboardPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [progressLoading, setProgressLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const sess = await getSession();
        setSession(sess);
        setLoading(false);

        const prog = (await getProgress()) as ProgressData;
        setProgress(prog);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
        setProgressLoading(false);
      }
    }
    fetchData();
  }, []);

  const fullName = session?.user?.user_metadata?.full_name || "Guest User";
  const email = session?.user?.email || "Not signed in";
  const plan = session?.user?.user_metadata?.plan || "free";
  const stats = [
    {
      label: "Resumes Uploaded",
      value: progress?.ats_trend?.length?.toString() || "0",
      icon: FileText,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
    },
    {
      label: "AI ATS Score",
      value: progress?.resume_evolution_score?.toString() || "-",
      icon: Zap,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Analyses Done",
      value: (
        (progress?.ats_trend?.length || 0) +
        (progress?.interview_trend?.length || 0) +
        (progress?.github_trend?.length || 0)
      ).toString(),
      icon: CheckCircle2,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
    },
    {
      label: "Prep Hours",
      value: "12",
      icon: Clock,
      color: "text-pink-500",
      bg: "bg-pink-500/10",
    },
  ];

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
          <h1 className="text-5xl font-extrabold tracking-tight text-[#1E293B] font-heading">
            Good Morning,{" "}
            <span className="text-indigo-500">{fullName.split(" ")[0]}</span>
          </h1>
          <p className="text-[#64748B] text-lg max-w-xl leading-relaxed italic">
            &quot;Your career path is being optimized by Hirenix AI.&quot;
          </p>
        </div>

        {loading ? (
          <div className="h-20 w-72 rounded-3xl bg-white/40 animate-pulse border border-white/60" />
        ) : (
          <Link
            href="/dashboard/account"
            className="p-1 px-1.5 rounded-[40px] bg-white/50 border border-white/80 shadow-premium backdrop-blur-xl flex items-center gap-4 pr-6 group hover:bg-white/80 hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 cursor-pointer"
          >
            <div className="h-14 w-14 rounded-full bg-linear-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg overflow-hidden border-2 border-white">
              <User size={24} />
            </div>
            <div className="flex flex-col">
              <div className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
                {fullName}
                <span className="text-[9px] uppercase font-extrabold tracking-widest px-2.5 py-1.5 rounded-full bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                  {plan}
                </span>
              </div>
              <div className="text-xs text-[#64748B] opacity-70">{email}</div>
            </div>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {stats.map(({ label, value, icon: Icon, color, bg }, index) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="p-8 border-white/80 bg-white/60 hover:bg-white/90">
              <div className="flex justify-between items-start mb-6">
                {progressLoading ? (
                  <div className="h-10 w-16 bg-slate-100 rounded-lg animate-pulse" />
                ) : (
                  <div className="text-5xl font-black font-heading text-[#1E293B] tracking-tight">
                    {value}
                  </div>
                )}
                <div
                  className={`p-3.5 rounded-2xl ${bg} border border-white/60 shrink-0 shadow-sm ${color} transition-transform group-hover:scale-110 duration-500`}
                >
                  <Icon size={20} />
                </div>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#64748B] opacity-60">
                {label}
              </div>
            </Card>
          </motion.div>
        ))}
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
