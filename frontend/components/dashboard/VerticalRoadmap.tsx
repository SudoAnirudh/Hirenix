"use client";
import React, { useState } from "react";
import { RoadmapSkill } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Circle,
  Clock,
  Star,
  Sparkles,
} from "lucide-react";
import SkillDrawer from "./SkillDrawer";

interface VerticalRoadmapProps {
  skills: RoadmapSkill[];
  onToggle?: (name: string) => void;
}

export default function VerticalRoadmap({
  skills,
  onToggle,
}: VerticalRoadmapProps) {
  const [selectedSkill, setSelectedSkill] = useState<RoadmapSkill | null>(null);

  const handleToggle = (name: string) => {
    if (onToggle) onToggle(name);
    if (selectedSkill?.name === name) {
      setSelectedSkill((prev) =>
        prev
          ? {
              ...prev,
              status: prev.status === "completed" ? "to_learn" : "completed",
            }
          : null,
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8 relative">
      {/* Main Spine */}
      <div className="absolute left-1/2 -translate-x-1/2 top-24 bottom-24 w-px bg-border hidden md:block" />

      <div className="space-y-12 relative">
        {skills.map((skill, index) => (
          <RoadmapNode
            key={skill.id || skill.name}
            skill={skill}
            onSkillClick={setSelectedSkill}
            onToggleStatus={handleToggle}
            isEven={index % 2 === 0}
          />
        ))}
      </div>

      <SkillDrawer
        skill={selectedSkill}
        onClose={() => setSelectedSkill(null)}
        onToggleStatus={handleToggle}
      />
    </div>
  );
}

function RoadmapNode({
  skill,
  depth = 0,
  onSkillClick,
  onToggleStatus,
  isEven = true,
}: {
  skill: RoadmapSkill;
  depth?: number;
  onSkillClick: (skill: RoadmapSkill) => void;
  onToggleStatus: (name: string) => void;
  isEven?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(depth < 1);
  const hasChildren = skill.children && skill.children.length > 0;

  // Determine vibrant colors based on status and priority
  const statusColors = {
    completed: "from-emerald-500 to-teal-500 shadow-emerald-500/20",
    in_progress: "from-amber-400 to-orange-500 shadow-amber-500/20",
    to_learn: "from-indigo-500 to-purple-600 shadow-indigo-500/20",
  };

  const activeColor =
    skill.status === "completed"
      ? statusColors.completed
      : statusColors.to_learn;

  return (
    <div className={`relative ${depth > 0 ? "ml-8 md:ml-12 mt-4" : "mt-8"}`}>
      {/* Branch Line for Nested items */}
      {depth > 0 && (
        <div className="absolute -left-8 md:-left-10 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-800">
          <div className="absolute top-8 left-0 w-8 md:w-10 h-px bg-slate-200 dark:bg-slate-800" />
        </div>
      )}

      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`group relative flex items-start gap-4 p-5 rounded-xl transition-all duration-200 border ${
          skill.status === "completed"
            ? "bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/40 shadow-xs"
            : "bg-card border-border hover:border-primary/50 shadow-xs"
        } ${depth === 0 ? "md:max-w-[90%] mx-auto" : ""}`}
      >
        {/* Status Indicator */}
        <div className="relative flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleStatus(skill.name);
            }}
            aria-label={`Toggle status for ${skill.name}`}
            className={`z-10 relative flex items-center justify-center w-8 h-8 rounded-lg transition-all active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
              skill.status === "completed"
                ? "bg-emerald-500 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-primary hover:bg-primary/10"
            }`}
          >
            {skill.status === "completed" ? (
              <CheckCircle2 size={18} />
            ) : (
              <Circle size={18} />
            )}
          </button>
        </div>

        {/* Node Content */}
        <div
          className="flex-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded-xl"
          onClick={() => onSkillClick(skill)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSkillClick(skill);
            }
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3
                  className={`font-bold tracking-tight transition-colors ${
                    skill.status === "completed"
                      ? "text-emerald-800 dark:text-emerald-400"
                      : "text-slate-900 dark:text-white"
                  } ${depth === 0 ? "text-lg" : "text-base"}`}
                >
                  {skill.name}
                </h3>
                {skill.is_optional && (
                  <span className="text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded uppercase">
                    Optional
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-medium line-clamp-2">
                {skill.description ||
                  "Master this topic to advance your career path."}
              </p>
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
              <div className="flex items-center gap-2">
                {skill.priority === "high" && (
                  <span className="flex items-center gap-1 text-[9px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                    CRITICAL
                  </span>
                )}
                {skill.estimated_time && (
                  <div className="flex items-center gap-1 text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-2 py-0.5 rounded border border-border/50">
                    <Clock size={11} className="text-slate-400" />
                    <span>{skill.estimated_time}</span>
                  </div>
                )}
              </div>

              {hasChildren && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                  aria-expanded={isExpanded}
                  aria-label={`${isExpanded ? "Collapse" : "Expand"} modules for ${skill.name}`}
                  className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 ${
                    isExpanded
                      ? "text-primary bg-primary/10"
                      : "text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {skill.children?.length} Modules
                  {isExpanded ? (
                    <ChevronDown size={12} />
                  ) : (
                    <ChevronRight size={12} />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Nested Children with stagger animation */}
      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0, x: -10 }}
            animate={{ opacity: 1, height: "auto", x: 0 }}
            exit={{ opacity: 0, height: 0, x: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-3 pb-4">
              {skill.children!.map((child, idx) => (
                <RoadmapNode
                  key={child.id || child.name}
                  skill={child}
                  depth={depth + 1}
                  onSkillClick={onSkillClick}
                  onToggleStatus={onToggleStatus}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
