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
        // Clean catch block
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
    <main className="animate-fade-up space-y-8 w-full max-w-5xl">
      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
          <Bookmark size={14} strokeWidth={2} />
          Opportunities
        </div>
        <h1 className="text-4xl font-extrabold font-heading text-foreground">
          Saved Jobs
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-xl font-medium">
          Your bookmarked market opportunities. Review and manage roles you
          intend to apply for.
        </p>
      </header>

      {loading ? (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          aria-busy="true"
          aria-label="Loading saved jobs"
        >
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="p-6 rounded-[28px] bg-card border border-border shadow-sm flex flex-col justify-between h-[202px] animate-pulse"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="h-3 w-20 bg-slate-100 dark:bg-slate-900 rounded" />
                  </div>
                </div>
                <div className="h-10 w-full bg-slate-100 dark:bg-slate-900 rounded-xl" />
                <div className="h-3 w-28 bg-slate-100 dark:bg-slate-900 rounded" />
              </div>
              <div className="pt-3 border-t border-border flex justify-between">
                <div className="h-4 w-12 bg-slate-100 dark:bg-slate-900 rounded" />
                <div className="h-4 w-12 bg-slate-100 dark:bg-slate-900 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <section
          className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border rounded-[28px] h-64 bg-card/10"
          aria-label="No saved jobs"
        >
          <Briefcase
            className="w-12 h-12 text-muted-foreground mb-4"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <h2 className="font-bold text-sm text-foreground">No saved jobs</h2>
          <p className="text-xs text-muted-foreground max-w-xs mt-1 mb-4 font-medium">
            Bookmark interesting suggestions in the Opportunities Discover
            panel.
          </p>
          <Link href="/dashboard/opportunities/discover">
            <button className="btn-primary flex items-center gap-1.5 text-xs py-2 px-4 rounded-xl focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2">
              Explore Jobs <ArrowRight size={14} strokeWidth={2} />
            </button>
          </Link>
        </section>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {jobs.map((job) => (
              <motion.article
                key={job.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-6 rounded-[28px] bg-card border border-border shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-800 transition-all relative overflow-hidden"
              >
                {job.alignment_score && (
                  <div className="absolute top-4 right-4 text-right">
                    <span className="text-xl font-black text-primary leading-none">
                      {job.alignment_score}%
                    </span>
                    <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground block">
                      Match
                    </span>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0"
                      aria-hidden="true"
                    >
                      <Briefcase size={18} strokeWidth={2} />
                    </div>
                    <div className="pr-12">
                      <h2 className="font-bold text-sm text-foreground line-clamp-1">
                        {job.title}
                      </h2>
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
                    <MapPin
                      size={12}
                      className="text-slate-400"
                      strokeWidth={2}
                    />
                    <span>{job.location}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex justify-between items-center text-xs font-semibold">
                  <button
                    onClick={() => handleRemove(job.id)}
                    className="text-red-500 hover:text-red-400 flex items-center gap-1 py-1 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-red-500/50 rounded-xs"
                    aria-label={`Remove ${job.title} from saved jobs`}
                  >
                    <Trash2 size={13} strokeWidth={2} /> Remove
                  </button>

                  {job.apply_url && (
                    <a
                      href={job.apply_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-indigo-400 flex items-center gap-1 py-1 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xs"
                      aria-label={`Apply to ${job.title} at ${job.company}`}
                    >
                      Apply <ExternalLink size={13} strokeWidth={2} />
                    </a>
                  )}
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      )}
    </main>
  );
}
