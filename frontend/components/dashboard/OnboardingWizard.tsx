"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Target,
  Briefcase,
  Zap,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface OnboardingWizardProps {
  onComplete: (data: { goal: string; role: string; company: string }) => void;
}

export default function OnboardingWizard({
  onComplete,
}: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [company, setCompany] = useState<string>("");

  const handleNext = () => setStep((s) => s + 1);

  const handleComplete = () => {
    onComplete({ goal, role, company });
  };

  const variants = {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 1.05, y: -20 },
  };

  // Force dark cinematic theme across the entire wizard
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0F19] text-white overflow-hidden">
      {/* Cinematic Background Blurs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-indigo-600/30 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[100px]"
        />
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex flex-col items-center text-center max-w-2xl px-6"
          >
            <div className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(99,102,241,0.2)]">
              <Sparkles className="text-indigo-400 w-10 h-10" />
            </div>
            <h1 className="text-5xl md:text-6xl font-black font-heading mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-white/50">
              Welcome to the evolution of your career.
            </h1>
            <p className="text-xl text-slate-400 mb-10 font-light leading-relaxed">
              Hirenix AI is calibrating your professional trajectory. Let's
              tailor the engine to your exact ambitions.
            </p>
            <Button
              onClick={handleNext}
              className="bg-white text-slate-950 h-12 px-8 rounded-full font-bold text-lg group transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              Initialize Profile
              <ArrowRight className="ml-2 w-5 h-5 transition-transform" />
            </Button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5 }}
            className="relative z-10 w-full max-w-4xl px-6"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold font-heading mb-4 text-white">
                What is your primary goal?
              </h2>
              <p className="text-slate-400 text-lg">
                Select the vector we should optimize your profile for.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  id: "Land a new job",
                  icon: Briefcase,
                  color: "text-emerald-400",
                  bg: "bg-emerald-400/10",
                  border: "border-emerald-500/30",
                },
                {
                  id: "Get promoted",
                  icon: ArrowRight,
                  color: "text-indigo-400",
                  bg: "bg-indigo-400/10",
                  border: "border-indigo-500/30",
                },
                {
                  id: "Switch roles entirely",
                  icon: Zap,
                  color: "text-violet-400",
                  bg: "bg-violet-400/10",
                  border: "border-violet-500/30",
                },
              ].map((item) => {
                const isSelected = goal === item.id;
                return (
                  <motion.button
                    key={item.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setGoal(item.id)}
                    className={`relative p-8 rounded-[32px] border text-left transition-all duration-300 ${
                      isSelected
                        ? `${item.border} bg-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)]`
                        : "border-white/10 bg-white/5"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-6 right-6 text-white">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                    )}
                    <div
                      className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center mb-6`}
                    >
                      <item.icon className={`w-7 h-7 ${item.color}`} />
                    </div>
                    <div className="text-2xl font-bold font-heading text-white">
                      {item.id}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-12 flex justify-center">
              <Button
                onClick={handleNext}
                disabled={!goal}
                className="bg-white text-slate-950 disabled:opacity-50 h-12 px-10 rounded-full font-bold text-lg group transition-all"
              >
                Continue
              </Button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5 }}
            className="relative z-10 w-full max-w-2xl px-6"
          >
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Target className="text-white w-8 h-8" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold font-heading mb-4 text-white">
                Paint the target.
              </h2>
              <p className="text-slate-400 text-lg">
                Where are we aiming this trajectory?
              </p>
            </div>

            <div className="space-y-6 bg-white/5 border border-white/10 p-8 rounded-[32px] backdrop-blur-xl">
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">
                  Target Role
                </label>
                <input
                  value={role}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setRole(e.target.value)
                  }
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full h-14 px-4 bg-white/5 border border-white/10 text-white text-lg rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-600"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">
                  Dream Company (Optional)
                </label>
                <input
                  value={company}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCompany(e.target.value)
                  }
                  placeholder="e.g. Stripe, Google, OpenAI"
                  className="w-full h-14 px-4 bg-white/5 border border-white/10 text-white text-lg rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="mt-10 flex justify-between items-center">
              <button
                onClick={() => setStep(2)}
                className="text-slate-400 font-medium transition-colors"
              >
                Back
              </button>
              <Button
                onClick={handleComplete}
                className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white h-14 px-10 rounded-full font-bold text-lg shadow-[0_0_30px_rgba(99,102,241,0.3)] transition-all"
              >
                Launch Dashboard
                <Zap className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
