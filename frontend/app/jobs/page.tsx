"use client";

import Link from "next/link";
import { Footer } from "@/components/landing/Footer";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, Construction } from "lucide-react";

export default function JobsPage() {
  return (
    <main className="dark bg-slate-950 text-slate-100 min-h-screen relative overflow-hidden flex flex-col justify-between">
      <LandingNavbar />

      <section className="relative z-10 py-32 px-6 flex-1 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center space-y-6 bg-slate-900/60 border border-slate-800 p-8 rounded-[32px] backdrop-blur-xl shadow-2xl"
        >
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
            <Construction size={32} />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono font-bold uppercase tracking-wider">
              <AlertCircle size={12} /> Under Optimization
            </div>
            <h1 className="font-display font-bold text-3xl tracking-tight text-white">
              Job Aggregator Offline
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              We are currently optimizing real-time job scraping pipelines. Use
              the dashboard job discovery workstation for active matching.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/"
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all text-center"
            >
              Return Home
            </Link>
            <Link
              href="/dashboard/opportunities/discover"
              className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all text-center"
            >
              Job Workstation
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </main>
  );
}
