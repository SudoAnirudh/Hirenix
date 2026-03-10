"use client";
import { useProctor } from "./ProctorProvider";
import {
  Shield,
  ShieldAlert,
  Clock,
  AlertTriangle,
  Eye,
  Expand,
  Users,
} from "lucide-react";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function ProctorToolbar() {
  const {
    trustScore,
    violations,
    elapsed,
    cameraStatus,
    faceStatus,
    sessionRisk,
    fullscreenActive,
    requestFullscreen,
  } = useProctor();

  const scoreColor =
    trustScore >= 80
      ? "var(--emerald)"
      : trustScore >= 50
        ? "#eab308"
        : "#ef4444";

  const ScoreIcon = trustScore >= 80 ? Shield : ShieldAlert;
  const faceLabel =
    faceStatus === "single_face"
      ? "Candidate verified"
      : faceStatus === "no_face"
        ? "Face missing"
        : faceStatus === "multiple_faces"
          ? "Multiple faces"
          : faceStatus === "misaligned"
            ? "Attention drift"
            : faceStatus === "checking"
              ? "Checking face"
              : "Face check unavailable";
  const faceColor =
    faceStatus === "single_face"
      ? "var(--emerald)"
      : faceStatus === "unsupported" || faceStatus === "checking"
        ? "var(--text-muted)"
        : "#ef4444";
  const riskColor =
    sessionRisk === "low"
      ? "var(--emerald)"
      : sessionRisk === "medium"
        ? "#eab308"
        : "#ef4444";

  return (
    <div
      className="glass-card"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "10px 18px",
        borderRadius: "var(--radius-md)",
        marginBottom: 16,
        flexWrap: "wrap",
      }}
    >
      {/* Timer */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Clock size={14} style={{ color: "var(--text-muted)" }} />
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            fontFamily: "monospace",
            color: "var(--text-primary)",
          }}
        >
          {formatTime(elapsed)}
        </span>
      </div>

      {/* Divider */}
      <div
        style={{
          width: 1,
          height: 20,
          background: "var(--border)",
        }}
      />

      {/* Trust Score */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <ScoreIcon size={14} style={{ color: scoreColor }} />
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: scoreColor,
          }}
        >
          Trust Score
        </span>
        <span
          style={{
            fontSize: 13,
            fontWeight: 800,
            color: scoreColor,
            background: `${scoreColor}1a`,
            padding: "2px 10px",
            borderRadius: 20,
            border: `1px solid ${scoreColor}33`,
          }}
        >
          {trustScore}
        </span>
      </div>

      {/* Divider */}
      <div
        style={{
          width: 1,
          height: 20,
          background: "var(--border)",
        }}
      />

      {/* Violations */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <AlertTriangle
          size={14}
          style={{
            color: violations.length > 0 ? "#ef4444" : "var(--text-muted)",
          }}
        />
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: violations.length > 0 ? "#ef4444" : "var(--text-muted)",
          }}
        >
          {violations.length} violation{violations.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Divider */}
      <div
        style={{
          width: 1,
          height: 20,
          background: "var(--border)",
        }}
      />

      {/* Webcam status */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Eye
          size={14}
          style={{
            color: cameraStatus === "active" ? "var(--indigo)" : "#ef4444",
          }}
        />
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: cameraStatus === "active" ? "var(--indigo)" : "#ef4444",
          }}
        >
          {cameraStatus === "active" ? "Monitored" : "No Camera"}
        </span>
      </div>

      <div
        style={{
          width: 1,
          height: 20,
          background: "var(--border)",
        }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Users size={14} style={{ color: faceColor }} />
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: faceColor,
          }}
        >
          {faceLabel}
        </span>
      </div>

      <div
        style={{
          width: 1,
          height: 20,
          background: "var(--border)",
        }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <AlertTriangle size={14} style={{ color: riskColor }} />
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: riskColor,
            textTransform: "uppercase",
          }}
        >
          {sessionRisk} risk
        </span>
      </div>

      {!fullscreenActive && (
        <button
          type="button"
          onClick={() => void requestFullscreen()}
          className="inline-flex items-center gap-2"
          style={{
            marginLeft: "auto",
            borderRadius: 999,
            border: "1px solid rgba(11,124,118,0.24)",
            background: "rgba(11,124,118,0.1)",
            color: "var(--indigo)",
            padding: "6px 10px",
            fontSize: 11,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          <Expand size={12} />
          Secure fullscreen
        </button>
      )}

      {/* Live indicator */}
      <div
        style={{
          marginLeft: fullscreenActive ? "auto" : 0,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#ef4444",
            animation: "pulse-glow 1.5s ease-in-out infinite",
          }}
        />
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 1,
            color: "#ef4444",
            textTransform: "uppercase",
          }}
        >
          Live
        </span>
      </div>
    </div>
  );
}
