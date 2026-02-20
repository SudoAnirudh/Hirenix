"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Brain,
  LayoutDashboard,
  FileText,
  Github,
  Briefcase,
  Mic,
  TrendingUp,
  LogOut,
  CreditCard,
  Zap,
} from "lucide-react";
import { signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";

const nav = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  {
    href: "/dashboard/resume-analysis",
    icon: FileText,
    label: "Resume Analysis",
  },
  {
    href: "/dashboard/github-analysis",
    icon: Github,
    label: "GitHub Intelligence",
  },
  { href: "/dashboard/job-match", icon: Briefcase, label: "Job Matching" },
  { href: "/dashboard/mock-interview", icon: Mic, label: "Mock Interview" },
  {
    href: "/dashboard/progress-tracker",
    icon: TrendingUp,
    label: "Progress Tracker",
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await signOut();
    router.push("/auth/login");
  }

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "var(--bg-base)" }}
    >
      {/* ── Sidebar ── */}
      <aside
        className="w-64 flex-shrink-0 flex flex-col border-r"
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--border)",
        }}
      >
        {/* Logo */}
        <div
          className="h-16 flex items-center px-6 gap-2 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <Brain size={22} style={{ color: "var(--indigo)" }} />
          <span className="font-display font-bold text-lg gradient-text">
            Hirenix
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 flex flex-col gap-1 overflow-y-auto">
          <p
            className="text-xs font-semibold px-3 mb-3 tracking-widest uppercase opacity-60"
            style={{ color: "var(--text-muted)" }}
          >
            Menu
          </p>
          {nav.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={`sidebar-link ${pathname === href ? "active" : ""}`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Upgrade banner */}
        <div
          className="mx-4 mb-4 rounded-xl p-4 relative overflow-hidden group"
          style={{
            background:
              "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))",
            border: "1px solid rgba(99,102,241,0.2)",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-100%] group-hover:animate-shimmer" />

          <div className="flex items-center gap-2 mb-2">
            <div className="p-1 rounded bg-indigo-500/20">
              <Zap size={14} className="text-indigo-400" />
            </div>
            <span className="text-sm font-semibold text-indigo-300">
              Free Plan
            </span>
          </div>
          <p
            className="text-xs mb-3 leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            Unlock GitHub analysis & unlimited AI interviews
          </p>
          <Link href="/pricing">
            <button className="btn-primary text-xs py-2 w-full shadow-lg shadow-indigo-500/20">
              Upgrade to Pro
            </button>
          </Link>
        </div>

        {/* Bottom actions */}
        <div
          className="px-4 pb-6 border-t pt-4 flex flex-col gap-1"
          style={{ borderColor: "var(--border)" }}
        >
          {/* User avatar placeholder */}
          <div className="flex items-center gap-3 px-3 py-2.5 mb-2 rounded-lg transition-colors hover:bg-white/5 cursor-pointer">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-white/10"
              style={{
                background:
                  "linear-gradient(135deg, var(--indigo), var(--violet))",
              }}
            >
              JD
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">John Doe</div>
              <div
                className="text-xs truncate opacity-70"
                style={{ color: "var(--text-muted)" }}
              >
                john@example.com
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="sidebar-link w-full text-left text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 overflow-y-auto bg-black/20">
        <div className="p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
