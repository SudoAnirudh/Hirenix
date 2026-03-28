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
  Map as MapIcon,
} from "lucide-react";
import { getSession, onAuthStateChange, signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  { href: "/dashboard/job-match", icon: Briefcase, label: "Job Matching" },
  { href: "/dashboard/mock-interview", icon: Mic, label: "Mock Interview" },
  {
    href: "/dashboard/progress-tracker",
    icon: TrendingUp,
    label: "Progress Tracker",
  },
  { href: "/dashboard/roadmap", icon: MapIcon, label: "Career Roadmap" },
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
        className="hidden md:flex w-64 shrink-0 flex-col rounded-3xl shadow-glass border border-(--border) overflow-hidden z-20 relative"
        style={{
          background: "var(--bg-surface)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <div className="h-20 flex items-center px-6 gap-3 relative z-10 mb-6">
          <div className="p-2 rounded-2xl bg-[#7C9ADD] flex items-center justify-center shadow-lg shadow-[#7C9ADD]/30">
            <Brain size={20} className="text-white" />
          </div>
          <span className="font-heading font-extrabold text-2xl tracking-tight text-[#1E293B]">
            Hirenix
          </span>
        </div>

        <nav className="flex-1 px-3 py-2 flex flex-col gap-1.5 overflow-y-auto custom-scrollbar">
          <div className="px-4 mb-4">
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#64748B] uppercase px-1">
              Main Menu
            </span>
          </div>
          <AnimatePresence>
            {nav.map(({ href, icon: Icon, label }, index) => (
              <motion.div
                key={href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link
                  href={href}
                  className={`sidebar-link ${pathname === href ? "active" : ""}`}
                >
                  <Icon size={18} strokeWidth={pathname === href ? 2.5 : 2} />
                  <span>{label}</span>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </nav>

        <div className="p-4 mt-auto">
          <div className="p-5 rounded-[24px] bg-white/50 border border-white/80 mb-6 group/plan shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#7C9ADD]/10 rounded-full -mr-10 -mt-10 blur-xl group-hover/plan:bg-[#7C9ADD]/20 transition-colors" />
            <div className="text-[11px] font-bold text-[#1E293B] mb-1 uppercase tracking-wider relative z-10">
              Standard Plan
            </div>
            <div className="text-[10px] text-[#64748B] mb-4 leading-relaxed relative z-10">
              Unlock advanced AI analysis and interview insights.
            </div>
            <Link
              href="/pricing"
              className="block w-full px-4 py-2.5 rounded-xl bg-[#7C9ADD] text-white text-[10px] font-bold text-center transition-all hover:bg-[#6B89CC] hover:shadow-lg hover:shadow-[#7C9ADD]/30 relative z-10"
            >
              Upgrade Now
            </Link>
          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all group font-heading text-sm font-medium text-[#64748B]"
          >
            <LogOut
              size={18}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span>{loggingOut ? "Signing out..." : "Sign Out"}</span>
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
