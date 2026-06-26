"use client";

import React from "react";
import { motion } from "framer-motion";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { Footer } from "@/components/landing/Footer";
import { Briefcase } from "lucide-react";

export default function JobsBoardPage() {
  return (
    <main className="min-h-screen relative bg-background text-foreground overflow-hidden selection:bg-brand-blue/30 selection:text-brand-blue font-body flex flex-col justify-between">
      {/* Background blurs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-blue/8 blur-[130px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand-green/8 blur-[160px] rounded-full" />
      </div>

      <LandingNavbar />

      <section className="relative z-10 flex-1 flex flex-col items-center justify-center pt-32 pb-16 px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-lg p-10 rounded-[36px] bg-card/45 border border-slate-200/50 shadow-glass backdrop-blur-xl text-center flex flex-col items-center gap-6"
        >
          <div className="w-16 h-16 rounded-3xl bg-brand-blue/10 flex items-center justify-center text-brand-blue border border-brand-blue/20 relative shadow-inner">
            <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-brand-green animate-ping" />
            <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-brand-green" />
            <Briefcase className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-500">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[10px] font-black tracking-wider uppercase">
                Under Scheduled Maintenance
              </span>
            </div>
            <h1 className="font-display font-bold text-4xl tracking-tighter leading-none text-foreground mt-2">
              Jobs Board is <span className="text-brand-blue">Offline</span>
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium mt-3">
              We are currently optimizing our real-time job aggregation
              workflows and scraping pipelines. This feature will return online
              shortly with faster delivery and direct outreach integrations.
            </p>
          </div>

          <div className="w-full h-px bg-slate-200/50 my-2" />

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <a
              href="/"
              className="flex-1 px-6 py-4 rounded-2xl bg-brand-blue text-white text-xs font-bold uppercase shadow-lg hover:bg-blue-600 transition-all text-center tracking-wider"
            >
              Go to Home
            </a>
            <a
              href="/dashboard"
              className="flex-1 px-6 py-4 rounded-2xl bg-card border border-border text-xs font-bold uppercase hover:bg-slate-50 transition-all text-center tracking-wider"
            >
              Go to Dashboard
            </a>
          </div>
        </motion.div>
      </section>

      <Footer />
    </main>
  );
}
