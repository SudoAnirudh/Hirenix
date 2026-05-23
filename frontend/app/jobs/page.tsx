"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { Footer } from "@/components/landing/Footer";
import { getBaseUrl } from "@/lib/api";
import {
  Search,
  MapPin,
  Building2,
  Calendar,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  X,
  AlertCircle,
} from "lucide-react";

interface JobPost {
  id: string;
  title: string;
  company: string;
  location: string;
  apply_url: string | null;
  description: string | null;
  requirements: string[];
  posted_at: string;
}

export default function JobsBoardPage() {
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);

  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [debouncedLocation, setDebouncedLocation] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setDebouncedLocation(location);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, location]);

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);
      setError("");
      try {
        let url = `${getBaseUrl()}/jobs-board?page=${page}&limit=${limit}`;
        if (debouncedSearch)
          url += `&search=${encodeURIComponent(debouncedSearch)}`;
        if (debouncedLocation)
          url += `&location=${encodeURIComponent(debouncedLocation)}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to retrieve jobs.");
        const data = await res.json();
        setJobs(data.jobs || []);
        setTotal(data.total || 0);
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "An unexpected network error occurred.",
        );
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, [page, limit, debouncedSearch, debouncedLocation]);

  const totalPages = Math.ceil(total / limit) || 1;

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays <= 1) return "Today";
      if (diffDays === 2) return "Yesterday";
      if (diffDays <= 7) return `${diffDays} days ago`;
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Recently";
    }
  };

  return (
    <main className="min-h-screen relative bg-background text-foreground overflow-hidden selection:bg-brand-blue/30 selection:text-brand-blue font-body">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-blue/8 blur-[130px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand-green/8 blur-[160px] rounded-full" />
      </div>

      <LandingNavbar />

      <section className="relative z-10 pt-48 pb-16 px-6 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-card/60 border border-white/60 shadow-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
            <span className="text-[10px] font-black tracking-[0.25em] text-slate-500 uppercase">
              Daily Curated Indian Tech Openings
            </span>
          </div>
          <h1 className="font-display font-bold text-5xl md:text-7xl mb-6 tracking-tighter leading-[0.95] text-foreground">
            Hirenix <span className="text-brand-blue">Jobs Board</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
            Aggregated daily from verified engineering leaders, recruiters, and
            hiring managers across India. Completely public and open.
          </p>
        </motion.div>
      </section>

      <section className="relative z-10 px-6 mb-12 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="p-4 rounded-[32px] bg-card/40 border border-white/60 shadow-glass backdrop-blur-xl flex flex-col md:flex-row gap-4"
        >
          <div className="flex-1 relative flex items-center">
            <Search className="absolute left-4.5 text-muted-foreground w-5 h-5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search roles, companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/60 border border-slate-200/50 rounded-2xl py-4.5 pl-12 pr-4 text-sm transition-all"
            />
          </div>
          <div className="md:w-72 relative flex items-center">
            <MapPin className="absolute left-4.5 text-muted-foreground w-5 h-5 pointer-events-none" />
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-white/60 border border-slate-200/50 rounded-2xl py-4.5 pl-12 pr-4 text-sm transition-all"
            />
          </div>
        </motion.div>
      </section>

      <section className="relative z-10 pb-24 px-6 max-w-5xl mx-auto min-h-[400px]">
        {error && (
          <div className="flex flex-col items-center justify-center p-12 glass-card rounded-[32px] border-red-200 bg-red-50/20 text-red-600 text-center gap-3">
            <AlertCircle className="w-10 h-10 text-red-500" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {!error && loading ? (
          <div className="flex flex-col gap-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="glass-card p-8 rounded-[36px] border border-slate-200/40 bg-card/25 shadow-glass animate-pulse h-40"
              />
            ))}
          </div>
        ) : (
          !error && (
            <>
              {jobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center glass-card p-12 rounded-[40px] border border-slate-200/40 bg-card/20 shadow-glass">
                  <h3 className="font-display font-bold text-2xl mb-2">
                    No jobs found
                  </h3>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {jobs.map((job, idx) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: idx * 0.05 }}
                      whileHover={{ y: -4 }}
                      onClick={() => setSelectedJob(job)}
                      className="glass-card p-8 rounded-[36px] border border-border bg-card/50 shadow-glass hover:bg-card/75 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3 mb-4.5">
                          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-[10px] font-bold text-slate-500 border border-slate-200/60 shadow-sm uppercase tracking-wider">
                            {job.company}
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-[10px] font-bold text-slate-500 border border-slate-200/60 shadow-sm uppercase tracking-wider">
                            {job.location}
                          </span>
                        </div>
                        <h3 className="text-2xl font-display font-bold text-foreground mb-3 group-hover:text-brand-blue transition-colors">
                          {job.title}
                        </h3>
                        {job.requirements.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4.5">
                            {job.requirements.slice(0, 5).map((req, i) => (
                              <span
                                key={i}
                                className="px-3.5 py-1.5 rounded-full bg-brand-blue/5 text-[10px] font-bold text-brand-blue border border-brand-blue/10 uppercase"
                              >
                                {req}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-4 pt-4 md:pt-0 shrink-0">
                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase">
                          <Calendar size={14} />
                          {formatDate(job.posted_at)}
                        </div>
                        <button
                          type="button"
                          className="px-6 py-3 rounded-2xl bg-brand-blue text-white text-xs font-bold uppercase shadow-lg hover:bg-blue-600 transition-all"
                        >
                          View Details
                        </button>
                      </div>
                    </motion.div>
                  ))}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-slate-200/50 pt-8 mt-4">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-3 rounded-2xl bg-card border border-border text-xs font-bold uppercase disabled:opacity-50"
                      >
                        Prev
                      </button>
                      <span className="text-xs font-bold text-muted-foreground uppercase">
                        Page {page} of {totalPages}
                      </span>
                      <button
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={page === totalPages}
                        className="p-3 rounded-2xl bg-card border border-border text-xs font-bold uppercase disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )
        )}
      </section>

      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card w-full max-w-2xl bg-slate-900 border border-slate-800 shadow-2xl rounded-[40px] overflow-hidden flex flex-col max-h-[85vh] relative text-white"
            >
              <div className="p-8 pb-4 flex justify-between items-start">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-3">
                    <span className="px-3.5 py-1.5 rounded-full bg-white/10 text-[9px] font-black uppercase tracking-wider">
                      {selectedJob.company}
                    </span>
                    <span className="px-3.5 py-1.5 rounded-full bg-white/10 text-[9px] font-black uppercase tracking-wider">
                      {selectedJob.location}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-3xl mt-3 text-white">
                    {selectedJob.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="p-2.5 rounded-full bg-white/10 text-slate-300 hover:text-white transition-all"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-8 py-4 space-y-8">
                {selectedJob.requirements.length > 0 && (
                  <div>
                    <h5 className="text-[10px] font-black uppercase text-slate-400 mb-3.5">
                      Key Qualifications
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.requirements.map((req, i) => (
                        <span
                          key={i}
                          className="px-4 py-2 rounded-2xl bg-brand-blue/15 text-brand-blue text-xs font-semibold uppercase"
                        >
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <h5 className="text-[10px] font-black uppercase text-slate-400 mb-3.5">
                    Job Overview
                  </h5>
                  <p className="text-sm font-medium text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {selectedJob.description ||
                      "No full description available."}
                  </p>
                </div>
              </div>
              <div className="p-8 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-[10px] font-black uppercase text-slate-400">
                  Posted:{" "}
                  <span className="text-brand-green font-bold">
                    {formatDate(selectedJob.posted_at)}
                  </span>
                </div>
                {selectedJob.apply_url ? (
                  <a
                    href={selectedJob.apply_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-8 py-4.5 rounded-[22px] bg-brand-blue text-white font-display font-black text-sm uppercase transition-all flex items-center justify-center gap-2"
                  >
                    Apply Now
                    <ExternalLink size={16} />
                  </a>
                ) : (
                  <span className="text-xs font-bold text-amber-500 uppercase tracking-wider bg-amber-500/10 px-4 py-2.5 rounded-xl border border-amber-500/25">
                    Refer to tweet
                  </span>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <Footer />
    </main>
  );
}
