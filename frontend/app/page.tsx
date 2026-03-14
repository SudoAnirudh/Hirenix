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
  Shield,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

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
    <main className="min-h-screen relative text-[color:var(--text-primary)] overflow-hidden">
      <nav className="fixed top-0 w-full z-50 border-b-2 border-[color:var(--border)] bg-[#050505]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-display font-bold text-3xl text-[color:var(--border-accent)] animate-glitch"
            data-text="HIRENIX"
          >
            HIRENIX
          </motion.span>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-6"
          >
            <Link href="/auth/login">
              <Button
                variant="ghost"
                className="hidden sm:inline-flex rounded-none border-2 border-[var(--border)] text-sm px-6"
              >
                SYSTEM LOGIN
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="primary" className="rounded-none border-2 px-6">
                INITIALIZE
              </Button>
            </Link>
          </motion.div>
        </div>
      </nav>

      <section className="relative z-10 pt-48 pb-20 px-6 text-center">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="max-w-6xl mx-auto"
        >
          <motion.div
            variants={glitchItem}
            className="flex justify-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-6 py-2 border-2 border-[var(--emerald)] bg-[#050505] text-[var(--emerald)] font-mono text-xs font-bold uppercase tracking-widest shadow-[4px_4px_0px_var(--emerald)]">
              <Zap
                size={16}
                className="text-[var(--emerald)] animate-pulse-glow"
              />
              AI Career Studio :: v2.0
            </div>
          </motion.div>

          <motion.h1
            variants={glitchItem}
            className="font-display font-bold text-5xl md:text-7xl lg:text-8xl mb-8 tracking-tighter leading-[1] uppercase"
          >
            BUILD AN <span className="text-[var(--cyan)]">OFFER-READY</span>{" "}
            PROFILE
            <br />
            <span className="text-[var(--indigo)] underline decoration-4 underline-offset-8">
              FASTER & SMARTER
            </span>
          </motion.h1>

          <motion.p
            variants={glitchItem}
            className="text-lg md:text-xl text-[color:var(--text-secondary)] mb-12 max-w-2xl mx-auto leading-relaxed border-l-4 border-[var(--violet)] pl-6 text-left"
          >
            &gt; Resume diagnostics_
            <br />
            &gt; GitHub signal scoring_
            <br />
            &gt; Job-fit breakdowns_
            <br />
            &gt; Structured mock interviews in one focused workflow_
          </motion.p>

          <motion.div
            variants={glitchItem}
            className="flex flex-col sm:flex-row gap-8 justify-center items-center"
          >
            <Link href="/auth/register">
              <Button
                size="lg"
                variant="primary"
                className="w-full sm:w-auto text-lg group rounded-none border-2"
              >
                EXECUTE_ANALYSIS
                <ArrowRight
                  size={20}
                  className="ml-3 group-hover:translate-x-1 transition-transform"
                />
              </Button>
            </Link>
            <div className="flex items-center gap-2 text-sm text-[color:var(--text-secondary)] font-mono uppercase tracking-widest">
              <CheckCircle2 size={18} className="text-[color:var(--emerald)]" />
              Free Tier Available
            </div>
          </motion.div>
        </motion.div>
      </section>

      <section className="relative z-10 py-32 px-6 border-t-[1px] border-[var(--border)] bg-[#080808]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20 max-w-4xl border-b-2 border-[var(--border)] pb-8"
          >
            <h2 className="font-display font-bold text-4xl md:text-5xl mb-4 uppercase text-[var(--pink)]">
              &gt; CAREER GROWTH SYSTEM
            </h2>
            <p className="text-xl text-[color:var(--text-secondary)] font-mono">
              [ BUILT FOR TACTICAL EXECUTION ]
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, desc }, idx) => (
              <Card
                key={title}
                className="glass-card rounded-none border-2 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-2 font-mono text-xs text-[var(--border)] font-bold">
                  0{idx + 1}
                </div>
                <CardHeader className="pb-4">
                  <div className="w-14 h-14 border-2 border-[var(--border)] bg-[#111] flex items-center justify-center mb-6 group-hover:border-[var(--emerald)] group-hover:bg-[#050505] transition-colors shadow-[4px_4px_0px_var(--border)] group-hover:shadow-[4px_4px_0px_var(--emerald)]">
                    <Icon
                      size={26}
                      className="text-[var(--text-primary)] group-hover:text-[var(--emerald)] transition-colors"
                    />
                  </div>
                  <CardTitle className="text-2xl font-display uppercase tracking-tight">
                    {title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed font-mono mt-2 text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors">
                    {desc}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 py-32 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto relative group"
        >
          {/* Cyberpunk background offset box */}
          <div className="absolute inset-0 bg-[var(--indigo)] translate-x-4 translate-y-4 shadow-[0_0_20px_var(--indigo)]" />

          <div className="relative p-12 md:p-20 border-4 border-white bg-[#050505]">
            <div className="absolute top-0 right-0 w-16 h-16 border-l-4 border-b-4 border-white bg-[#050505] translate-x-1 -translate-y-1" />

            <Shield size={56} className="text-[color:var(--emerald)] mb-8" />
            <h2 className="font-display font-bold text-5xl md:text-6xl mb-6 text-white uppercase tracking-tighter">
              START FREE, UPGRADE WHEN NEEDED.
            </h2>
            <p className="text-lg md:text-xl text-[color:var(--text-secondary)] mb-12 max-w-2xl font-mono">
              [ NO CARD REQUIRED ] Move from messy resume drafts to structured,
              data-backed job applications in the terminal.
            </p>
            <Link href="/auth/register">
              <Button
                size="lg"
                className="btn-primary rounded-none text-xl px-12 py-8 uppercase tracking-widest border-4 shadow-none hover:-translate-y-1"
              >
                CREATE SECURE ACCOUNT
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      <footer className="relative z-10 py-12 px-6 border-t-2 border-[color:var(--border)] bg-[#050505]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm font-mono text-[color:var(--text-muted)] uppercase tracking-widest">
            (C) {new Date().getFullYear()} HIRENIX_SYS
          </p>
          <div className="flex gap-4">
            <span className="text-xs font-mono px-3 py-1 border border-[var(--border)] text-[var(--border)]">
              SYS.NEXT.JS
            </span>
            <span className="text-xs font-mono px-3 py-1 border border-[var(--border)] text-[var(--border)]">
              DB.SUPABASE
            </span>
            <span className="text-xs font-mono px-3 py-1 border border-[var(--border)] text-[var(--border)]">
              API.FASTAPI
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
