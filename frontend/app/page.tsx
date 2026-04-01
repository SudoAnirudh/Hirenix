"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Github,
  Briefcase,
  Mic,
  TrendingUp,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { Footer } from "@/components/landing/Footer";

const features = [
  {
    icon: Brain,
    title: "AI RESUME SCORING",
    desc: "Hybrid ATS scoring combining rule-based analysis and semantic embeddings.",
  },
  {
    icon: Github,
    title: "GITHUB INTELLIGENCE",
    desc: "Compute your GitHub Performance Index across consistency, depth, and diversity.",
  },
  {
    icon: Briefcase,
    title: "JOB MATCHING",
    desc: "Match your profile against any job description with semantic similarity + skill gap analysis.",
  },
  {
    icon: Mic,
    title: "MOCK INTERVIEWS",
    desc: "AI-generated questions tailored to your role with structured answer feedback.",
  },
  {
    icon: TrendingUp,
    title: "PROGRESS TRACKER",
    desc: "Track your Resume Evolution Score and improvement trends over time.",
  },
  {
    icon: Zap,
    title: "INSTANT FEEDBACK",
    desc: "Get actionable, prioritised suggestions in seconds, not hours.",
  },
];

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const glitchItem = {
  hidden: { opacity: 0, x: -20 },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 20,
      mass: 1,
    },
  },
};

export default function LandingPage() {
  return (
    <main className="min-h-screen relative bg-white overflow-hidden selection:bg-[#7C9ADD]/30 selection:text-[#2D3748]">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#7C9ADD]/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#98C9A3]/10 blur-[150px] rounded-full animate-pulse-slow" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-[#B8C1EC]/5 blur-[100px] rounded-full" />
      </div>

      <LandingNavbar />

      <section className="relative z-10 pt-56 pb-32 px-6 text-center">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="max-w-5xl mx-auto"
        >
          <motion.div
            variants={glitchItem}
            className="flex justify-center mb-10"
          >
            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/40 backdrop-blur-md border border-white/60 text-[#7C9ADD] font-bold text-xs uppercase tracking-[0.2em] shadow-sm">
              <Zap size={14} className="animate-pulse" />
              Next-Gen AI Career Studio
            </div>
          </motion.div>

          <motion.h1
            variants={glitchItem}
            className="font-display font-bold text-6xl md:text-8xl mb-10 tracking-tighter leading-[0.9] text-[#2D3748]"
          >
            Design your{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-br from-[#7C9ADD] to-[#98C9A3]">
              dream career
            </span>
            <br />
            with AI intelligence.
          </motion.h1>

          <motion.p
            variants={glitchItem}
            className="text-xl md:text-2xl text-[#718096] mb-16 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            The all-in-one studio for high-fidelity resume engineering, smart
            job matching, and immersive interview practice.
          </motion.p>

          <motion.div
            variants={glitchItem}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <Link href="/auth/register">
              <Button
                size="lg"
                className="w-full sm:w-auto h-16 px-12 rounded-[24px] bg-[#7C9ADD] text-white text-lg font-bold shadow-xl shadow-[#7C9ADD]/20 group transition-all"
              >
                Get Started
                <ArrowRight
                  size={20}
                  className="ml-3 group-hover:translate-x-1 transition-transform"
                />
              </Button>
            </Link>
            <div className="flex items-center gap-3 text-sm text-[#A0AEC0] font-bold uppercase tracking-widest">
              <CheckCircle2 size={20} className="text-[#98C9A3]" />
              Enterprise-Grade AI
            </div>
          </motion.div>
        </motion.div>
      </section>

      <section className="relative z-10 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <h2 className="font-display font-bold text-4xl md:text-5xl mb-6 tracking-tighter text-[#2D3748]">
              The Full-Stack Career Engine
            </h2>
            <p className="text-lg text-[#718096] font-medium max-w-xl mx-auto">
              Replace messy spreadsheets and anxious job hunting with a
              streamlined, AI-optimized workflow.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {features.map(({ icon: Icon, title, desc }, idx) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card p-10 rounded-[48px] border border-white/80 bg-white/60 shadow-glass group hover:-translate-y-2 transition-all duration-500"
              >
                <div className="w-16 h-16 rounded-3xl bg-white shadow-sm border border-white/80 flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500">
                  <Icon
                    size={28}
                    className="text-[#7C9ADD] group-hover:text-[#98C9A3] transition-colors"
                  />
                </div>
                <h3 className="text-2xl font-display font-bold mb-4 text-[#2D3748] tracking-tight">
                  {title}
                </h3>
                <p className="leading-relaxed font-medium text-[#718096]">
                  {desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 py-32 px-6 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto relative"
        >
          <div className="absolute inset-0 bg-linear-to-br from-[#7C9ADD]/20 to-[#98C9A3]/20 blur-[100px] -z-10" />
          <div className="relative p-16 md:p-24 rounded-[64px] bg-white/40 border border-white/60 backdrop-blur-2xl shadow-glass text-center">
            <div className="w-20 h-20 rounded-[28px] bg-white shadow-lg flex items-center justify-center mx-auto mb-10">
              <TrendingUp className="text-[#98C9A3]" size={32} />
            </div>
            <h2 className="font-display font-bold text-5xl md:text-7xl mb-8 text-[#2D3748] tracking-tighter">
              Launch your career trajectory today.
            </h2>
            <p className="text-xl md:text-2xl text-[#718096] mb-16 max-w-2xl mx-auto font-medium">
              Join thousands of professionals using AI to craft irresistible
              resumes and ace complex interviews.
            </p>
            <Link href="/auth/register">
              <Button
                size="lg"
                className="h-20 px-16 rounded-[32px] bg-[#2D3748] text-white text-xl font-bold hover:bg-[#7C9ADD] transition-all shadow-xl active:scale-95"
              >
                Initialize Free Access
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </main>
  );
}
