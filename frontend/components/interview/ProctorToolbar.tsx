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
    trustScore >= 80 ? "#98C9A3" : trustScore >= 50 ? "#EAB308" : "#F28C8C";

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
      ? "#98C9A3"
      : faceStatus === "unsupported" || faceStatus === "checking"
        ? "#A0AEC0"
        : "#F28C8C";
  const riskColor =
    sessionRisk === "low"
      ? "#98C9A3"
      : sessionRisk === "medium"
        ? "#EAB308"
        : "#F28C8C";

  return (
    <div className="glass-card flex items-center gap-6 px-6 py-3 rounded-[24px] mb-6 flex-wrap bg-white/40 border-white/60 shadow-glass backdrop-blur-xl">
      {/* Timer */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/50 border border-white/80 shrink-0">
        <Clock size={14} className="text-[#7C9ADD]" />
        <span className="text-sm font-bold font-mono text-[#2D3748] tracking-tight">
          {formatTime(elapsed)}
        </span>
      </div>

      <div className="w-px h-6 bg-[#E2E8F0]" />

      {/* Trust Score */}
      <div className="flex items-center gap-3">
        <div className="p-1.5 rounded-lg bg-white shadow-sm border border-white/80">
          <ScoreIcon size={16} style={{ color: scoreColor }} />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#A0AEC0]">
            Trust Score
          </span>
          <span
            className="text-lg font-display font-bold leading-none"
            style={{ color: scoreColor }}
          >
            {trustScore}
          </span>
        </div>
      </div>

      <div className="w-px h-6 bg-[#E2E8F0]" />

      {/* Violations */}
      <div className="flex items-center gap-2 group">
        <AlertTriangle
          size={16}
          className={`transition-colors ${violations.length > 0 ? "text-[#F28C8C]" : "text-[#A0AEC0]"}`}
        />
        <span
          className={`text-[10px] font-bold uppercase tracking-widest ${violations.length > 0 ? "text-[#F28C8C]" : "text-[#A0AEC0]"}`}
        >
          {violations.length} violation{violations.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="ml-auto flex items-center gap-6">
        {/* Status Indicators */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Eye
              size={14}
              className={
                cameraStatus === "active" ? "text-[#7C9ADD]" : "text-[#F28C8C]"
              }
            />
            <span
              className={`text-[10px] font-bold uppercase tracking-widest ${cameraStatus === "active" ? "text-[#7C9ADD]" : "text-[#F28C8C]"}`}
            >
              {cameraStatus === "active" ? "Active" : "Offline"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={14} style={{ color: faceColor }} />
            <span
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: faceColor }}
            >
              {faceStatus === "single_face" ? "Verified" : faceLabel}
            </span>
          </div>
        </div>

        {!fullscreenActive && (
          <button
            type="button"
            onClick={() => void requestFullscreen()}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#7C9ADD]/10 border border-[#7C9ADD]/20 text-[#7C9ADD] text-[10px] font-bold uppercase tracking-widest hover:bg-[#7C9ADD]/20 transition-all active:scale-95"
          >
            <Expand size={12} />
            Secure Fullscreen
          </button>
        )}

        {/* Live Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F28C8C]/5 border border-[#F28C8C]/10 shrink-0">
          <div className="w-2 h-2 rounded-full bg-[#F28C8C] animate-pulse shadow-[0_0_8px_rgba(242,140,140,0.5)]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F28C8C]">
            Live
          </span>
        </div>
      </div>
    </div>
  );
}
