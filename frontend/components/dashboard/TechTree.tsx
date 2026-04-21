"use client";
import React, { useMemo, useRef, useEffect, useState } from "react";
import TechTreeNode from "./TechTreeNode";
import { RoadmapSkill } from "@/lib/api";
import { motion } from "framer-motion";

interface TechTreeProps {
  skills: RoadmapSkill[];
  onToggle?: (name: string) => void;
}

interface NodePosition {
  id: string;
  x: number;
  y: number;
  tier: number;
}

export default function TechTree({ skills, onToggle }: TechTreeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (containerRef.current) {
      const { offsetWidth, offsetHeight } = containerRef.current;
      setDimensions({ width: offsetWidth, height: offsetHeight || 800 });
    }

    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight || 800,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 1. Group skills into tiers based on priority and difficulty
  const tiers = useMemo(() => {
    const t1: RoadmapSkill[] = []; // Foundation
    const t2: RoadmapSkill[] = []; // Core
    const t3: RoadmapSkill[] = []; // Mastery

    skills.forEach((skill) => {
      if (
        skill.priority === "high" &&
        (skill.difficulty === "easy" || skill.difficulty === "medium")
      ) {
        t1.push(skill);
      } else if (skill.priority === "low" || skill.difficulty === "hard") {
        t3.push(skill);
      } else {
        t2.push(skill);
      }
    });

    // Handle edge cases (empty tiers)
    if (t1.length === 0 && skills.length > 0)
      t1.push(...skills.slice(0, Math.ceil(skills.length / 3)));

    return [t1, t2, t3];
  }, [skills]);

  // 2. Calculate coordinates for each node
  const nodePositions = useMemo(() => {
    if (dimensions.width === 0) return [];

    const pos: NodePosition[] = [];
    const tierHeight = dimensions.height / 3.5;
    const padding = 60;

    tiers.forEach((tier, tierIdx) => {
      // Bottom to Top: tier 0 at bottom, tier 2 at top
      const y = dimensions.height - padding - tierHeight * tierIdx;
      const nodeWidth = 280; // Approximate width including gap
      const totalWidth = tier.length * nodeWidth;
      const startX = (dimensions.width - totalWidth) / 2 + nodeWidth / 2;

      tier.forEach((skill, skillIdx) => {
        pos.push({
          id: skill.name,
          x: startX + skillIdx * nodeWidth,
          y,
          tier: tierIdx,
        });
      });
    });

    return pos;
  }, [tiers, dimensions]);

  // 3. Generate connection branches
  // Logic: Connect each node in Tier N to nearby nodes in Tier N+1
  const connections = useMemo(() => {
    const lines: Array<{
      from: NodePosition;
      to: NodePosition;
      active: boolean;
    }> = [];

    for (let i = 0; i < nodePositions.length; i++) {
      const fromNode = nodePositions[i];
      const fromSkill = skills.find((s) => s.name === fromNode.id);

      if (fromNode.tier < 2) {
        const nextTierNodes = nodePositions.filter(
          (n) => n.tier === fromNode.tier + 1,
        );

        nextTierNodes.forEach((toNode) => {
          // Only connect if horizontally somewhat close to keep it looking clean
          const dist = Math.abs(fromNode.x - toNode.x);
          if (dist < 400) {
            lines.push({
              from: fromNode,
              to: toNode,
              active: fromSkill?.status === "completed",
            });
          }
        });
      }
    }

    return lines;
  }, [nodePositions, skills]);

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-[850px] overflow-x-auto overflow-y-hidden py-20 px-10 bg-slate-50/30 dark:bg-slate-900/10 rounded-[48px] border border-slate-200/50 dark:border-slate-800/50"
    >
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#7C9ADD 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Connection Canvas */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
        <defs>
          <linearGradient id="activeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7C9ADD" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
        </defs>

        {connections.map((conn, idx) => (
          <motion.path
            key={`${conn.from.id}-${conn.to.id}`}
            d={`M ${conn.from.x} ${conn.from.y} C ${conn.from.x} ${conn.from.y - 100}, ${conn.to.x} ${conn.to.y + 100}, ${conn.to.x} ${conn.to.y}`}
            fill="none"
            stroke={conn.active ? "url(#activeGradient)" : "#E2E8F0"}
            strokeWidth={conn.active ? 3 : 1.5}
            strokeDasharray={conn.active ? "none" : "8, 6"}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: conn.active ? 1 : 0.4 }}
            transition={{ duration: 1.5, delay: idx * 0.05 }}
          />
        ))}
      </svg>

      {/* Nodes */}
      <div className="absolute inset-0 pointer-events-none">
        {nodePositions.map((pos, i) => {
          const skill = skills.find((s) => s.name === pos.id)!;
          // A node is"reachable" if it's Tier 0 OR if any parent in Tier N-1 is completed
          const reachable =
            pos.tier === 0 ||
            connections.some((c) => c.to.id === pos.id && c.active);

          return (
            <div
              key={pos.id}
              style={{
                position: "absolute",
                left: pos.x,
                top: pos.y,
                transform: "translate(-50%, -50%)",
                pointerEvents: "auto",
                zIndex: 10,
              }}
            >
              <TechTreeNode
                skill={skill}
                index={i}
                onToggle={onToggle}
                active={reachable}
              />
            </div>
          );
        })}
      </div>

      {/* Legend / Tiers Indicators */}
      <div className="absolute left-10 top-0 bottom-0 flex flex-col justify-between py-24 pointer-events-none opacity-40">
        <div className="flex items-center gap-3">
          <div className="h-0.5 w-8 bg-indigo-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">
            Tier 3: Mastery
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-0.5 w-8 bg-indigo-400" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">
            Tier 2: Core Skills
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-0.5 w-8 bg-indigo-300" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">
            Tier 1: Foundations
          </span>
        </div>
      </div>
    </div>
  );
}
