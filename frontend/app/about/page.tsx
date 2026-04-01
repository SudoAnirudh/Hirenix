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

export default function AboutPage() {
  return (
    <main className="min-h-screen relative bg-white overflow-hidden selection:bg-[#7C9ADD]/30 selection:text-[#2D3748]">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#7C9ADD]/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#98C9A3]/10 blur-[150px] rounded-full animate-pulse-slow" />
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
            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/40 backdrop-blur-md border border-white/60 text-[#7C9ADD] font-bold text-xs uppercase tracking-[0.2em] shadow-sm">
              <Brain size={14} className="animate-pulse" />
              Our Mission
            </div>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="font-display font-bold text-6xl md:text-8xl mb-10 tracking-tighter leading-[0.9] text-[#2D3748]"
          >
            Engineering the{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-br from-[#7C9ADD] to-[#98C9A3]">
              future of work
            </span>
            .
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-xl md:text-2xl text-[#718096] mb-12 max-w-2xl mx-auto leading-relaxed font-medium"
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
              icon: Target,
              title: "Precision Engineering",
              desc: "We don&apos;t do generic. Our AI probes the deepest layers of your code and experience to find exact matches.",
            },
            {
              icon: Shield,
              title: "Data Integrity",
              desc: "Your data stays yours. We use RLS-secured Supabase logic and private storage for every user portfolio.",
            },
            {
              icon: Globe,
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
              className="glass-card p-10 rounded-[40px] border border-white/80 bg-white/60 shadow-glass"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#7C9ADD]/10 flex items-center justify-center mb-8">
                <value.icon className="text-[#7C9ADD]" size={28} />
              </div>
              <h3 className="text-2xl font-display font-bold mb-4 text-[#2D3748]">
                {value.title}
              </h3>
              <p className="text-[#718096] font-medium leading-relaxed">
                {value.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Founder Section */}
      <section className="relative z-10 py-32 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="glass-card rounded-[64px] p-12 md:p-20 bg-white/40 border border-white/80 flex flex-col md:flex-row items-center gap-16 shadow-glass relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#7C9ADD]/5 blur-[100px] rounded-full -mr-32 -mt-32" />

            <div className="w-48 h-48 md:w-64 md:h-64 rounded-[48px] overflow-hidden shadow-2xl relative group shrink-0">
              <Image
                src="https://avatars.githubusercontent.com/u/78668573?v=4"
                alt="Anirudh S"
                width={256}
                height={256}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-linear-to-t from-[#2D3748]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-6">
                <div className="flex gap-4">
                  <Link
                    href="https://github.com/SudoAnirudh"
                    className="text-white hover:scale-110 transition-transform"
                  >
                    <Github size={20} />
                  </Link>
                  <Link
                    href="https://portfolio-blue-five-10.vercel.app/"
                    className="text-white hover:scale-110 transition-transform"
                  >
                    <Globe size={20} />
                  </Link>
                </div>
              </div>
            </div>

            <div className="flex-1 text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#7C9ADD]/10 text-[#7C9ADD] font-bold text-[10px] uppercase tracking-widest mb-6">
                Founder&apos;s Note
              </div>
              <h2 className="font-display font-bold text-4xl md:text-5xl text-[#2D3748] mb-8 tracking-tighter">
                Built by a developer, <br />
                <span className="text-[#7C9ADD]">for developers.</span>
              </h2>
              <p className="text-lg text-[#718096] font-medium leading-relaxed mb-10 max-w-xl">
                &quot;Hirenix started as a project to solve my own frustrations
                with the job market. I wanted a studio that wasn&apos;t just
                about &apos;applying&apos;, but about &apos;understanding&apos;
                my own value through the lens of modern AI. Today, it&apos;s a
                command center for thousands of engineers aiming for elite
                roles.&quot;
              </p>
              <div className="flex flex-col gap-1">
                <span className="font-display font-black text-xl text-[#2D3748]">
                  Anirudh S
                </span>
                <span className="text-sm font-bold text-[#A0AEC0] uppercase tracking-widest">
                  Creator of Hirenix
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-4xl mx-auto p-16 rounded-[48px] bg-[#2D3748] text-center shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-linear-to-br from-[#7C9ADD]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-8 tracking-tight relative z-10">
            Ready to optimize your path?
          </h2>
          <Link href="/auth/register" className="relative z-10">
            <Button className="h-16 px-12 rounded-2xl bg-white text-[#2D3748] hover:bg-[#7C9ADD] hover:text-white transition-all text-lg font-bold shadow-xl active:scale-95 group/btn">
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
