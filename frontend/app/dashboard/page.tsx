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
  Map,
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
  {
    icon: Map,
    label: "Career Roadmap",
    href: "/dashboard/roadmap",
    desc: "Visualize your path to success",
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
    <div className="animate-fade-up max-w-6xl mx-auto space-y-12 pb-20 relative">
      {/* Decorative background orbs */}
      <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full blur-[120px] bg-[#7C9ADD]/10 pointer-events-none -z-10" />
      <div className="absolute top-1/4 -right-20 w-[500px] h-[500px] rounded-full blur-[150px] bg-[#B8C1EC]/10 pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[180px] bg-[#98C9A3]/5 pointer-events-none -z-10" />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-white/60 relative z-10">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight text-[#2D3748] font-display">
            Dashboard
          </h1>
          <p className="text-[#718096] text-base max-w-lg leading-relaxed font-body">
            Welcome to your career studio. Use our AI tools to craft
            professional resumes and prepare for your dream interviews.
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
              className="h-12 w-12 rounded-2xl flex items-center justify-center shadow-inner"
              style={{
                background: "rgba(124, 154, 221, 0.1)",
                color: "#7C9ADD",
              }}
            >
              <User size={22} />
            </div>
            <div>
              <div className="text-sm font-bold text-[#2D3748] flex items-center gap-2">
                {fullName}
                <span className="text-[9px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-lg bg-[#7C9ADD] text-white">
                  {plan}
                </span>
              </div>
              <div className="text-xs mt-1 text-[#718096]">{email}</div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
        {[
          {
            label: "Resumes Uploaded",
            value: "0",
            icon: FileText,
            color: "text-[#7C9ADD]",
            bg: "bg-[#7C9ADD]/5",
          },
          {
            label: "AI ATS Score",
            value: "-",
            icon: TrendingUp,
            color: "text-[#98C9A3]",
            bg: "bg-[#98C9A3]/5",
          },
          {
            label: "Analyses Done",
            value: "0",
            icon: CheckCircle2,
            color: "text-[#A5B4FC]",
            bg: "bg-[#A5B4FC]/5",
          },
          {
            label: "Prep Hours",
            value: "0",
            icon: Clock,
            color: "text-[#FBCFE8]",
            bg: "bg-[#FBCFE8]/5",
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="glass-card p-8 rounded-[32px] bg-white/60 border border-white/60 backdrop-blur-xl shadow-glass group relative hover:bg-white/90 hover:translate-y-[-4px] transition-all"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="text-4xl font-bold font-display text-[#2D3748] tracking-tight">
                {value}
              </div>
              <div
                className={`p-3 rounded-2xl ${bg} border border-white shrink-0 shadow-sm ${color}`}
              >
                <Icon size={20} />
              </div>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A0AEC0]">
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
          <Link href="/upload" className="block outline-none rounded-3xl">
            <div className="h-full p-8 rounded-[24px] transition-all group flex flex-col justify-between gap-10 cursor-pointer bg-gradient-to-br from-[#7C9ADD] to-[#93C5FD] text-white shadow-xl shadow-[#7C9ADD]/20 hover:shadow-2xl hover:shadow-[#7C9ADD]/30 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-md border border-white/30">
                  <FileText size={24} />
                </div>
                <div className="p-2 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight size={20} />
                </div>
              </div>
              <div>
                <div className="text-xl font-bold font-display mb-2">
                  Resume Studio
                </div>
                <div className="text-sm text-white/80 leading-relaxed font-body">
                  Start your creative journey and get AI-powered insights
                  instantly.
                </div>
              </div>
            </div>
          </Link>

          {modules.map(({ icon: Icon, label, href, desc }) => (
            <Link
              key={href}
              href={href}
              className="block outline-none rounded-3xl"
            >
              <div className="h-full glass-card p-8 group flex flex-col justify-between gap-10 cursor-pointer relative overflow-hidden active:scale-[0.98]">
                <div className="absolute inset-0 bg-linear-to-br from-[#7C9ADD]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center justify-between relative z-10">
                  <div
                    className="w-12 h-12 rounded-2xl border border-white/60 bg-white/50 flex items-center justify-center transition-all group-hover:bg-white group-hover:shadow-lg group-hover:shadow-blue-500/5"
                    style={{ color: "#7C9ADD" }}
                  >
                    <Icon size={24} />
                  </div>
                  <div className="p-2 rounded-full bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight size={18} className="text-[#7C9ADD]" />
                  </div>
                </div>
                <div className="relative z-10">
                  <div className="text-lg font-bold text-[#2D3748] mb-1 font-display tracking-tight group-hover:text-[#7C9ADD] transition-colors">
                    {label}
                  </div>
                  <div className="text-sm text-[#718096] font-body leading-relaxed">
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
