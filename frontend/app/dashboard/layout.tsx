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
  User,
  Sparkles,
  Settings,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { getSession, onAuthStateChange, signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LoadingScreen from "@/components/ui/LoadingScreen";

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

  // Accordion group states
  const [careerOpen, setCareerOpen] = useState(false);
  const [oppsOpen, setOppsOpen] = useState(false);
  const [prepOpen, setPrepOpen] = useState(false);

  // Auto-expand active group
  useEffect(() => {
    if (pathname.startsWith("/dashboard/career")) setCareerOpen(true);
    if (pathname.startsWith("/dashboard/opportunities")) setOppsOpen(true);
    if (pathname.startsWith("/dashboard/preparation")) setPrepOpen(true);
  }, [pathname]);

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
      <LoadingScreen
        message="Initialising Dashboard"
        submessage="Verifying Secure Connection"
      />
    );
  }

  const menuItems = [
    { type: "link", href: "/dashboard", icon: LayoutDashboard, label: "Home" },
    {
      type: "group",
      label: "Career",
      icon: User,
      open: careerOpen,
      setOpen: setCareerOpen,
      children: [
        { href: "/dashboard/career", label: "Overview" },
        { href: "/dashboard/career/resume", label: "Resume Workspace" },
        { href: "/dashboard/career/linkedin", label: "LinkedIn" },
        { href: "/dashboard/career/github", label: "GitHub" },
      ],
    },
    {
      type: "group",
      label: "Opportunities",
      icon: Briefcase,
      open: oppsOpen,
      setOpen: setOppsOpen,
      children: [
        { href: "/dashboard/opportunities/discover", label: "Discover" },
        { href: "/dashboard/opportunities/saved", label: "Saved" },
        {
          href: "/dashboard/opportunities/applications",
          label: "Applications",
        },
      ],
    },
    {
      type: "group",
      label: "Preparation",
      icon: Brain,
      open: prepOpen,
      setOpen: setPrepOpen,
      children: [
        { href: "/dashboard/preparation/interviews", label: "Interviews" },
        { href: "/dashboard/preparation/roadmap", label: "Roadmap" },
      ],
    },
    {
      type: "link",
      href: "/dashboard/progress",
      icon: TrendingUp,
      label: "Progress",
    },
    {
      type: "link",
      href: "/dashboard/ai-copilot",
      icon: Sparkles,
      label: "AI Copilot",
    },
    {
      type: "link",
      href: "/dashboard/settings",
      icon: Settings,
      label: "Settings",
    },
  ];

  // Mobile navigation tabs
  const mobileCoreTabs = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
    {
      href: "/dashboard/opportunities/discover",
      icon: Briefcase,
      label: "Jobs",
    },
    {
      href: "/dashboard/opportunities/applications",
      icon: TrendingUp,
      label: "CRM",
    },
    { href: "/dashboard/ai-copilot", icon: Sparkles, label: "AI" },
    { href: "/dashboard/career", icon: User, label: "Profile" },
  ];

  const mobileDrawerTabs = [
    {
      href: "/dashboard/career/resume",
      icon: FileText,
      label: "Resume Workspace",
    },
    {
      href: "/dashboard/career/linkedin",
      icon: Linkedin,
      label: "LinkedIn Optimization",
    },
    {
      href: "/dashboard/career/github",
      icon: Github,
      label: "GitHub Intelligence",
    },
    {
      href: "/dashboard/opportunities/saved",
      icon: Briefcase,
      label: "Saved Jobs",
    },
    { href: "/dashboard/preparation/roadmap", icon: MapIcon, label: "Roadmap" },
    {
      href: "/dashboard/progress",
      icon: TrendingUp,
      label: "Progress Tracker",
    },
    { href: "/dashboard/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div
      className="flex h-screen overflow-hidden p-4 md:p-6"
      style={{ background: "var(--background)" }}
    >
      <aside
        className="hidden md:flex w-64 shrink-0 flex-col rounded-3xl border border-border overflow-hidden z-20 relative p-2"
        style={{
          background: "var(--card)",
          boxShadow: "var(--shadow-glass)",
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
            {menuItems.map((item, index) => {
              if (item.type === "link") {
                const Icon = item.icon!;
                const isActive = pathname === item.href;
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                  >
                    <Link
                      href={item.href!}
                      className={`relative flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${
                        isActive
                          ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                          : "text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-foreground"
                      }`}
                    >
                      <Icon
                        size={18}
                        strokeWidth={isActive ? 2.5 : 2}
                        className="relative z-10"
                      />
                      <span className="text-sm font-bold tracking-tight relative z-10">
                        {item.label}
                      </span>
                    </Link>
                  </motion.div>
                );
              } else {
                const Icon = item.icon!;
                const isGroupActive = pathname.startsWith(
                  item.children![0].href.split("/").slice(0, 3).join("/"),
                );
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className="flex flex-col"
                  >
                    <button
                      onClick={() => item.setOpen!(!item.open)}
                      className={`flex items-center justify-between w-full px-4 py-3 rounded-2xl transition-all text-left font-heading text-sm font-bold ${
                        isGroupActive
                          ? "text-indigo-500 dark:text-indigo-400"
                          : "text-muted-foreground hover:text-foreground"
                      } hover:bg-slate-50 dark:hover:bg-slate-900/50`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={18} strokeWidth={2} />
                        <span className="text-sm font-bold tracking-tight">
                          {item.label}
                        </span>
                      </div>
                      {item.open ? (
                        <ChevronUp size={14} className="opacity-60" />
                      ) : (
                        <ChevronDown size={14} className="opacity-60" />
                      )}
                    </button>

                    <AnimatePresence initial={false}>
                      {item.open && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden flex flex-col pl-9 mt-1 mb-2 gap-1 border-l border-slate-100 dark:border-slate-800 ml-6"
                        >
                          {item.children!.map((child) => {
                            const isChildActive = pathname === child.href;
                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                className={`py-2 px-3 text-xs font-bold rounded-xl transition-all ${
                                  isChildActive
                                    ? "text-indigo-500 dark:text-indigo-400"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                {child.label}
                              </Link>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              }
            })}
          </AnimatePresence>
        </nav>

        <div className="p-2 mt-auto">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl transition-all group font-heading text-sm font-bold text-muted-foreground border border-transparent hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-foreground"
          >
            <LogOut size={18} />
            <span>{loggingOut ? "Signing out..." : "Sign Out"}</span>
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
        <div className="flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-premium rounded-[32px] p-2">
          {mobileCoreTabs.map(({ href, icon: Icon, label }) => {
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
                  {label}
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
              {mobileDrawerTabs.map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex flex-col items-start gap-4 p-5 rounded-[28px] bg-slate-50 dark:bg-slate-800/40 border border-transparent hover:border-slate-100 transition-all duration-300"
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
                className="flex items-center justify-center gap-3 w-full p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-500 dark:text-red-400 font-bold transition-all active:scale-[0.98]"
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
