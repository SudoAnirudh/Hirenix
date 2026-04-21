"use client";
import Link from "next/link";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { Footer } from "@/components/landing/Footer";
import { motion } from "framer-motion";
import { Github, Code2, Rocket, ArrowRight } from "lucide-react";

export default function CareersPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  };

  const contributionAreas = [
    {
      title: "Core Platform",
      description:
        "Help build and optimize the Next.js frontend and FastAPI backend. Work on performance, accessibility, and new platform features.",
      icon: Code2,
      tags: ["React 19", "Next.js", "Python", "FastAPI"],
    },
    {
      title: "AI Engines",
      description:
        "Enhance our ATS scoring models and semantic caching systems. Improve prompt engineering and latency optimization.",
      icon: Rocket,
      tags: ["pgvector", "LLMs", "Sentence Transformers"],
    },
  ];

  return (
    <main className="min-h-screen relative bg-background overflow-hidden selection:bg-brand-blue/30 selection:text-brand-blue">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-blue/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand-green/10 blur-[150px] rounded-full animate-pulse-slow" />
      </div>

      <LandingNavbar />

      <section className="relative z-10 pt-48 pb-32 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="initial"
            animate="animate"
            variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
            className="text-center mb-20"
          >
            <motion.div
              variants={fadeInUp}
              className="flex justify-center mb-8"
            >
              <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-card/40 backdrop-blur-md border border-border text-brand-blue font-bold text-xs uppercase tracking-[0.2em] shadow-sm">
                <Github size={14} className="animate-pulse" />
                Open Source
              </div>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="font-display font-bold text-5xl md:text-7xl mb-8 tracking-tighter leading-[0.9] text-foreground"
            >
              Build the Future of{""}
              <span className="text-transparent bg-clip-text bg-linear-to-br from-brand-blue to-brand-green">
                Hiring
              </span>
              .
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium"
            >
              Hirenix is an open-source initiative. We're looking for passionate
              developers to contribute to the platform and democratize career
              acceleration tools.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="mt-12 flex justify-center"
            >
              <Link
                href="https://github.com/SudoAnirudh/Hirenix"
                target="_blank"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-brand-blue text-white font-bold tracking-widest uppercase transition-all"
              >
                <Github size={20} />
                View Repository
                <ArrowRight size={18} />
              </Link>
            </motion.div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mb-20">
            {contributionAreas.map((area, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                className="glass-card p-10 rounded-[40px] border border-border bg-card/60 shadow-glass relative overflow-hidden"
              >
                <div className="w-14 h-14 rounded-2xl bg-brand-blue/10 flex items-center justify-center mb-8">
                  <area.icon className="text-brand-blue" size={28} />
                </div>
                <h3 className="text-2xl font-display font-bold text-foreground mb-4">
                  {area.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  {area.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {area.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 rounded-full bg-secondary/50 text-muted-foreground text-xs font-bold uppercase tracking-wider border border-border"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center p-12 rounded-[40px] bg-linear-to-b from-card to-background border border-border"
          >
            <h2 className="text-3xl font-display font-bold text-foreground mb-6">
              How to Contribute
            </h2>
            <div className="flex flex-col md:flex-row justify-center items-center gap-8 text-left max-w-2xl mx-auto">
              <div className="flex-1 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold shrink-0">
                    1
                  </div>
                  <p className="text-muted-foreground">
                    Fork the repository and clone it to your local machine.
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold shrink-0">
                    2
                  </div>
                  <p className="text-muted-foreground">
                    Find an open issue labeled{" "}
                    <span className="text-brand-green font-mono text-sm px-2 py-0.5 rounded-md bg-brand-green/10">
                      good first issue
                    </span>
                    .
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold shrink-0">
                    3
                  </div>
                  <p className="text-muted-foreground">
                    Submit a Pull Request with a clear description of your
                    changes.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
