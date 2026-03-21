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
  const [role, setRole] = useState(ROLES[0]);
  const [experienceLevel, setExperienceLevel] = useState("junior");
  const [interviewType, setInterviewType] = useState("mixed");
  const [difficulty, setDifficulty] = useState("medium");
  const [numQuestions, setNumQuestions] = useState(5);
  const [resumeId, setResumeId] = useState("");
  const [answerMode, setAnswerMode] = useState("text");
  const [proctoring, setProctoring] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [session, setSession] = useState<Session | null>(null);

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
      <div className="animate-fade-up max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pb-16">
        {/* Left Column: Strong Identity */}
        <div className="lg:col-span-5 flex flex-col gap-10 relative">
          <div className="sticky top-8 flex flex-col gap-12">
            {/* Header section with dramatic typography */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#7C9ADD]/20 text-[#7C9ADD] bg-[#7C9ADD]/5 text-[10px] font-bold uppercase tracking-[0.2em]">
                <Shield size={14} />
                <span>Session Architect</span>
              </div>

              <h1 className="font-display font-bold text-6xl xl:text-7xl leading-[0.95] tracking-tighter text-[#2D3748]">
                Interview <br />
                <span className="text-[#7C9ADD]">Simulator</span>
              </h1>

              <p className="text-lg font-body text-[#718096] max-w-md leading-relaxed">
                Step into a high-fidelity, pressure-tested studio environment.
                Record your responses, get real-time coaching, and master your
                technical narrative.
              </p>
            </div>

            {/* List of capabilities */}
            <div className="flex flex-col gap-4">
              {[
                {
                  icon: LayoutTemplate,
                  label: "Role-Aware Strategy",
                  colorClass:
                    "text-[var(--indigo)] border-[var(--indigo)] bg-[var(--indigo)]/10",
                },
                {
                  icon: BarChart3,
                  label: "Rubric-Based Coaching",
                  colorClass:
                    "text-[var(--violet)] border-[var(--violet)] bg-[var(--violet)]/10",
                },
                {
                  icon: Eye,
                  label: "Exemplar Comparisons",
                  colorClass:
                    "text-[var(--emerald)] border-[var(--emerald)] bg-[var(--emerald)]/10",
                },
              ].map(({ icon: Icon, label, colorClass }) => (
                <div
                  key={label}
                  className="flex items-center gap-5 text-sm font-bold tracking-tight group"
                >
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-2xl border transition-all duration-500 group-hover:scale-110 ${colorClass}`}
                  >
                    <Icon size={20} />
                  </div>
                  <span className="text-[#4A5568] group-hover:text-[#2D3748] transition-colors">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* Launch Button */}
            <button
              id="start-interview-btn"
              className={`mt-10 w-full flex items-center justify-between p-2 rounded-[32px] bg-white border border-[#7C9ADD]/20 shadow-glass hover:shadow-xl hover:-translate-y-1 transition-all group ${loading ? "cursor-wait" : "cursor-pointer"}`}
              onClick={handleStart}
              disabled={loading}
            >
              <div className="flex flex-col items-start gap-1 ml-10">
                <span className="font-display font-bold text-2xl tracking-tighter text-[#2D3748]">
                  {loading ? "Preparing Studio..." : "Launch Session"}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7C9ADD]">
                  Ready for assessment
                </span>
              </div>
              <div className="w-16 h-16 rounded-[24px] bg-[#7C9ADD] text-white flex items-center justify-center shadow-lg shadow-[#7C9ADD]/20 group-hover:bg-[#7C9ADD]/90 transition-all">
                <ChevronRight
                  size={32}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </div>
            </button>
          </div>
        </div>

        {/* Right Column: Configuration Modules */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          {/* Section 1: Target Architecture */}
          <div className="p-8 md:p-12 rounded-[48px] flex flex-col gap-12 relative overflow-hidden group bg-white/60 border border-white/80 shadow-glass">
            <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full blur-[100px] opacity-10 pointer-events-none transition-opacity duration-1000 group-hover:opacity-20 bg-[#7C9ADD]" />

            <div className="flex items-center justify-between relative z-10">
              <h2 className="font-display font-bold text-4xl tracking-tighter text-[#2D3748]">
                Target Architecture
              </h2>
              <Target
                size={32}
                strokeWidth={1.5}
                className="text-[#7C9ADD]/30"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
              <div className="flex flex-col gap-4">
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#A0AEC0]">
                  Target Role
                </label>
                <div className="relative group/select">
                  <select
                    id="mi-role"
                    className="w-full appearance-none bg-transparent font-display font-bold text-2xl h-16 border-b-2 outline-none transition-all cursor-pointer border-[#E2E8F0] focus:border-[#7C9ADD] text-[#2D3748]"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={{
                      paddingRight: "40px",
                    }}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <ChevronRight
                    size={24}
                    className="absolute right-0 bottom-5 pointer-events-none rotate-90 transition-transform group-hover/select:translate-y-1 text-[#7C9ADD]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#A0AEC0] flex items-center justify-between">
                  <span>Resume ID</span>
                  <span className="px-3 py-1 rounded-full bg-[#E2E8F0]/50 lowercase font-medium tracking-normal">
                    Optional
                  </span>
                </label>
                <input
                  id="mi-resume-id"
                  className="w-full bg-transparent font-display font-bold text-2xl h-16 border-b-2 outline-none transition-all border-[#E2E8F0] focus:border-[#7C9ADD] text-[#2D3748] placeholder:text-[#E2E8F0]"
                  placeholder="Paste ID"
                  value={resumeId}
                  onChange={(e) => setResumeId(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-6 relative z-10">
              <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#A0AEC0]">
                Seniority Focus
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {EXPERIENCE_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    className={`flex flex-col items-start p-6 rounded-[32px] transition-all border-2 text-left w-full ${
                      experienceLevel === level.value
                        ? "bg-[#7C9ADD] text-white shadow-lg shadow-[#7C9ADD]/30 border-[#7C9ADD] scale-[1.02]"
                        : "bg-white/40 text-[#4A5568] border-white/60 hover:bg-white/60 hover:border-[#7C9ADD]/20"
                    }`}
                    onClick={() => setExperienceLevel(level.value)}
                  >
                    <span className="font-display font-bold text-xl tracking-tight mb-2">
                      {level.label}
                    </span>
                    <span
                      className={`text-[11px] font-medium leading-tight ${experienceLevel === level.value ? "opacity-90" : "opacity-60"}`}
                    >
                      {level.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Format & Modality */}
          <div className="p-8 md:p-12 rounded-[48px] flex flex-col gap-12 relative overflow-hidden group bg-white/60 border border-white/80 shadow-glass">
            <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full blur-[100px] opacity-10 pointer-events-none transition-opacity duration-1000 group-hover:opacity-20 bg-[#B8C1EC]" />

            <div className="flex items-center justify-between relative z-10">
              <h2 className="font-display font-bold text-4xl tracking-tighter text-[#2D3748]">
                Session Modality
              </h2>
              <BrainCircuit
                size={32}
                strokeWidth={1.5}
                className="text-[#B8C1EC]/50"
              />
            </div>

            <div className="flex flex-col gap-6 relative z-10">
              <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#A0AEC0]">
                Interview Focus
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {INTERVIEW_TYPES.map((type) => (
                  <button
                    key={type.value}
                    className={`flex flex-col gap-3 p-6 rounded-[32px] transition-all text-left relative overflow-hidden border-2 ${
                      interviewType === type.value
                        ? "border-[#7C9ADD] bg-white text-[#2D3748] shadow-glass shadow-[#7C9ADD]/10"
                        : "border-white/60 bg-white/40 text-[#4A5568] hover:border-[#7C9ADD]/20"
                    }`}
                    onClick={() => setInterviewType(type.value)}
                  >
                    <span
                      className={`font-display font-bold text-xl tracking-tight ${interviewType === type.value ? "text-[#7C9ADD]" : "text-[#2D3748]"}`}
                    >
                      {type.label}
                    </span>
                    <span className="text-xs font-medium opacity-60">
                      {type.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 relative z-10">
              <div className="flex flex-col gap-6">
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#A0AEC0] flex items-center justify-between">
                  <span>Difficulty</span>
                  <span className="font-display text-xs font-bold text-[#7C9ADD]">
                    {DIFFICULTIES.find((d) => d.value === difficulty)?.label}
                  </span>
                </label>
                <div className="flex gap-2.5 h-10">
                  {DIFFICULTIES.map((d, index) => {
                    const isActive =
                      DIFFICULTIES.findIndex((x) => x.value === difficulty) >=
                      index;
                    return (
                      <button
                        key={d.value}
                        className={`flex-1 h-full rounded-full transition-all border-2 ${
                          isActive
                            ? "bg-[#7C9ADD] border-[#7C9ADD] shadow-lg shadow-[#7C9ADD]/20"
                            : "bg-white/40 border-white/60 opacity-40 hover:opacity-80"
                        }`}
                        onClick={() => setDifficulty(d.value)}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#A0AEC0] flex items-center justify-between">
                  <span>Quantity</span>
                  <span className="font-display text-xs font-bold text-[#7C9ADD]">
                    {numQuestions} Questions
                  </span>
                </label>
                <div className="flex gap-2">
                  {QUESTION_COUNTS.map((n) => (
                    <button
                      key={n}
                      className={`flex-1 h-12 flex items-center justify-center font-bold rounded-2xl border-2 transition-all ${
                        numQuestions === n
                          ? "border-[#7C9ADD] bg-[#7C9ADD] text-white shadow-lg shadow-[#7C9ADD]/20"
                          : "border-white/60 bg-white/40 text-[#4A5568] hover:border-[#7C9ADD]/20"
                      }`}
                      onClick={() => setNumQuestions(n)}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6 relative z-10">
              <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#A0AEC0]">
                Technical Modality
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {ANSWER_MODES.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    className={`flex flex-col items-center justify-center gap-4 py-8 rounded-[32px] border-2 transition-all group/mode ${
                      answerMode === value
                        ? "border-[#7C9ADD] bg-white text-[#7C9ADD] shadow-glass"
                        : "border-white/60 bg-white/40 text-[#4A5568] hover:border-[#7C9ADD]/20"
                    }`}
                    onClick={() => setAnswerMode(value)}
                  >
                    <Icon
                      size={28}
                      strokeWidth={1.5}
                      className="group-hover/mode:scale-110 transition-transform"
                    />
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase">
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div
              className={`p-10 rounded-[40px] border-2 flex flex-col md:flex-row items-center md:items-start gap-10 transition-all w-full relative overflow-hidden group/proctor ${
                proctoring
                  ? "bg-[#7C9ADD]/10 border-[#7C9ADD]/20"
                  : "bg-white/40 border-white/60"
              }`}
            >
              <div className="flex-1 text-center md:text-left relative z-10">
                <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                  <div
                    className={`p-3 rounded-2xl bg-white shadow-sm border border-white/80 ${proctoring ? "text-[#7C9ADD]" : "text-[#A0AEC0]"}`}
                  >
                    <ShieldCheck size={28} />
                  </div>
                  <span className="font-display font-bold text-2xl tracking-tighter text-[#2D3748]">
                    Focus Mode
                  </span>
                  {proctoring && (
                    <span className="md:ml-auto text-[10px] font-bold uppercase px-4 py-1.5 rounded-full border border-[#7C9ADD]/20 bg-white text-[#7C9ADD] tracking-[0.2em] shadow-sm">
                      Enhanced
                    </span>
                  )}
                </div>
                <p
                  className={`text-sm font-medium leading-relaxed ${proctoring ? "text-[#4A5568]" : "text-[#718096]"}`}
                >
                  Enables anti-cheating protocols, webcam tracking, and
                  fullscreen enforcement for high-fidelity practice.
                </p>
              </div>

              <button
                onClick={() => setProctoring(!proctoring)}
                className={`relative z-10 w-[72px] h-10 outline-none border-2 rounded-full transition-all duration-500 mt-2 p-1 ${
                  proctoring
                    ? "bg-[#7C9ADD] border-[#7C9ADD] shadow-lg shadow-[#7C9ADD]/20"
                    : "bg-[#E2E8F0] border-[#E2E8F0]"
                }`}
              >
                <div
                  className={`w-7 h-7 bg-white rounded-full shadow-md transition-all duration-500 transform ${
                    proctoring ? "translate-x-[32px]" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ─────────────────────── PREFLIGHT PHASE ─────────────────────── */
  if (phase === "preflight") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <PreInterviewChecks
          onReady={() => setPhase("interview")}
          onBack={() => {
            setPhase("setup");
            setSession(null);
          }}
        />
      </div>
    );
  }

  /* ─────────────────────── INTERVIEW PHASE ─────────────────────── */
  if (phase === "interview" && session) {
    return (
      <ProctorProvider enabled={proctoring}>
        <ProctorSnapshotCapture snapshotRef={proctorSnapshotRef} />
        <InterviewView
          session={session}
          proctoringEnabled={proctoringing}
          onComplete={handleComplete}
          onExit={handleRestart}
        />
      </ProctorProvider>
    );
  }

  /* ─────────────────────── REPORT PHASE ─────────────────────── */
  return (
    <div className="animate-fade-up max-w-4xl mx-auto py-12 px-6">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="w-20 h-20 rounded-[28px] flex items-center justify-center mx-auto mb-8 bg-[#98C9A3]/10 border border-[#98C9A3]/20 shadow-lg shadow-[#98C9A3]/5">
          <Trophy size={40} className="text-[#98C9A3]" />
        </div>
        <h1 className="font-display font-bold text-5xl mb-4 tracking-tighter text-[#2D3748]">
          Session Complete
        </h1>
        <p className="text-lg font-body text-[#718096] max-w-lg mx-auto leading-relaxed">
          Exceptional effort. You&apos;ve completed the{" "}
          <span className="font-bold text-[#7C9ADD]">
            {session?.target_role}
          </span>{" "}
          assessment. Here is your comprehensive performance narrative.
        </p>

        {session && (
          <div className="inline-flex items-center gap-3 mt-8 px-5 py-2 rounded-full bg-white/40 border border-white/60 shadow-sm relative overflow-hidden group">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A0AEC0]">
              {session.interview_type.replace("_", " ")}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#E2E8F0]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A0AEC0]">
              {session.experience_level}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#E2E8F0]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A0AEC0]">
              {session.answer_mode} Mode
            </span>
          </div>
        )}
      </div>

      {/* Trust Score Report */}
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
          <div className="glass-card p-10 md:p-14 mb-10 rounded-[48px] border border-white/80 bg-white/60 shadow-glass">
            <div className="flex items-center justify-between mb-12">
              <h3 className="font-display font-bold text-2xl tracking-tighter text-[#2D3748]">
                Performance Breakdown
              </h3>
              <div className="px-5 py-2 rounded-full bg-[#7C9ADD]/5 border border-[#7C9ADD]/10 text-[#7C9ADD] text-[10px] font-bold uppercase tracking-widest">
                Aggregated Score
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              {[
                { label: "Clarity", key: "clarity_score" as const },
                { label: "Technical", key: "technical_score" as const },
                { label: "Depth", key: "depth_score" as const },
                { label: "Communication", key: "communication_score" as const },
                {
                  label: "Problem Solving",
                  key: "problem_solving_score" as const,
                },
              ].map(({ label, key }) => {
                const avg =
                  answerScores.reduce((s, a) => s + a[key], 0) /
                  answerScores.length;
                return (
                  <div key={label} className="flex flex-col gap-4 group">
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-bold uppercase tracking-widest text-[#718096] group-hover:text-[#2D3748] transition-colors">
                        {label}
                      </span>
                      <span className="font-display font-bold text-xl text-[#2D3748]">
                        {avg.toFixed(1)}
                        <span className="text-sm text-[#A0AEC0] font-medium ml-1">
                          / 10
                        </span>
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-white/40 border border-white/60 shadow-inner overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#7C9ADD] shadow-glass transition-all duration-1000"
                        style={{ width: `${avg * 10}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 pt-12 border-t border-[#E2E8F0]/50">
              <div className="p-8 rounded-[32px] bg-[#98C9A3]/5 border border-[#98C9A3]/10">
                <h4 className="font-display font-bold text-sm mb-6 uppercase tracking-widest text-[#98C9A3]">
                  Key Strengths
                </h4>
                <div className="space-y-3">
                  {Array.from(
                    new Set(answerScores.flatMap((item) => item.strengths)),
                  )
                    .slice(0, 4)
                    .map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#98C9A3] mt-2 shrink-0" />
                        <p className="text-sm font-body text-[#4A5568] leading-relaxed">
                          {item}
                        </p>
                      </div>
                    ))}
                </div>
              </div>

              <div className="p-8 rounded-[32px] bg-[#B8C1EC]/5 border border-[#B8C1EC]/10">
                <h4 className="font-display font-bold text-sm mb-6 uppercase tracking-widest text-[#7C9ADD]">
                  Growth Opportunity
                </h4>
                <div className="space-y-3">
                  {Array.from(
                    new Set(answerScores.flatMap((item) => item.improvements)),
                  )
                    .slice(0, 4)
                    .map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#7C9ADD] mt-2 shrink-0" />
                        <p className="text-sm font-body text-[#4A5568] leading-relaxed">
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

      {/* Restart button with premium styling */}
      <div className="flex justify-center mt-12">
        <button
          className="flex items-center justify-center gap-3 px-10 py-5 rounded-[24px] bg-[#7C9ADD] text-white font-display font-bold text-lg shadow-lg shadow-[#7C9ADD]/20 hover:bg-[#7C9ADD]/90 hover:-translate-y-1 active:scale-95 transition-all group"
          onClick={handleRestart}
        >
          <RotateCcw
            size={20}
            className="group-hover:rotate-180 transition-transform duration-500"
          />
          <span>Initialize New Session</span>
        </button>
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
  });

  return null;
}
