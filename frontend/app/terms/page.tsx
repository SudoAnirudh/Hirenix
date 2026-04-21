"use client";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { Footer } from "@/components/landing/Footer";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";

export default function TermsPage() {
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
                <FileText size={14} className="animate-pulse" />
                Terms of Service
              </div>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="font-display font-bold text-5xl md:text-7xl mb-8 tracking-tighter leading-[0.9] text-foreground"
            >
              Terms of{""}
              <span className="text-transparent bg-clip-text bg-linear-to-br from-brand-blue to-brand-green">
                Service
              </span>
              .
            </motion.h1>
          </motion.div>

          <div className="space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-10 rounded-[40px] border border-border bg-card/60 shadow-glass relative overflow-hidden"
            >
              <h2 className="text-2xl font-display font-bold text-foreground mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                By accessing or using the Hirenix platform, you agree to be
                bound by these Terms of Service. If you disagree with any part
                of the terms, then you may not access the service.
              </p>

              <h2 className="text-2xl font-display font-bold text-foreground mb-4">
                2. Account Responsibilities
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                You are responsible for safeguarding the password that you use
                to access the service and for any activities or actions under
                your password.
              </p>

              <h2 className="text-2xl font-display font-bold text-foreground mb-4">
                3. Prohibited Uses
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                You may not use Hirenix to spam recruiters, automate job
                applications in a way that violates target platform policies, or
                attempt to reverse-engineer the underlying AI models.
              </p>

              <h2 className="text-2xl font-display font-bold text-foreground mb-4">
                4. Limitation of Liability
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Hirenix acts as an AI advisory tool. We do not guarantee
                employment, job interview callbacks, or specific outcomes
                resulting from the usage of our AI suggestions.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
