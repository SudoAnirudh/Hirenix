"use client";
import { useEffect, useRef } from "react";
import { useProctor } from "./ProctorProvider";
import { Camera, CameraOff, AlertTriangle, Users } from "lucide-react";

export default function WebcamMonitor() {
  const { stream, cameraStatus, violations, faceStatus, sessionRisk } =
    useProctor();
  const videoRef = useRef<HTMLVideoElement>(null);

  /* Attach stream to video element */
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const latestViolation = violations[violations.length - 1];
  const faceBadge = {
    label:
      faceStatus === "single_face"
        ? "Single face"
        : faceStatus === "no_face"
          ? "Face missing"
          : faceStatus === "multiple_faces"
            ? "Multiple faces"
            : faceStatus === "misaligned"
              ? "Attention drift"
              : faceStatus === "checking"
                ? "Checking"
                : "Unavailable",
    color:
      faceStatus === "single_face"
        ? "var(--emerald)"
        : faceStatus === "unsupported" || faceStatus === "checking"
          ? "var(--text-muted)"
          : "#ef4444",
  };
  const riskColor =
    sessionRisk === "low"
      ? "var(--emerald)"
      : sessionRisk === "medium"
        ? "#eab308"
        : "#ef4444";

  return (
    <div
      style={{
        width: 200,
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        border: `2px solid ${cameraStatus === "active" ? "rgba(11,124,118,0.4)" : "rgba(220,38,38,0.4)"}`,
        background: "#1a1a1a",
        position: "relative",
        flexShrink: 0,
      }}
    >
      {/* Video feed or fallback */}
      {cameraStatus === "active" ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: "100%",
            height: 150,
            objectFit: "cover",
            display: "block",
            transform: "scaleX(-1)",
          }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: 150,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <CameraOff size={24} style={{ color: "#ef4444" }} />
          <span style={{ color: "#ef4444", fontSize: 11, fontWeight: 600 }}>
            {cameraStatus === "denied" ? "Camera Denied" : "No Camera"}
          </span>
        </div>
      )}

      {/* Recording indicator */}
      {cameraStatus === "active" && (
        <div
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            display: "flex",
            alignItems: "center",
            gap: 4,
            background: "rgba(0,0,0,0.6)",
            borderRadius: 20,
            padding: "3px 8px",
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
              color: "#fff",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: 0.5,
            }}
          >
            REC
          </span>
        </div>
      )}

      {/* Status bar */}
      <div
        style={{
          padding: "6px 10px",
          display: "flex",
          alignItems: "center",
          gap: 6,
          background:
            cameraStatus === "active"
              ? "rgba(11,124,118,0.12)"
              : "rgba(220,38,38,0.12)",
        }}
      >
        <Camera
          size={12}
          style={{
            color: cameraStatus === "active" ? "var(--indigo)" : "#ef4444",
          }}
        />
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: cameraStatus === "active" ? "var(--indigo)" : "#ef4444",
          }}
        >
          {cameraStatus === "active" ? "Camera Active" : "Camera Off"}
        </span>
      </div>

      <div
        style={{
          padding: "6px 10px",
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "rgba(255,255,255,0.04)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Users size={12} style={{ color: faceBadge.color }} />
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: faceBadge.color,
          }}
        >
          {faceBadge.label}
        </span>
      </div>

      <div
        style={{
          padding: "6px 10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(255,255,255,0.03)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <span
          style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)" }}
        >
          Session risk
        </span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: riskColor,
            textTransform: "uppercase",
          }}
        >
          {sessionRisk}
        </span>
      </div>

      {/* Violation warning overlay */}
      {latestViolation && (
        <div
          key={latestViolation.timestamp}
          style={{
            position: "absolute",
            bottom: 32,
            left: 0,
            right: 0,
            padding: "6px 8px",
            background: "rgba(220,38,38,0.9)",
            display: "flex",
            alignItems: "center",
            gap: 6,
            animation: "fadeUp 0.2s ease",
          }}
        >
          <AlertTriangle size={12} style={{ color: "#fff" }} />
          <span style={{ color: "#fff", fontSize: 10, fontWeight: 600 }}>
            {latestViolation.label}
          </span>
        </div>
      )}
    </div>
  );
}
