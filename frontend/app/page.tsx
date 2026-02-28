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
    desc: "Get actionable, prioritised suggestions in seconds — not hours.",
  },
];

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const fadeUpItem = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

export default function LandingPage() {
  return (
    <main className="min-h-screen relative bg-[#0a0a0f] text-slate-200 overflow-hidden">
      {/* ── Background Effects ── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px] mix-blend-screen animate-float" />
        <div
          className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-violet-600/10 blur-[120px] mix-blend-screen animate-float"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* ── Navbar ── */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-display font-bold text-2xl bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent"
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
              <Button variant="shine">Get Started</Button>
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 pt-40 pb-20 px-6 text-center">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="max-w-4xl mx-auto"
        >
          <motion.div
            variants={fadeUpItem}
            className="flex justify-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium backdrop-blur-md">
              <Zap
                size={14}
                className="text-indigo-400 fill-indigo-400 animate-pulse"
              />
              Next-Gen AI Career Analytics
            </div>
          </motion.div>

          <motion.h1
            variants={fadeUpItem}
            className="font-display font-bold text-5xl md:text-7xl lg:text-8xl mb-8 tracking-tight leading-[1.1]"
          >
            Land Your Dream Job <br />
            <span className="bg-gradient-to-br from-white via-slate-200 to-slate-500 bg-clip-text text-transparent">
              With AI Precision
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUpItem}
            className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Resume ATS scoring, massive GitHub intelligence, and AI mock
            interviews — perfectly tailored to any job description.
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
            <div className="flex items-center gap-2 text-sm text-slate-400 ml-4">
              <CheckCircle2 size={16} className="text-emerald-500" /> Free
              Forever Tier
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20 max-w-3xl mx-auto"
          >
            <h2 className="font-display font-bold text-4xl md:text-5xl mb-6">
              Everything You Need to{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                Succeed
              </span>
            </h2>
            <p className="text-lg text-slate-400">
              Powerful modules working together to accelerate your career growth
              and land the offers you deserve.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <Card key={title}>
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
                    <Icon size={24} className="text-indigo-400" />
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

      {/* ── CTA ── */}
      <section className="relative z-10 py-32 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto rounded-3xl overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-violet-600/20 mix-blend-screen" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />

          <div className="relative p-12 md:p-20 text-center border border-white/10 rounded-3xl bg-black/40 backdrop-blur-md">
            <Shield size={48} className="text-indigo-400 mx-auto mb-6" />
            <h2 className="font-display font-bold text-4xl md:text-5xl mb-6 text-white">
              Start Free, Scale as You Grow
            </h2>
            <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
              No credit card required. Experience the power of AI career
              acceleration today.
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

      {/* ── Footer ── */}
      <footer className="relative z-10 py-8 px-6 border-t border-white/5 text-center">
        <p className="text-sm text-slate-500">
          © {new Date().getFullYear()} Hirenix. Built with Next.js, FastAPI &
          Supabase.
        </p>
      </footer>
    </main>
  );
}
