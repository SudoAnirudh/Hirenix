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
      <div
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div>
          <h1 className="text-3xl font-semibold tracking-tight mb-2">
            Dashboard
          </h1>
          <p
            className="text-sm max-w-md"
            style={{ color: "var(--text-secondary)" }}
          >
            Welcome back to your career intelligence hub. Manage your profile,
            analyze documentation, and track your progress.
          </p>
        </div>

        {loading ? (
          <div
            className="h-16 w-64 rounded-xl animate-pulse"
            style={{ background: "var(--bg-elevated)" }}
          />
        ) : (
          <div className="glass-card flex items-center gap-4 p-3 lg:p-4 rounded-2xl">
            <div
              className="h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(11,124,118,0.12)",
                color: "var(--indigo)",
              }}
            >
              <User size={20} />
            </div>
            <div>
              <div className="text-sm font-medium flex items-center gap-2">
                {fullName}
                <span
                  className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full"
                  style={{ background: "var(--text-primary)", color: "#fff" }}
                >
                  {plan}
                </span>
              </div>
              <div
                className="text-xs mt-0.5"
                style={{ color: "var(--text-secondary)" }}
              >
                {email}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: "Resumes Uploaded", value: "0", icon: FileText },
          { label: "Highest ATS Score", value: "-", icon: TrendingUp },
          { label: "Analyses Run", value: "0", icon: CheckCircle2 },
          { label: "Active Applications", value: "0", icon: Clock },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="glass-card group relative overflow-hidden p-6 rounded-2xl"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="text-3xl font-semibold">{value}</div>
              <div
                className="p-2 rounded-lg transition-colors"
                style={{
                  background: "var(--bg-elevated)",
                  color: "var(--text-secondary)",
                }}
              >
                <Icon size={18} />
              </div>
            </div>
            <div
              className="text-sm font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center gap-2 mb-6">
          <Sparkles style={{ color: "var(--indigo)" }} size={18} />
          <h2 className="text-lg font-semibold">Workspace</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <Link
            href="/upload"
            className="block outline-none rounded-2xl focus-visible:ring-2 focus-visible:ring-[color:var(--indigo)]"
          >
            <div className="h-full p-6 rounded-2xl border border-transparent transition-all group flex flex-col justify-between gap-8 cursor-pointer bg-[linear-gradient(120deg,#dd6b20_0%,#c05621_100%)] text-white shadow-[0_14px_32px_rgba(192,86,33,0.34)]">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white">
                  <FileText size={20} />
                </div>
                <ArrowRight
                  size={18}
                  className="text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all"
                />
              </div>
              <div>
                <div className="text-lg font-medium mb-1">Upload Resume</div>
                <div className="text-sm text-white/80">
                  Start your analysis journey and get AI-powered insights
                  instantly.
                </div>
              </div>
            </div>
          </Link>

          {modules.map(({ icon: Icon, label, href, desc }) => (
            <Link
              key={href}
              href={href}
              className="block outline-none rounded-2xl focus-visible:ring-2 focus-visible:ring-[color:var(--indigo)]"
            >
              <div className="h-full glass-card p-6 rounded-2xl transition-all group flex flex-col justify-between gap-8 cursor-pointer relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[rgba(11,124,118,0.08)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center justify-between relative z-10">
                  <div
                    className="w-10 h-10 rounded-xl border flex items-center justify-center transition-all"
                    style={{
                      background: "var(--bg-elevated)",
                      borderColor: "var(--border)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-all"
                    style={{ color: "var(--text-muted)" }}
                  />
                </div>
                <div className="relative z-10">
                  <div className="text-base font-medium mb-1">{label}</div>
                  <div
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
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
