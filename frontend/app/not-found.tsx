"use client";
import Link from "next/link";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { Footer } from "@/components/landing/Footer";
import { motion } from "framer-motion";
import { FileQuestion, Home, Search } from "lucide-react";

export default function NotFound() {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  };

  return (
    <main className="min-h-screen flex flex-col relative bg-background overflow-hidden selection:bg-brand-blue/30 selection:text-brand-blue">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-blue/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand-green/10 blur-[150px] rounded-full animate-pulse-slow" />
      </div>

      <LandingNavbar />

      <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-32 pb-20 text-center">
        <motion.div
          initial="initial"
          animate="animate"
          variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
          className="max-w-2xl mx-auto flex flex-col items-center"
        >
          <motion.div
            variants={fadeInUp}
            className="w-32 h-32 md:w-48 md:h-48 relative mb-8"
          >
            <motion.div
              animate={{
                y: [0, -15, 0],
                rotate: [0, -5, 5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 bg-brand-blue/10 rounded-full blur-2xl"
            />
            <div className="w-full h-full bg-card border border-border shadow-2xl rounded-full flex items-center justify-center relative z-10">
              <FileQuestion className="text-brand-blue w-16 h-16 md:w-24 md:h-24 opacity-80" />
            </div>

            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -top-4 -right-4 w-12 h-12 bg-brand-green/20 border border-brand-green/30 rounded-2xl flex items-center justify-center backdrop-blur-sm z-20"
            >
              <Search className="text-brand-green w-5 h-5" />
            </motion.div>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="font-display font-black text-6xl md:text-9xl mb-4 tracking-tighter text-foreground"
          >
            404
          </motion.h1>

          <motion.h2
            variants={fadeInUp}
            className="font-display font-bold text-2xl md:text-4xl mb-6 tracking-tight text-transparent bg-clip-text bg-linear-to-r from-foreground to-muted-foreground"
          >
            Job Not Found
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            className="text-lg md:text-xl text-muted-foreground mb-12 max-w-lg leading-relaxed font-medium"
          >
            It looks like this page was rejected by our ATS scanner. Don't
            worry, your career path is still on track. Let's get you back to
            safety.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-brand-blue text-white font-bold text-sm tracking-widest uppercase transition-all"
            >
              <Home size={18} />
              Return Home
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-card border border-border text-foreground font-bold text-sm tracking-widest uppercase transition-all"
            >
              Go to Dashboard
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <Footer />
    </main>
  );
}
