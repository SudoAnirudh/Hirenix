"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Sun,
  Wifi,
  Users,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { getBaseUrl } from "@/lib/api";

/* ─── Types ─── */
type CheckStatus = "pending" | "running" | "pass" | "fail" | "warn";

interface CheckResult {
  status: CheckStatus;
  label: string;
  detail?: string;
}

interface PreInterviewChecksProps {
  onReady: (stream: MediaStream) => void;
  onBack: () => void;
}

/* ─── Helpers ─── */
function statusIcon(status: CheckStatus) {
  switch (status) {
    case "pass":
      return <CheckCircle size={18} className="text-[#98C9A3]" />;
    case "fail":
      return <XCircle size={18} className="text-[#F87171]" />;
    case "warn":
      return <AlertTriangle size={18} className="text-[#7C9ADD]" />;
    case "running":
      return <Loader2 size={18} className="text-[#7C9ADD] animate-spin" />;
    default:
      return (
        <div className="w-[18px] h-[18px] rounded-full border-2 border-slate-200" />
      );
  }
}

function statusColor(status: CheckStatus) {
  if (status === "pass") return "#98C9A3";
  if (status === "fail") return "#F87171";
  if (status === "warn") return "#7C9ADD";
  if (status === "running") return "#7C9ADD";
  return "#94A3B8";
}

type FaceDetectorInstance = {
  detect: (
    input: ImageBitmapSource,
  ) => Promise<Array<{ boundingBox?: DOMRectReadOnly }>>;
};

declare global {
  interface Window {
    FaceDetector?: new (options?: {
      fastMode?: boolean;
      maxDetectedFaces?: number;
    }) => FaceDetectorInstance;
  }
}

/* ─── Component ─── */
export default function PreInterviewChecks({
  onReady,
  onBack,
}: PreInterviewChecksProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const [camera, setCamera] = useState<CheckResult>({
    status: "pending",
    label: "Camera Access",
  });
  const [microphone, setMicrophone] = useState<CheckResult>({
    status: "pending",
    label: "Microphone Access",
  });
  const [faceCheck, setFaceCheck] = useState<CheckResult>({
    status: "pending",
    label: "Face Detection",
  });
  const [lighting, setLighting] = useState<CheckResult>({
    status: "pending",
    label: "Lighting Quality",
  });
  const [internet, setInternet] = useState<CheckResult>({
    status: "pending",
    label: "Internet Speed",
  });
  const [micLevel, setMicLevel] = useState(0);
  const [allChecksRun, setAllChecksRun] = useState(false);

  /* ── Camera check ── */
  const runCameraCheck = useCallback(async () => {
    setCamera({
      status: "running",
      label: "Camera Access",
      detail: "Requesting camera…",
    });
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
        audio: false,
      });
      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCamera({
        status: "pass",
        label: "Camera Access",
        detail: "Camera is working",
      });
      return mediaStream;
    } catch {
      setCamera({
        status: "fail",
        label: "Camera Access",
        detail: "Camera access denied or unavailable",
      });
      return null;
    }
  }, []);

  /* ── Microphone check ── */
  const runMicCheck = useCallback(async () => {
    setMicrophone({
      status: "running",
      label: "Microphone Access",
      detail: "Requesting microphone…",
    });
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(audioStream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let detected = false;

      const checkInterval = setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        const normalized = Math.min(avg / 80, 1);
        setMicLevel(normalized);
        if (normalized > 0.05 && !detected) {
          detected = true;
        }
      }, 100);

      // Give 3 seconds to detect audio
      await new Promise((r) => setTimeout(r, 3000));
      clearInterval(checkInterval);

      // Merge audio tracks into the video stream for later use
      if (streamRef.current) {
        audioStream.getAudioTracks().forEach((track) => {
          streamRef.current!.addTrack(track);
        });
      }

      setMicrophone({
        status: "pass",
        label: "Microphone Access",
        detail: detected
          ? "Microphone working — audio detected"
          : "Microphone connected (speak to test)",
      });
    } catch {
      setMicrophone({
        status: "fail",
        label: "Microphone Access",
        detail: "Microphone access denied or unavailable",
      });
    }
  }, []);

  /* ── Face detection check ── */
  const runFaceCheck = useCallback(async () => {
    setFaceCheck({
      status: "running",
      label: "Face Detection",
      detail: "Looking for your face…",
    });

    if (!window.FaceDetector) {
      setFaceCheck({
        status: "warn",
        label: "Face Detection",
        detail: "Standard mode active — optimized for current browser",
      });
      return;
    }

    if (!videoRef.current || !streamRef.current) {
      setFaceCheck({
        status: "fail",
        label: "Face Detection",
        detail: "Camera must be active first",
      });
      return;
    }

    try {
      const detector = new window.FaceDetector({
        fastMode: true,
        maxDetectedFaces: 3,
      });

      // Wait for video to be ready
      await new Promise((r) => setTimeout(r, 1000));

      const faces = await detector.detect(videoRef.current!);

      if (faces.length === 0) {
        setFaceCheck({
          status: "fail",
          label: "Face Detection",
          detail: "No face detected — position yourself in front of the camera",
        });
      } else if (faces.length === 1) {
        // Check face alignment
        const face = faces[0];
        const frameW = videoRef.current!.videoWidth || 1;
        const frameH = videoRef.current!.videoHeight || 1;
        const box = face.boundingBox;
        if (box) {
          const centerX = (box.x + box.width / 2) / frameW;
          const centerY = (box.y + box.height / 2) / frameH;
          const wellCentered =
            centerX > 0.25 && centerX < 0.75 && centerY > 0.2 && centerY < 0.8;
          setFaceCheck({
            status: wellCentered ? "pass" : "warn",
            label: "Face Detection",
            detail: wellCentered
              ? "Face detected and well-aligned ✓"
              : "Face detected but not well-centered — adjust your position",
          });
        } else {
          setFaceCheck({
            status: "pass",
            label: "Face Detection",
            detail: "Face detected ✓",
          });
        }
      } else {
        setFaceCheck({
          status: "fail",
          label: "Face Detection",
          detail: `${faces.length} faces detected — only one person should be visible`,
        });
      }
    } catch {
      setFaceCheck({
        status: "warn",
        label: "Face Detection",
        detail: "Face detection unavailable in this browser",
      });
    }
  }, []);

  /* ── Lighting check ── */
  const runLightingCheck = useCallback(async () => {
    setLighting({
      status: "running",
      label: "Lighting Quality",
      detail: "Analyzing lighting…",
    });

    if (!videoRef.current || !canvasRef.current) {
      setLighting({
        status: "warn",
        label: "Lighting Quality",
        detail: "Camera must be active first",
      });
      return;
    }

    await new Promise((r) => setTimeout(r, 500));

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setLighting({
        status: "warn",
        label: "Lighting Quality",
        detail: "Could not analyze lighting",
      });
      return;
    }

    canvas.width = video.videoWidth || 320;
    canvas.height = video.videoHeight || 240;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    let totalBrightness = 0;

    for (let i = 0; i < data.length; i += 4) {
      // Perceived luminance
      totalBrightness +=
        0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    }

    const avgBrightness = totalBrightness / (data.length / 4);

    if (avgBrightness < 40) {
      setLighting({
        status: "fail",
        label: "Lighting Quality",
        detail: "Too dark — improve your lighting",
      });
    } else if (avgBrightness < 80) {
      setLighting({
        status: "warn",
        label: "Lighting Quality",
        detail: "Lighting is dim — consider adding more light",
      });
    } else if (avgBrightness > 220) {
      setLighting({
        status: "warn",
        label: "Lighting Quality",
        detail: "Lighting is very bright — reduce glare if possible",
      });
    } else {
      setLighting({
        status: "pass",
        label: "Lighting Quality",
        detail: "Lighting conditions are good ✓",
      });
    }
  }, []);

  /* ── Internet check ── */
  const runInternetCheck = useCallback(async () => {
    setInternet({
      status: "running",
      label: "Internet Speed",
      detail: "Testing connection…",
    });

    try {
      const start = performance.now();
      await fetch(`${getBaseUrl()}/health`, { cache: "no-store" });
      const duration = performance.now() - start;

      if (duration < 500) {
        setInternet({
          status: "pass",
          label: "Internet Speed",
          detail: `Connection good — ${Math.round(duration)}ms latency`,
        });
      } else if (duration < 2000) {
        setInternet({
          status: "warn",
          label: "Internet Speed",
          detail: `Connection slow — ${Math.round(duration)}ms latency`,
        });
      } else {
        setInternet({
          status: "warn",
          label: "Internet Speed",
          detail: `High latency — ${Math.round(duration)}ms`,
        });
      }
    } catch {
      setInternet({
        status: "fail",
        label: "Internet Speed",
        detail: "Could not reach backend server",
      });
    }
  }, []);

  /* ── Run all checks sequentially ── */
  useEffect(() => {
    let cancelled = false;

    async function runAll() {
      await runCameraCheck();
      if (cancelled) return;

      // Small pause between checks for visual progression
      await new Promise((r) => setTimeout(r, 300));
      await runMicCheck();
      if (cancelled) return;

      await new Promise((r) => setTimeout(r, 300));
      await runFaceCheck();
      if (cancelled) return;

      await new Promise((r) => setTimeout(r, 300));
      await runLightingCheck();
      if (cancelled) return;

      await new Promise((r) => setTimeout(r, 300));
      await runInternetCheck();
      if (cancelled) return;

      setAllChecksRun(true);
    }

    void runAll();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Cleanup on unmount ── */
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        void audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const checks = [camera, microphone, faceCheck, lighting, internet];
  const mandatoryPassed =
    camera.status === "pass" &&
    (microphone.status === "pass" || microphone.status === "warn") &&
    faceCheck.status !== "fail" &&
    lighting.status !== "fail" &&
    internet.status !== "fail";
  const canProceed = allChecksRun && mandatoryPassed;

  function handleProceed() {
    if (streamRef.current) {
      onReady(streamRef.current);
    }
  }

  return (
    <div className="animate-fade-up max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-3">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#7C9ADD]/10 border border-[#7C9ADD]/20 shadow-glass">
          <ShieldCheck size={24} className="text-[#7C9ADD]" />
        </div>
        <div>
          <h1 className="font-display font-bold text-3xl text-[#2D3748] tracking-tight">
            System Check
          </h1>
          <p className="text-sm font-medium text-[#718096]">
            Verifying your studio environment
          </p>
        </div>
      </div>

      <p className="text-[#4A5568] mb-8 leading-relaxed max-w-lg">
        We&apos;ll quickly verify your studio setup to ensure a high-quality,
        proctored session.
      </p>

      {/* Main layout: Video + Checks */}
      <div className="flex gap-5" style={{ alignItems: "flex-start" }}>
        {/* Video preview */}
        <div className="glass-card w-[340px] overflow-hidden shrink-0 relative rounded-[32px] bg-white/40 backdrop-blur-xl border border-white shadow-glass">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-[240px] object-cover block scale-x-[-1] bg-[#1a1a1a]"
          />
          {/* Face alignment guide overlay */}
          <div className="absolute inset-0 h-[240px] flex items-center justify-center pointer-events-none">
            <div className="w-[140px] h-[180px] border-2 border-dashed border-[#7C9ADD]/30 rounded-full" />
          </div>

          {/* Camera status badge */}
          <div
            className={`px-4 py-3 flex items-center gap-2 ${
              camera.status === "pass" ? "bg-[#98C9A3]/10" : "bg-red-500/5"
            }`}
          >
            {camera.status === "pass" ? (
              <Camera size={14} className="text-[#98C9A3]" />
            ) : (
              <CameraOff size={14} className="text-[#F87171]" />
            )}
            <span
              className={`text-xs font-bold leading-none ${
                camera.status === "pass" ? "text-[#98C9A3]" : "text-[#F87171]"
              }`}
            >
              {camera.status === "pass" ? "Camera Active" : "Camera Pending"}
            </span>
          </div>

          {/* Mic level bar */}
          <div className="px-4 py-3 border-t border-[#7C9ADD]/10">
            <div className="flex items-center gap-2 mb-2">
              <Mic
                size={14}
                className={
                  microphone.status === "pass"
                    ? "text-[#7C9ADD]"
                    : "text-slate-300"
                }
              />
              <span className="text-xs font-bold text-[#718096]">
                Audio Feedback
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-100"
                style={{
                  width: `${micLevel * 100}%`,
                  background:
                    micLevel > 0.6
                      ? "#F87171"
                      : micLevel > 0.3
                        ? "#FBBF24"
                        : "#98C9A3",
                }}
              />
            </div>
          </div>
        </div>

        {/* Hidden canvas for lighting analysis */}
        <canvas ref={canvasRef} style={{ display: "none" }} />

        {/* Check cards */}
        <div className="flex-1 flex flex-col gap-3">
          {checks.map((check, i) => {
            const icons = [Camera, Mic, Users, Sun, Wifi];
            const Icon = icons[i];
            const color = statusColor(check.status);
            return (
              <div
                key={check.label}
                className={`glass-card p-4 flex items-center gap-4 rounded-[24px] bg-white/60 border border-white/60 shadow-glass transition-all duration-300 ${
                  check.status === "running"
                    ? "ring-2 ring-[#7C9ADD]/20 scale-[1.02]"
                    : ""
                }`}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${color}15` }}
                >
                  <Icon size={18} style={{ color: color }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-bold text-[#2D3748]">
                      {check.label}
                    </span>
                    {statusIcon(check.status)}
                  </div>
                  {check.detail && (
                    <span
                      className="text-[11px] font-medium block truncate"
                      style={{ color: color }}
                    >
                      {check.detail}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between gap-4 mt-10">
        <button
          className="px-8 py-3.5 rounded-full text-sm font-bold text-[#718096] hover:bg-slate-100 transition-all active:scale-95"
          onClick={onBack}
        >
          Return to Setup
        </button>

        <button
          className={`px-10 py-3.5 rounded-full flex items-center gap-2 text-sm font-bold transition-all active:scale-95 ${
            canProceed
              ? "bg-[#7C9ADD] text-white shadow-lg shadow-[#7C9ADD]/20 hover:shadow-xl hover:-translate-y-0.5"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
          onClick={handleProceed}
          disabled={!canProceed}
        >
          {allChecksRun ? (
            <>
              Enter Studio <ChevronRight size={16} />
            </>
          ) : (
            <>
              <Loader2 size={16} className="animate-spin" />
              Running Studio Setup…
            </>
          )}
        </button>
      </div>

      {/* Warning if checks failed */}
      {allChecksRun && !mandatoryPassed && (
        <div className="glass-card p-5 mt-6 flex items-start gap-4 rounded-[24px] border-[#F87171]/20 bg-[#F87171]/5">
          <AlertTriangle size={20} className="text-[#F87171] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-[#F87171] mb-1">
              Configuration required
            </p>
            <p className="text-xs text-[#718096] leading-relaxed">
              Please fix the issues highlighted above. A stable camera
              connection is required for proctored sessions.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
