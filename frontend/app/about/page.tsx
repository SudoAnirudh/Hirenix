"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { Brain, Target, Github, ArrowRight, Shield, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { Footer } from "@/components/landing/Footer";

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
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

const RadarPreview = () => (
  <div className="relative w-full h-44 flex items-center justify-center bg-brand-blue/5 rounded-3xl overflow-hidden mb-8 group/preview">
    <div className="absolute inset-0 flex items-center justify-center opacity-20">
      <div className="w-36 h-36 border border-brand-blue rounded-full animate-ping [animation-duration:3s]" />
      <div className="w-28 h-28 border border-brand-blue/40 rounded-full" />
      <div className="w-16 h-16 border border-brand-blue/20 rounded-full" />
    </div>
    <svg
      className="w-32 h-32 transform rotate-[-18deg] relative z-10 transition-transform duration-500 group-hover/preview:scale-110 group-hover/preview:rotate-0"
      viewBox="0 0 100 100"
    >
      <polygon
        points="50,10 90,40 75,90 25,90 10,40"
        className="fill-brand-blue/10 stroke-brand-blue stroke-2"
      />
      <motion.polygon
        initial={{ scale: 0.8, opacity: 0.5 }}
        animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        points="50,25 80,45 65,75 35,75 20,45"
        className="fill-brand-blue/30 stroke-brand-blue stroke-1"
      />
      <circle cx="50" cy="10" r="2" className="fill-brand-blue" />
      <circle cx="90" cy="40" r="2" className="fill-brand-blue" />
      <circle cx="75" cy="90" r="2" className="fill-brand-blue" />
      <circle cx="25" cy="90" r="2" className="fill-brand-blue" />
      <circle cx="10" cy="40" r="2" className="fill-brand-blue" />
    </svg>
  </div>
);

const SecurityPreview = () => (
  <div className="relative w-full h-44 flex items-center justify-center bg-brand-green/5 rounded-3xl overflow-hidden mb-8 group/preview">
    <div className="flex flex-col items-center gap-4 relative z-10">
      <div className="flex items-end gap-2 h-12">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <motion.div
            key={i}
            animate={{ height: [12, 24, 36, 20, 12] }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
            className="w-2.5 bg-brand-green/30 rounded-full group-hover/preview:bg-brand-green/50 transition-colors"
          />
        ))}
      </div>
      <div className="px-4 py-1.5 rounded-full bg-card border border-brand-green/20 text-[10px] font-bold text-brand-green uppercase tracking-[0.2em] flex items-center gap-2.5 shadow-sm group-hover/preview:border-brand-green/40 transition-all">
        <Shield
          size={12}
          className="group-hover/preview:rotate-12 transition-transform"
        />
        RLS Secured
      </div>
    </div>
    <div className="absolute top-2 right-2 p-2">
      <div className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
    </div>
  </div>
);

const GitHubPreview = () => (
  <div className="relative w-full h-44 flex items-center justify-center bg-brand-purple/5 rounded-3xl overflow-hidden mb-8 group/preview">
    <div className="grid grid-cols-7 gap-2 relative z-10 transform group-hover/preview:scale-105 transition-transform duration-500">
      {Array.from({ length: 28 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0.3 }}
          animate={{
            opacity: [0.3, 1, 0.3],
            backgroundColor:
              i % 3 === 0 ? "#8b5cf6" : "rgba(139, 92, 246, 0.1)",
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: (i % 7) * 0.15 + Math.floor(i / 7) * 0.3,
          }}
          className="w-4 h-4 rounded-sm border border-brand-purple/10"
        />
      ))}
    </div>
    <div className="absolute bottom-3 right-4 flex items-center gap-1.5 text-[8px] font-bold text-brand-purple/60 uppercase tracking-widest">
      <Github size={10} />
      Activity Stream
    </div>
  </div>
);

export default function AboutPage() {
  return (
    <main className="min-h-screen relative bg-background overflow-hidden selection:bg-brand-blue/30 selection:text-brand-blue">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-blue/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand-green/10 blur-[150px] rounded-full animate-pulse-slow" />
      </div>

      <LandingNavbar />

      {/* Hero Section */}
      <section className="relative z-10 pt-56 pb-24 px-6 text-center">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="max-w-4xl mx-auto"
        >
          <motion.div variants={fadeInUp} className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-card/40 backdrop-blur-md border border-border text-brand-blue font-bold text-xs uppercase tracking-[0.2em] shadow-sm">
              <Brain size={14} className="animate-pulse" />
              Our Mission
            </div>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="font-display font-bold text-6xl md:text-8xl mb-10 tracking-tighter leading-[0.9] text-foreground"
          >
            Engineering the{""}
            <span className="text-transparent bg-clip-text bg-linear-to-br from-brand-blue to-brand-green">
              future of work
            </span>
            .
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            Hirenix is built on the belief that career growth should be
            data-driven, transparent, and powered by the world&apos;s most
            advanced AI.
          </motion.p>
        </motion.div>
      </section>

      {/* Values Section */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            {
              preview: RadarPreview,
              title: "Precision Engineering",
              desc: "We don&apos;t do generic. Our AI probes the deepest layers of your code and experience to find exact matches.",
            },
            {
              preview: SecurityPreview,
              title: "Data Integrity",
              desc: "Your data stays yours. We use RLS-secured Supabase logic and private storage for every user portfolio.",
            },
            {
              preview: GitHubPreview,
              title: "Modern Standards",
              desc: "Built for the global, remote-first market where GitHub presence and semantic relevance are the new currency.",
            },
          ].map((value, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-10 rounded-[40px] border border-border bg-card/60 shadow-glass group"
            >
              <value.preview />
              <h3 className="text-2xl font-display font-bold mb-4 text-foreground">
                {value.title}
              </h3>
              <p className="text-muted-foreground font-medium leading-relaxed">
                {value.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Founder Section */}
      <section className="relative z-10 py-32 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="glass-card rounded-[64px] p-12 md:p-20 bg-card/40 border border-border flex flex-col md:flex-row items-center gap-16 shadow-glass relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/5 blur-[100px] rounded-full -mr-32 -mt-32" />

            <div className="w-48 h-48 md:w-64 md:h-64 rounded-[48px] overflow-hidden shadow-2xl relative group shrink-0 border-4 border-border/50">
              <Image
                src="https://avatars.githubusercontent.com/u/78668573?v=4"
                alt="Anirudh S"
                width={256}
                height={256}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-linear-to-t from-brand-blue/90 via-brand-blue/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end justify-center pb-8 translate-y-4 group-hover:translate-y-0">
                <div className="flex gap-6">
                  <Link
                    href="https://github.com/SudoAnirudh"
                    className="text-white hover:scale-125 transition-transform p-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/20 shadow-lg"
                    title="GitHub Profile"
                  >
                    <Github size={22} />
                  </Link>
                  <Link
                    href="https://portfolio-blue-five-10.vercel.app/"
                    className="text-white hover:scale-125 transition-transform p-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/20 shadow-lg"
                    title="Personal Portfolio"
                  >
                    <Globe size={22} />
                  </Link>
                </div>
              </div>
            </div>

            <div className="flex-1 text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-blue/10 text-brand-blue font-bold text-[10px] uppercase tracking-widest mb-6">
                Founder&apos;s Note
              </div>
              <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-8 tracking-tighter">
                Built by a developer, <br />
                <span className="text-brand-blue">for developers.</span>
              </h2>
              <p className="text-lg text-muted-foreground font-medium leading-relaxed mb-10 max-w-xl">
                &quot;Hirenix started as a project to solve my own frustrations
                with the job market. I wanted a platform that wasn&apos;t just
                about &apos;applying&apos;, but about &apos;understanding&apos;
                my own value through the lens of modern AI. Today, it&apos;s a
                command center for thousands of engineers aiming for elite
                roles.&quot;
              </p>
              <div className="flex flex-col gap-1 relative">
                <span className="font-display font-black text-xl text-foreground">
                  Anirudh S
                </span>
                <motion.span
                  initial={{ opacity: 0, pathLength: 0, x: -20 }}
                  whileInView={{ opacity: 0.6, pathLength: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8, duration: 1.5, ease: "easeOut" }}
                  style={{ fontFamily: "'Caveat', cursive" }}
                  className="absolute -bottom-10 -left-1 text-4xl text-brand-blue pointer-events-none select-none"
                >
                  Anirudh S
                </motion.span>
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-6">
                  Creator of Hirenix
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-4xl mx-auto p-16 rounded-[48px] bg-primary text-center shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-linear-to-br from-brand-blue/20 to-transparent opacity-0 transition-opacity duration-1000" />
          <h2 className="text-4xl md:text-5xl font-display font-bold text-primary-foreground mb-8 tracking-tight relative z-10">
            Ready to optimize your path?
          </h2>
          <Link href="/auth/register" className="relative z-10">
            <Button className="h-16 px-12 rounded-2xl bg-background text-foreground transition-all text-lg font-bold shadow-xl active:scale-95 group/btn">
              Get Started Now
              <ArrowRight
                size={20}
                className="ml-3 group-hover/btn:translate-x-1 transition-transform"
              />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
