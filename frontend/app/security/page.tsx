"use client";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { Footer } from "@/components/landing/Footer";
import { motion } from "framer-motion";
import { Shield, Lock, FileKey } from "lucide-react";

export default function SecurityPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  };

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
                <Shield size={14} className="animate-pulse" />
                Security First
              </div>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="font-display font-bold text-5xl md:text-7xl mb-8 tracking-tighter leading-[0.9] text-foreground"
            >
              Enterprise-Grade{""}
              <span className="text-transparent bg-clip-text bg-linear-to-br from-brand-blue to-brand-green">
                Security
              </span>
              .
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium"
            >
              At Hirenix, we treat your career data with the utmost
              confidentiality and robust security protocols.
            </motion.p>
          </motion.div>

          <div className="space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-10 rounded-[40px] border border-border bg-card/60 shadow-glass relative overflow-hidden group"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 flex items-center justify-center">
                  <Lock className="text-brand-blue" size={24} />
                </div>
                <h2 className="text-2xl font-display font-bold text-foreground">
                  Data Encryption
                </h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                All data, including resumes, job descriptions, and user
                profiles, is encrypted in transit using industry-standard TLS
                1.3 and at rest using AES-256 encryption. Our database, powered
                by Supabase, ensures your vector embeddings and personal
                identifiable information are securely isolated.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card p-10 rounded-[40px] border border-border bg-card/60 shadow-glass relative overflow-hidden group"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-brand-green/10 flex items-center justify-center">
                  <FileKey className="text-brand-green" size={24} />
                </div>
                <h2 className="text-2xl font-display font-bold text-foreground">
                  Authentication & Access
                </h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                We use strict JSON Web Token (JWT) based authentication.
                Passwords and credentials are never stored in plaintext. Access
                to the LLM semantic cache and other backend endpoints are
                protected by Row Level Security (RLS) policies and service-role
                level authorization to prevent unauthorized access.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
