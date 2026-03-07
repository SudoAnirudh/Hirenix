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
    title: "AI Resume Scoring",
    desc: "Hybrid ATS scoring combining rule-based analysis and semantic embeddings.",
  },
  {
    icon: Github,
    title: "GitHub Intelligence",
    desc: "Compute your GitHub Performance Index across consistency, depth, and diversity.",
  },
  {
    icon: Briefcase,
    title: "Job Matching",
    desc: "Match your profile against any job description with semantic similarity + skill gap analysis.",
  },
  {
    icon: Mic,
    title: "Mock Interviews",
    desc: "AI-generated questions tailored to your role with structured answer feedback.",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracker",
    desc: "Track your Resume Evolution Score and improvement trends over time.",
  },
  {
    icon: Zap,
    title: "Instant Feedback",
    desc: "Get actionable, prioritised suggestions in seconds, not hours.",
  },
];

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

const fadeUpItem = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 180,
      damping: 28,
      mass: 0.9,
    },
  },
};

export default function LandingPage() {
  return (
    <main className="min-h-screen relative text-[color:var(--text-primary)] overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-20 w-96 h-96 rounded-full bg-orange-300/30 blur-3xl animate-float" />
        <div
          className="absolute top-24 -right-20 w-[28rem] h-[28rem] rounded-full bg-teal-300/30 blur-3xl animate-float"
          style={{ animationDelay: "1.7s" }}
        />
      </div>

      <nav className="fixed top-0 w-full z-50 border-b border-[color:var(--border)] bg-[rgba(255,250,242,0.84)] backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-display font-bold text-2xl gradient-text"
          >
            Hirenix
          </motion.span>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <Link href="/auth/login">
              <Button variant="ghost" className="hidden sm:inline-flex">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="primary">Get Started</Button>
            </Link>
          </motion.div>
        </div>
      </nav>

      <section className="relative z-10 pt-40 pb-20 px-6 text-center">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="max-w-5xl mx-auto"
        >
          <motion.div
            variants={fadeUpItem}
            className="flex justify-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-300 bg-orange-100/90 text-orange-900 text-sm font-semibold">
              <Zap size={14} className="text-orange-700" />
              AI Career Studio
            </div>
          </motion.div>

          <motion.h1
            variants={fadeUpItem}
            className="font-display font-bold text-5xl md:text-7xl lg:text-8xl mb-7 tracking-tight leading-[1.04]"
          >
            Build an Offer-Ready Profile
            <br />
            <span className="bg-gradient-to-r from-[#17232e] via-[#dd6b20] to-[#0b7c76] bg-clip-text text-transparent">
              Faster and Smarter
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUpItem}
            className="text-lg md:text-xl text-[color:var(--text-secondary)] mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Resume diagnostics, GitHub signal scoring, job-fit breakdowns, and
            structured mock interviews in one focused workflow.
          </motion.p>

          <motion.div
            variants={fadeUpItem}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/auth/register">
              <Button
                size="lg"
                variant="primary"
                className="w-full sm:w-auto text-lg group"
              >
                Start Analyzing
                <ArrowRight
                  size={18}
                  className="ml-2 group-hover:translate-x-1 transition-transform"
                />
              </Button>
            </Link>
            <div className="flex items-center gap-2 text-sm text-[color:var(--text-secondary)]">
              <CheckCircle2 size={16} className="text-[color:var(--emerald)]" />
              Free Tier Available
            </div>
          </motion.div>
        </motion.div>
      </section>

      <section className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 max-w-3xl mx-auto"
          >
            <h2 className="font-display font-bold text-4xl md:text-5xl mb-6">
              Career Growth System
              <span className="gradient-text"> Built for Execution</span>
            </h2>
            <p className="text-lg text-[color:var(--text-secondary)]">
              Use focused modules that connect your profile quality, market fit,
              and interview readiness.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <Card key={title}>
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-[rgba(11,124,118,0.12)] border border-[rgba(11,124,118,0.3)] flex items-center justify-center mb-4">
                    <Icon size={22} className="text-[color:var(--indigo)]" />
                  </div>
                  <CardTitle className="text-xl">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {desc}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 py-24 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto rounded-3xl overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-200/70 via-amber-100/50 to-teal-200/60" />
          <div className="relative p-12 md:p-20 text-center border border-white/60 rounded-3xl bg-[rgba(255,250,242,0.85)] backdrop-blur-md">
            <Shield
              size={46}
              className="text-[color:var(--indigo)] mx-auto mb-6"
            />
            <h2 className="font-display font-bold text-4xl md:text-5xl mb-6 text-[#17232e]">
              Start Free, Upgrade When Needed
            </h2>
            <p className="text-lg md:text-xl text-[color:var(--text-secondary)] mb-10 max-w-2xl mx-auto">
              No card required. Move from messy resume drafts to structured,
              data-backed job applications.
            </p>
            <Link href="/auth/register">
              <Button
                size="lg"
                variant="shine"
                className="px-12 py-6 text-lg rounded-xl"
              >
                Create Free Account
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      <footer className="relative z-10 py-8 px-6 border-t border-[color:var(--border)] text-center">
        <p className="text-sm text-[color:var(--text-secondary)]">
          {new Date().getFullYear()} Hirenix. Built with Next.js, FastAPI and
          Supabase.
        </p>
      </footer>
    </main>
  );
}
