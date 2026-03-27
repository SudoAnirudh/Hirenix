"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { startInterview, saveProctorReport } from "@/lib/api";
import InterviewPanel from "@/components/InterviewPanel";
import {
  ProctorProvider,
  useProctor,
} from "@/components/interview/ProctorProvider";
import WebcamMonitor from "@/components/interview/WebcamMonitor";
import ProctorToolbar from "@/components/interview/ProctorToolbar";
import TrustScoreReport from "@/components/interview/TrustScoreReport";
import PreInterviewChecks from "@/components/interview/PreInterviewChecks";
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
  ShieldCheck,
  Eye,
  Mic,
  MessageSquareText,
  LayoutTemplate,
  ScanFace,
} from "lucide-react";

/* ─── Constants ─── */
const ROLES = [
  "Software Engineer",
  "Frontend Engineer",
  "Backend Engineer",
  "Full Stack Engineer",
  "Data Scientist",
  "Data Engineer",
  "ML Engineer",
  "DevOps Engineer",
];

const DIFFICULTIES = [
  { value: "easy", label: "Easy", desc: "Fundamental concepts" },
  { value: "medium", label: "Medium", desc: "Industry standard" },
  { value: "hard", label: "Hard", desc: "Senior-level depth" },
];

const QUESTION_COUNTS = [3, 5, 8, 10];
const EXPERIENCE_LEVELS = [
  { value: "junior", label: "0-2 years", desc: "Foundational decision-making" },
  { value: "mid", label: "3-5 years", desc: "Delivery and tradeoffs" },
  { value: "senior", label: "6+ years", desc: "Leadership and architecture" },
];
const INTERVIEW_TYPES = [
  {
    value: "mixed",
    label: "Mixed",
    desc: "Balanced technical, design, and behavioral",
  },
  {
    value: "technical",
    label: "Technical",
    desc: "Implementation and debugging focus",
  },
  {
    value: "system_design",
    label: "System Design",
    desc: "Architecture and scale",
  },
  {
    value: "behavioral",
    label: "Behavioral",
    desc: "Ownership, conflict, and storytelling",
  },
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
  {
    value: "video",
    label: "Video",
    desc: "Simulate camera-first interview answers",
    icon: ScanFace,
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

interface AnswerScore {
  score: number;
  overall_score: number;
  clarity_score: number;
  technical_score: number;
  depth_score: number;
  communication_score: number;
  problem_solving_score: number;
  strengths: string[];
  improvements: string[];
  model_answer_hint: string;
  model_answer: string;
  coaching_tip: string;
}

type Phase = "setup" | "preflight" | "interview" | "report";

/* ═══════════════════════════════════════════════════════════
   Inner interview view — lives inside ProctorProvider
   ═══════════════════════════════════════════════════════════ */
function InterviewView({
  session,
  proctoringEnabled,
  onComplete,
  onExit,
}: {
  session: Session;
  proctoringEnabled: boolean;
  onComplete: (scores: AnswerScore[]) => void;
  onExit: () => void;
}) {
  const proctor = useProctor();

  return (
    <div className="animate-fade-up max-w-4xl">
      {/* Proctor toolbar */}
      <ProctorToolbar />

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

      {/* Main layout: Questions + Webcam side-by-side */}
      <div className="flex gap-5" style={{ alignItems: "flex-start" }}>
        {/* Questions */}
        <div className="flex-1 min-w-0 max-h-[calc(100vh-280px)] overflow-y-auto no-scrollbar pb-10">
          <InterviewPanel
            session={session}
            proctoringEnabled={proctoringEnabled}
            onComplete={(scores) => {
              proctor.stop();
              onComplete(scores);
            }}
          />
        </div>

        {/* Webcam sidebar */}
        <div className="hidden md:block">
          <WebcamMonitor />
        </div>
      </div>
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
  const [role, setRole] = useState("Senior Product Designer");
  const [experienceLevel, setExperienceLevel] = useState("senior");
  const [interviewType, setInterviewType] = useState("behavioral");
  const [intensity, setIntensity] = useState(2); // 1: Easy, 2: Medium, 3: Hard
  const [numQuestions, setNumQuestions] = useState(5);
  const [resumeId, setResumeId] = useState("");
  const [answerMode, setAnswerMode] = useState("voice");
  const [proctoring, setProctoring] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [session, setSession] = useState<Session | null>(null);

  const difficulty =
    intensity === 1 ? "easy" : intensity === 3 ? "hard" : "medium";

  /* Report data */
  const [answerScores, setAnswerScores] = useState<AnswerScore[]>([]);
  const proctorSnapshotRef = useRef<{
    trustScore: number;
    violations: { type: string; timestamp: number; label: string }[];
    elapsed: number;
    cameraStatus: string;
    faceStatus:
      | "checking"
      | "single_face"
      | "no_face"
      | "multiple_faces"
      | "misaligned"
      | "unsupported";
    fullscreenActive: boolean;
    sessionRisk: "low" | "medium" | "high";
  } | null>(null);
  const [reportData, setReportData] =
    useState<typeof proctorSnapshotRef.current>(null);

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
        proctoringEnabled: proctoring,
      })) as Session;
      setSession(data);
      setPhase(proctoring ? "preflight" : "interview");
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const handleComplete = useCallback(
    async (scores: AnswerScore[]) => {
      setAnswerScores(scores);
      const report = proctorSnapshotRef.current;
      setReportData(report);
      setPhase("report");

      // Save proctor report to backend in the background
      if (session && proctoring && report) {
        try {
          await saveProctorReport(session.session_id, report);
        } catch (e) {
          console.error("Failed to save proctor report:", e);
        }
      }
    },
    [session, proctoring],
  );

  function handleRestart() {
    setPhase("setup");
    setSession(null);
    setAnswerScores([]);
    setReportData(null);
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

        <main className="relative z-10 pt-32 pb-32 px-6 max-w-5xl mx-auto">
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
                    <input
                      className="w-full bg-white/50 border border-white rounded-3xl py-5 px-8 focus:ring-4 focus:ring-[#7C9ADD]/10 text-[#17232E] font-display font-bold text-xl shadow-sm transition-all placeholder:text-[#A0AEC0] outline-none hover:bg-white/80"
                      placeholder="e.g. Lead Frontend Architect"
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    />
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

              {/* Answer Mode & Proctoring */}
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
                <div className="space-y-6">
                  <label className="text-[10px] font-black text-[#718096] uppercase tracking-[0.3em] block mb-2">
                    Proctoring Engine
                  </label>
                  <button
                    className={`w-full p-6 rounded-[28px] flex items-center justify-between group cursor-pointer transition-all border-2 ${proctoring ? "bg-[#98C9A3]/10 border-[#98C9A3]/30" : "bg-white/30 border-white"} hover:bg-white/50`}
                    onClick={() => setProctoring(!proctoring)}
                    type="button"
                  >
                    <div className="flex items-center gap-5">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${proctoring ? "bg-[#98C9A3] text-white shadow-lg" : "bg-white text-[#718096]"}`}
                      >
                        <ShieldCheck size={24} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-[#17232E]">
                          Realism Feedback
                        </p>
                        <p className="text-[10px] text-[#718096] font-medium uppercase tracking-wider">
                          Full Proctoring Suite
                        </p>
                      </div>
                    </div>
                    <div
                      className={`w-14 h-7 rounded-full relative p-1.5 transition-colors ${proctoring ? "bg-[#98C9A3]" : "bg-[#D1D5DB]"}`}
                    >
                      <div
                        className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${proctoring ? "translate-x-7" : "translate-x-0"}`}
                      />
                    </div>
                  </button>
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

  /* ─────────────────────── PREFLIGHT PHASE ─────────────────────── */
  if (phase === "preflight") {
    return (
      <div className="relative min-h-screen bg-[#FDF9F3] text-[#17232E] -m-8 overflow-hidden font-body flex items-center justify-center px-6">
        {/* Ambient Background Orbs */}
        <div className="fixed w-[800px] h-[800px] bg-[#7C9ADD] top-[-300px] left-[-200px] animate-breathe opacity-[0.08] blur-[140px] rounded-full z-0 pointer-events-none"></div>
        <div
          className="fixed w-[700px] h-[700px] bg-[#98C9A3] bottom-[-200px] right-[-200px] animate-breathe opacity-[0.08] blur-[140px] rounded-full z-0 pointer-events-none"
          style={{ animationDelay: "-4s" }}
        ></div>

        <div className="relative z-10 w-full max-w-4xl py-20">
          <PreInterviewChecks
            onReady={() => setPhase("interview")}
            onBack={() => {
              setPhase("setup");
              setSession(null);
            }}
          />
        </div>
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

        <div className="relative z-10">
          <ProctorProvider enabled={proctoring}>
            <ProctorSnapshotCapture snapshotRef={proctorSnapshotRef} />
            <InterviewView
              session={session}
              proctoringEnabled={proctoring}
              onComplete={handleComplete}
              onExit={handleRestart}
            />
          </ProctorProvider>
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

      <div className="relative z-10 max-w-5xl mx-auto">
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

        {/* Trust Score Report */}
        <div className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
          {proctoring && reportData ? (
            <TrustScoreReport
              trustScore={reportData.trustScore}
              violations={
                reportData.violations as Parameters<
                  typeof TrustScoreReport
                >[0]["violations"]
              }
              elapsed={reportData.elapsed}
              cameraStatus={reportData.cameraStatus}
              faceStatus={reportData.faceStatus}
              fullscreenActive={reportData.fullscreenActive}
              sessionRisk={reportData.sessionRisk}
              answerScores={answerScores}
              targetRole={session?.target_role}
            />
          ) : (
            /* Non-proctored: just show performance summary */
            answerScores.length > 0 && (
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
                      answerScores.reduce((s, a) => s + a[key], 0) /
                      answerScores.length;
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
                      {Array.from(
                        new Set(answerScores.flatMap((item) => item.strengths)),
                      )
                        .slice(0, 4)
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
                      {Array.from(
                        new Set(
                          answerScores.flatMap((item) => item.improvements),
                        ),
                      )
                        .slice(0, 4)
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
            )
          )}
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

/* ─── Helper: captures proctor state into a ref for the report phase ─── */
function ProctorSnapshotCapture({
  snapshotRef,
}: {
  snapshotRef: React.MutableRefObject<{
    trustScore: number;
    violations: { type: string; timestamp: number; label: string }[];
    elapsed: number;
    cameraStatus: string;
    faceStatus:
      | "checking"
      | "single_face"
      | "no_face"
      | "multiple_faces"
      | "misaligned"
      | "unsupported";
    fullscreenActive: boolean;
    sessionRisk: "low" | "medium" | "high";
  } | null>;
}) {
  const proctor = useProctor();

  useEffect(() => {
    snapshotRef.current = {
      trustScore: proctor.trustScore,
      violations: proctor.violations,
      elapsed: proctor.elapsed,
      cameraStatus: proctor.cameraStatus,
      faceStatus: proctor.faceStatus,
      fullscreenActive: proctor.fullscreenActive,
      sessionRisk: proctor.sessionRisk,
    };
  }, [proctor, snapshotRef]);

  return null;
}
