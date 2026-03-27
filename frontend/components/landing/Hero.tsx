"use client";

import { motion } from "framer-motion";
import { ArrowRight, Zap, Brain, Sparkles, Command } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-32 pb-20 px-6 overflow-hidden bg-obsidian">
      {/* Background Orbital Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-electric-orchid/20 blur-[120px] rounded-full animate-morph" />
        <div
          className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-hyper-lime/10 blur-[150px] rounded-full animate-morph"
          style={{ animationDelay: "-4s" }}
        />
        <div className="absolute inset-0 bg-dot-pattern opacity-20" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-morphism border-hyper-lime/20 text-hyper-lime text-xs font-bold uppercase tracking-[0.2em] mb-8 shadow-neon"
        >
          <Sparkles size={14} className="animate-pulse" />
          The AI Career Studio
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-display font-black text-6xl md:text-8xl lg:text-9xl text-white tracking-tighter leading-[0.85] mb-8"
        >
          ENGINEER YOUR <br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-hyper-lime via-white to-electric-orchid animate-gradient-x">
            DREAM CAREER.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 font-medium leading-relaxed"
        >
          The high-fidelity command center for resume optimization, GitHub
          intelligence, and immersive interview mastery.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <Link href="/auth/register">
            <Button
              size="lg"
              className="h-16 px-10 rounded-xl bg-hyper-lime text-obsidian text-lg font-black hover:scale-105 transition-transform shadow-[0_0_30px_rgba(212,255,0,0.3)] group border-none"
            >
              INITIALIZE ACCESS
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>

          <div className="flex items-center gap-3 px-6 py-4 rounded-xl glass-morphism border-white/5 text-white/50 text-xs font-bold uppercase tracking-widest group cursor-default">
            <Command
              size={18}
              className="text-hyper-lime group-hover:rotate-180 transition-transform duration-500"
            />
            Press{" "}
            <span className="text-white bg-white/20 px-2 py-0.5 rounded mx-1">
              /
            </span>{" "}
            to query AI
          </div>
        </motion.div>

        {/* Floating AI Command Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-24 max-w-2xl mx-auto p-4 rounded-2xl glass-morphism border-white/10 shadow-2xl relative"
        >
          <div className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-hyper-lime blur-md animate-pulse" />
          <div className="flex items-center gap-4 px-4 py-3 bg-white/5 rounded-xl border border-white/5">
            <div className="w-8 h-8 rounded-lg bg-hyper-lime/20 flex items-center justify-center">
              <Brain className="text-hyper-lime" size={18} />
            </div>
            <div className="text-left">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter">
                AI AGENT ACTIVE
              </p>
              <p className="text-white font-medium italic">
                &quot;Analyzing resume for FAANG compatibility...&quot;
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
