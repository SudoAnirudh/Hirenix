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
      {/* Sidebar */}
      <aside
        className="w-60 flex-shrink-0 flex flex-col border-r"
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--border)",
        }}
      >
        <div
          className="h-16 flex items-center px-5 gap-2 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <Brain size={22} style={{ color: "var(--indigo)" }} />
          <span className="font-display font-bold text-lg gradient-text">
            Hirenix
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          {nav.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={`sidebar-link ${pathname === href ? "active" : ""}`}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        <div
          className="px-3 py-4 border-t flex flex-col gap-1"
          style={{ borderColor: "var(--border)" }}
        >
          <Link href="/pricing" className="sidebar-link">
            <CreditCard size={16} /> Upgrade Plan
          </Link>
          <button
            onClick={handleLogout}
            className="sidebar-link w-full text-left"
            style={{ color: "var(--text-muted)" }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
