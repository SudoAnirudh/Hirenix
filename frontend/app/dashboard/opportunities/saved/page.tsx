"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  MapPin,
  Trash2,
  ExternalLink,
  ArrowRight,
  Bookmark,
} from "lucide-react";
import { toast } from "sonner";

interface SavedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  apply_url?: string;
  alignment_score?: number;
  reason?: string;
}

export default function SavedJobsPage() {
  const [jobs, setJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("hirenix_saved_jobs");
    if (saved) {
      try {
        setJobs(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
    setLoading(false);
  }, []);

  const handleRemove = (id: string) => {
    const updated = jobs.filter((j) => j.id !== id);
    setJobs(updated);
    localStorage.setItem("hirenix_saved_jobs", JSON.stringify(updated));
    toast.success("Job removed from Saved.");
  };

  return (
    <div className="animate-fade-up space-y-8 w-full max-w-5xl">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-indigo-500 font-bold text-xs uppercase tracking-widest">
          <Bookmark size={14} />
          Opportunities
        </div>
        <h1 className="text-4xl font-extrabold font-heading text-foreground">
          Saved Jobs
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-xl">
          Your bookmarked market opportunities. Review and manage roles you
          intend to apply for.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-48 rounded-3xl bg-slate-100 dark:bg-slate-900 animate-pulse border border-border" />
          <div className="h-48 rounded-3xl bg-slate-100 dark:bg-slate-900 animate-pulse border border-border" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border rounded-[28px] h-64 bg-card/10">
          <Briefcase className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="font-bold text-sm text-foreground">No saved jobs</h3>
          <p className="text-xs text-muted-foreground max-w-xs mt-1 mb-4">
            Bookmark interesting suggestions in the Opportunities Discover
            panel.
          </p>
          <Link href="/dashboard/opportunities/discover">
            <button className="btn-primary flex items-center gap-1.5 text-xs py-2 px-4 rounded-xl">
              Explore Jobs <ArrowRight size={14} />
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {jobs.map((job) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-6 rounded-[28px] bg-card border border-border shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-800 transition-all relative overflow-hidden"
              >
                {job.alignment_score && (
                  <div className="absolute top-4 right-4 text-right">
                    <span className="text-xl font-black text-indigo-500 leading-none">
                      {job.alignment_score}%
                    </span>
                    <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground block">
                      Match
                    </span>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 flex items-center justify-center text-indigo-500 shrink-0">
                      <Briefcase size={18} />
                    </div>
                    <div className="pr-12">
                      <h4 className="font-bold text-sm text-foreground line-clamp-1">
                        {job.title}
                      </h4>
                      <p className="text-xs text-muted-foreground font-bold leading-none">
                        {job.company}
                      </p>
                    </div>
                  </div>

                  {job.reason && (
                    <p className="text-[11px] font-medium text-muted-foreground line-clamp-2 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/40">
                      &quot;{job.reason}&quot;
                    </p>
                  )}

                  <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-bold uppercase tracking-wider">
                    <MapPin size={12} className="text-slate-400" />
                    <span>{job.location}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex justify-between items-center text-xs font-semibold">
                  <button
                    onClick={() => handleRemove(job.id)}
                    className="text-red-500 hover:text-red-400 flex items-center gap-1 py-1"
                  >
                    <Trash2 size={13} /> Remove
                  </button>

                  {job.apply_url && (
                    <a
                      href={job.apply_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-500 hover:text-indigo-400 flex items-center gap-1 py-1"
                    >
                      Apply <ExternalLink size={13} />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
