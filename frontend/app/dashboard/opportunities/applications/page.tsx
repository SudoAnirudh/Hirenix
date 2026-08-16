"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  MoreVertical,
  MapPin,
  ExternalLink,
  Calendar,
  AlertCircle,
  Clock,
  Ban,
  Trophy,
  TrendingUp,
} from "lucide-react";
import {
  getApplications,
  updateApplication,
  deleteApplication,
  JobApplication,
} from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import AddApplicationModal from "@/components/dashboard/AddApplicationModal";

const COLUMNS = [
  { id: "wishlist", title: "Wishlist", icon: Clock, color: "text-slate-400" },
  {
    id: "applied",
    title: "Applied",
    icon: AlertCircle,
    color: "text-blue-500",
  },
  {
    id: "interviewing",
    title: "Interviewing",
    icon: TrendingUp,
    color: "text-amber-500",
  },
  { id: "offer", title: "Offer", icon: Trophy, color: "text-emerald-500" },
  { id: "rejected", title: "Rejected", icon: Ban, color: "text-rose-500" },
];

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchApps();
  }, []);

  async function fetchApps() {
    setLoading(true);
    try {
      const data = await getApplications();
      setApplications(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  }

  async function handleMove(appId: string, newStatus: string) {
    try {
      setApplications((apps) =>
        apps.map((a) =>
          a.id === appId ? { ...a, status: newStatus as any } : a,
        ),
      );
      await updateApplication(appId, { status: newStatus });
      toast.success("Status updated");
    } catch (err: any) {
      toast.error("Failed to move application");
      fetchApps(); // Rollback
    }
  }

  async function handleDelete(appId: string) {
    if (!confirm("Are you sure you want to delete this application?")) return;
    try {
      setApplications((apps) => apps.filter((a) => a.id !== appId));
      await deleteApplication(appId);
      toast.success("Application deleted");
    } catch (err: any) {
      toast.error("Failed to delete application");
      fetchApps();
    }
  }

  const filteredApps = applications.filter(
    (app) =>
      app.company.toLowerCase().includes(search.toLowerCase()) ||
      app.role.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-heading font-extrabold text-[#1E293B] dark:text-card-foreground">
            Applications <span className="text-indigo-500">CRM</span>
          </h1>
          <p className="text-[#64748B] mt-1 text-sm font-medium">
            Strategic tracking for your pipeline of opportunities.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] transition-colors group-focus-within:text-indigo-500"
              size={18}
            />
            <input
              type="text"
              placeholder="Filter by company or role..."
              className="pl-12 pr-4 py-3 bg-card/50 dark:bg-slate-900/50 border border-white/80 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all w-72 shadow-premium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary h-12 px-6 flex items-center gap-2 font-bold shadow-lg shadow-indigo-600/20"
          >
            <Plus size={18} />
            Add Application
          </button>
        </div>
      </div>

      <AddApplicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchApps}
      />

      {loading && applications.length === 0 ? (
        <div className="grid grid-cols-5 gap-6 h-64">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-slate-100 animate-pulse rounded-3xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 h-[calc(100vh-250px)] overflow-x-auto pb-4 custom-scrollbar">
          {COLUMNS.map((col) => {
            const colApps = filteredApps.filter((a) => a.status === col.id);
            return (
              <div key={col.id} className="flex flex-col min-w-[280px]">
                <div className="flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-1.5 rounded-lg bg-card shadow-sm ${col.color}`}
                    >
                      <col.icon size={16} />
                    </div>
                    <h3 className="font-bold text-[#1E293B] dark:text-slate-200 text-[11px] uppercase tracking-[0.2em]">
                      {col.title}
                    </h3>
                  </div>
                  <div className="h-6 w-6 rounded-lg bg-card/80 dark:bg-slate-800 border border-white dark:border-slate-700 flex items-center justify-center text-[10px] font-black text-slate-500 shadow-xs">
                    {colApps.length}
                  </div>
                </div>

                <div className="flex-1 rounded-[32px] bg-slate-100/40 dark:bg-slate-900/20 p-4 space-y-4 border border-dashed border-slate-200 dark:border-slate-800 overflow-y-auto custom-scrollbar backdrop-blur-3xl min-h-[400px]">
                  <AnimatePresence mode="popLayout">
                    {colApps.map((app) => (
                      <JobCard
                        key={app.id}
                        app={app}
                        onMove={(status) => handleMove(app.id, status)}
                        onDelete={() => handleDelete(app.id)}
                      />
                    ))}
                  </AnimatePresence>
                  {colApps.length === 0 && (
                    <div className="h-20 flex items-center justify-center text-[10px] text-slate-400 font-medium uppercase tracking-widest text-center px-4">
                      No applications
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function JobCard({
  app,
  onMove,
  onDelete,
}: {
  app: JobApplication;
  onMove: (status: string) => void;
  onDelete: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      className="group p-5 bg-card dark:bg-slate-900 rounded-[24px] shadow-premium border border-white dark:border-slate-800 dark: transition-all cursor-grab active:cursor-grabbing relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-linear-to-b from-indigo-500 to-violet-500 opacity-0 transition-opacity" />
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-foreground text-sm leading-tight line-clamp-2">
          {app.role}
        </h4>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 px-1.5 rounded-lg text-slate-400 group- transition-colors"
          >
            <MoreVertical size={14} />
          </button>
          <AnimatePresence>
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMenu(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  className="absolute right-0 top-full mt-1 w-32 bg-card rounded-xl shadow-xl border border-slate-100 py-1 z-50"
                >
                  {COLUMNS.filter((c) => c.id !== app.status).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        onMove(c.id);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-[11px] font-bold text-slate-600 transition-colors"
                    >
                      Move to {c.title}
                    </button>
                  ))}
                  <div className="h-px bg-slate-100 my-1" />
                  <button
                    onClick={() => {
                      onDelete();
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-[11px] font-bold text-rose-500 transition-colors"
                  >
                    Delete
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-3 font-medium">
        {app.company}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {app.location && (
          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold bg-slate-50 px-2 py-0.5 rounded-lg">
            <MapPin size={10} />
            {app.location}
          </div>
        )}
        {app.match_score !== undefined && (
          <div className="flex items-center gap-1 text-[10px] text-[#558B6E] font-bold bg-[#98C9A3]/10 px-2 py-0.5 rounded-lg border border-[#98C9A3]/20">
            <TrendingUp size={10} />
            {Math.round(app.match_score)}% Match
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
        <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
          <Calendar size={10} />
          {new Date(app.created_at).toLocaleDateString()}
        </div>
        {app.apply_url && (
          <a
            href={app.apply_url}
            target="_blank"
            rel="noreferrer"
            className="p-1 px-1.5 bg-brand-blue/10 text-brand-blue rounded-lg transition-all transform"
          >
            <ExternalLink size={12} />
          </a>
        )}
      </div>
    </motion.div>
  );
}
