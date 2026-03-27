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
      <div className="relative min-h-screen bg-base text-primary -m-8 overflow-hidden">
        {/* Ambient Background Orbs */}
        <div className="fixed bg-orb w-[600px] h-[600px] bg-indigo top-[-200px] left-[-100px] animate-breathe opacity-15 blur-[120px] rounded-full z-0"></div>
        <div
          className="fixed bg-orb w-[500px] h-[500px] bg-emerald bottom-[-100px] right-[-100px] animate-breathe opacity-15 blur-[120px] rounded-full z-0"
          style={{ animationDelay: "-4s" }}
        ></div>

        <main className="relative z-10 pt-32 pb-20 px-6 max-w-4xl mx-auto">
          {/* Setup Header */}
          <div className="text-center mb-12">
            <span className="text-[0.75rem] font-bold tracking-[0.15em] text-indigo uppercase mb-3 block">
              Personalized Coaching
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tight mb-4 text-primary">
              Configure Your Session
            </h1>
            <p className="text-muted font-body text-lg max-w-2xl mx-auto leading-relaxed">
              Fine-tune the parameters of your ethereal interview. Hirenix AI
              will adapt its persona and questions based on your selections.
            </p>
          </div>

          {/* Main Configuration Card */}
          <div className="backdrop-blur-lg bg-surface/80 border border-white/20 shadow-xl p-8 md:p-12 rounded-[2rem] relative overflow-hidden">
            <div className="space-y-10">
              {/* Role & Experience Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider">
                    Target Role
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-muted">
                      search
                    </span>
                    <input
                      className="w-full bg-white/40 border border-border/10 rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-indigo/20 text-primary font-body shadow-sm transition-all placeholder:text-muted/50"
                      placeholder="e.g. Senior Product Designer"
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider">
                    Experience Level
                  </label>
                  <div className="flex p-1 bg-white/40 rounded-xl shadow-sm">
                    {EXPERIENCE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all ${
                          experienceLevel === opt.value
                            ? "bg-white text-indigo shadow-sm"
                            : "text-muted hover:bg-white/50"
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
              <div className="space-y-4">
                <label className="text-xs font-bold text-muted uppercase tracking-wider">
                  Interview Track
                </label>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {TRACK_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      className={`backdrop-blur-lg p-4 rounded-xl text-left border-2 transition-all ${
                        interviewType === opt.value
                          ? "border-indigo bg-white/80"
                          : "border-transparent bg-white/65 hover:border-indigo/30"
                      }`}
                      onClick={() => setInterviewType(opt.value)}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-indigo mb-2 block">
                        {opt.icon}
                      </span>
                      <span className="block font-bold text-sm">
                        {opt.label}
                      </span>
                      <span className="text-[10px] text-muted">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty & Questions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-muted uppercase tracking-wider">
                      Challenge Intensity
                    </label>
                    <span className="text-xs font-bold text-indigo">
                      {intensity === 1
                        ? "Easy"
                        : intensity === 2
                          ? "Medium"
                          : "Hard"}
                    </span>
                  </div>
                  <div className="relative pt-2">
                    <input
                      className="w-full h-2 bg-white/40 rounded-full appearance-none cursor-pointer accent-indigo"
                      max="3"
                      min="1"
                      step="1"
                      type="range"
                      value={intensity}
                      onChange={(e) => setIntensity(parseInt(e.target.value))}
                    />
                    <div className="flex justify-between mt-2 px-1">
                      <span className="text-[10px] text-muted">Easy</span>
                      <span className="text-[10px] text-muted">Hard</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider">
                    Number of Questions
                  </label>
                  <div className="flex items-center gap-4 bg-white/40 p-2 rounded-xl shadow-sm">
                    <button
                      className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white/60 transition-colors"
                      type="button"
                      onClick={() =>
                        setNumQuestions((prev) => Math.max(1, prev - 1))
                      }
                    >
                      <span className="material-symbols-outlined">remove</span>
                    </button>
                    <input
                      className="flex-1 bg-transparent border-0 text-center font-bold text-lg focus:ring-0"
                      type="number"
                      value={numQuestions}
                      onChange={(e) =>
                        setNumQuestions(parseInt(e.target.value) || 1)
                      }
                    />
                    <button
                      className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white/60 transition-colors"
                      type="button"
                      onClick={() =>
                        setNumQuestions((prev) => Math.min(20, prev + 1))
                      }
                    >
                      <span className="material-symbols-outlined">add</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Answer Mode & Proctoring */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider">
                    Answer Mode
                  </label>
                  <div className="flex gap-3">
                    {[
                      { value: "voice", label: "Voice", icon: "mic" },
                      { value: "video", label: "Video", icon: "videocam" },
                      { value: "text", label: "Text", icon: "keyboard" },
                    ].map((mode) => (
                      <button
                        key={mode.value}
                        className={`flex-1 backdrop-blur-lg py-3 flex flex-col items-center gap-1 border transition-all rounded-xl ${
                          answerMode === mode.value
                            ? "border-indigo bg-white/90 ring-1 ring-indigo"
                            : "border-white/20 bg-white/40 opacity-60 hover:opacity-100"
                        }`}
                        onClick={() => setAnswerMode(mode.value)}
                        type="button"
                      >
                        <span
                          className={`material-symbols-outlined ${answerMode === mode.value ? "text-indigo" : "text-muted"}`}
                          style={
                            answerMode === mode.value
                              ? { fontVariationSettings: "'FILL' 1" }
                              : {}
                          }
                        >
                          {mode.icon}
                        </span>
                        <span className="text-[10px] font-bold">
                          {mode.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider">
                    Practice Focus
                  </label>
                  <div
                    className={`backdrop-blur-lg p-4 rounded-xl flex items-center justify-between group cursor-pointer transition-all border ${proctoring ? "bg-white/80 border-indigo/30" : "bg-white/65 border-white/20"} hover:bg-white/80`}
                    onClick={() => setProctoring(!proctoring)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-emerald text-lg">
                          verified_user
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-bold">
                          Optional Realism Mode
                        </p>
                        <p className="text-[10px] text-muted">
                          Webcam & Mic proctoring
                        </p>
                      </div>
                    </div>
                    <div
                      className={`w-10 h-5 rounded-full relative p-1 transition-colors ${proctoring ? "bg-indigo" : "bg-muted/30"}`}
                    >
                      <div
                        className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${proctoring ? "translate-x-5" : "translate-x-0"}`}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resume Upload Area */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-muted uppercase tracking-wider">
                  Tailor with your Resume (Optional)
                </label>
                <div className="border-2 border-dashed border-border/20 rounded-xl p-8 text-center group hover:border-indigo transition-all cursor-pointer bg-white/20">
                  <span className="material-symbols-outlined text-3xl text-indigo mb-2 group-hover:scale-110 transition-transform block">
                    cloud_upload
                  </span>
                  <p className="font-body text-sm text-primary font-semibold">
                    Drop your resume here or{" "}
                    <span className="text-indigo underline">browse</span>
                  </p>
                  <p className="text-[10px] text-muted mt-1">
                    PDF or DOCX (Max 5MB)
                  </p>
                </div>
              </div>

              <div className="pt-6">
                <button
                  className={`w-full bg-indigo text-white py-5 rounded-lg font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-indigo/20 hover:scale-[1.02] active:scale-[0.98] transition-all group ${loading ? "opacity-70 cursor-wait" : ""}`}
                  type="button"
                  disabled={loading}
                  onClick={handleStart}
                >
                  <span>
                    {loading ? "Generating..." : "Generate My Interview Plan"}
                  </span>
                  {!loading && (
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                      bolt
                    </span>
                  )}
                </button>
                <p className="text-center text-[10px] text-muted mt-4 font-body">
                  Hirenix AI will analyze your inputs to curate {numQuestions}{" "}
                  custom {interviewType} questions for a {role} role.
                </p>
              </div>

              {error && (
                <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold text-center">
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
          proctoringEnabled={proctoring}
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
        <div className="w-20 h-20 rounded-[28px] flex items-center justify-center mx-auto mb-8 bg-emerald/10 border border-emerald/20 shadow-lg shadow-emerald/5">
          <Trophy size={40} className="text-emerald" />
        </div>
        <h1 className="font-display font-bold text-5xl mb-4 tracking-tighter text-primary">
          Session Complete
        </h1>
        <p className="text-lg font-body text-muted max-w-lg mx-auto leading-relaxed">
          Exceptional effort. You&apos;ve completed the{" "}
          <span className="font-bold text-indigo">{session?.target_role}</span>{" "}
          assessment. Here is your comprehensive performance narrative.
        </p>

        {session && (
          <div className="inline-flex items-center gap-3 mt-8 px-5 py-2 rounded-full bg-white/40 border border-white/60 shadow-sm relative overflow-hidden group">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
              {session.interview_type.replace("_", " ")}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-border" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
              {session.experience_level}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-border" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
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
          <div className="glass-card p-10 md:p-14 mb-10 rounded-[48px] border border-white/20 bg-surface/80 shadow-xl">
            <div className="flex items-center justify-between mb-12">
              <h3 className="font-display font-bold text-2xl tracking-tighter text-primary">
                Performance Breakdown
              </h3>
              <div className="px-5 py-2 rounded-full bg-indigo/5 border border-indigo/10 text-indigo text-[10px] font-bold uppercase tracking-widest">
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
                      <span className="text-xs font-bold uppercase tracking-widest text-muted group-hover:text-primary transition-colors">
                        {label}
                      </span>
                      <span className="font-display font-bold text-xl text-primary">
                        {avg.toFixed(1)}
                        <span className="text-sm text-muted font-medium ml-1">
                          / 10
                        </span>
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-white/20 border border-white/20 shadow-inner overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo shadow-lg transition-all duration-1000"
                        style={{ width: `${avg * 10}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 pt-12 border-t border-border/10">
              <div className="p-8 rounded-[32px] bg-emerald/5 border border-emerald/10">
                <h4 className="font-display font-bold text-sm mb-6 uppercase tracking-widest text-emerald">
                  Key Strengths
                </h4>
                <div className="space-y-3">
                  {Array.from(
                    new Set(answerScores.flatMap((item) => item.strengths)),
                  )
                    .slice(0, 4)
                    .map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald mt-2 shrink-0" />
                        <p className="text-sm font-body text-secondary leading-relaxed">
                          {item}
                        </p>
                      </div>
                    ))}
                </div>
              </div>

              <div className="p-8 rounded-[32px] bg-indigo/5 border border-indigo/10">
                <h4 className="font-display font-bold text-sm mb-6 uppercase tracking-widest text-indigo">
                  Growth Opportunity
                </h4>
                <div className="space-y-3">
                  {Array.from(
                    new Set(answerScores.flatMap((item) => item.improvements)),
                  )
                    .slice(0, 4)
                    .map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo mt-2 shrink-0" />
                        <p className="text-sm font-body text-secondary leading-relaxed">
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
          className="flex items-center justify-center gap-3 px-10 py-5 rounded-[24px] bg-indigo text-white font-display font-bold text-lg shadow-lg shadow-indigo/20 hover:bg-indigo/90 hover:-translate-y-1 active:scale-95 transition-all group"
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
