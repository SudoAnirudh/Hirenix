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
} from "lucide-react";
import { getSession } from "@/lib/auth";

const modules = [
  {
    icon: FileText,
    label: "Resume Analysis",
    href: "/dashboard/resume-analysis",
    desc: "Upload and score your resume",
  },
  {
    icon: Github,
    label: "GitHub Intelligence",
    href: "/dashboard/github-analysis",
    desc: "Analyse your GitHub profile",
  },
  {
    icon: Briefcase,
    label: "Job Matching",
    href: "/dashboard/job-match",
    desc: "Match against job descriptions",
  },
  {
    icon: Mic,
    label: "Mock Interview",
    href: "/dashboard/mock-interview",
    desc: "Practice with AI questions",
  },
  {
    icon: TrendingUp,
    label: "Progress Tracker",
    href: "/dashboard/progress-tracker",
    desc: "Track your evolution score",
  },
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

export default function DashboardPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSession() {
      const sess = await getSession();
      setSession(sess);
      setLoading(false);
    }
    fetchSession();
  }, []);

  const fullName = session?.user?.user_metadata?.full_name || "Guest User";
  const email = session?.user?.email || "Not signed in";
  const plan = session?.user?.user_metadata?.plan || "free";

  return (
    <div className="animate-fade-up max-w-5xl mx-auto space-y-10 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50 mb-2">
            Dashboard
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md">
            Welcome back to your career intelligence hub. Manage your profile,
            analyze documentation, and track your progress.
          </p>
        </div>

        {/* Account Info Card */}
        {loading ? (
          <div className="h-16 w-64 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-xl" />
        ) : (
          <div className="flex items-center gap-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-3 lg:p-4 rounded-2xl shadow-sm">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300">
              <User size={20} />
            </div>
            <div>
              <div className="text-sm font-medium text-neutral-900 dark:text-white flex items-center gap-2">
                {fullName}
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900">
                  {plan}
                </span>
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                {email}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: "Resumes Uploaded", value: "0", icon: FileText },
          { label: "Highest ATS Score", value: "—", icon: TrendingUp },
          { label: "Analyses Run", value: "0", icon: CheckCircle2 },
          { label: "Active Applications", value: "0", icon: Clock },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="group relative overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="text-3xl font-semibold text-neutral-900 dark:text-white">
                {value}
              </div>
              <div className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                <Icon size={18} />
              </div>
            </div>
            <div className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Modules Section */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="text-neutral-400" size={18} />
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Workspace
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Upload Primary Action Card */}
          <Link
            href="/upload"
            className="block outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white rounded-2xl"
          >
            <div className="h-full bg-neutral-900 dark:bg-white p-6 rounded-2xl border border-transparent hover:ring-2 hover:ring-offset-2 hover:ring-neutral-900 dark:hover:ring-white dark:hover:ring-offset-neutral-950 transition-all group flex flex-col justify-between gap-8 cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-white/10 dark:bg-black/5 flex items-center justify-center text-white dark:text-neutral-900">
                  <FileText size={20} />
                </div>
                <ArrowRight
                  size={18}
                  className="text-white/50 dark:text-neutral-900/50 group-hover:text-white dark:group-hover:text-neutral-900 group-hover:translate-x-1 transition-all"
                />
              </div>
              <div>
                <div className="text-lg font-medium text-white dark:text-neutral-900 mb-1">
                  Upload Resume
                </div>
                <div className="text-sm text-white/70 dark:text-neutral-900/70">
                  Start your analysis journey and get AI-powered insights
                  instantly.
                </div>
              </div>
            </div>
          </Link>

          {/* Standard Module Cards */}
          {modules.map(({ icon: Icon, label, href, desc }) => (
            <Link
              key={href}
              href={href}
              className="block outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white rounded-2xl"
            >
              <div className="h-full bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-sm transition-all group flex flex-col justify-between gap-8 cursor-pointer relative overflow-hidden">
                {/* Subtle gradient accent on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-neutral-50/50 to-transparent dark:from-neutral-800/10 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex items-center justify-between relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700/50 flex items-center justify-center text-neutral-600 dark:text-neutral-300 group-hover:scale-105 group-hover:bg-white dark:group-hover:bg-neutral-800 group-hover:shadow-sm transition-all">
                    <Icon size={20} />
                  </div>
                  <ArrowRight
                    size={18}
                    className="text-neutral-300 dark:text-neutral-600 group-hover:text-neutral-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all"
                  />
                </div>
                <div className="relative z-10">
                  <div className="text-base font-medium text-neutral-900 dark:text-white mb-1 group-hover:text-black dark:group-hover:text-white transition-colors">
                    {label}
                  </div>
                  <div className="text-sm text-neutral-500 dark:text-neutral-400">
                    {desc}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
