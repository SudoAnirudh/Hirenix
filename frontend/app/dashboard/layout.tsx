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
  Linkedin,
  Menu,
  X,
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
  {
    href: "/dashboard/linkedin-analysis",
    icon: Linkedin,
    label: "LinkedIn Optimization",
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

const coreTabs = [
  nav[0], // Overview
  nav[2], // Resume Analysis
  nav[5], // Job Match
  nav[6], // Mock Interview
];

const moreTabs = [
  nav[1], // Resume Templates
  nav[3], // GitHub Intelligence
  nav[4], // LinkedIn Optimization
  nav[7], // Progress Tracker
  nav[8], // Career Roadmap
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

    router.replace("/auth/login");
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
        className="hidden md:flex w-64 shrink-0 flex-col rounded-3xl shadow-glass border border-(--border) overflow-hidden z-20 relative p-2"
        style={{
          background: "var(--glass-bg)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          boxShadow: "var(--glass-shadow)",
        }}
      >
        <div className="h-20 flex items-center px-6 gap-3 relative z-10 mb-6">
          <div className="p-2.5 rounded-2xl bg-linear-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Brain size={20} className="text-white" />
          </div>
          <span className="font-heading font-extrabold text-2xl tracking-tighter text-foreground dark:text-white">
            Hirenix
          </span>
        </div>

        <nav className="flex-1 px-2 py-2 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
          <div className="px-4 mb-4 mt-2">
            <span className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase px-1 opacity-60">
              Command Center
            </span>
          </div>
          <AnimatePresence>
            {nav.map(({ href, icon: Icon, label }, index) => (
              <motion.div
                key={href}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
              >
                <Link
                  href={href}
                  className={`relative flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${
                    pathname === href
                      ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                      : "text-muted-foreground dark:"
                  }`}
                >
                  <Icon
                    size={18}
                    strokeWidth={pathname === href ? 2.5 : 2}
                    className="relative z-10 transition-transform duration-300"
                  />
                  <span className="text-sm font-bold tracking-tight relative z-10 transition-all duration-300">
                    {label}
                  </span>
                  {pathname === href && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 bg-indigo-500 rounded-2xl -z-0"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </nav>

        <div className="p-2 mt-auto">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl transition-all group font-heading text-sm font-bold text-muted-foreground border border-transparent"
          >
            <LogOut size={18} className=" group- transition-all duration-300" />
            <span className=" transition-all duration-300">
              {loggingOut ? "Signing out..." : "Sign Out"}
            </span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto scroll-smooth pb-28 md:pb-0">
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

      {/* Mobile Bottom Tab Bar */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm z-50">
        <div className="flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)] rounded-[32px] p-2">
          {coreTabs.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`relative flex-1 flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl transition-all duration-300 ${
                  isActive ? "text-indigo-500" : "text-muted-foreground"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-active-tab"
                    className="absolute inset-0 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-2xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 2}
                  className="relative z-10"
                />
                <span className="text-[9px] font-bold mt-1 tracking-tight truncate w-full text-center">
                  {label.split("")[0]}
                </span>
              </Link>
            );
          })}

          {/* Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`relative flex-1 flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl transition-all duration-300 ${
              isMobileMenuOpen
                ? "text-indigo-500 bg-indigo-500/10"
                : "text-muted-foreground"
            }`}
          >
            {isMobileMenuOpen ? (
              <X size={22} strokeWidth={2.5} />
            ) : (
              <Menu size={22} strokeWidth={2} />
            )}
            <span className="text-[9px] font-bold mt-1 tracking-tight truncate w-full text-center">
              Menu
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Slide-up Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="md:hidden fixed inset-x-0 bottom-0 top-[10%] bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl z-40 rounded-t-[40px] shadow-[0_-20px_40px_rgba(0,0,0,0.1)] border-t border-white/20 dark:border-white/5 overflow-hidden flex flex-col pt-8 pb-32 px-6"
          >
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full" />
            <h2 className="text-2xl font-black font-heading mb-6 tracking-tight text-foreground dark:text-white mt-4 px-2">
              All Tools
            </h2>
            <div className="flex-1 overflow-y-auto w-full grid grid-cols-2 gap-3 auto-rows-max custom-scrollbar pb-8 px-1">
              {moreTabs.map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex flex-col items-start gap-4 p-5 rounded-[28px] bg-slate-50 dark:bg-slate-800/40 dark: border border-transparent dark: transition-all duration-300"
                >
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-sm text-indigo-500 dark:text-indigo-400">
                    <Icon size={20} strokeWidth={2} />
                  </div>
                  <span className="text-[13px] leading-tight font-bold text-foreground dark:text-slate-200">
                    {label}
                  </span>
                </Link>
              ))}
            </div>

            <div className="pt-4 mt-auto">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                disabled={loggingOut}
                className="flex items-center justify-center gap-3 w-full p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-500 dark:text-red-400 font-bold dark: transition-all active:scale-[0.98]"
              >
                <LogOut size={20} />
                <span>{loggingOut ? "Signing out..." : "Sign Out"}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
