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
import { SpotlightCard } from "@/components/ui/spotlight-card";

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

const fadeItem = {
  hidden: { y: 20, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

export default function LandingPage() {
  return (
    <main className="min-h-screen relative bg-background text-foreground overflow-hidden selection:bg-brand-blue/20 selection:text-brand-blue">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-blue/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand-green/10 blur-[150px] rounded-full animate-pulse-slow" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-brand-purple/5 blur-[100px] rounded-full" />
      </div>

      <LandingNavbar />

      <section className="relative z-10 pt-56 pb-32 px-6 text-center">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="max-w-5xl mx-auto"
        >
          <motion.div variants={fadeItem} className="flex justify-center mb-10">
            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-secondary/50 backdrop-blur-md border border-border text-brand-blue font-bold text-xs uppercase tracking-[0.2em] shadow-sm">
              <Zap size={14} className="animate-pulse" />
              Next-Gen AI Career Studio
            </div>
          </motion.div>

          <motion.h1
            variants={fadeItem}
            className="text-6xl sm:text-7xl md:text-8xl font-black font-display tracking-tight text-foreground flex flex-col mb-8 leading-[0.9]"
          >
            Supercharge Your
            <span className="text-brand-blue tracking-tighter drop-shadow-sm">
              Career Trajectory.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeItem}
            className="text-xl md:text-2xl text-muted-foreground mb-16 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            The all-in-one studio for high-fidelity resume engineering, smart
            job matching, and immersive interview practice.
          </motion.p>

          <motion.div
            variants={fadeItem}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <Link href="/auth/register">
              <Button
                size="lg"
                className="w-full sm:w-auto h-16 px-12 rounded-[24px] bg-brand-blue text-white text-lg font-bold shadow-xl shadow-brand-blue/20 group transition-all"
              >
                Get Started
                <ArrowRight size={20} className="ml-3 transition-transform" />
              </Button>
            </Link>
            <div className="flex items-center gap-3 text-sm text-muted-foreground font-bold uppercase tracking-widest">
              <CheckCircle2 size={20} className="text-brand-green" />
              Enterprise-Grade AI
            </div>
          </motion.div>
        </motion.div>
      </section>

      <section className="relative z-10 py-32 px-6" id="features">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <h2 className="font-display font-bold text-4xl md:text-6xl mb-6 tracking-tighter text-foreground">
              The Full-Stack Career Engine
            </h2>
            <p className="text-lg text-muted-foreground font-medium max-w-xl mx-auto">
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
                className="group"
              >
                <SpotlightCard className="h-full p-10 rounded-[48px] border-border bg-card/40 shadow-glass transition-all duration-500">
                  <div className="w-16 h-16 rounded-3xl bg-background shadow-sm border border-border flex items-center justify-center mb-10 transition-transform duration-500">
                    <Icon
                      size={28}
                      className="text-brand-blue group- transition-colors"
                    />
                  </div>
                  <h3 className="text-2xl font-display font-bold mb-4 text-foreground tracking-tight">
                    {title}
                  </h3>
                  <p className="leading-relaxed font-medium text-muted-foreground">
                    {desc}
                  </p>
                </SpotlightCard>
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
          <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/20 to-brand-green/20 blur-[100px] -z-10" />
          <div className="relative p-16 md:p-24 rounded-[64px] bg-card/40 border border-border backdrop-blur-2xl shadow-glass text-center">
            <div className="w-20 h-20 rounded-[28px] bg-background shadow-lg flex items-center justify-center mx-auto mb-10 border border-border">
              <TrendingUp className="text-brand-green" size={32} />
            </div>
            <h2 className="font-display font-bold text-5xl md:text-7xl mb-8 text-foreground tracking-tighter leading-none">
              Launch your career trajectory today.
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground mb-16 max-w-2xl mx-auto font-medium">
              Join thousands of professionals using AI to craft irresistible
              resumes and ace complex interviews.
            </p>
            <Link href="/auth/register">
              <Button
                size="lg"
                className="h-20 px-16 rounded-[32px] bg-primary text-primary-foreground text-xl font-bold transition-all shadow-xl active:scale-95 border-none"
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
