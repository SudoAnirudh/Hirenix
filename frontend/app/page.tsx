"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Github,
  Briefcase,
  Mic,
  TrendingUp,
  Zap,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Terminal,
  FileText,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { Footer } from "@/components/landing/Footer";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { toast } from "sonner";

// Heuristic scorer for the live interactive box
function calculateLiveScore(text: string): {
  score: number;
  metrics: boolean;
  keywordsCount: number;
  contactFound: boolean;
} {
  const t = text.toLowerCase();
  let score = 30;

  // 1. Metric check
  const hasMetric =
    /\b\d+(%|\$|x|k|m|px|x)\b/i.test(t) ||
    /percent|million|billion|impact/i.test(t);
  if (hasMetric) score += 25;

  // 2. Tech keywords check
  const keywords = [
    "react",
    "next.js",
    "python",
    "fastapi",
    "aws",
    "docker",
    "kubernetes",
    "ai",
    "ml",
    "typescript",
    "javascript",
    "sql",
    "git",
    "ci/cd",
    "rust",
  ];
  let kwCount = 0;
  keywords.forEach((kw) => {
    if (t.includes(kw)) kwCount++;
  });
  score += Math.min(kwCount * 8, 32);

  // 3. Contact information check
  const hasContact = /@|linkedin\.com|github\.com/i.test(t);
  if (hasContact) score += 11;

  return {
    score: Math.min(score, 98),
    metrics: hasMetric,
    keywordsCount: kwCount,
    contactFound: hasContact,
  };
}

const features = [
  {
    icon: Brain,
    title: "AI RESUME SCORING",
    desc: "Hybrid ATS scoring combining rule-based analysis and semantic embeddings.",
  },
  {
    icon: Github,
    title: "GITHUB INTELLIGENCE",
    desc: "Compute your GitHub Performance Index across consistency, depth, and diversity.",
  },
  {
    icon: Briefcase,
    title: "JOB MATCHING",
    desc: "Match your profile against any job description with semantic similarity + skill gap analysis.",
  },
  {
    icon: Mic,
    title: "MOCK INTERVIEWS",
    desc: "AI-generated questions tailored to your role with structured answer feedback.",
  },
  {
    icon: TrendingUp,
    title: "PROGRESS TRACKER",
    desc: "Track your Resume Evolution Score and improvement trends over time.",
  },
  {
    icon: Zap,
    title: "INSTANT FEEDBACK",
    desc: "Get actionable, prioritised suggestions in seconds, not hours.",
  },
];

const PRESETS = {
  staff:
    "Anirudh S — Staff AI Engineer\n• Created Hirenix Career OS with Next.js 16 and FastAPI, increasing user activation metrics by 42%.\n• Designed hybrid semantic ATS scoring models evaluating embeddings over a vector(1536) space.",
  junior:
    "Jane Dev — Junior Web Developer\n• Responsible for updating webpage components and layout colors.\n• Fixed general bugs. Used HTML, CSS and Javascript.",
  scanned:
    "[OCR Scan: Corrupted text layers detected. Image is unreadable. Non-searchable PDF binary blocks.]",
};

export default function LandingPage() {
  const [selectedScenario, setSelectedScenario] = useState<
    "staff" | "junior" | "scanned" | "custom"
  >("staff");
  const [text, setText] = useState(PRESETS.staff);
  const [scoreData, setScoreData] = useState(calculateLiveScore(PRESETS.staff));

  useEffect(() => {
    setScoreData(calculateLiveScore(text));
  }, [text]);

  const selectScenario = (id: "staff" | "junior" | "scanned") => {
    setSelectedScenario(id);
    setText(PRESETS[id]);
  };

  return (
    <main className="dark bg-slate-950 text-slate-100 min-h-screen relative overflow-hidden selection:bg-brand-blue/20 selection:text-brand-blue">
      {/* Background Cyber Glow Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />

      {/* Decorative Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[130px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-500/10 blur-[160px] rounded-full" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-500/5 blur-[100px] rounded-full" />
      </div>

      <LandingNavbar />

      {/* Hero Section Split Layout */}
      <section className="relative z-10 pt-44 lg:pt-56 pb-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Left Column: Hero Text */}
          <div className="lg:col-span-6 space-y-8 text-left">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-indigo-400 font-bold text-xs uppercase tracking-widest shadow-md">
              <Sparkles size={12} className="animate-pulse" />
              Next-Gen AI Career OS
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black font-display tracking-tight text-white leading-[0.95] flex flex-col gap-1">
              <span>Supercharge Your</span>
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-indigo-400 to-purple-400 tracking-tighter filter drop-shadow-sm">
                Career Trajectory.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 leading-relaxed font-medium max-w-xl">
              The all-in-one studio for high-fidelity resume engineering, smart
              job matching, and immersive proctored mock interview practice.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center pt-2">
              <Link href="/auth/register" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-16 px-12 rounded-[20px] bg-indigo-600 hover:bg-indigo-500 text-white text-base font-bold shadow-lg shadow-indigo-500/20 group transition-all"
                >
                  Get Started
                  <ArrowRight
                    size={18}
                    className="ml-3 group-hover:translate-x-1 transition-transform"
                  />
                </Button>
              </Link>
              <div className="flex items-center gap-3 text-xs text-slate-500 font-bold uppercase tracking-widest pl-1">
                <CheckCircle2 size={18} className="text-emerald-500" />
                Enterprise-Grade AI
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Demonstration Panel */}
          <div className="lg:col-span-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl backdrop-blur-xl relative">
              {/* Header Window Bar */}
              <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest ml-3 flex items-center gap-1.5">
                    <Terminal size={10} /> ATS Live Scorer Demo
                  </span>
                </div>
                <div className="flex bg-slate-950/80 border border-slate-800 p-0.5 rounded-xl">
                  {["staff", "junior", "scanned"].map((presetId) => (
                    <button
                      key={presetId}
                      onClick={() => selectScenario(presetId as any)}
                      className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${
                        selectedScenario === presetId
                          ? "bg-indigo-600 text-white"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {presetId}
                    </button>
                  ))}
                </div>
              </div>

              {/* Terminal Playground workspace */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  {/* Left sub-column: Text Editor */}
                  <div className="md:col-span-7 space-y-2">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">
                      Edit Statement / Try custom bullet
                    </label>
                    <textarea
                      value={text}
                      onChange={(e) => {
                        setSelectedScenario("custom");
                        setText(e.target.value);
                      }}
                      rows={5}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-2xl p-4 text-xs font-mono text-slate-200 outline-none resize-none leading-relaxed custom-scrollbar"
                      placeholder="Type your resume bullet here (e.g. Built website using React for 500+ active users)..."
                    />
                  </div>

                  {/* Right sub-column: Live Score Ring */}
                  <div className="md:col-span-5 flex flex-col items-center justify-center text-center gap-4 py-2">
                    <div className="relative w-28 h-28 flex items-center justify-center">
                      <svg
                        className="w-full h-full transform -rotate-90"
                        viewBox="0 0 100 100"
                      >
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          fill="none"
                          stroke="#1e293b"
                          strokeWidth="8"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          fill="none"
                          stroke={
                            scoreData.score >= 80
                              ? "#10b981"
                              : scoreData.score >= 50
                                ? "#f59e0b"
                                : "#ef4444"
                          }
                          strokeWidth="8"
                          strokeDasharray="263.8"
                          strokeDashoffset={
                            263.8 - (263.8 * scoreData.score) / 100
                          }
                          className="transition-all duration-700 ease-out"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-3xl font-black text-white leading-none">
                          {scoreData.score}%
                        </span>
                        <span className="text-[8px] font-black uppercase text-slate-500 tracking-wider mt-1">
                          ATS Score
                        </span>
                      </div>
                    </div>

                    <div className="text-[10px] font-bold">
                      {scoreData.score >= 80 ? (
                        <span className="text-emerald-500 uppercase tracking-widest">
                          High Compliance
                        </span>
                      ) : scoreData.score >= 50 ? (
                        <span className="text-amber-500 uppercase tracking-widest">
                          Needs Tuning
                        </span>
                      ) : (
                        <span className="text-red-500 uppercase tracking-widest">
                          Critical Alert
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Audit Checklist logs */}
                <div className="border-t border-slate-800/80 pt-5 grid grid-cols-2 gap-4">
                  <div className="flex gap-2 items-center text-xs">
                    {scoreData.metrics ? (
                      <CheckCircle2 size={14} className="text-emerald-500" />
                    ) : (
                      <AlertCircle size={14} className="text-amber-500" />
                    )}
                    <span className="text-slate-400">Metrics (XYZ Format)</span>
                  </div>
                  <div className="flex gap-2 items-center text-xs">
                    {scoreData.keywordsCount >= 2 ? (
                      <CheckCircle2 size={14} className="text-emerald-500" />
                    ) : (
                      <AlertCircle size={14} className="text-amber-500" />
                    )}
                    <span className="text-slate-400">
                      Keyword Density ({scoreData.keywordsCount})
                    </span>
                  </div>
                  <div className="flex gap-2 items-center text-xs">
                    {scoreData.contactFound ? (
                      <CheckCircle2 size={14} className="text-emerald-500" />
                    ) : (
                      <AlertCircle size={14} className="text-amber-500" />
                    )}
                    <span className="text-slate-400">Contact Details</span>
                  </div>
                  <div className="flex gap-2 items-center text-xs">
                    {selectedScenario !== "scanned" ? (
                      <CheckCircle2 size={14} className="text-emerald-500" />
                    ) : (
                      <AlertCircle size={14} className="text-red-500" />
                    )}
                    <span className="text-slate-400">
                      PDF Reader Text-Layer
                    </span>
                  </div>
                </div>

                {/* Scenario specific CTA message helper */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/60 flex justify-between items-center gap-3">
                  <div className="text-[10px] text-slate-400 leading-normal">
                    {selectedScenario === "staff" &&
                      "✨ Excellent profile formatting and measured outcomes! Passes target screening requirements."}
                    {selectedScenario === "junior" &&
                      "⚠️ Weak keyword matching and 0% metrics parsed. Try typing a percentage (e.g. 'boosted speeds by 30%') to fix!"}
                    {selectedScenario === "scanned" &&
                      "❌ Image-only scan warning. Uploading this PDF will result in automatic rejection from screening engines."}
                    {selectedScenario === "custom" &&
                      "💡 Live Sandbox Scorer: modify the text block above to watch scores alter dynamically based on context!"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="relative z-10 py-32 px-6" id="features">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <h2 className="font-display font-bold text-4xl md:text-6xl mb-6 tracking-tighter text-white">
              The Full-Stack Career Engine
            </h2>
            <p className="text-lg text-slate-400 font-medium max-w-xl mx-auto">
              Replace messy spreadsheets and anxious job hunting with a
              streamlined, AI-optimized workflow.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {features.map(({ icon: Icon, title, desc }, idx) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group cursor-pointer"
              >
                <SpotlightCard className="h-full p-10 rounded-[36px] border-slate-800 bg-slate-900/40 shadow-glass transition-all duration-500 hover:border-slate-700/80">
                  <div className="w-16 h-16 rounded-3xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-10 transition-transform duration-500 group-hover:scale-105">
                    <Icon size={28} className="text-indigo-400" />
                  </div>
                  <h3 className="text-2xl font-display font-bold mb-4 text-white tracking-tight">
                    {title}
                  </h3>
                  <p className="leading-relaxed font-medium text-slate-400">
                    {desc}
                  </p>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Large Bottom CTA Section */}
      <section className="relative z-10 py-32 px-6 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 blur-[100px] -z-10" />
          <div className="relative p-16 md:p-24 rounded-[48px] bg-slate-900/40 border border-slate-800 backdrop-blur-2xl shadow-glass text-center">
            <div className="w-20 h-20 rounded-[28px] bg-slate-950 shadow-lg flex items-center justify-center mx-auto mb-10 border border-slate-800">
              <TrendingUp className="text-emerald-400" size={32} />
            </div>
            <h2 className="font-display font-bold text-5xl md:text-7xl mb-8 text-white tracking-tighter leading-none">
              Launch your career trajectory today.
            </h2>
            <p className="text-xl md:text-2xl text-slate-400 mb-16 max-w-2xl mx-auto font-medium">
              Join thousands of professionals using AI to craft irresistible
              resumes and ace complex interviews.
            </p>
            <Link href="/auth/register">
              <Button
                size="lg"
                className="h-20 px-16 rounded-[24px] bg-white text-slate-950 text-xl font-bold transition-all shadow-xl active:scale-95 border-none hover:bg-slate-100"
              >
                Initialize Free Access
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </main>
  );
}
