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
        ? "#98C9A3"
        : faceStatus === "unsupported" || faceStatus === "checking"
          ? "#A0AEC0"
          : "#F28C8C",
  };
  const riskColor =
    sessionRisk === "low"
      ? "#98C9A3"
      : sessionRisk === "medium"
        ? "#EAB308"
        : "#F28C8C";

  return (
    <div className="w-[240px] rounded-[32px] overflow-hidden border-2 transition-all duration-500 relative shrink-0 bg-white/40 border-white/60 shadow-glass backdrop-blur-xl group">
      {/* Video feed or fallback */}
      <div className="relative aspect-video overflow-hidden rounded-[24px] m-2 shadow-inner border border-[#7C9ADD]/10">
        {cameraStatus === "active" ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-white/20">
            <div className="p-3 rounded-2xl bg-white/50 border border-white/80 text-[#F28C8C]">
              <CameraOff size={24} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#F28C8C]">
              {cameraStatus === "denied" ? "Camera Denied" : "No Feed"}
            </span>
          </div>
        )}

        {/* Recording indicator */}
        {cameraStatus === "active" && (
          <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/20 backdrop-blur-md border border-white/20">
            <div className="w-1.5 h-1.5 rounded-full bg-[#F28C8C] animate-pulse" />
            <span className="text-[9px] font-bold text-white tracking-widest">
              REC
            </span>
          </div>
        )}

        {/* Violation warning overlay */}
        {latestViolation && (
          <div
            key={latestViolation.timestamp}
            className="absolute inset-x-0 bottom-0 p-4 bg-[#F28C8C]/80 backdrop-blur-md flex items-center gap-3 animate-slide-up"
          >
            <AlertTriangle size={14} className="text-white shrink-0" />
            <span className="text-[10px] font-bold text-white leading-tight">
              {latestViolation.label}
            </span>
          </div>
        )}
      </div>

      {/* Status Badges */}
      <div className="px-4 pb-4 space-y-2">
        <div className="flex items-center justify-between p-2 rounded-2xl bg-white/50 border border-white/80">
          <div className="flex items-center gap-2">
            <Camera
              size={12}
              className={
                cameraStatus === "active" ? "text-[#7C9ADD]" : "text-[#F28C8C]"
              }
            />
            <span
              className={`text-[10px] font-bold uppercase tracking-tighter ${cameraStatus === "active" ? "text-[#7C9ADD]" : "text-[#F28C8C]"}`}
            >
              Camera
            </span>
          </div>
          <span className="text-[10px] font-bold text-[#2D3748]">
            {cameraStatus === "active" ? "Active" : "Offline"}
          </span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-2xl bg-white/50 border border-white/80">
          <div className="flex items-center gap-2">
            <Users size={12} style={{ color: faceBadge.color }} />
            <span
              className="text-[10px] font-bold uppercase tracking-tighter"
              style={{ color: faceBadge.color }}
            >
              Biometrics
            </span>
          </div>
          <span className="text-[10px] font-bold text-[#2D3748]">
            {faceBadge.label}
          </span>
        </div>

        <div className="flex items-center justify-between px-2 pt-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#A0AEC0]">
            Risk Level
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full bg-[#7C9ADD]/10 text-[#7C9ADD] border border-[#7C9ADD]/10">
            {sessionRisk}
          </span>
        </div>
      </div>
    </div>
  );
}
