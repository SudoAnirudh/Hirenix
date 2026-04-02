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
          <h1 className="text-3xl font-heading font-extrabold text-[#1E293B]">
            Applications CRM
          </h1>
          <p className="text-[#64748B] mt-1">
            Track your job search progress with precision.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
              size={18}
            />
            <input
              type="text"
              placeholder="Search apps..."
              className="pl-10 pr-4 py-2 bg-white/50 border border-white/80 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7C9ADD]/20 transition-all w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="primary">
            <Plus size={18} className="mr-2" />
            Add Application
          </Button>
        </div>
      </div>

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
                      className={`p-1.5 rounded-lg bg-white shadow-sm ${col.color}`}
                    >
                      <col.icon size={16} />
                    </div>
                    <h3 className="font-bold text-[#1E293B] text-sm uppercase tracking-wider">
                      {col.title}
                    </h3>
                  </div>
                  <Badge variant="outline" className="bg-white/50">
                    {colApps.length}
                  </Badge>
                </div>

                <div className="flex-1 rounded-[28px] bg-slate-100/40 p-3 space-y-3 border border-dashed border-slate-200 overflow-y-auto custom-scrollbar">
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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className="group p-4 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-[#7C9ADD]/30 transition-all cursor-grab active:cursor-grabbing relative"
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-[#2D3748] text-sm leading-tight line-clamp-2">
          {app.role}
        </h4>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 px-1.5 hover:bg-slate-50 rounded-lg text-slate-400 group-hover:text-[#7C9ADD] transition-colors"
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
                  className="absolute right-0 top-full mt-1 w-32 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50"
                >
                  {COLUMNS.filter((c) => c.id !== app.status).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        onMove(c.id);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-[#7C9ADD]/5 hover:text-[#7C9ADD] transition-colors"
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
                    className="w-full text-left px-3 py-1.5 text-[11px] font-bold text-rose-500 hover:bg-rose-50 transition-colors"
                  >
                    Delete
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      <p className="text-xs text-[#718096] mb-3 font-medium">{app.company}</p>

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
            className="p-1 px-1.5 bg-[#7C9ADD]/10 text-[#7C9ADD] rounded-lg hover:bg-[#7C9ADD] hover:text-white transition-all transform hover:scale-110"
          >
            <ExternalLink size={12} />
          </a>
        )}
      </div>
    </motion.div>
  );
}
