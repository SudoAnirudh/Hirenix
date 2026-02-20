"use client";
import Link from "next/link";
import {
  FileText,
  Github,
  Briefcase,
  Mic,
  TrendingUp,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const modules = [
  {
    icon: FileText,
    label: "Resume Analysis",
    href: "/dashboard/resume-analysis",
    color: "var(--indigo)",
    score: null,
    desc: "Upload and score your resume",
  },
  {
    icon: Github,
    label: "GitHub Intelligence",
    href: "/dashboard/github-analysis",
    color: "var(--violet)",
    score: null,
    desc: "Analyse your GitHub profile",
  },
  {
    icon: Briefcase,
    label: "Job Matching",
    href: "/dashboard/job-match",
    color: "var(--cyan)",
    score: null,
    desc: "Match against job descriptions",
  },
  {
    icon: Mic,
    label: "Mock Interview",
    href: "/dashboard/mock-interview",
    color: "var(--pink)",
    score: null,
    desc: "Practice with AI questions",
  },
  {
    icon: TrendingUp,
    label: "Progress Tracker",
    href: "/dashboard/progress-tracker",
    color: "var(--emerald)",
    score: null,
    desc: "Track your evolution score",
  },
];

export default function DashboardPage() {
  return (
    <div className="animate-fade-up max-w-5xl">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={18} style={{ color: "var(--indigo)" }} />
          <span
            className="text-sm font-medium"
            style={{ color: "var(--indigo)" }}
          >
            Career Intelligence Hub
          </span>
        </div>
        <h1 className="font-display font-bold text-3xl mb-2">
          Dashboard Overview
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Upload a resume to get started with your AI-powered career analysis.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Resumes Uploaded", value: "—" },
          { label: "Best ATS Score", value: "—" },
          { label: "Job Matches Run", value: "—" },
          { label: "Interview Score", value: "—" },
        ].map(({ label, value }) => (
          <div key={label} className="glass-card p-5 text-center">
            <div className="font-display font-bold text-2xl gradient-text">
              {value}
            </div>
            <div
              className="text-xs mt-1"
              style={{ color: "var(--text-secondary)" }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Module Cards */}
      <h2 className="font-semibold text-lg mb-4">Quick Access</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {modules.map(({ icon: Icon, label, href, color, desc }) => (
          <Link key={href} href={href}>
            <div className="glass-card p-5 flex flex-col gap-3 cursor-pointer">
              <div className="flex items-center justify-between">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: `${color}1a` }}
                >
                  <Icon size={18} style={{ color }} />
                </div>
                <ArrowRight size={16} style={{ color: "var(--text-muted)" }} />
              </div>
              <div>
                <div className="font-semibold text-sm mb-1">{label}</div>
                <div
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {desc}
                </div>
              </div>
            </div>
          </Link>
        ))}
        <Link href="/upload">
          <div
            className="glass-card p-5 flex flex-col gap-3 cursor-pointer"
            style={{ border: "1px dashed var(--border-accent)" }}
          >
            <div className="flex items-center justify-between">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(99,102,241,0.1)" }}
              >
                <FileText size={18} style={{ color: "var(--indigo)" }} />
              </div>
              <ArrowRight size={16} style={{ color: "var(--indigo)" }} />
            </div>
            <div>
              <div className="font-semibold text-sm mb-1 gradient-text">
                Upload Resume
              </div>
              <div
                className="text-xs"
                style={{ color: "var(--text-secondary)" }}
              >
                Start your analysis journey
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
