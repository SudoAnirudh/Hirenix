"use client";
import React, { useState, useEffect, useCallback } from "react";
import { startInterview, getProgress } from "@/lib/api";
import InterviewPanel from "@/components/InterviewPanel";
import type { SessionSummary } from "@/components/InterviewPanel";
import { ToastProvider } from "@/components/interview/ToastProvider";
import { ProctorProvider } from "@/components/interview/ProctorProvider";
import PreInterviewChecks from "@/components/interview/PreInterviewChecks";
import LoadingScreen from "@/components/ui/LoadingScreen";
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
  FileText,
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
interface Resume {
  id: string;
  file_name: string;
  ats_score?: number;
}

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

type Phase = "setup" | "checks" | "interview" | "report";

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
      <div className="flex items-center justify-between mb-6 p-4 border border-border bg-card rounded-xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
            <BrainCircuit size={16} className="text-primary" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-lg tracking-tight text-foreground">
              Interview Studio
            </h1>
            <p className="text-[10px] font-body text-muted-foreground">
              {session.target_role} · {session.interview_type.replace("_", "")}
            </p>
          </div>
        </div>

        <button
          onClick={onExit}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 text-xs font-semibold transition-colors active:scale-95"
        >
          <RotateCcw size={13} />
          Exit Session
        </button>
      </div>

      <InterviewPanel
        session={session}
        onComplete={onComplete}
        onExit={onExit}
      />
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
  const [resumes, setResumes] = useState<Resume[]>([]);

  const difficulty =
    intensity === 1 ? "easy" : intensity === 3 ? "hard" : "medium";

  /* Report data */
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(
    null,
  );
  const [userRating, setUserRating] = useState<number | null>(null);
  const [userFeedback, setUserFeedback] = useState("");

  /* Load resumes and auto-fill resume ID from localStorage */
  useEffect(() => {
    async function loadResumes() {
      try {
        const progress = (await getProgress()) as any;
        if (progress?.ats_trend) {
          setResumes(progress.ats_trend);
          if (progress.ats_trend.length > 0) {
            const stored = localStorage.getItem("latest_resume");
            let initialResumeId = "";
            if (stored) {
              try {
                const parsed = JSON.parse(stored);
                if (
                  parsed?.resume_id &&
                  progress.ats_trend.some(
                    (r: Resume) => r.id === parsed.resume_id,
                  )
                ) {
                  initialResumeId = parsed.resume_id;
                }
              } catch {}
            }
            setResumeId(initialResumeId);
          }
        }
      } catch (err) {
        console.error("Failed to load resumes:", err);
      }
    }
    loadResumes();
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

  if (loading) {
    return (
      <LoadingScreen
        message="Synthesizing Interview Studio"
        submessage="Curating tailored questions based on your professional vector..."
      />
    );
  }

  /* ─────────────────────── SETUP SCREEN ─────────────────────── */
  if (phase === "setup") {
    return (
      <div className="relative w-full text-foreground overflow-hidden font-body">
        <main className="relative z-10 py-6 w-full mx-auto max-w-4xl">
          {/* Setup Header */}
          <div className="mb-8 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider mb-3">
              <Sparkles size={12} />
              Curated Performance Studio
            </div>
            <h1 className="text-3xl font-display font-extrabold text-foreground tracking-tight mb-2">
              Configure Your Interview Session
            </h1>
            <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed">
              Fine-tune your technical persona. Hirenix AI adapts its logic,
              depth, and delivery based on your target role and experience.
            </p>
          </div>

          {/* Main Configuration Card */}
          <div
            className="border border-border bg-card p-6 md:p-10 rounded-xl shadow-xs relative overflow-hidden animate-fade-up"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="space-y-16">
              {/* Role & Experience Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Target size={14} className="text-muted-foreground" />
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Target Industry Role
                    </label>
                  </div>
                  <div className="relative">
                    <select
                      className="w-full bg-card border border-border rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-primary/50 text-foreground font-semibold text-sm transition-all outline-none"
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
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <BarChart3 size={14} className="text-muted-foreground" />
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Seniority Vector
                    </label>
                  </div>
                  <div className="flex p-1 bg-slate-50 dark:bg-slate-900 border border-border rounded-lg">
                    {EXPERIENCE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
                          experienceLevel === opt.value
                            ? "bg-card text-primary shadow-xs border border-border/50"
                            : "text-muted-foreground hover:text-foreground"
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

              {/* Resume Context Selection */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-muted-foreground" />
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Resume Context
                  </label>
                </div>
                <div className="relative">
                  <select
                    className="w-full bg-card border border-border rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-primary/50 text-foreground font-semibold text-sm transition-all outline-none"
                    value={resumeId}
                    onChange={(e) => setResumeId(e.target.value)}
                  >
                    <option value="">
                      General Interview (No Resume Context)
                    </option>
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.file_name}{" "}
                        {r.ats_score ? `(ATS Score: ${r.ats_score})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-[10px] text-muted-foreground pl-1">
                  Selecting a resume allows the AI to tailor questions
                  specifically to your background, projects, and skills.
                </p>
              </div>

              {/* Interview Type Selection */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <BrainCircuit size={14} className="text-muted-foreground" />
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Specialization Track
                  </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {TRACK_OPTIONS.map((opt) => {
                    const isSelected = interviewType === opt.value;
                    return (
                      <button
                        key={opt.value}
                        className={`group relative p-5 rounded-xl text-left border transition-all duration-200 block cursor-pointer ${
                          isSelected
                            ? "border-primary bg-primary/5 text-foreground shadow-xs"
                            : "border-border bg-card hover:bg-slate-50 dark:hover:bg-slate-900/40"
                        }`}
                        onClick={() => setInterviewType(opt.value)}
                        type="button"
                      >
                        <div
                          className={`mb-3 w-8 h-8 rounded-md flex items-center justify-center transition-all ${isSelected ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800 text-primary"}`}
                        >
                          {opt.value === "technical" && <Target size={16} />}
                          {opt.value === "behavioral" && (
                            <MessageSquareText size={16} />
                          )}
                          {opt.value === "system_design" && (
                            <LayoutTemplate size={16} />
                          )}
                          {opt.value === "mixed" && <Sparkles size={16} />}
                        </div>
                        <span
                          className={`block font-bold text-sm tracking-tight mb-0.5 ${isSelected ? "text-foreground" : "text-muted-foreground"}`}
                        >
                          {opt.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground leading-relaxed">
                          {opt.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Difficulty & Questions & Answer Mode */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Shield size={14} className="text-muted-foreground" />
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Challenge Depth
                      </label>
                    </div>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded-md">
                      {intensity === 1
                        ? "Foundational"
                        : intensity === 2
                          ? "Professional"
                          : "Expert"}
                    </span>
                  </div>
                  <div className="relative pt-2">
                    <input
                      className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-primary"
                      max="3"
                      min="1"
                      step="1"
                      type="range"
                      value={intensity}
                      onChange={(e) => setIntensity(parseInt(e.target.value))}
                    />
                    <div className="flex justify-between mt-3 px-0.5">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                        Entry
                      </span>
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                        Expert
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <RotateCcw size={14} className="text-muted-foreground" />
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Session Questions
                    </label>
                  </div>
                  <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900 border border-border p-1.5 rounded-lg">
                    <button
                      className="w-8 h-8 rounded-md flex items-center justify-center bg-card border border-border text-primary transition-all shadow-xs"
                      type="button"
                      onClick={() =>
                        setNumQuestions((prev) => Math.max(1, prev - 1))
                      }
                    >
                      <span className="text-sm font-bold">-</span>
                    </button>
                    <div className="flex-1 text-center">
                      <span className="font-bold text-base text-foreground">
                        {numQuestions}
                      </span>
                    </div>
                    <button
                      className="w-8 h-8 rounded-md flex items-center justify-center bg-card border border-border text-primary transition-all shadow-xs"
                      type="button"
                      onClick={() =>
                        setNumQuestions((prev) => Math.min(20, prev + 1))
                      }
                    >
                      <span className="text-sm font-bold">+</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Delivery Paradigm
                  </label>
                  <div className="flex gap-3">
                    {ANSWER_MODES.map((mode) => {
                      const isSelected = answerMode === mode.value;
                      const Icon = mode.icon;
                      return (
                        <button
                          key={mode.value}
                          className={`flex-1 py-2 flex items-center justify-center gap-2 border transition-all rounded-lg cursor-pointer text-[10px] font-bold ${
                            isSelected
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border bg-card text-muted-foreground"
                          }`}
                          onClick={() => setAnswerMode(mode.value)}
                          type="button"
                        >
                          <Icon size={12} />
                          {mode.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Area */}
              <div className="pt-6 border-t border-border">
                <button
                  className="w-full bg-foreground text-card py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all"
                  type="button"
                  onClick={() => setPhase("checks")}
                >
                  <span>Initiate Studio Session</span>
                  <ChevronRight size={16} />
                </button>
                <div className="flex items-center justify-center gap-2 mt-6 opacity-60">
                  <span className="w-6 h-px bg-muted-foreground" />
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                    Hirenix Studio
                  </p>
                  <span className="w-6 h-px bg-muted-foreground" />
                </div>
              </div>

              {error && (
                <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-100 text-red-700 text-xs font-semibold text-center">
                  {error}
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Success Indicator (Floating Status Pill) */}
        {!loading && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 backdrop-blur bg-card/80 border border-border px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg z-50">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-bold text-foreground tracking-wide">
              Mentor is ready
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
              opacity: 0.1;
            }
            50% {
              transform: scale(1.05);
              opacity: 0.15;
            }
          }
          @keyframes fade-up {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-up {
            animation: fade-up 0.4s ease-out forwards;
          }
        `}</style>
      </div>
    );
  }

  /* ─────────────────────── CHECKS PHASE ─────────────────────── */
  if (phase === "checks") {
    return (
      <div className="fixed inset-0 z-[100] min-h-screen w-screen h-screen bg-[#FDF9F3] text-foreground overflow-y-auto font-body flex items-center justify-center p-6">
        <div className="relative z-10 w-full max-w-4xl mx-auto flex justify-center">
          <PreInterviewChecks
            onReady={() => void handleStart()}
            onBack={() => setPhase("setup")}
          />
        </div>
      </div>
    );
  }

  /* ─────────────────────── INTERVIEW PHASE ─────────────────────── */
  if (phase === "interview" && session) {
    return (
      <ProctorProvider enabled={true}>
        <div className="fixed inset-0 z-[100] min-h-screen w-screen h-screen bg-[#FDF9F3] text-foreground overflow-y-auto font-body px-6 py-12">
          <div className="relative z-10 w-full mx-auto">
            <InterviewView
              session={session}
              onComplete={handleComplete}
              onExit={handleRestart}
            />
          </div>
        </div>
      </ProctorProvider>
    );
  }

  /* ─────────────────────── REPORT PHASE ─────────────────────── */
  return (
    <div className="relative min-h-screen bg-[#FDF9F3] text-foreground -m-8 font-body py-16 px-6 animate-fade-up">
      <div className="relative z-10 w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-bold text-4xl mb-4 tracking-tight">
            Session Complete
          </h1>
          <p className="text-muted-foreground">
            Performance analysis for {session?.target_role}.
          </p>
        </div>

        {/* Performance Report */}
        <div className="animate-fade-up">
          {sessionSummary?.feedback?.length ? (
            <div className="border border-border bg-card p-8 mb-8 rounded-lg">
              <h3 className="font-bold text-lg mb-8">Performance Analytics</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
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
                    <div key={label} className="space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {label}
                        </span>
                        <span className="font-bold text-sm">
                          {avg.toFixed(1)} / 10
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${avg * 10}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        {/* Per-question analysis */}
        {session && sessionSummary?.feedback?.length ? (
          <div className="border border-border bg-card p-8 rounded-lg mb-8">
            <h3 className="font-bold text-lg mb-8">Detailed Breakdown</h3>
            <div className="space-y-6">
              {session.questions.map((qq, idx) => {
                const fb = sessionSummary.feedback.find(
                  (f) => f.question_id === qq.question_id,
                );
                if (!fb) return null;
                return (
                  <div
                    key={qq.question_id}
                    className="p-6 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-border"
                  >
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <p className="font-bold text-sm">{qq.question}</p>
                      <span className="px-2 py-1 bg-card border border-border rounded text-[10px] font-bold">
                        {fb.score}/10
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="text-xs text-muted-foreground">
                        <span className="block font-bold text-emerald-600 mb-1">
                          Strengths
                        </span>
                        {fb.strengths?.join(", ")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <span className="block font-bold text-primary mb-1">
                          Improvements
                        </span>
                        {fb.improvements?.join(", ")}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Guidance */}
        {sessionSummary?.feedback?.length ? (
          <div className="border border-border bg-card p-8 rounded-lg mb-8">
            <h3 className="font-bold text-lg mb-6">Optimization Roadmap</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-border">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-4">
                  Your next 3 reps
                </div>
                <ol className="space-y-3 text-xs font-body text-muted-foreground leading-relaxed list-decimal list-inside">
                  <li>Open with a 1-sentence summary answer.</li>
                  <li>
                    Use a 2-3 bullet structure (tradeoffs → example → result).
                  </li>
                  <li>Close with a metric, constraint, or failure mode.</li>
                </ol>
              </div>
              <div className="p-8 rounded-[32px] bg-card/50 border border-white/70">
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-5">
                  Focus areas from this session
                </div>
                <div className="space-y-3">
                  {(sessionSummary.overall_improvements ?? [])
                    .slice(0, 6)
                    .map((item, idx) => (
                      <div key={idx} className="flex items-start gap-4">
                        <div className="w-2 h-2 rounded-full bg-brand-blue mt-2 shrink-0" />
                        <p className="text-sm font-body text-muted-foreground leading-relaxed font-medium">
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
        <div className="border border-border bg-card p-6 md:p-10 rounded-xl shadow-xs relative overflow-hidden mb-6">
          <div className="flex items-center gap-3 mb-8 relative z-10">
            <span className="w-2.5 h-6 bg-primary rounded-md" />
            <h3 className="font-display font-bold text-2xl tracking-tight text-foreground">
              Feedback (optional)
            </h3>
          </div>

          <div className="relative z-10 space-y-8">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Rate this session
              </div>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setUserRating(n)}
                    className={`px-4 py-2.5 rounded-lg border text-xs font-bold transition-all ${
                      userRating === n
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-foreground border-border hover:bg-slate-50 dark:hover:bg-slate-900"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
                What should we improve?
              </div>
              <textarea
                className="w-full rounded-lg p-4 min-h-[140px] bg-card border border-border outline-none text-xs text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50"
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
                className="btn-primary px-6 py-2.5 rounded-lg text-xs"
              >
                Submit feedback
              </button>
            </div>
          </div>
        </div>

        {/* Restart button */}
        <div className="flex justify-center mt-8 mb-16 relative z-10">
          <button
            className="btn-primary py-3 px-8 rounded-lg text-sm flex items-center gap-2"
            onClick={handleRestart}
          >
            <RotateCcw size={16} />
            <span>Initialize New Session</span>
          </button>
        </div>
      </div>
    </div>
  );
}
