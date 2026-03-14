"use client";
import { useState, useEffect, useCallback, useRef } from "react";
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
}: {
  session: Session;
  proctoringEnabled: boolean;
  onComplete: (scores: AnswerScore[]) => void;
}) {
  const proctor = useProctor();

  return (
    <div className="animate-fade-up max-w-4xl">
      {/* Proctor toolbar */}
      <ProctorToolbar />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-none border-2 border-[var(--border)] bg-[#111] flex items-center justify-center">
          <BrainCircuit size={20} className="text-[var(--primary)]" />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl uppercase tracking-tight text-[var(--text-primary)]">
            AI Mock Interview
          </h1>
          <p className="text-xs font-mono text-[var(--text-secondary)]">
            {session.target_role} · {session.interview_type.replace("_", " ")} ·{" "}
            {session.experience_level} · {session.questions.length} questions
          </p>
        </div>
      </div>

      {/* Main layout: Questions + Webcam side-by-side */}
      <div className="flex gap-5" style={{ alignItems: "flex-start" }}>
        {/* Questions */}
        <div className="flex-1 min-w-0">
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
        <div className="lg:col-span-5 flex flex-col gap-8 relative">
          <div className="sticky top-8 flex flex-col gap-10">
            {/* Header section with dramatic typography */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-none border-2 border-dashed border-[var(--indigo)] text-[var(--indigo)] bg-[var(--indigo)]/5 text-xs font-bold uppercase tracking-widest font-mono">
                <Shield size={14} />
                <span>Interview Configuration</span>
              </div>

              <h1 className="font-display font-black text-6xl xl:text-7xl leading-[0.9] tracking-tighter uppercase text-[var(--text-primary)]">
                Mock <br />
                <span
                  className="text-[var(--primary)] glitch"
                  data-text="Interview"
                >
                  Interview
                </span>
              </h1>

              <p className="text-base font-mono text-[var(--text-secondary)] max-w-sm">
                Configure a highly realistic, stress-tested environment.
                Practice delivery, receive deep technical coaching, and perfect
                your performance.
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
                  className="flex items-center gap-4 text-sm font-bold bg-transparent font-mono uppercase tracking-tight"
                >
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-none border-2 ${colorClass}`}
                  >
                    <Icon size={18} strokeWidth={2} />
                  </div>
                  <span className="text-[var(--text-primary)]">{label}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <button
              id="start-interview-btn"
              className={`mt-4 w-full flex items-center justify-between px-6 py-5 rounded-none border-2 border-[var(--primary)] shadow-[6px_6px_0px_var(--primary)] hover:shadow-[2px_2px_0px_var(--primary)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all group overflow-hidden relative bg-[var(--bg-elevated)] text-[var(--primary)] ${loading ? "cursor-wait" : "cursor-pointer"}`}
              onClick={handleStart}
              disabled={loading}
            >
              <div className="absolute inset-0 w-full h-full bg-[var(--primary)]/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0" />
              <div className="relative z-10 flex flex-col items-start gap-1">
                <span className="font-display font-black text-xl lg:text-2xl tracking-tight uppercase">
                  {loading ? "INITIALIZING..." : "LAUNCH SESSION"}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 decoration-black font-mono">
                  BEGIN PRACTICE
                </span>
              </div>
              <div className="relative z-10 w-12 h-12 rounded-none border-2 border-[var(--primary)] flex items-center justify-center bg-transparent group-hover:bg-[var(--primary)] group-hover:text-black transition-colors">
                <ChevronRight
                  size={24}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </div>
            </button>

            {error && (
              <div className="p-4 rounded-none text-sm font-bold font-mono animate-fade-up border-2 text-[var(--pink)] bg-[var(--pink)]/5 border-[var(--pink)]">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Configuration Modules */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          {/* Section 1: Target Architecture */}
          <div className="p-6 md:p-10 rounded-[2.5rem] flex flex-col gap-10 relative overflow-hidden group bg-surface border border-border/10 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
            <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full blur-[100px] opacity-20 pointer-events-none transition-opacity duration-1000 group-hover:opacity-40 bg-indigo" />

            <div className="flex items-center justify-between relative z-10">
              <h2 className="font-display font-black text-3xl tracking-tight">
                Target Role
              </h2>
              <Target size={32} strokeWidth={1.5} className="text-indigo/30" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted">
                  Target Role
                </label>
                <div className="relative group/select">
                  <select
                    id="mi-role"
                    className="w-full appearance-none bg-transparent font-display font-bold text-xl h-14 border-b-2 outline-none transition-colors cursor-pointer"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={{
                      borderColor: "var(--border)",
                      color: "var(--text-primary)",
                      paddingRight: "40px",
                    }}
                    onFocus={(e) =>
                      (e.target.style.borderColor = "var(--indigo)")
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = "var(--border)")
                    }
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <ChevronRight
                    size={20}
                    className="absolute right-0 bottom-4 pointer-events-none rotate-90 transition-transform group-hover/select:translate-y-1"
                    style={{ color: "var(--indigo)" }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black uppercase tracking-widest flex items-center justify-between text-muted">
                  <span>Resume ID</span>
                  <span className="px-2 py-0.5 rounded-full bg-black/5">
                    Optional
                  </span>
                </label>
                <input
                  id="mi-resume-id"
                  className="w-full bg-transparent font-display font-semibold text-xl h-14 border-b-2 border-border text-primary outline-none transition-colors focus:border-indigo"
                  placeholder="Paste ID"
                  value={resumeId}
                  onChange={(e) => setResumeId(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-4 relative z-10">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted">
                Experience Level
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {EXPERIENCE_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    className={`flex flex-col items-start p-5 rounded-3xl transition-all border-2 text-left hover:-translate-y-1 ${
                      experienceLevel === level.value
                        ? "bg-primary text-base shadow-[0_12px_24px_rgba(0,0,0,0.1)] border-primary"
                        : "bg-transparent text-secondary border-border"
                    }`}
                    onClick={() => setExperienceLevel(level.value)}
                  >
                    <span className="font-display font-black text-xl tracking-tight mb-1">
                      {level.label}
                    </span>
                    <span className="text-[11px] font-bold opacity-80">
                      {level.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Format & Modality */}
          <div className="p-6 md:p-10 rounded-none flex flex-col gap-10 relative overflow-hidden group bg-[#050505] border-2 border-[var(--border)] shadow-[8px_8px_0px_var(--border)]">
            <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full blur-[100px] opacity-10 pointer-events-none transition-opacity duration-1000 group-hover:opacity-20 bg-[var(--violet)]" />

            <div className="flex items-center justify-between relative z-10">
              <h2 className="font-display font-black text-3xl tracking-tight uppercase text-[var(--text-primary)]">
                Format Settings
              </h2>
              <BrainCircuit
                size={32}
                strokeWidth={1.5}
                className="text-[var(--violet)]/50"
              />
            </div>

            <div className="flex flex-col gap-4 relative z-10">
              <label className="text-[10px] font-bold font-mono uppercase tracking-widest text-[var(--text-secondary)]">
                Interview Type
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {INTERVIEW_TYPES.map((type) => (
                  <button
                    key={type.value}
                    className={`flex flex-col gap-3 p-5 rounded-none transition-all text-left relative overflow-hidden border-2 ${
                      interviewType === type.value
                        ? "border-[var(--violet)] shadow-[4px_4px_0px_var(--violet)] bg-[#111] translate-x-[-2px] translate-y-[-2px]"
                        : "border-[var(--border)] bg-[#111] hover:border-[var(--text-muted)]"
                    }`}
                    onClick={() => setInterviewType(type.value)}
                  >
                    {interviewType === type.value && (
                      <div className="absolute top-0 right-0 p-4 -translate-y-2 translate-x-2">
                        <div className="w-8 h-8 rounded-none border-4 border-[var(--violet)] opacity-20" />
                      </div>
                    )}
                    <span
                      className={`font-display font-black text-lg tracking-tight uppercase relative z-10 ${interviewType === type.value ? "text-[var(--violet)]" : "text-[var(--text-primary)]"}`}
                    >
                      {type.label}
                    </span>
                    <span className="text-xs font-mono relative z-10 text-[var(--text-secondary)]">
                      {type.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 relative z-10">
              <div className="flex flex-col gap-5">
                <label className="text-[10px] font-bold font-mono uppercase tracking-widest flex items-center justify-between text-[var(--text-secondary)]">
                  <span>Difficulty Depth</span>
                  <span className="font-display text-sm font-bold text-[var(--indigo)] uppercase">
                    {DIFFICULTIES.find((d) => d.value === difficulty)?.label}
                  </span>
                </label>
                <div className="flex gap-2 h-10">
                  {DIFFICULTIES.map((d, index) => {
                    const isActive =
                      DIFFICULTIES.findIndex((x) => x.value === difficulty) >=
                      index;
                    return (
                      <button
                        key={d.value}
                        className={`flex-1 h-full rounded-none transition-all border-2 ${
                          isActive
                            ? "bg-[var(--indigo)] border-[var(--indigo)] opacity-100"
                            : "bg-[#111] border-[var(--border)] opacity-40 hover:opacity-80"
                        }`}
                        onClick={() => setDifficulty(d.value)}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-5">
                <label className="text-[10px] font-bold font-mono uppercase tracking-widest flex items-center justify-between text-[var(--text-secondary)]">
                  <span>Question Count</span>
                  <span className="font-display text-sm font-bold text-[var(--violet)]">
                    {numQuestions}
                  </span>
                </label>
                <div className="flex gap-2">
                  {QUESTION_COUNTS.map((n) => (
                    <button
                      key={n}
                      className={`flex-1 h-10 flex items-center justify-center font-mono font-bold rounded-none border-2 transition-all hover:bg-[var(--violet)]/10 hover:border-[var(--violet)] hover:text-[var(--violet)] ${
                        numQuestions === n
                          ? "border-[var(--violet)] bg-[var(--violet)] text-black"
                          : "border-[var(--border)] bg-[#111] text-[var(--text-muted)]"
                      }`}
                      onClick={() => setNumQuestions(n)}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 relative z-10">
              <label className="text-[10px] font-bold font-mono uppercase tracking-widest text-[var(--text-secondary)]">
                Answer Modality
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {ANSWER_MODES.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    className={`flex flex-col items-center justify-center gap-3 py-6 rounded-none border-2 transition-all group/mode ${
                      answerMode === value
                        ? "border-[var(--primary)] bg-[var(--primary)] text-black shadow-[4px_4px_0px_var(--primary)] translate-x-[-2px] translate-y-[-2px]"
                        : "border-[var(--border)] bg-[#111] text-[var(--text-primary)] hover:border-[var(--text-muted)]"
                    }`}
                    onClick={() => setAnswerMode(value)}
                  >
                    <Icon
                      size={24}
                      strokeWidth={2}
                      className="group-hover/mode:scale-110 transition-transform"
                    />
                    <span className="text-[11px] font-mono font-bold tracking-widest uppercase">
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div
              className={`mt-2 p-6 md:p-8 rounded-none border-2 flex flex-col md:flex-row items-center md:items-start gap-6 transition-all w-full relative overflow-hidden group/proctor ${
                proctoring
                  ? "bg-[var(--indigo)]/10 border-[var(--indigo)] text-[var(--text-primary)]"
                  : "bg-[#111] border-[var(--border)] text-[var(--text-primary)]"
              }`}
            >
              <div className="flex-1 text-center md:text-left relative z-10">
                <div className="flex flex-col md:flex-row items-center gap-3 mb-3">
                  <ShieldCheck
                    size={24}
                    strokeWidth={2}
                    className={
                      proctoring
                        ? "text-[var(--indigo)]"
                        : "text-[var(--text-muted)]"
                    }
                  />
                  <span className="font-display font-black text-xl tracking-tight uppercase">
                    Immersive Focus Mode
                  </span>
                  {proctoring && (
                    <span className="md:ml-auto text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-none border border-[var(--indigo)] bg-[var(--indigo)]/20 text-[var(--indigo)] tracking-widest">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p
                  className={`text-sm font-mono ${proctoring ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}
                >
                  Enables anti-cheating measures, webcam tracking, and
                  fullscreen enforcement to simulate a highly realistic practice
                  environment.
                </p>
              </div>

              <button
                onClick={() => setProctoring(!proctoring)}
                className={`relative z-10 w-[64px] h-8 outline-none border-2 rounded-none transition-all duration-200 mt-2 ${
                  proctoring
                    ? "bg-[var(--indigo)] border-[var(--indigo)] shadow-[2px_2px_0px_var(--indigo)]"
                    : "bg-[#050505] border-[var(--border)]"
                }`}
              >
                <div
                  className={`absolute top-0 w-7 h-7 bg-[var(--text-primary)] border-2 border-transparent transition-all duration-200 ${
                    proctoring ? "left-[32px]" : "left-0 bg-[var(--text-muted)]"
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
          proctoringEnabled={proctoring}
          onComplete={handleComplete}
        />
      </ProctorProvider>
    );
  }

  /* ─────────────────────── REPORT PHASE ─────────────────────── */
  return (
    <div className="animate-fade-up max-w-3xl mx-auto py-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-none flex items-center justify-center mx-auto mb-4 border-2 border-[var(--emerald)] bg-[var(--emerald)]/10">
          <Trophy size={28} className="text-[var(--emerald)]" />
        </div>
        <h1 className="font-display font-black text-3xl mb-2 uppercase tracking-tight text-[var(--text-primary)]">
          Practice Session Complete
        </h1>
        <p className="text-sm font-mono text-[var(--text-secondary)]">
          Here&apos;s your coaching report for the{" "}
          <strong className="text-[var(--indigo)]">
            {session?.target_role}
          </strong>{" "}
          interview.
        </p>
        {session && (
          <p className="text-xs mt-2 font-mono font-bold uppercase tracking-widest text-[var(--text-muted)]">
            {session.interview_type.replace("_", " ")} ·{" "}
            {session.experience_level} · {session.answer_mode}
          </p>
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
        /* Non-proctored: just show answer scores */
        answerScores.length > 0 && (
          <div className="glass-card p-5 mb-6 rounded-none border-2 border-[var(--border)] shadow-[6px_6px_0px_var(--border)]">
            <h3 className="font-display font-bold text-sm mb-3 uppercase tracking-widest text-[var(--text-primary)]">
              Answer Scores
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                  <div key={label} className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-mono font-bold uppercase">
                      <span className="text-[var(--text-secondary)]">
                        {label}
                      </span>
                      <span className="text-[var(--text-primary)]">
                        {avg.toFixed(1)}/10
                      </span>
                    </div>
                    <div className="h-1.5 rounded-none bg-[#111] border border-[var(--border)]">
                      <div
                        className="h-full rounded-none bg-[var(--primary)]"
                        style={{ width: `${avg * 10}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
              <div className="p-4 border-2 border-[var(--emerald)] bg-[var(--emerald)]/5 rounded-none">
                <h4 className="font-mono font-bold text-xs mb-3 uppercase tracking-widest text-[var(--emerald)]">
                  Session strengths
                </h4>
                {Array.from(
                  new Set(answerScores.flatMap((item) => item.strengths)),
                )
                  .slice(0, 4)
                  .map((item) => (
                    <p
                      key={item}
                      className="text-sm mb-1 font-mono text-[var(--text-primary)]"
                    >
                      ✓ {item}
                    </p>
                  ))}
              </div>
              <div className="p-4 border-2 border-[var(--indigo)] bg-[var(--indigo)]/5 rounded-none">
                <h4 className="font-mono font-bold text-xs mb-3 uppercase tracking-widest text-[var(--indigo)]">
                  Next practice goals
                </h4>
                {Array.from(
                  new Set(answerScores.flatMap((item) => item.improvements)),
                )
                  .slice(0, 4)
                  .map((item) => (
                    <p
                      key={item}
                      className="text-sm mb-1 font-mono text-[var(--text-primary)]"
                    >
                      → {item}
                    </p>
                  ))}
              </div>
            </div>
          </div>
        )
      )}

      {/* Restart button */}
      <div className="flex justify-center mt-8">
        <button
          className="btn-primary inline-flex items-center gap-2"
          onClick={handleRestart}
        >
          <RotateCcw size={14} /> Start Another Interview
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
