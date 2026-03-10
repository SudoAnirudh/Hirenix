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
  MonitorOff,
  Clipboard,
  Eye,
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

/* ─── Types ─── */
interface Question {
  question_id: string;
  question: string;
  category: string;
  difficulty: string;
}

interface Session {
  session_id: string;
  target_role: string;
  questions: Question[];
}

interface AnswerScore {
  score: number;
  clarity_score: number;
  technical_score: number;
  depth_score: number;
  communication_score: number;
}

type Phase = "setup" | "preflight" | "interview" | "report";

/* ═══════════════════════════════════════════════════════════
   Inner interview view — lives inside ProctorProvider
   ═══════════════════════════════════════════════════════════ */
function InterviewView({
  session,
  difficulty,
  onComplete,
}: {
  session: Session;
  difficulty: string;
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
          <h1 className="font-display font-bold text-2xl">
            AI-Proctored Interview
          </h1>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            {session.target_role} · {session.questions.length} questions ·{" "}
            {difficulty}
          </p>
        </div>
      </div>

      {/* Main layout: Questions + Webcam side-by-side */}
      <div className="flex gap-5" style={{ alignItems: "flex-start" }}>
        {/* Questions */}
        <div className="flex-1 min-w-0">
          <InterviewPanel
            session={session}
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
  const [difficulty, setDifficulty] = useState("medium");
  const [numQuestions, setNumQuestions] = useState(5);
  const [resumeId, setResumeId] = useState("");
  const [proctoring, setProctoring] = useState(true);
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
    if (!resumeId.trim()) {
      setError(
        "Please enter a Resume ID. Upload your resume first in the Resume Analysis page.",
      );
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = (await startInterview(
        resumeId.trim(),
        role,
        difficulty,
        numQuestions,
      )) as Session;
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
              AI-Proctored Interview
            </h1>
          </div>
        </div>
        <p className="mb-8" style={{ color: "var(--text-secondary)" }}>
          Simulate a real AI-proctored assessment with webcam monitoring,
          tab-switch detection, and conduct scoring — just like HackerRank or
          top-tier hiring platforms.
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
              Upload your resume in the Resume Analysis page first to get an ID.
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
                <span className="text-sm font-semibold">AI Proctoring</span>
              </div>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                Enable webcam monitoring, fullscreen integrity checks,
                face-presence detection, attention-drift checks, restricted
                shortcut blocking, and Trust Score tracking to simulate a real
                proctored assessment.
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
                Start Proctored Interview <ChevronRight size={14} />
              </>
            )}
          </button>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {[
            {
              icon: Camera,
              title: "Webcam Monitoring",
              desc: "Live camera feed with recording indicators and camera interruption alerts.",
            },
            {
              icon: MonitorOff,
              title: "Session Integrity",
              desc: "Tracks tab switches, focus loss, fullscreen exits, and restricted browser shortcuts.",
            },
            {
              icon: Clipboard,
              title: "Copy/Paste Blocking",
              desc: "Clipboard operations are blocked and logged as violations.",
            },
            {
              icon: Eye,
              title: "Attention & Risk Signals",
              desc: "Detects face absence, multiple faces, off-frame attention drift, and rolls them into a live risk level.",
            },
            {
              icon: Target,
              title: "Role-Specific Questions",
              desc: "Questions tailored to your target role and resume context.",
            },
            {
              icon: BarChart3,
              title: "Scored Feedback",
              desc: "Clarity, technical depth, communication scores for every answer.",
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
          difficulty={difficulty}
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
          Interview Complete
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Here&apos;s your detailed performance and conduct report for the{" "}
          <strong style={{ color: "var(--indigo)" }}>
            {session?.target_role}
          </strong>{" "}
          interview.
        </p>
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
