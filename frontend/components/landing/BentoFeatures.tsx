"use client";

import { motion } from "framer-motion";
import {
  Brain,
  Github,
  Briefcase,
  Mic,
  TrendingUp,
  Zap,
  BarChart3,
  Fingerprint,
} from "lucide-react";

const features = [
  {
    title: "Hybrid ATS Scoring",
    desc: "Rule-based analysis meets semantic embeddings for high-accuracy scoring.",
    icon: Brain,
    size: "col-span-2 row-span-2",
    color: "text-hyper-lime",
    bg: "bg-hyper-lime/5",
    content: (
      <div className="mt-8 flex items-center justify-center">
        <div className="relative w-32 h-32 rounded-full border-4 border-dashed border-hyper-lime/20 flex items-center justify-center">
          <div className="absolute inset-0 border-4 border-hyper-lime rounded-full border-t-transparent animate-spin-slow" />
          <span className="text-4xl font-black text-hyper-lime tracking-tighter">
            98%
          </span>
        </div>
      </div>
    ),
  },
  {
    title: "GitHub Intelligence",
    desc: "Consistency, depth, and diversity analysis.",
    icon: Github,
    size: "col-span-2 row-span-1",
    color: "text-electric-orchid",
    bg: "bg-electric-orchid/5",
    content: (
      <div className="mt-4 flex gap-1 items-end justify-center h-12">
        {[40, 70, 45, 90, 65, 80, 50, 95].map((h, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            whileInView={{ height: `${h}%` }}
            transition={{ delay: i * 0.05, duration: 0.5 }}
            className="w-4 bg-electric-orchid/40 rounded-t-sm"
          />
        ))}
      </div>
    ),
  },
  {
    title: "Job Matching",
    desc: "Semantic similarity + gap analysis.",
    icon: Briefcase,
    size: "col-span-1 row-span-1",
    color: "text-cyan-400",
    bg: "bg-cyan-400/5",
  },
  {
    title: "Mock Interviews",
    desc: "AI-generated tailored practice.",
    icon: Mic,
    size: "col-span-1 row-span-1",
    color: "text-pink-400",
    bg: "bg-pink-400/5",
  },
  {
    title: "Career Evolution",
    desc: "Track your growth over time.",
    icon: TrendingUp,
    size: "col-span-1 row-span-2",
    color: "text-emerald-400",
    bg: "bg-emerald-400/5",
    content: (
      <div className="mt-12 flex flex-col gap-4">
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "70%" }}
            className="h-full bg-emerald-400"
          />
        </div>
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "45%" }}
            className="h-full bg-emerald-400/50"
          />
        </div>
      </div>
    ),
  },
  {
    title: "Neural Engine",
    desc: "Actionable priorities in seconds.",
    icon: Zap,
    size: "col-span-3 row-span-1",
    color: "text-hyper-lime",
    bg: "bg-hyper-lime/5",
    content: (
      <div className="mt-6 flex items-center gap-6 overflow-hidden mask-fade-right">
        {["Optimizer", "Analyzer", "Generator", "Tracker", "Mastery"].map(
          (txt, i) => (
            <span
              key={i}
              className="text-xs font-black uppercase tracking-widest text-slate-500 whitespace-nowrap bg-white/5 px-4 py-2 rounded-full border border-white/5"
            >
              {txt}
            </span>
          ),
        )}
      </div>
    ),
  },
];

export const BentoFeatures = () => {
  return (
    <section className="py-32 px-6 bg-obsidian relative">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20">
          <p className="text-hyper-lime font-black uppercase tracking-[0.3em] text-xs mb-4">
            Core Ecosystem
          </p>
          <h2 className="text-white font-display font-black text-5xl md:text-7xl tracking-tighter leading-tight">
            The Full-Stack <br />
            Career Architecture.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[240px] gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className={`${f.size} ${f.bg} rounded-2xl p-8 border border-white/5 bento-item group hover:border-hyper-lime/20 transition-all cursor-default overflow-hidden relative shadow-2xl`}
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-30 transition-opacity">
                <f.icon className={f.color} size={120} />
              </div>

              <div className="relative z-10 flex flex-col h-full">
                <div
                  className={`w-10 h-10 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center mb-6 ${f.color}`}
                >
                  <f.icon size={20} />
                </div>
                <h3 className="text-xl font-display font-black text-white tracking-tight mb-2">
                  {f.title}
                </h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-[200px]">
                  {f.desc}
                </p>
                {f.content && <div className="mt-auto">{f.content}</div>}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
