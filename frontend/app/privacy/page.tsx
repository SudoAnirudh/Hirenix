"use client";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { Footer } from "@/components/landing/Footer";
import { motion } from "framer-motion";
import { UserCheck } from "lucide-react";

export default function PrivacyPage() {
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
                <UserCheck size={14} className="animate-pulse" />
                Privacy Policy
              </div>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="font-display font-bold text-5xl md:text-7xl mb-8 tracking-tighter leading-[0.9] text-foreground"
            >
              Your Data,{""}
              <span className="text-transparent bg-clip-text bg-linear-to-br from-brand-blue to-brand-green">
                Protected
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
                1. Data Collection
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                When you use Hirenix, we collect information that you provide to
                us directly, such as your email address, resume contents, and
                GitHub/LinkedIn URLs. We also store the outcomes of AI analyses
                (like semantic match scores) to provide you with historical
                insights.
              </p>

              <h2 className="text-2xl font-display font-bold text-foreground mb-4">
                2. Usage of Information
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                The data we collect is exclusively used to improve your career
                acceleration journey. Resume texts and Job Descriptions are
                processed through third-party LLM providers (e.g., Groq, OpenAI)
                to generate actionable bridge advice.
              </p>

              <h2 className="text-2xl font-display font-bold text-foreground mb-4">
                3. Data Sharing
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                We do not sell your personal data. We may share anonymous,
                aggregated data with trusted partners for the purpose of
                maintaining our service infrastructure.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
