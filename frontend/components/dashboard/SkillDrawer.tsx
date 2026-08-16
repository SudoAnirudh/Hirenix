"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ExternalLink,
  Video,
  BookOpen,
  GraduationCap,
  CheckCircle2,
} from "lucide-react";
import { RoadmapSkill } from "@/lib/api";

interface SkillDrawerProps {
  skill: RoadmapSkill | null;
  onClose: () => void;
  onToggleStatus: (name: string) => void;
}

export default function SkillDrawer({
  skill,
  onClose,
  onToggleStatus,
}: SkillDrawerProps) {
  if (!skill) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />

        {/* Drawer */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative w-full max-w-md h-full bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {skill.name}
            </h2>
            <button
              onClick={onClose}
              aria-label="Close skill details"
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-900"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Description */}
            <section>
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                About this skill
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {skill.description ||
                  "Master this skill to advance in your career path. This topic covers essential concepts and practical implementations."}
              </p>
            </section>

            {/* Resources */}
            <section>
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                Learning Resources
              </h3>
              <div className="space-y-3">
                {skill.resources.map((resource, idx) => (
                  <a
                    key={idx}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-border hover:border-primary group transition-all"
                  >
                    <div className="p-2 rounded-md bg-white dark:bg-slate-900 shadow-xs text-primary transition-transform">
                      {resource.type === "video" ? (
                        <Video size={16} />
                      ) : resource.type === "course" ? (
                        <GraduationCap size={16} />
                      ) : (
                        <BookOpen size={16} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-primary truncate">
                        {resource.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">
                          {resource.type}
                        </span>
                        {resource.is_free && (
                          <span className="text-[9px] px-1 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                            FREE
                          </span>
                        )}
                      </div>
                    </div>
                    <ExternalLink
                      size={12}
                      className="text-slate-400 group-hover:text-primary shrink-0"
                    />
                  </a>
                ))}
              </div>
            </section>

            {/* Quick Actions */}
            <section className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  onToggleStatus(skill.name);
                }}
                className={`w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  skill.status === "completed"
                    ? "bg-emerald-50/40 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                    : "btn-primary h-11"
                }`}
              >
                <CheckCircle2 size={16} />
                {skill.status === "completed"
                  ? "Completed"
                  : "Mark as Completed"}
              </button>
            </section>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
