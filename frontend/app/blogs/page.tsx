"use client";

import { motion, Variants } from "framer-motion";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { Footer } from "@/components/landing/Footer";
import { Brain, Code, UserCheck, ArrowRight } from "lucide-react";

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
    },
  },
};

const blogs = [
  {
    title: "The Power of ATS: Decoding the Algorithms",
    excerpt:
      "Learn how Hirenix deconstructs resume parsing algorithms to ensure your resume never gets lost in the void.",
    icon: Brain,
    date: "April 15, 2026",
    readTime: "5 min read",
  },
  {
    title: "GitHub Intelligence vs. Contribution Graphs",
    excerpt:
      "Why semantic code analysis and repository depth beat simple contribution squares when applying to elite engineering roles.",
    icon: Code,
    date: "April 10, 2026",
    readTime: "8 min read",
  },
  {
    title: "Surviving the AI Mock Interview",
    excerpt:
      "How to prepare for our high-pressure technical mock interviews that simulate real-world hiring committee standards.",
    icon: UserCheck,
    date: "April 02, 2026",
    readTime: "6 min read",
  },
];

export default function BlogsPage() {
  return (
    <main className="min-h-screen relative bg-background text-foreground overflow-hidden selection:bg-brand-blue/30 selection:text-brand-blue">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-blue/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand-green/10 blur-[150px] rounded-full animate-pulse-slow" />
      </div>

      <LandingNavbar />

      <section className="relative z-10 pt-48 pb-24 px-6 text-center">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="max-w-4xl mx-auto"
        >
          <motion.h1
            variants={fadeInUp}
            className="font-display font-bold text-5xl md:text-7xl mb-8 tracking-tighter leading-[0.9] text-foreground"
          >
            Insights & <span className="text-brand-blue">Features</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto font-medium"
          >
            Deep dives into how Hirenix accelerates your career, beats the ATS,
            and prepares you for the world's toughest engineering interviews.
          </motion.p>
        </motion.div>
      </section>

      <section className="relative z-10 pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {blogs.map((blog, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                className="glass-card flex flex-col p-8 rounded-[40px] border border-border bg-card/60 shadow-glass transition-all duration-500 group cursor-pointer"
              >
                <div className="w-14 h-14 rounded-2xl bg-brand-blue/10 flex items-center justify-center mb-8 text-brand-blue group- group- transition-all duration-300">
                  <blog.icon size={24} />
                </div>
                <div className="flex gap-3 items-center text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
                  <span>{blog.date}</span>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span>{blog.readTime}</span>
                </div>
                <h3 className="text-2xl font-display font-bold mb-4 text-foreground group- transition-colors">
                  {blog.title}
                </h3>
                <p className="text-muted-foreground font-medium leading-relaxed mb-8 flex-1">
                  {blog.excerpt}
                </p>
                <div className="mt-auto flex items-center font-bold text-brand-blue text-sm tracking-wide">
                  Read Article
                  <ArrowRight size={16} className="ml-2 transition-transform" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
