"use client";
import React from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Lock,
  Clock,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { RoadmapSkill } from "@/lib/api";

interface TechTreeNodeProps {
  skill: RoadmapSkill;
  index: number;
  onToggle?: (name: string) => void;
  active?: boolean;
}

export default function TechTreeNode({
  skill,
  onToggle,
  active = true,
}: TechTreeNodeProps) {
  const isCompleted = skill.status === "completed";
  const isInProgress = skill.status === "in_progress";

  const getIntensityColor = () => {
    if (isCompleted)
      return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (isInProgress)
      return "text-indigo-500 bg-indigo-500/10 border-indigo-500/20";
    if (!active)
      return "text-slate-400 bg-slate-400/5 border-slate-400/10 grayscale";
    return "text-slate-600 bg-white/40 border-white/60";
  };

  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
      className={`relative p-4 rounded-2xl border backdrop-blur-md shadow-glass transition-all duration-500 w-64 ${getIntensityColor()}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-xl border border-white/40 bg-white/30`}>
          {isCompleted ? (
            <CheckCircle2 size={18} className="text-emerald-500" />
          ) : !active ? (
            <Lock size={18} className="text-slate-400" />
          ) : (
            <Sparkles size={18} className="text-indigo-400" />
          )}
        </div>

        <div className="flex flex-col items-end">
          <span
            className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
              skill.priority === "high"
                ? "bg-red-500/10 text-red-500"
                : "bg-slate-500/10 text-slate-500"
            }`}
          >
            {skill.priority}
          </span>
          <div className="flex items-center gap-1 mt-1 opacity-60">
            <Clock size={10} />
            <span className="text-[10px] font-bold">
              {skill.estimated_time}
            </span>
          </div>
        </div>
      </div>

      <h3 className="font-heading font-black text-sm uppercase tracking-tight mb-2 truncate">
        {skill.name}
      </h3>

      <div className="flex items-center justify-between mt-4 gap-2">
        <button
          onClick={() => onToggle?.(skill.name)}
          className={`flex-1 text-[10px] font-black uppercase tracking-widest py-2 rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 ${
            isCompleted
              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
              : "bg-white/60 text-slate-600"
          }`}
        >
          {isCompleted ? "Mastered" : "Mark Done"}
        </button>

        {skill.resources && skill.resources.length > 0 && (
          <div className="group/res relative">
            <button
              aria-label="View resources"
              className="p-2 rounded-xl bg-white/40 border border-white transition-colors cursor-pointer text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <ExternalLink size={14} />
            </button>

            {/* Simple resources preview on hover */}
            <div className="absolute bottom-full right-0 mb-3 w-48 bg-slate-900 text-white p-3 rounded-2xl text-[10px] opacity-0 invisible group-hover/res:opacity-100 group-hover/res:visible group-focus-within/res:opacity-100 group-focus-within/res:visible transition-all z-50 shadow-2xl">
              <p className="font-black uppercase tracking-widest text-[#7C9ADD] mb-2">
                Resources
              </p>
              <ul className="space-y-1">
                {skill.resources.slice(0, 3).map((res, i) => (
                  <li key={i} className="truncate">
                    • {res.title}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Decorative"branch connection" points */}
      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white border border-slate-200" />
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white border border-slate-200" />
    </motion.div>
  );
}
