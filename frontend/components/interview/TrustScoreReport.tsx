"use client";
import { type Violation } from "./ProctorProvider";
import {
  Shield,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  MonitorOff,
  Clipboard,
  MousePointer,
  ArrowRightLeft,
  Expand,
  CameraOff,
  Users,
} from "lucide-react";

/* ─── Types ─── */
interface AnswerScore {
  score: number;
  overall_score: number;
  clarity_score: number;
  technical_score: number;
  depth_score: number;
  communication_score: number;
  problem_solving_score: number;
}

interface Props {
  trustScore: number;
  violations: Violation[];
  elapsed: number;
  cameraStatus: string;
  faceStatus?:
    | "checking"
    | "single_face"
    | "no_face"
    | "multiple_faces"
    | "misaligned"
    | "unsupported";
  fullscreenActive?: boolean;
  sessionRisk?: "low" | "medium" | "high";
  answerScores?: AnswerScore[];
  targetRole?: string;
}

/* ─── Helpers ─── */
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

const VIOLATION_ICONS: Record<string, typeof AlertTriangle> = {
  tab_switch: ArrowRightLeft,
  window_blur: MonitorOff,
  copy_attempt: Clipboard,
  paste_attempt: Clipboard,
  right_click: MousePointer,
  restricted_shortcut: Eye,
  fullscreen_exit: Expand,
  camera_lost: CameraOff,
  no_face_detected: Users,
  multiple_faces_detected: Users,
  face_misaligned: Eye,
};

function getVerdict(trust: number, avgScore: number) {
  const combined = trust * 0.4 + avgScore * 0.6;
  if (combined >= 80)
    return {
      text: "Interview Ready",
      color: "#98C9A3", // Emerald
      icon: CheckCircle,
    };
  if (combined >= 55)
    return {
      text: "Needs Improvement",
      color: "#7C9ADD", // Indigo
      icon: AlertTriangle,
    };
  return {
    text: "Not Ready Yet",
    color: "#E57373", // Red
    icon: ShieldAlert,
  };
}

/* ─── Component ─── */
export default function TrustScoreReport({
  trustScore,
  violations,
  elapsed,
  cameraStatus,
  faceStatus = "unsupported",
  fullscreenActive = false,
  sessionRisk = "low",
  answerScores = [],
  targetRole = "General",
}: Props) {
  const avgAnswerScore =
    answerScores.length > 0
      ? (answerScores.reduce((s, a) => s + a.score, 0) / answerScores.length) *
        10
      : 0;

  const verdict = getVerdict(trustScore, avgAnswerScore);
  const VerdictIcon = verdict.icon;

  /* Group violations by type */
  const violationGroups = violations.reduce(
    (acc, v) => {
      acc[v.type] = (acc[v.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const scoreColor =
    trustScore >= 80 ? "#98C9A3" : trustScore >= 50 ? "#7C9ADD" : "#E57373";
  const riskColor =
    sessionRisk === "low"
      ? "#98C9A3"
      : sessionRisk === "medium"
        ? "#7C9ADD"
        : "#E57373";
  const flaggedSignals = [
    cameraStatus !== "active" ? "Camera continuity was interrupted." : null,
    faceStatus === "no_face"
      ? "Candidate left the frame during the session."
      : null,
    faceStatus === "multiple_faces"
      ? "More than one face appeared on camera."
      : null,
    faceStatus === "misaligned"
      ? "Face framing suggested repeated attention drift."
      : null,
    !fullscreenActive
      ? "Fullscreen protection was not maintained throughout."
      : null,
    violationGroups.restricted_shortcut
      ? "Restricted shortcuts were attempted."
      : null,
  ].filter(Boolean) as string[];

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      {/* ── Verdict Banner ── */}
      <div
        className="glass-card p-6 flex flex-col items-center gap-3 text-center"
        style={{
          border: `1px solid ${verdict.color}33`,
        }}
      >
        <VerdictIcon size={32} style={{ color: verdict.color }} />
        <h2
          className="font-display font-bold text-2xl"
          style={{ color: verdict.color }}
        >
          {verdict.text}
        </h2>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Based on your practice-session focus signals and answer quality for
          the <strong>{targetRole}</strong> interview.
        </p>
      </div>

      {/* ── Score Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Trust Score */}
        <div className="glass-card p-5 flex flex-col items-center gap-3">
          <Shield size={20} style={{ color: scoreColor }} />
          <span
            className="text-xs font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Trust Score
          </span>
          {/* Ring */}
          <div style={{ position: "relative", width: 90, height: 90 }}>
            <svg width={90} height={90} viewBox="0 0 90 90">
              <circle
                cx={45}
                cy={45}
                r={38}
                fill="none"
                stroke="var(--bg-elevated)"
                strokeWidth={6}
              />
              <circle
                cx={45}
                cy={45}
                r={38}
                fill="none"
                stroke={scoreColor}
                strokeWidth={6}
                strokeLinecap="round"
                strokeDasharray={`${(trustScore / 100) * 238.76} 238.76`}
                transform="rotate(-90 45 45)"
                style={{ transition: "stroke-dasharray 0.6s ease" }}
              />
            </svg>
            <span
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 22,
                color: scoreColor,
              }}
            >
              {trustScore}
            </span>
          </div>
        </div>

        {/* Performance Score */}
        <div className="glass-card p-5 flex flex-col items-center gap-3">
          <CheckCircle size={20} style={{ color: "var(--indigo)" }} />
          <span
            className="text-xs font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Answer Quality
          </span>
          <div style={{ position: "relative", width: 90, height: 90 }}>
            <svg width={90} height={90} viewBox="0 0 90 90">
              <circle
                cx={45}
                cy={45}
                r={38}
                fill="none"
                stroke="var(--bg-elevated)"
                strokeWidth={6}
              />
              <circle
                cx={45}
                cy={45}
                r={38}
                fill="none"
                stroke="var(--indigo)"
                strokeWidth={6}
                strokeLinecap="round"
                strokeDasharray={`${(avgAnswerScore / 100) * 238.76} 238.76`}
                transform="rotate(-90 45 45)"
                style={{ transition: "stroke-dasharray 0.6s ease" }}
              />
            </svg>
            <span
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 22,
                color: "var(--indigo)",
              }}
            >
              {Math.round(avgAnswerScore)}
            </span>
          </div>
        </div>

        {/* Session Stats */}
        <div className="glass-card p-5 flex flex-col gap-3">
          <div
            className="flex items-center gap-2 text-xs font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            <Clock size={14} /> Session Stats
          </div>
          <div className="flex flex-col gap-2 flex-1 justify-center">
            {[
              { label: "Duration", value: formatTime(elapsed) },
              { label: "Questions", value: `${answerScores.length}` },
              { label: "Violations", value: `${violations.length}` },
              { label: "Session risk", value: sessionRisk.toUpperCase() },
              {
                label: "Camera",
                value: cameraStatus === "active" ? "✓ Active" : "✗ Off",
              },
              {
                label: "Face Check",
                value:
                  faceStatus === "single_face"
                    ? "✓ Verified"
                    : faceStatus === "misaligned"
                      ? "⚠ Drift"
                      : faceStatus === "checking"
                        ? "… Checking"
                        : faceStatus === "unsupported"
                          ? "Unavailable"
                          : "⚠ Attention",
              },
              {
                label: "Fullscreen",
                value: fullscreenActive ? "✓ Active" : "✗ Off",
              },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm">
                <span style={{ color: "var(--text-muted)" }}>{label}</span>
                <span className="font-semibold">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
          <Eye size={14} style={{ color: riskColor }} />
          Session Risk Analysis
        </h3>
        <div
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold mb-4"
          style={{
            background: `${riskColor}1a`,
            border: `1px solid ${riskColor}33`,
            color: riskColor,
          }}
        >
          {sessionRisk.toUpperCase()} RISK
        </div>
        {flaggedSignals.length > 0 ? (
          <div className="flex flex-col gap-2">
            {flaggedSignals.map((item) => (
              <p
                key={item}
                className="text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                {item}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            No elevated conduct patterns were detected beyond normal interview
            movement.
          </p>
        )}
      </div>

      {/* ── Violation Breakdown ── */}
      <div className="glass-card p-5">
        <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
          <AlertTriangle
            size={14}
            style={{
              color:
                violations.length > 0
                  ? "var(--color-red)"
                  : "var(--text-muted)",
            }}
          />
          Violation Breakdown
        </h3>
        {violations.length === 0 ? (
          <div
            className="flex items-center gap-2 text-sm p-3 rounded-lg"
            style={{
              background: "rgba(16,185,129,0.08)",
              color: "var(--emerald)",
            }}
          >
            <CheckCircle size={14} />
            No violations detected — excellent conduct!
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {Object.entries(violationGroups).map(([type, count]) => {
              const Icon = VIOLATION_ICONS[type] || AlertTriangle;
              return (
                <div
                  key={type}
                  className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-100"
                >
                  <div className="flex items-center gap-3">
                    <Icon size={14} className="text-red-600" />
                    <span className="text-sm font-medium">
                      {type
                        .replace(/_/g, "")
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                    ×{count}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Violation Timeline ── */}
      {violations.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <Eye size={14} style={{ color: "var(--text-muted)" }} />
            Violation Timeline
          </h3>
          <div className="flex flex-col gap-1 max-h-[200px] overflow-y-auto">
            {violations.map((v, i) => {
              const Icon = VIOLATION_ICONS[v.type] || AlertTriangle;
              const time = new Date(v.timestamp);
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm"
                  style={{
                    background:
                      i % 2 === 0 ? "rgba(0,0,0,0.02)" : "transparent",
                  }}
                >
                  <span
                    className="text-xs font-mono"
                    style={{ color: "var(--text-muted)", minWidth: 55 }}
                  >
                    {time.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                  <Icon size={12} style={{ color: "#ef4444" }} />
                  <span style={{ color: "var(--text-secondary)" }}>
                    {v.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Answer Breakdown ── */}
      {answerScores.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="font-semibold text-sm mb-4">Answer Score Breakdown</h3>
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
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
