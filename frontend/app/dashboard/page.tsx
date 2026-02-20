"use client";
import Link from "next/link";
import { FileText, Github, Briefcase, Mic, TrendingUp, ArrowRight, Upload, CheckCircle, Clock } from "lucide-react";

const modules = [
  { icon: FileText,   label: "Resume Analysis",    href: "/dashboard/resume-analysis",  color: "var(--indigo)",  bg: "rgba(99,102,241,0.12)"  },
  { icon: Github,     label: "GitHub Intelligence", href: "/dashboard/github-analysis",  color: "var(--violet)",  bg: "rgba(139,92,246,0.12)"  },
  { icon: Briefcase,  label: "Job Matching",        href: "/dashboard/job-match",        color: "var(--cyan)",    bg: "rgba(6,182,212,0.12)"   },
  { icon: Mic,        label: "Mock Interview",      href: "/dashboard/mock-interview",   color: "var(--pink)",    bg: "rgba(236,72,153,0.12)"  },
  { icon: TrendingUp, label: "Progress Tracker",   href: "/dashboard/progress-tracker", color: "var(--emerald)", bg: "rgba(16,185,129,0.12)"  },
];

const quickActions = [
  { label: "Upload Resume",        href: "/upload",                icon: Upload,    desc: "Get ATS score in seconds" },
  { label: "Match a Job",          href: "/dashboard/job-match",   icon: Briefcase, desc: "Paste any JD and score it" },
  { label: "Mock Interview",       href: "/dashboard/mock-interview", icon: Mic,    desc: "AI questions for your role" },
];

// Placeholder activity feed (will be real data once backend is connected)
const activity = [
  { icon: CheckCircle, text: "Resume uploaded and scored", time: "Just now",   color: "var(--emerald)" },
  { icon: Briefcase,   text: "Job matched — Software Engineer", time: "2h ago", color: "var(--cyan)"    },
  { icon: Mic,         text: "Mock interview session completed", time: "Yesterday", color: "var(--violet)" },
];

export default function DashboardPage() {
  return (
    <div className="animate-fade-up max-w-5xl">

      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium mb-1" style={{ color: "var(--indigo)" }}>Career Intelligence Hub</p>
          <h1 className="font-display font-bold text-3xl mb-1">Good evening! 👋</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Your AI-powered career dashboard. Upload a resume to get started.</p>
        </div>
        <Link href="/upload">
          <button className="btn-primary flex items-center gap-2 text-sm shrink-0">
            <Upload size={14} /> Upload Resume
          </button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 stagger">
        {[
          { label: "Resumes Uploaded", value: "—", color: "var(--indigo)"  },
          { label: "Best ATS Score",   value: "—", color: "var(--violet)"  },
          { label: "Job Matches Run",  value: "—", color: "var(--cyan)"    },
          { label: "Interview Score",  value: "—", color: "var(--emerald)" },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-card p-5 text-center animate-fade-up">
            <div className="font-display font-bold text-2xl" style={{ color }}>{value}</div>
            <div className="text-xs mt-1.5" style={{ color: "var(--text-secondary)" }}>{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Module cards (2/3 width) */}
        <div className="lg:col-span-2">
          <h2 className="font-semibold text-sm mb-4" style={{ color: "var(--text-secondary)" }}>MODULES</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 stagger">
            {modules.map(({ icon: Icon, label, href, color, bg }) => (
              <Link key={href} href={href}>
                <div className="glass-card p-5 flex items-center gap-4 cursor-pointer animate-fade-up group">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110" style={{ background: bg }}>
                    <Icon size={18} style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{label}</div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Click to open →</div>
                  </div>
                </div>
              </Link>
            ))}
            {/* Upload CTA card */}
            <Link href="/upload">
              <div className="glass-card p-5 flex items-center gap-4 cursor-pointer animate-fade-up" style={{ border: "1px dashed var(--border-accent)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(99,102,241,0.1)" }}>
                  <Upload size={18} style={{ color: "var(--indigo)" }} />
                </div>
                <div>
                  <div className="font-semibold text-sm gradient-text">Upload Resume</div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Start your analysis →</div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Activity feed (1/3 width) */}
        <div>
          <h2 className="font-semibold text-sm mb-4" style={{ color: "var(--text-secondary)" }}>RECENT ACTIVITY</h2>
          <div className="glass-card p-5 flex flex-col gap-4">
            {activity.map(({ icon: Icon, text, time, color }, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${color}1a` }}>
                  <Icon size={13} style={{ color }} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium leading-snug">{text}</p>
                  <div className="flex items-center gap-1 mt-1" style={{ color: "var(--text-muted)" }}>
                    <Clock size={10} /> <span className="text-xs">{time}</span>
                  </div>
                </div>
              </div>
            ))}
            <div className="pt-2 border-t" style={{ borderColor: "var(--border)" }}>
              <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>Activity shown once you start using the platform</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions row */}
      <h2 className="font-semibold text-sm mb-4" style={{ color: "var(--text-secondary)" }}>QUICK ACTIONS</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {quickActions.map(({ label, href, icon: Icon, desc }) => (
          <Link key={href} href={href}>
            <div className="glass-card p-5 flex items-center gap-3 cursor-pointer group">
              <Icon size={16} style={{ color: "var(--indigo)" }} />
              <div className="flex-1">
                <div className="text-sm font-medium">{label}</div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>{desc}</div>
              </div>
              <ArrowRight size={14} style={{ color: "var(--text-muted)" }} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
