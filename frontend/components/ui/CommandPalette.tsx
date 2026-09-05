"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  FileText,
  Briefcase,
  Mic,
  Sparkles,
  Map,
  TrendingUp,
  Settings,
  Github,
  Linkedin,
  X,
  ArrowRight,
  Command,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  category: "Navigation" | "Workstations" | "Actions";
  description: string;
  icon: React.ElementType;
  href?: string;
  action?: () => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
}: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          window.dispatchEvent(new CustomEvent("hirenix:open-command-palette"));
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const items: CommandItem[] = [
    {
      id: "dash",
      title: "Dashboard Overview",
      category: "Navigation",
      description: "Return to your career readiness workstation",
      icon: TrendingUp,
      href: "/dashboard",
    },
    {
      id: "resume",
      title: "Resume Workspace & ATS Diagnostic",
      category: "Workstations",
      description: "Upload, parse, and analyze resume against ATS rules",
      icon: FileText,
      href: "/dashboard/career/resume",
    },
    {
      id: "jobs",
      title: "Job Discovery & Compatibility Matrix",
      category: "Workstations",
      description: "Search open positions and match candidate requirements",
      icon: Briefcase,
      href: "/dashboard/opportunities/discover",
    },
    {
      id: "saved-jobs",
      title: "Saved Jobs & Application CRM",
      category: "Workstations",
      description: "Track active applications, interviews, and offers",
      icon: Briefcase,
      href: "/dashboard/opportunities/applications",
    },
    {
      id: "interview",
      title: "AI Interview Simulator",
      category: "Workstations",
      description: "Practice technical and behavioral mock interviews",
      icon: Mic,
      href: "/dashboard/preparation/interviews",
    },
    {
      id: "copilot",
      title: "AI Career Copilot & Agent Command Center",
      category: "Workstations",
      description: "Run autonomous career agent pipelines",
      icon: Sparkles,
      href: "/dashboard/ai-copilot",
    },
    {
      id: "github",
      title: "GitHub Intelligence & Production Index",
      category: "Workstations",
      description: "Audit repository quality, impact, and tech stack",
      icon: Github,
      href: "/dashboard/career/github",
    },
    {
      id: "linkedin",
      title: "LinkedIn Optimization Audit",
      category: "Workstations",
      description: "Optimize profile headline and experience bullet points",
      icon: Linkedin,
      href: "/dashboard/career/linkedin",
    },
    {
      id: "roadmap",
      title: "Skill Roadmap & Growth Path",
      category: "Workstations",
      description: "View skill gaps and recommended learning milestones",
      icon: Map,
      href: "/dashboard/preparation/roadmap",
    },
    {
      id: "settings",
      title: "Settings & Integrations",
      category: "Navigation",
      description: "Manage account, target roles, and API integrations",
      icon: Settings,
      href: "/dashboard/settings",
    },
  ];

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase()),
  );

  const handleSelect = (item: CommandItem) => {
    onClose();
    setQuery("");
    if (item.href) {
      router.push(item.href);
    } else if (item.action) {
      item.action();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Input Bar */}
            <div className="flex items-center px-4 py-3.5 border-b border-border gap-3">
              <Search className="h-5 w-5 text-muted-foreground shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command or search workstations... (e.g., 'Resume', 'Jobs', 'Interview')"
                className="flex-1 bg-transparent border-none text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                autoFocus
              />
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] font-mono font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
                  ESC
                </span>
                <button
                  onClick={onClose}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Command List */}
            <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
              {filteredItems.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  No commands or workstations found matching &quot;{query}&quot;
                </div>
              ) : (
                filteredItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 text-left transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-md bg-muted text-foreground border border-border shrink-0">
                          <Icon size={16} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                            {item.title}
                          </div>
                          <div className="text-[11px] text-muted-foreground truncate">
                            {item.description}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-4">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
                          {item.category}
                        </span>
                        <ArrowRight
                          size={14}
                          className="text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-border bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-[11px] text-muted-foreground">
              <div className="flex items-center gap-2">
                <Command size={12} />
                <span>Hirenix Command Palette</span>
              </div>
              <div className="flex items-center gap-3">
                <span>
                  Navigate with{" "}
                  <kbd className="font-mono bg-muted px-1 rounded border border-border">
                    ↑
                  </kbd>{" "}
                  <kbd className="font-mono bg-muted px-1 rounded border border-border">
                    ↓
                  </kbd>
                </span>
                <span>
                  Select with{" "}
                  <kbd className="font-mono bg-muted px-1 rounded border border-border">
                    ↵
                  </kbd>
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
