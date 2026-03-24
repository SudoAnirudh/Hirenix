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
  Map,
  Linkedin,
} from "lucide-react";
import { getSession, onAuthStateChange, signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const nav = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  {
    href: "/dashboard/resume-templates",
    icon: FileText,
    label: "Resume Templates",
  },
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
  {
    href: "/dashboard/linkedin-analysis",
    icon: Linkedin,
    label: "LinkedIn Analysis",
  },
  { href: "/dashboard/job-match", icon: Briefcase, label: "Job Matching" },
  { href: "/dashboard/mock-interview", icon: Mic, label: "Mock Interview" },
  {
    href: "/dashboard/progress-tracker",
    icon: TrendingUp,
    label: "Progress Tracker",
  },
  { href: "/dashboard/roadmap", icon: Map, label: "Career Roadmap" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function verifySession() {
      const session = await getSession();
      if (!mounted) return;

      if (!session) {
        router.replace("/");
        return;
      }

      setCheckingSession(false);
    }

    verifySession();

    const subscription = onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.replace("/");
        router.refresh();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  async function handleLogout() {
    setLoggingOut(true);
    setError("");

    const { error: signOutError } = await signOut();
    if (signOutError) {
      setError(signOutError.message);
      setLoggingOut(false);
      return;
    }

    router.replace("/");
    router.refresh();
  }

  if (checkingSession) {
    return (
      <div
        className="min-h-screen flex items-center justify-center text-sm"
        style={{ color: "var(--text-secondary)" }}
      >
        Loading dashboard...
      </div>
    );
  }

  return (
    <div
      className="flex h-screen overflow-hidden p-4 md:p-6"
      style={{ background: "var(--bg-base)" }}
    >
      <aside
        className="hidden md:flex w-64 shrink-0 flex-col rounded-3xl shadow-glass border border-[var(--border)] overflow-hidden z-20 relative"
        style={{
          background: "var(--bg-surface)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <div className="h-24 flex items-center px-8 gap-3 relative z-10">
          <div className="p-2.5 rounded-2xl bg-[#7C9ADD]/10 flex items-center justify-center">
            <Brain size={22} className="text-[#7C9ADD]" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-[#2D3748]">
            Hirenix
          </span>
        </div>

        <nav className="flex-1 px-4 py-2 flex flex-col gap-2 overflow-y-auto">
          <div className="px-4 mb-3">
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#7C9ADD]/70 uppercase px-1">
              Main Menu
            </span>
          </div>
          {nav.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={`sidebar-link ${pathname === href ? "active" : ""}`}
            >
              <Icon size={18} strokeWidth={pathname === href ? 2.5 : 2} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <div className="p-5 rounded-3xl bg-white/40 border border-white/60 mb-6 group/plan">
            <div className="text-[11px] font-bold text-[#2D3748] mb-1 uppercase tracking-wider">
              Standard Plan
            </div>
            <div className="text-[10px] text-[#718096] mb-4 leading-relaxed">
              Unlock advanced AI analysis and interview insights.
            </div>
            <Link
              href="/pricing"
              className="px-4 py-2 rounded-xl bg-[#7C9ADD] text-white text-[10px] font-bold text-center transition-all hover:bg-[#7C9ADD]/90 hover:shadow-lg hover:shadow-[#7C9ADD]/20"
            >
              Upgrade Now
            </Link>
          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="sidebar-link w-full text-left bg-transparent! hover:text-red-500! group transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            <LogOut
              size={18}
              className="group-hover:translate-x-1 transition-transform"
            />
            {loggingOut ? "Signing out..." : "Sign Out"}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto scroll-smooth">
        <div className="min-h-full w-full px-6 py-6 md:px-12 md:py-10">
          <div className="max-w-[1600px] mx-auto">
            {error && (
              <div className="mb-6 w-full rounded-2xl border border-red-100 bg-red-50/50 p-4 text-sm text-red-700 animate-fade-up">
                {error}
              </div>
            )}
            <div className="w-full flex flex-col">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
