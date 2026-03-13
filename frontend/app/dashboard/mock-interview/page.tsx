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
  Camera,
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
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background:
              "linear-gradient(135deg, rgba(11,124,118,0.15), rgba(221,107,32,0.15))",
            border: "1px solid rgba(11,124,118,0.25)",
          }}
        >
          <BrainCircuit size={20} style={{ color: "var(--indigo)" }} />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl">AI Mock Interview</h1>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
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
      <div className="animate-fade-up max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, rgba(11,124,118,0.15), rgba(221,107,32,0.15))",
              border: "1px solid rgba(11,124,118,0.25)",
            }}
          >
            <Shield size={20} style={{ color: "var(--indigo)" }} />
          </div>
          <div>
            <h1 className="font-display font-bold text-3xl">
              AI Mock Interview
            </h1>
          </div>
        </div>
        <p className="mb-8" style={{ color: "var(--text-secondary)" }}>
          Practice role-specific interviews with structured coaching, model
          answers, and optional focus tracking. The goal is self-evaluation and
          improvement, not exam-style enforcement.
        </p>

        {/* Setup Form */}
        <div className="glass-card p-6 flex flex-col gap-5">
          <div
            className="flex items-center gap-2 pb-3"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <Sparkles size={16} style={{ color: "var(--violet)" }} />
            <span className="font-semibold text-sm">
              Configure Your Interview
            </span>
          </div>

          {/* Resume ID */}
          <div>
            <label
              className="text-xs font-medium mb-1 block"
              style={{ color: "var(--text-secondary)" }}
            >
              Resume ID
            </label>
            <input
              id="mi-resume-id"
              className="input-base"
              placeholder="Paste your resume ID from the Resume Analysis page"
              value={resumeId}
              onChange={(e) => setResumeId(e.target.value)}
            />
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              Optional. Add a resume ID to get questions nudged toward your
              background and projects.
            </p>
          </div>

          {/* Target Role */}
          <div>
            <label
              className="text-xs font-medium mb-1 block"
              style={{ color: "var(--text-secondary)" }}
            >
              Target Role
            </label>
            <select
              id="mi-role"
              className="input-base"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ cursor: "pointer" }}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className="text-xs font-medium mb-2 block"
              style={{ color: "var(--text-secondary)" }}
            >
              Experience Level
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {EXPERIENCE_LEVELS.map((level) => (
                <button
                  key={level.value}
                  className="px-4 py-3 rounded-xl text-left transition-all"
                  style={{
                    background:
                      experienceLevel === level.value
                        ? "rgba(11,124,118,0.1)"
                        : "var(--bg-elevated)",
                    border: `1px solid ${experienceLevel === level.value ? "rgba(11,124,118,0.35)" : "var(--border)"}`,
                    color:
                      experienceLevel === level.value
                        ? "var(--indigo)"
                        : "var(--text-secondary)",
                    cursor: "pointer",
                  }}
                  onClick={() => setExperienceLevel(level.value)}
                >
                  <span className="text-sm font-medium block">
                    {level.label}
                  </span>
                  <span className="text-xs" style={{ opacity: 0.7 }}>
                    {level.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              className="text-xs font-medium mb-2 block"
              style={{ color: "var(--text-secondary)" }}
            >
              Interview Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {INTERVIEW_TYPES.map((type) => (
                <button
                  key={type.value}
                  className="px-4 py-3 rounded-xl text-left transition-all"
                  style={{
                    background:
                      interviewType === type.value
                        ? "rgba(124,58,237,0.1)"
                        : "var(--bg-elevated)",
                    border: `1px solid ${interviewType === type.value ? "rgba(124,58,237,0.35)" : "var(--border)"}`,
                    color:
                      interviewType === type.value
                        ? "var(--violet)"
                        : "var(--text-secondary)",
                    cursor: "pointer",
                  }}
                  onClick={() => setInterviewType(type.value)}
                >
                  <span className="text-sm font-medium block">
                    {type.label}
                  </span>
                  <span className="text-xs" style={{ opacity: 0.7 }}>
                    {type.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label
              className="text-xs font-medium mb-2 block"
              style={{ color: "var(--text-secondary)" }}
            >
              Difficulty
            </label>
            <div className="flex gap-3">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.value}
                  className="flex-1 px-4 py-3 rounded-xl text-left transition-all"
                  style={{
                    background:
                      difficulty === d.value
                        ? "rgba(11,124,118,0.1)"
                        : "var(--bg-elevated)",
                    border: `1px solid ${difficulty === d.value ? "rgba(11,124,118,0.35)" : "var(--border)"}`,
                    color:
                      difficulty === d.value
                        ? "var(--indigo)"
                        : "var(--text-secondary)",
                    cursor: "pointer",
                  }}
                  onClick={() => setDifficulty(d.value)}
                >
                  <span className="text-sm font-medium block">{d.label}</span>
                  <span className="text-xs" style={{ opacity: 0.7 }}>
                    {d.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Number of Questions */}
          <div>
            <label
              className="text-xs font-medium mb-2 block"
              style={{ color: "var(--text-secondary)" }}
            >
              Number of Questions
            </label>
            <div className="flex gap-2">
              {QUESTION_COUNTS.map((n) => (
                <button
                  key={n}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background:
                      numQuestions === n
                        ? "rgba(11,124,118,0.1)"
                        : "var(--bg-elevated)",
                    border: `1px solid ${numQuestions === n ? "rgba(11,124,118,0.35)" : "var(--border)"}`,
                    color:
                      numQuestions === n
                        ? "var(--indigo)"
                        : "var(--text-secondary)",
                    cursor: "pointer",
                  }}
                  onClick={() => setNumQuestions(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              className="text-xs font-medium mb-2 block"
              style={{ color: "var(--text-secondary)" }}
            >
              Answer Mode
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {ANSWER_MODES.map(({ value, label, desc, icon: Icon }) => (
                <button
                  key={value}
                  className="px-4 py-3 rounded-xl text-left transition-all"
                  style={{
                    background:
                      answerMode === value
                        ? "rgba(221,107,32,0.1)"
                        : "var(--bg-elevated)",
                    border: `1px solid ${answerMode === value ? "rgba(221,107,32,0.35)" : "var(--border)"}`,
                    color:
                      answerMode === value
                        ? "var(--violet)"
                        : "var(--text-secondary)",
                    cursor: "pointer",
                  }}
                  onClick={() => setAnswerMode(value)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon size={15} />
                    <span className="text-sm font-medium block">{label}</span>
                  </div>
                  <span className="text-xs" style={{ opacity: 0.7 }}>
                    {desc}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
              Voice and video modes currently use the text answer flow while the
              capture pipeline is being expanded.
            </p>
          </div>

          {/* Proctoring Toggle */}
          <div
            className="p-4 rounded-xl flex items-start gap-4"
            style={{
              background: proctoring
                ? "rgba(11,124,118,0.06)"
                : "var(--bg-elevated)",
              border: `1px solid ${proctoring ? "rgba(11,124,118,0.25)" : "var(--border)"}`,
            }}
          >
            <button
              onClick={() => setProctoring(!proctoring)}
              style={{
                width: 44,
                height: 24,
                borderRadius: 12,
                background: proctoring
                  ? "linear-gradient(120deg, #0b7c76, #0f766e)"
                  : "var(--bg-elevated)",
                border: `1px solid ${proctoring ? "rgba(11,124,118,0.4)" : "var(--border)"}`,
                cursor: "pointer",
                position: "relative",
                flexShrink: 0,
                transition: "all 0.2s ease",
              }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: proctoring ? "#fff" : "var(--text-muted)",
                  position: "absolute",
                  top: 2,
                  left: proctoring ? 22 : 3,
                  transition: "left 0.2s ease",
                }}
              />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck
                  size={14}
                  style={{
                    color: proctoring ? "var(--indigo)" : "var(--text-muted)",
                  }}
                />
                <span className="text-sm font-semibold">Focus Mode</span>
              </div>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                Enable webcam checks, fullscreen prompts, and attention signals
                if you want a more realistic practice environment. This is
                optional and only adds session-integrity insights to the final
                report.
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm" style={{ color: "#ef4444" }}>
              {error}
            </p>
          )}

          {/* Start Button */}
          <button
            id="start-interview-btn"
            className="btn-primary self-start flex items-center gap-2"
            onClick={handleStart}
            disabled={loading}
          >
            {loading ? (
              "Setting up interview…"
            ) : (
              <>
                Start Mock Interview <ChevronRight size={14} />
              </>
            )}
          </button>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {[
            {
              icon: LayoutTemplate,
              title: "Structured Interview Plan",
              desc: "Builds a role-aware mix of technical, system design, and behavioral questions.",
            },
            {
              icon: Target,
              title: "Role-Specific Questions",
              desc: "Questions adapt to your target role, difficulty, and optional resume context.",
            },
            {
              icon: BarChart3,
              title: "Coaching Feedback",
              desc: "Each answer gets rubric-based scoring, strengths, improvements, and model-answer guidance.",
            },
            {
              icon: Sparkles,
              title: "Practice-Focused Flow",
              desc: "Designed for self-evaluation and improvement instead of pass-fail screening.",
            },
            {
              icon: Camera,
              title: "Optional Focus Mode",
              desc: "Add webcam and attention tracking only if you want exam-style practice pressure.",
            },
            {
              icon: Eye,
              title: "Model Answers",
              desc: "Compare your response to a stronger answer pattern and next-step coaching tip.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass-card p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Icon size={16} style={{ color: "var(--indigo)" }} />
                <span className="font-medium text-sm">{title}</span>
              </div>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                {desc}
              </p>
            </div>
          ))}
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
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{
            background:
              "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(11,124,118,0.15))",
            border: "1px solid rgba(16,185,129,0.25)",
          }}
        >
          <Trophy size={28} style={{ color: "var(--emerald)" }} />
        </div>
        <h1 className="font-display font-bold text-3xl mb-2">
          Practice Session Complete
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Here&apos;s your coaching report for the{" "}
          <strong style={{ color: "var(--indigo)" }}>
            {session?.target_role}
          </strong>{" "}
          interview.
        </p>
        {session && (
          <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
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
          <div className="glass-card p-5 mb-6">
            <h3 className="font-semibold text-sm mb-3">Answer Scores</h3>
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
                    <div className="flex justify-between text-xs">
                      <span style={{ color: "var(--text-secondary)" }}>
                        {label}
                      </span>
                      <span className="font-semibold">{avg.toFixed(1)}/10</span>
                    </div>
                    <div
                      className="h-1.5 rounded-full"
                      style={{ background: "var(--bg-elevated)" }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${avg * 10}%`,
                          background:
                            "linear-gradient(90deg, var(--indigo), var(--violet))",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
              <div>
                <h4 className="font-medium text-sm mb-2">Session strengths</h4>
                {Array.from(
                  new Set(answerScores.flatMap((item) => item.strengths)),
                )
                  .slice(0, 4)
                  .map((item) => (
                    <p
                      key={item}
                      className="text-sm mb-1"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      ✓ {item}
                    </p>
                  ))}
              </div>
              <div>
                <h4 className="font-medium text-sm mb-2">
                  Next practice goals
                </h4>
                {Array.from(
                  new Set(answerScores.flatMap((item) => item.improvements)),
                )
                  .slice(0, 4)
                  .map((item) => (
                    <p
                      key={item}
                      className="text-sm mb-1"
                      style={{ color: "var(--text-secondary)" }}
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
