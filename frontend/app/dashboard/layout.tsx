"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Search,
  ChevronRight,
  Bell,
  CheckCircle2,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { getSession, onAuthStateChange, signOut } from "@/lib/auth";
import LoadingScreen from "@/components/ui/LoadingScreen";
import CommandPalette from "@/components/ui/CommandPalette";

interface UserSession {
  user?: {
    email?: string;
    user_metadata?: {
      full_name?: string;
      plan?: string;
    };
  };
}

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
  const [session, setSession] = useState<UserSession | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Sub-navigation group states
  const [careerOpen, setCareerOpen] = useState(true);
  const [oppsOpen, setOppsOpen] = useState(true);
  const [prepOpen, setPrepOpen] = useState(true);

  useEffect(() => {
    if (pathname.startsWith("/dashboard/career")) setCareerOpen(true);
    if (pathname.startsWith("/dashboard/opportunities")) setOppsOpen(true);
    if (pathname.startsWith("/dashboard/preparation")) setPrepOpen(true);
  }, [pathname]);

  useEffect(() => {
    const handleOpenCommandPalette = () => setIsCommandPaletteOpen(true);
    window.addEventListener(
      "hirenix:open-command-palette",
      handleOpenCommandPalette,
    );
    return () =>
      window.removeEventListener(
        "hirenix:open-command-palette",
        handleOpenCommandPalette,
      );
  }, []);

  useEffect(() => {
    let mounted = true;

    async function verifySession() {
      const sess = await getSession();
      if (!mounted) return;

      if (!sess) {
        router.replace("/auth/login");
        return;
      }

      setSession(sess);
      setCheckingSession(false);
    }

    verifySession();

    const subscription = onAuthStateChange((event, currentSession) => {
      if (event === "SIGNED_OUT" || !currentSession) {
        router.replace("/auth/login");
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
        message="Initialising Hirenix Workstation"
        submessage="Verifying Credentials & Workspace Environment"
      />
    );
  }

  const fullName = session?.user?.user_metadata?.full_name || "Candidate";
  const email = session?.user?.email || "";
  const plan = (session?.user?.user_metadata?.plan || "free").toUpperCase();

  // Helper for path breadcrumb titles
  const getBreadcrumbs = () => {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length <= 1) return [{ label: "Dashboard", href: "/dashboard" }];

    const breadcrumbs = [{ label: "Dashboard", href: "/dashboard" }];
    if (parts[1] === "career") {
      breadcrumbs.push({
        label: "Career Intelligence",
        href: "/dashboard/career",
      });
      if (parts[2] === "resume")
        breadcrumbs.push({
          label: "Resume Workspace",
          href: "/dashboard/career/resume",
        });
      if (parts[2] === "github")
        breadcrumbs.push({
          label: "GitHub Intelligence",
          href: "/dashboard/career/github",
        });
      if (parts[2] === "linkedin")
        breadcrumbs.push({
          label: "LinkedIn Optimization",
          href: "/dashboard/career/linkedin",
        });
    } else if (parts[1] === "opportunities") {
      breadcrumbs.push({
        label: "Opportunities",
        href: "/dashboard/opportunities/discover",
      });
      if (parts[2] === "discover")
        breadcrumbs.push({
          label: "Job Discovery",
          href: "/dashboard/opportunities/discover",
        });
      if (parts[2] === "saved")
        breadcrumbs.push({
          label: "Saved Openings",
          href: "/dashboard/opportunities/saved",
        });
      if (parts[2] === "applications")
        breadcrumbs.push({
          label: "Application CRM",
          href: "/dashboard/opportunities/applications",
        });
    } else if (parts[1] === "preparation") {
      breadcrumbs.push({
        label: "Preparation",
        href: "/dashboard/preparation/interviews",
      });
      if (parts[2] === "interviews")
        breadcrumbs.push({
          label: "Interview Simulator",
          href: "/dashboard/preparation/interviews",
        });
      if (parts[2] === "roadmap")
        breadcrumbs.push({
          label: "Skill Roadmap",
          href: "/dashboard/preparation/roadmap",
        });
    } else if (parts[1] === "progress") {
      breadcrumbs.push({
        label: "Progress Tracker",
        href: "/dashboard/progress",
      });
    } else if (parts[1] === "ai-copilot") {
      breadcrumbs.push({
        label: "AI Career Copilot",
        href: "/dashboard/ai-copilot",
      });
    } else if (parts[1] === "settings") {
      breadcrumbs.push({ label: "Settings", href: "/dashboard/settings" });
    }

    return breadcrumbs;
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-card">
        {/* Workspace Brand */}
        <div className="h-16 flex items-center px-5 border-b border-border justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-extrabold text-sm shadow-xs">
              <Brain size={18} />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-base tracking-tight text-foreground group-hover:text-primary transition-colors">
                Hirenix
              </span>
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest leading-none">
                Career Engine
              </span>
            </div>
          </Link>

          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-border bg-muted text-foreground">
            {plan}
          </span>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Main Navigation */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
              Command Center
            </div>
            <Link
              href="/dashboard"
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                pathname === "/dashboard"
                  ? "bg-primary text-primary-foreground font-bold shadow-xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <LayoutDashboard size={16} />
              <span>Overview Workstation</span>
            </Link>
          </div>

          {/* Career Intelligence */}
          <div>
            <button
              onClick={() => setCareerOpen(!careerOpen)}
              className="w-full flex items-center justify-between px-3 mb-1 text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>Career Intelligence</span>
              {careerOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
            {careerOpen && (
              <div className="space-y-0.5">
                <Link
                  href="/dashboard/career"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    pathname === "/dashboard/career"
                      ? "bg-muted text-foreground font-bold border border-border"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  <User size={15} />
                  <span>Profile Overview</span>
                </Link>
                <Link
                  href="/dashboard/career/resume"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    pathname === "/dashboard/career/resume"
                      ? "bg-muted text-foreground font-bold border border-border"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  <FileText size={15} />
                  <span>Resume Workspace</span>
                </Link>
                <Link
                  href="/dashboard/career/github"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    pathname === "/dashboard/career/github"
                      ? "bg-muted text-foreground font-bold border border-border"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  <Github size={15} />
                  <span>GitHub Production Index</span>
                </Link>
                <Link
                  href="/dashboard/career/linkedin"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    pathname === "/dashboard/career/linkedin"
                      ? "bg-muted text-foreground font-bold border border-border"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  <Linkedin size={15} />
                  <span>LinkedIn Audit</span>
                </Link>
              </div>
            )}
          </div>

          {/* Opportunities */}
          <div>
            <button
              onClick={() => setOppsOpen(!oppsOpen)}
              className="w-full flex items-center justify-between px-3 mb-1 text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>Opportunities</span>
              {oppsOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
            {oppsOpen && (
              <div className="space-y-0.5">
                <Link
                  href="/dashboard/opportunities/discover"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    pathname === "/dashboard/opportunities/discover"
                      ? "bg-muted text-foreground font-bold border border-border"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  <Briefcase size={15} />
                  <span>Job Discovery</span>
                </Link>
                <Link
                  href="/dashboard/opportunities/saved"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    pathname === "/dashboard/opportunities/saved"
                      ? "bg-muted text-foreground font-bold border border-border"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  <CheckCircle2 size={15} />
                  <span>Saved Positions</span>
                </Link>
                <Link
                  href="/dashboard/opportunities/applications"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    pathname === "/dashboard/opportunities/applications"
                      ? "bg-muted text-foreground font-bold border border-border"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  <TrendingUp size={15} />
                  <span>Application CRM</span>
                </Link>
              </div>
            )}
          </div>

          {/* Preparation */}
          <div>
            <button
              onClick={() => setPrepOpen(!prepOpen)}
              className="w-full flex items-center justify-between px-3 mb-1 text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>Preparation</span>
              {prepOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
            {prepOpen && (
              <div className="space-y-0.5">
                <Link
                  href="/dashboard/preparation/interviews"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    pathname === "/dashboard/preparation/interviews"
                      ? "bg-muted text-foreground font-bold border border-border"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  <Mic size={15} />
                  <span>Interview Simulator</span>
                </Link>
                <Link
                  href="/dashboard/preparation/roadmap"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    pathname === "/dashboard/preparation/roadmap"
                      ? "bg-muted text-foreground font-bold border border-border"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  <MapIcon size={15} />
                  <span>Career Roadmap</span>
                </Link>
              </div>
            )}
          </div>

          {/* AI Tools */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
              Autonomous Systems
            </div>
            <Link
              href="/dashboard/ai-copilot"
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                pathname === "/dashboard/ai-copilot"
                  ? "bg-muted text-foreground font-bold border border-border"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              <Sparkles size={15} className="text-primary" />
              <span>AI Career Copilot</span>
            </Link>
            <Link
              href="/dashboard/progress"
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                pathname === "/dashboard/progress"
                  ? "bg-muted text-foreground font-bold border border-border"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              <TrendingUp size={15} />
              <span>Progress Analytics</span>
            </Link>
          </div>
        </nav>

        {/* User Account Bar */}
        <div className="p-3 border-t border-border bg-slate-50/50 dark:bg-slate-900/50">
          <Link
            href="/dashboard/settings"
            className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-md bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center shrink-0">
                {fullName[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                  {fullName}
                </div>
                <div className="text-[10px] text-muted-foreground truncate">
                  {email}
                </div>
              </div>
            </div>
            <Settings
              size={14}
              className="text-muted-foreground group-hover:text-foreground shrink-0"
            />
          </Link>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Global Header */}
        <header className="h-16 shrink-0 border-b border-border bg-card px-4 lg:px-8 flex items-center justify-between gap-4 z-10">
          {/* Breadcrumbs Navigation */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-md hover:bg-muted text-foreground mr-1"
            >
              <Menu size={18} />
            </button>

            {getBreadcrumbs().map((b, idx, arr) => (
              <React.Fragment key={b.href}>
                {idx > 0 && (
                  <ChevronRight
                    size={12}
                    className="text-muted-foreground/60 shrink-0"
                  />
                )}
                <Link
                  href={b.href}
                  className={`truncate hover:text-foreground transition-colors ${
                    idx === arr.length - 1
                      ? "font-semibold text-foreground"
                      : ""
                  }`}
                >
                  {b.label}
                </Link>
              </React.Fragment>
            ))}
          </div>

          {/* Header Action Bar */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Search Trigger */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="flex items-center gap-3 px-3 py-1.5 rounded-lg border border-border bg-muted/60 text-xs text-muted-foreground hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer"
            >
              <Search size={14} />
              <span className="hidden sm:inline">Search workstations...</span>
              <kbd className="hidden sm:inline font-mono text-[10px] px-1.5 py-0.5 rounded border border-border bg-card text-foreground">
                ⌘K
              </kbd>
            </button>

            {/* Notifications Indicator */}
            <button
              onClick={() => router.push("/dashboard/ai-copilot")}
              className="p-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:border-slate-300 dark:hover:border-slate-700 transition-colors relative cursor-pointer"
              title="Notifications & Agent Signals"
            >
              <Bell size={16} />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-muted border border-transparent hover:border-border transition-colors cursor-pointer"
              >
                <div className="h-7 w-7 rounded-md bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center">
                  {fullName[0]?.toUpperCase()}
                </div>
                <ChevronDown size={14} className="text-muted-foreground" />
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-xl py-1 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-border space-y-0.5">
                    <div className="font-semibold text-foreground">
                      {fullName}
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {email}
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-[10px] font-mono text-primary uppercase">
                      <ShieldCheck size={12} /> {plan} Plan Active
                    </div>
                  </div>

                  <Link
                    href="/dashboard/settings"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-muted text-foreground transition-colors"
                  >
                    <Settings size={14} /> Account Settings
                  </Link>

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      handleLogout();
                    }}
                    disabled={loggingOut}
                    className="w-full flex items-center gap-2 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-left transition-colors cursor-pointer"
                  >
                    <LogOut size={14} />
                    <span>{loggingOut ? "Signing out..." : "Sign Out"}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-background">
          <div className="max-w-7xl mx-auto space-y-6">
            {error && (
              <div className="p-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/50 text-xs text-red-700 dark:text-red-300">
                {error}
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
