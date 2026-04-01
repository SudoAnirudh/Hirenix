"use client";
import React, { useState, useEffect, useCallback } from "react";
import { startInterview } from "@/lib/api";
import InterviewPanel from "@/components/InterviewPanel";
import type { SessionSummary } from "@/components/InterviewPanel";
import { ToastProvider } from "@/components/interview/ToastProvider";
import {
  BrainCircuit,
  Sparkles,
  ChevronRight,
  Trophy,
  RotateCcw,
  Target,
  BarChart3,
  Shield,
  Mic,
  MessageSquareText,
  LayoutTemplate,
} from "lucide-react";

/* ─── Constants ─── */
const ROLES = [
  "Software Engineering Intern",
  "Frontend Engineering Intern",
  "Backend Engineering Intern",
  "Full Stack Engineering Intern",
  "Data Science Intern",
  "Data Engineering Intern",
  "ML Engineering Intern",
  "DevOps Engineering Intern",
  "Fresher Software Engineer",
  "Fresher Frontend Engineer",
  "Fresher Backend Engineer",
  "Fresher Full Stack Engineer",
];

const ANSWER_MODES = [
  {
    value: "text",
    label: "Text",
    desc: "Type structured responses",
    icon: MessageSquareText,
  },
  {
    value: "voice",
    label: "Voice",
    desc: "Practice speaking with transcript support",
    icon: Mic,
  },
];

const EXPERIENCE_OPTIONS = [
  { value: "entry", label: "Entry" },
  { value: "mid", label: "Mid" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead" },
];

const TRACK_OPTIONS = [
  {
    value: "technical",
    label: "Technical",
    desc: "Skills & Code",
    icon: "code",
  },
  {
    value: "behavioral",
    label: "Behavioral",
    desc: "Soft Skills",
    icon: "psychology",
  },
  {
    value: "system_design",
    label: "System Design",
    desc: "Architecture",
    icon: "account_tree",
  },
  {
    value: "mixed",
    label: "Mixed",
    desc: "Balanced",
    icon: "dynamic_feed",
  },
];

/* ─── Types ─── */
interface Question {
  question_id: string;
  question: string;
  category: string;
  difficulty: string;
  expected_topics: string[];
  follow_up_prompt?: string | null;
}

interface InterviewPlan {
  role: string;
  experience_level: string;
  interview_type: string;
  difficulty: string;
  num_questions: number;
  technical: number;
  behavioral: number;
  system_design: number;
}

interface Session {
  session_id: string;
  target_role: string;
  experience_level: string;
  interview_type: string;
  answer_mode: string;
  interview_plan: InterviewPlan;
  questions: Question[];
}

type Phase = "setup" | "interview" | "report";

/* ═══════════════════════════════════════════════════════════
   Inner interview view
   ═══════════════════════════════════════════════════════════ */
function InterviewView({
  session,
  onComplete,
  onExit,
}: {
  session: Session;
  onComplete: (summary: SessionSummary) => void;
  onExit: () => void;
}) {
  return (
    <div className="animate-fade-up w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 p-5 glass-card rounded-[24px]">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#7C9ADD]/10 flex items-center justify-center border border-[#7C9ADD]/20">
            <BrainCircuit size={20} className="text-[#7C9ADD]" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl tracking-tight text-[#2D3748]">
              Interview Studio
            </h1>
            <p className="text-[11px] font-body text-[#718096]">
              {session.target_role} · {session.interview_type.replace("_", " ")}
            </p>
          </div>
        </div>

        <button
          onClick={onExit}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-50 text-red-500 border border-red-100 text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-sm hover:shadow-red-200 active:scale-95"
        >
          <RotateCcw size={14} />
          Exit Session
        </button>
      </div>

      <InterviewPanel session={session} onComplete={onComplete} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Main page component
   ═══════════════════════════════════════════════════════════ */
export default function MockInterviewPage() {
  return (
    <ToastProvider>
      <MockInterviewPageContent />
    </ToastProvider>
  );
}

function MockInterviewPageContent() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [role, setRole] = useState(ROLES[0]);
  const [experienceLevel, setExperienceLevel] = useState("entry");
  const [interviewType, setInterviewType] = useState("behavioral");
  const [intensity, setIntensity] = useState(2); // 1: Easy, 2: Medium, 3: Hard
  const [numQuestions, setNumQuestions] = useState(5);
  const [resumeId, setResumeId] = useState("");
  const [answerMode, setAnswerMode] = useState("voice");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [session, setSession] = useState<Session | null>(null);

  const difficulty =
    intensity === 1 ? "easy" : intensity === 3 ? "hard" : "medium";

  /* Report data */
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(
    null,
  );
  const [userRating, setUserRating] = useState<number | null>(null);
  const [userFeedback, setUserFeedback] = useState("");

  /* Auto-fill resume ID from localStorage */
  useEffect(() => {
    try {
      const stored = localStorage.getItem("latest_resume");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.resume_id) setResumeId(parsed.resume_id);
      }
    } catch {
      // ignore
    }
  }, []);

  async function handleStart() {
    setLoading(true);
    setError("");
    try {
      const data = (await startInterview(resumeId.trim() || null, role, {
        difficulty,
        numQuestions,
        experienceLevel,
        interviewType,
        answerMode,
        proctoringEnabled: false,
      })) as Session;
      setSession(data);
      setPhase("interview");
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const handleComplete = useCallback(async (summary: SessionSummary) => {
    setSessionSummary(summary);
    setPhase("report");
  }, []);

  function handleRestart() {
    setPhase("setup");
    setSession(null);
    setSessionSummary(null);
    setUserRating(null);
    setUserFeedback("");
    setError("");
  }

  /* ─────────────────────── SETUP SCREEN ─────────────────────── */
  if (phase === "setup") {
    return (
      <div className="relative min-h-screen bg-[#FDF9F3] text-[#17232E] -m-8 overflow-hidden font-body">
        {/* Ambient Background Orbs */}
        <div className="fixed w-[800px] h-[800px] bg-[#7C9ADD] top-[-300px] left-[-200px] animate-breathe opacity-[0.08] blur-[140px] rounded-full z-0 pointer-events-none"></div>
        <div
          className="fixed w-[700px] h-[700px] bg-[#98C9A3] bottom-[-200px] right-[-200px] animate-breathe opacity-[0.08] blur-[140px] rounded-full z-0 pointer-events-none"
          style={{ animationDelay: "-4s" }}
        ></div>

        <main className="relative z-10 pt-32 pb-32 px-6 w-full mx-auto">
          {/* Setup Header */}
          <div className="text-center mb-20 animate-fade-up">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/60 border border-white shadow-sm mb-8">
              <Sparkles size={14} className="text-[#7C9ADD]" />
              <span className="text-[10px] font-black tracking-[0.3em] text-[#7C9ADD] uppercase">
                Curated Performance Studio
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tighter mb-8 text-[#17232E] leading-[0.95]">
              Configure Your <br className="hidden md:block" />
              <span className="text-[#7C9ADD]">Interview Session</span>
            </h1>
            <p className="text-[#718096] font-body text-xl max-w-2xl mx-auto leading-relaxed font-medium">
              Fine-tune your technical persona. Hirenix AI adapts its logic,
              depth, and delivery based on your unique career vector.
            </p>
          </div>

          {/* Main Configuration Card */}
          <div
            className="glass-card p-10 md:p-16 rounded-[48px] bg-white/40 border border-white/60 shadow-glass backdrop-blur-2xl relative overflow-hidden animate-fade-up"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="space-y-16">
              {/* Role & Experience Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Target size={14} className="text-[#718096]" />
                    <label className="text-[10px] font-black text-[#718096] uppercase tracking-[0.3em]">
                      Target Industry Role
                    </label>
                  </div>
                  <div className="relative group">
                    <select
                      className="w-full bg-white/50 border border-white rounded-3xl py-5 px-8 focus:ring-4 focus:ring-[#7C9ADD]/10 text-[#17232E] font-display font-bold text-xl shadow-sm transition-all outline-none hover:bg-white/80 appearance-none"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <BarChart3 size={14} className="text-[#718096]" />
                    <label className="text-[10px] font-black text-[#718096] uppercase tracking-[0.3em]">
                      Seniority Vector
                    </label>
                  </div>
                  <div className="flex p-2 bg-white/50 border border-white rounded-[24px] shadow-sm backdrop-blur-md">
                    {EXPERIENCE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        className={`flex-1 py-4 text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all ${
                          experienceLevel === opt.value
                            ? "bg-white text-[#7C9ADD] shadow-lg shadow-[#7C9ADD]/10"
                            : "text-[#718096] hover:bg-white/40"
                        }`}
                        onClick={() => setExperienceLevel(opt.value)}
                        type="button"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Interview Type Selection */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <BrainCircuit size={14} className="text-[#718096]" />
                  <label className="text-[10px] font-black text-[#718096] uppercase tracking-[0.3em]">
                    Specialization Track
                  </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {TRACK_OPTIONS.map((opt) => {
                    const isSelected = interviewType === opt.value;
                    return (
                      <button
                        key={opt.value}
                        className={`group relative p-8 rounded-[32px] text-left border-2 transition-all duration-500 overflow-hidden ${
                          isSelected
                            ? "border-[#7C9ADD] bg-white shadow-2xl shadow-[#7C9ADD]/20"
                            : "border-white bg-white/30 hover:bg-white/70 hover:border-white/80"
                        }`}
                        onClick={() => setInterviewType(opt.value)}
                        type="button"
                      >
                        <div
                          className={`mb-4 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${isSelected ? "bg-[#7C9ADD] text-white shadow-lg" : "bg-white text-[#7C9ADD]"}`}
                        >
                          {opt.value === "technical" && <Target size={24} />}
                          {opt.value === "behavioral" && (
                            <MessageSquareText size={24} />
                          )}
                          {opt.value === "system_design" && (
                            <LayoutTemplate size={24} />
                          )}
                          {opt.value === "mixed" && <Sparkles size={24} />}
                        </div>
                        <span
                          className={`block font-display font-bold text-lg tracking-tight mb-1 ${isSelected ? "text-[#17232E]" : "text-[#4A5568]"}`}
                        >
                          {opt.label}
                        </span>
                        <span className="text-[11px] text-[#718096] font-medium leading-relaxed opacity-80">
                          {opt.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Difficulty & Questions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                      <Shield size={14} className="text-[#718096]" />
                      <label className="text-[10px] font-black text-[#718096] uppercase tracking-[0.3em]">
                        Challenge Depth
                      </label>
                    </div>
                    <span className="text-[10px] font-black text-[#7C9ADD] uppercase tracking-widest bg-[#7C9ADD]/10 px-4 py-1.5 rounded-full">
                      {intensity === 1
                        ? "Foundational"
                        : intensity === 2
                          ? "Professional"
                          : "Expert"}
                    </span>
                  </div>
                  <div className="relative pt-4">
                    <input
                      className="w-full h-2 bg-white/40 rounded-full appearance-none cursor-pointer accent-[#7C9ADD]"
                      max="3"
                      min="1"
                      step="1"
                      type="range"
                      value={intensity}
                      onChange={(e) => setIntensity(parseInt(e.target.value))}
                    />
                    <div className="flex justify-between mt-6 px-1">
                      <span className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-widest">
                        Entry
                      </span>
                      <span className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-widest">
                        Master
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <RotateCcw size={14} className="text-[#718096]" />
                    <label className="text-[10px] font-black text-[#718096] uppercase tracking-[0.3em]">
                      Session Duration
                    </label>
                  </div>
                  <div className="flex items-center gap-6 bg-white/50 border border-white p-3 rounded-[24px] shadow-sm backdrop-blur-md">
                    <button
                      className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white text-[#7C9ADD] hover:bg-[#7C9ADD] hover:text-white transition-all shadow-sm active:scale-90"
                      type="button"
                      onClick={() =>
                        setNumQuestions((prev) => Math.max(1, prev - 1))
                      }
                    >
                      <RotateCcw size={18} className="-rotate-90" />
                    </button>
                    <div className="flex-1 text-center">
                      <span className="font-display font-bold text-3xl text-[#17232E]">
                        {numQuestions}
                      </span>
                      <span className="text-[10px] font-black text-[#718096] uppercase tracking-widest ml-3">
                        Questions
                      </span>
                    </div>
                    <button
                      className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white text-[#7C9ADD] hover:bg-[#7C9ADD] hover:text-white transition-all shadow-sm active:scale-90"
                      type="button"
                      onClick={() =>
                        setNumQuestions((prev) => Math.min(20, prev + 1))
                      }
                    >
                      <RotateCcw size={18} className="rotate-90" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Answer Mode */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
                <div className="space-y-6">
                  <label className="text-[10px] font-black text-[#718096] uppercase tracking-[0.3em] block mb-2">
                    Delivery Paradigm
                  </label>
                  <div className="flex gap-4">
                    {ANSWER_MODES.map((mode) => {
                      const isSelected = answerMode === mode.value;
                      const Icon = mode.icon;
                      return (
                        <button
                          key={mode.value}
                          className={`flex-1 py-6 flex flex-col items-center gap-3 border-2 transition-all rounded-[24px] ${
                            isSelected
                              ? "border-[#7C9ADD] bg-white shadow-xl shadow-[#7C9ADD]/10"
                              : "border-white bg-white/30 text-[#718096] hover:bg-white/50"
                          }`}
                          onClick={() => setAnswerMode(mode.value)}
                          type="button"
                        >
                          <Icon
                            size={24}
                            className={
                              isSelected ? "text-[#7C9ADD]" : "text-[#718096]"
                            }
                          />
                          <span className="text-[10px] font-black uppercase tracking-widest">
                            {mode.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Area */}
              <div className="pt-10">
                <button
                  className={`w-full bg-linear-to-r from-[#2D3748] to-[#4A5568] text-white py-8 rounded-[32px] font-display font-black text-2xl flex items-center justify-center gap-6 shadow-2xl shadow-[#2D3748]/30 hover:scale-[1.02] active:scale-[0.98] transition-all group ${loading ? "opacity-70 cursor-wait" : ""}`}
                  type="button"
                  disabled={loading}
                  onClick={handleStart}
                >
                  <span>
                    {loading
                      ? "Synthesizing Environment..."
                      : "Initiate Studio Session"}
                  </span>
                  {!loading && (
                    <ChevronRight
                      size={32}
                      className="group-hover:translate-x-2 transition-transform"
                    />
                  )}
                </button>
                <div className="flex items-center justify-center gap-3 mt-8 opacity-60">
                  <span className="w-8 h-px bg-[#718096]" />
                  <p className="text-[10px] font-black text-[#718096] uppercase tracking-[0.4em]">
                    Hirenix V1.0 · Powered by AI
                  </p>
                  <span className="w-8 h-px bg-[#718096]" />
                </div>
              </div>

              {error && (
                <div className="mt-8 p-6 rounded-3xl bg-red-50 border border-red-100 text-red-600 text-[11px] font-black uppercase tracking-widest text-center animate-shake">
                  {error}
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Success Indicator (Floating Status Pill) */}
        {!loading && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 backdrop-blur-lg bg-surface/80 border border-white/20 px-4 py-2 rounded-full flex items-center gap-3 shadow-lg z-50">
            <div className="w-2 h-2 rounded-full bg-emerald animate-pulse"></div>
            <span className="text-xs font-bold text-primary tracking-wide">
              Mentor is ready to curate
            </span>
          </div>
        )}

        <style jsx global>{`
          .animate-breathe {
            animation: breathe 8s ease-in-out infinite;
          }
          @keyframes breathe {
            0%,
            100% {
              transform: scale(1);
              opacity: 0.15;
            }
            50% {
              transform: scale(1.1);
              opacity: 0.25;
            }
          }
          @keyframes fade-up {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-up {
            animation: fade-up 0.6s ease-out forwards;
          }
        `}</style>
      </div>
    );
  }

  /* ─────────────────────── INTERVIEW PHASE ─────────────────────── */
  if (phase === "interview" && session) {
    return (
      <div className="relative min-h-screen bg-[#FDF9F3] text-[#17232E] -m-8 overflow-hidden font-body px-6 py-20">
        {/* Ambient Background Orbs */}
        <div className="fixed w-[800px] h-[800px] bg-[#7C9ADD] top-[-300px] left-[-200px] animate-breathe opacity-[0.05] blur-[140px] rounded-full z-0 pointer-events-none"></div>
        <div
          className="fixed w-[700px] h-[700px] bg-[#98C9A3] bottom-[-200px] right-[-200px] animate-breathe opacity-[0.05] blur-[140px] rounded-full z-0 pointer-events-none"
          style={{ animationDelay: "-4s" }}
        ></div>

        <div className="relative z-10 w-full mx-auto">
          <InterviewView
            session={session}
            onComplete={handleComplete}
            onExit={handleRestart}
          />
        </div>
      </div>
    );
  }

  /* ─────────────────────── REPORT PHASE ─────────────────────── */
  return (
    <div className="relative min-h-screen bg-[#FDF9F3] text-[#17232E] -m-8 overflow-hidden font-body py-24 px-6 animate-fade-up">
      {/* Ambient Background Orbs */}
      <div className="fixed w-[800px] h-[800px] bg-[#7C9ADD] top-[-300px] left-[-200px] animate-breathe opacity-[0.05] blur-[140px] rounded-full z-0 pointer-events-none"></div>
      <div
        className="fixed w-[700px] h-[700px] bg-[#98C9A3] bottom-[-200px] right-[-200px] animate-breathe opacity-[0.05] blur-[140px] rounded-full z-0 pointer-events-none"
        style={{ animationDelay: "-4s" }}
      ></div>

      <div className="relative z-10 w-full mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="w-24 h-24 rounded-[36px] flex items-center justify-center mx-auto mb-10 bg-[#98C9A3] text-white shadow-2xl shadow-[#98C9A3]/40 transform hover:rotate-6 transition-transform">
            <Trophy size={48} />
          </div>
          <h1 className="font-display font-bold text-6xl md:text-8xl mb-6 tracking-tighter text-[#17232E] leading-tight">
            Session <span className="text-[#98C9A3]">Complete</span>
          </h1>
          <p className="text-xl font-body text-[#718096] max-w-2xl mx-auto leading-relaxed font-medium">
            Exceptional effort. You&apos;ve completed the benchmark for{" "}
            <span className="font-bold text-[#17232E] underline decoration-[#7C9ADD]/30 underline-offset-8 decoration-4">
              {session?.target_role}
            </span>
            .
          </p>

          {session && (
            <div className="inline-flex items-center gap-6 mt-12 px-8 py-3 rounded-full bg-white/60 border border-white shadow-sm backdrop-blur-md">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#7C9ADD]">
                {session.interview_type.replace("_", " ")}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#E2E8F0]" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#7C9ADD]">
                {session.experience_level}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#E2E8F0]" />
              <div className="flex items-center gap-2">
                <Shield size={12} className="text-[#98C9A3]" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#98C9A3]">
                  Validated Session
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Performance Report */}
        <div className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
          {sessionSummary?.feedback?.length ? (
            <div className="glass-card p-12 md:p-20 mb-16 rounded-[48px] border border-white/60 bg-white/40 shadow-glass backdrop-blur-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-linear-to-br from-[#98C9A3]/10 to-[#7C9ADD]/5 blur-[120px] pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16 relative z-10">
                <div className="flex items-center gap-5">
                  <span className="w-16 h-0.5 bg-linear-to-r from-[#7C9ADD] to-transparent rounded-full" />
                  <h3 className="font-display font-bold text-3xl tracking-tight text-[#17232E]">
                    Aggregated Performance Index
                  </h3>
                </div>
                <div className="px-6 py-2 rounded-full bg-[#7C9ADD]/10 border border-[#7C9ADD]/20 text-[#7C9ADD] text-[10px] font-black uppercase tracking-[0.3em]">
                  Validated Analytics
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-12 relative z-10">
                {[
                  { label: "Clarity", key: "clarity_score" as const },
                  { label: "Technical", key: "technical_score" as const },
                  { label: "Depth", key: "depth_score" as const },
                  {
                    label: "Communication",
                    key: "communication_score" as const,
                  },
                  {
                    label: "Problem Solving",
                    key: "problem_solving_score" as const,
                  },
                ].map(({ label, key }) => {
                  const avg =
                    sessionSummary.feedback.reduce((s, a) => s + a[key], 0) /
                    sessionSummary.feedback.length;
                  return (
                    <div key={label} className="flex flex-col gap-5 group">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#718096] group-hover:text-[#7C9ADD] transition-colors">
                          {label}
                        </span>
                        <span className="font-display font-bold text-xl text-[#7C9ADD]">
                          {avg.toFixed(1)}
                          <span className="text-sm text-[#718096] font-medium ml-1">
                            / 10
                          </span>
                        </span>
                      </div>
                      <div className="h-2.5 rounded-full bg-white/20 border border-white/20 shadow-inner overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#7C9ADD] shadow-lg transition-all duration-1000"
                          style={{ width: `${avg * 10}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 pt-12 border-t border-[#7C9ADD]/10 relative z-10">
                <div className="p-8 rounded-[32px] bg-[#98C9A3]/5 border border-[#98C9A3]/10">
                  <h4 className="text-[10px] font-black mb-6 uppercase tracking-[0.3em] text-[#98C9A3]">
                    Strategic Alphas
                  </h4>
                  <div className="space-y-4">
                    {(sessionSummary.overall_strengths?.length
                      ? sessionSummary.overall_strengths
                      : Array.from(
                          new Set(
                            sessionSummary.feedback.flatMap(
                              (item) => item.strengths,
                            ),
                          ),
                        )
                    )
                      .slice(0, 6)
                      .map((item, index) => (
                        <div key={index} className="flex items-start gap-4">
                          <div className="w-2 h-2 rounded-full bg-[#98C9A3] mt-1.5 shrink-0" />
                          <p className="text-sm font-body text-[#718096] leading-relaxed font-medium">
                            {item}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="p-8 rounded-[32px] bg-[#7C9ADD]/5 border border-[#7C9ADD]/10">
                  <h4 className="text-[10px] font-black mb-6 uppercase tracking-[0.3em] text-[#7C9ADD]">
                    Gap Optimization
                  </h4>
                  <div className="space-y-4">
                    {(sessionSummary.overall_improvements?.length
                      ? sessionSummary.overall_improvements
                      : Array.from(
                          new Set(
                            sessionSummary.feedback.flatMap(
                              (item) => item.improvements,
                            ),
                          ),
                        )
                    )
                      .slice(0, 6)
                      .map((item, index) => (
                        <div key={index} className="flex items-start gap-4">
                          <div className="w-2 h-2 rounded-full bg-[#7C9ADD] mt-1.5 shrink-0" />
                          <p className="text-sm font-body text-[#718096] leading-relaxed font-medium">
                            {item}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Per-question analysis (pros/cons) */}
        {session && sessionSummary?.feedback?.length ? (
          <div className="glass-card p-12 md:p-16 rounded-[48px] border border-white/60 bg-white/40 shadow-glass backdrop-blur-2xl relative overflow-hidden mb-16">
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-linear-to-br from-[#7C9ADD]/10 to-[#98C9A3]/5 blur-[120px] pointer-events-none" />

            <div className="flex items-center gap-5 mb-12 relative z-10">
              <span className="w-16 h-0.5 bg-linear-to-r from-[#98C9A3] to-transparent rounded-full" />
              <h3 className="font-display font-bold text-3xl tracking-tight text-[#17232E]">
                Per-question analysis
              </h3>
            </div>

            <div className="space-y-6 relative z-10">
              {session.questions.map((qq, idx) => {
                const fb = sessionSummary.feedback.find(
                  (f) => f.question_id === qq.question_id,
                );
                if (!fb) return null;
                return (
                  <div
                    key={qq.question_id}
                    className="p-8 rounded-[32px] bg-white/50 border border-white/70 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-6 mb-6">
                      <div className="min-w-0">
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#718096] mb-3">
                          Question {idx + 1} · {qq.category.replace("_", " ")}
                        </div>
                        <div className="font-display font-bold text-xl text-[#17232E] leading-snug">
                          {qq.question}
                        </div>
                      </div>
                      <div className="shrink-0 px-5 py-3 rounded-[24px] bg-white/70 border border-white text-center">
                        <div className="text-[10px] font-black uppercase tracking-[0.25em] text-[#A0AEC0]">
                          Score
                        </div>
                        <div className="font-display font-black text-2xl text-[#7C9ADD] tabular-nums">
                          {fb.score}
                          <span className="text-sm text-[#A0AEC0] font-medium ml-1">
                            /10
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-6 rounded-[24px] bg-[#98C9A3]/5 border border-[#98C9A3]/10">
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#98C9A3] mb-4">
                          Pros
                        </div>
                        <ul className="space-y-3">
                          {fb.strengths?.slice(0, 4).map((s, i) => (
                            <li
                              key={i}
                              className="text-sm font-body text-[#4A5568] leading-relaxed font-medium"
                            >
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-6 rounded-[24px] bg-[#7C9ADD]/5 border border-[#7C9ADD]/10">
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#7C9ADD] mb-4">
                          Cons / Improvements
                        </div>
                        <ul className="space-y-3">
                          {fb.improvements?.slice(0, 4).map((s, i) => (
                            <li
                              key={i}
                              className="text-sm font-body text-[#4A5568] leading-relaxed font-medium"
                            >
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Overall improvement guidance */}
        {sessionSummary?.feedback?.length ? (
          <div className="glass-card p-12 md:p-16 rounded-[48px] border border-white/60 bg-white/40 shadow-glass backdrop-blur-2xl relative overflow-hidden mb-16">
            <div className="absolute bottom-0 right-0 w-[520px] h-[520px] bg-linear-to-br from-[#98C9A3]/10 to-[#7C9ADD]/5 blur-[120px] pointer-events-none" />
            <div className="flex items-center gap-5 mb-10 relative z-10">
              <span className="w-16 h-0.5 bg-linear-to-r from-[#7C9ADD] to-transparent rounded-full" />
              <h3 className="font-display font-bold text-3xl tracking-tight text-[#17232E]">
                How to improve overall performance
              </h3>
            </div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 rounded-[32px] bg-white/50 border border-white/70">
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#718096] mb-5">
                  Your next 3 reps
                </div>
                <ol className="space-y-4 text-sm font-body text-[#4A5568] font-medium leading-relaxed list-decimal list-inside">
                  <li>Open with a 1-sentence summary answer.</li>
                  <li>
                    Use a 2-3 bullet structure (tradeoffs → example → result).
                  </li>
                  <li>Close with a metric, constraint, or failure mode.</li>
                </ol>
              </div>
              <div className="p-8 rounded-[32px] bg-white/50 border border-white/70">
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#718096] mb-5">
                  Focus areas from this session
                </div>
                <div className="space-y-3">
                  {(sessionSummary.overall_improvements ?? [])
                    .slice(0, 6)
                    .map((item, idx) => (
                      <div key={idx} className="flex items-start gap-4">
                        <div className="w-2 h-2 rounded-full bg-[#7C9ADD] mt-2 shrink-0" />
                        <p className="text-sm font-body text-[#4A5568] leading-relaxed font-medium">
                          {item}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Optional user feedback */}
        <div className="glass-card p-12 md:p-16 rounded-[48px] border border-white/60 bg-white/40 shadow-glass backdrop-blur-2xl relative overflow-hidden mb-10">
          <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-linear-to-br from-[#7C9ADD]/10 to-[#98C9A3]/5 blur-[120px] pointer-events-none" />
          <div className="flex items-center gap-5 mb-10 relative z-10">
            <span className="w-16 h-0.5 bg-linear-to-r from-[#98C9A3] to-transparent rounded-full" />
            <h3 className="font-display font-bold text-3xl tracking-tight text-[#17232E]">
              Feedback (optional)
            </h3>
          </div>

          <div className="relative z-10 space-y-8">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#718096] mb-4">
                Rate this session
              </div>
              <div className="flex flex-wrap gap-3">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setUserRating(n)}
                    className={`px-5 py-3 rounded-[24px] border text-sm font-black transition-all ${
                      userRating === n
                        ? "bg-[#7C9ADD] text-white border-[#7C9ADD]"
                        : "bg-white/60 text-[#2D3748] border-white/70 hover:bg-white"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#718096] mb-4">
                What should we improve?
              </div>
              <textarea
                className="w-full rounded-[32px] p-6 min-h-[140px] bg-white/60 border border-white/70 shadow-inner outline-none text-[#2D3748] placeholder:text-[#A0AEC0]"
                value={userFeedback}
                onChange={(e) => setUserFeedback(e.target.value)}
                placeholder="Optional: share what felt off (question quality, pacing, voice transcript, scoring, UI)..."
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  console.log("mock-interview feedback", {
                    rating: userRating,
                    feedback: userFeedback,
                    sessionId: sessionSummary?.session_id,
                  });
                }}
                className="px-10 py-4 rounded-[28px] bg-linear-to-r from-[#2D3748] to-[#4A5568] text-white font-display font-black shadow-2xl hover:scale-[1.01] active:scale-[0.98] transition-all"
              >
                Submit feedback
              </button>
            </div>
          </div>
        </div>

        {/* Restart button with premium styling */}
        <div className="flex justify-center mt-12 mb-20 relative z-10">
          <button
            className="flex items-center justify-center gap-6 px-14 py-8 rounded-[32px] bg-linear-to-r from-[#2D3748] to-[#4A5568] text-white font-display font-black text-2xl shadow-2xl shadow-[#2D3748]/30 hover:scale-[1.02] active:scale-[0.98] transition-all group"
            onClick={handleRestart}
          >
            <RotateCcw
              size={28}
              className="group-hover:rotate-180 transition-transform duration-700"
            />
            <span>Initialize New Session</span>
          </button>
        </div>
      </div>
    </div>
  );
}
