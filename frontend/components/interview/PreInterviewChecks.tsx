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
      return <CheckCircle size={18} style={{ color: "var(--emerald)" }} />;
    case "fail":
      return <XCircle size={18} style={{ color: "#ef4444" }} />;
    case "warn":
      return <AlertTriangle size={18} style={{ color: "#eab308" }} />;
    case "running":
      return (
        <Loader2
          size={18}
          style={{
            color: "var(--indigo)",
            animation: "spin 1s linear infinite",
          }}
        />
      );
    default:
      return (
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            border: "2px solid var(--border)",
          }}
        />
      );
  }
}

function statusColor(status: CheckStatus) {
  if (status === "pass") return "var(--emerald)";
  if (status === "fail") return "#ef4444";
  if (status === "warn") return "#eab308";
  if (status === "running") return "var(--indigo)";
  return "var(--text-muted)";
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
        detail: "Browser doesn't support native face detection — will skip",
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
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background:
              "linear-gradient(135deg, rgba(11,124,118,0.15), rgba(221,107,32,0.15))",
            border: "1px solid rgba(11,124,118,0.25)",
          }}
        >
          <ShieldCheck size={20} style={{ color: "var(--indigo)" }} />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl">
            Pre-Interview System Check
          </h1>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Verifying your setup before the proctored interview begins
          </p>
        </div>
      </div>

      <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
        We need to verify your camera, microphone, lighting, and internet
        connection. Ensure you&apos;re in a well-lit, quiet environment with
        your face clearly visible.
      </p>

      {/* Main layout: Video + Checks */}
      <div className="flex gap-5" style={{ alignItems: "flex-start" }}>
        {/* Video preview */}
        <div
          className="glass-card"
          style={{
            width: 320,
            overflow: "hidden",
            flexShrink: 0,
            position: "relative",
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: "100%",
              height: 240,
              objectFit: "cover",
              display: "block",
              transform: "scaleX(-1)",
              background: "#1a1a1a",
            }}
          />
          {/* Face alignment guide overlay */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: 240,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                width: 120,
                height: 160,
                border: "2px dashed rgba(11,124,118,0.4)",
                borderRadius: "50%",
              }}
            />
          </div>

          {/* Camera status badge */}
          <div
            style={{
              padding: "8px 12px",
              display: "flex",
              alignItems: "center",
              gap: 6,
              background:
                camera.status === "pass"
                  ? "rgba(21,128,61,0.08)"
                  : "rgba(239,68,68,0.08)",
            }}
          >
            {camera.status === "pass" ? (
              <Camera size={12} style={{ color: "var(--emerald)" }} />
            ) : (
              <CameraOff size={12} style={{ color: "#ef4444" }} />
            )}
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: camera.status === "pass" ? "var(--emerald)" : "#ef4444",
              }}
            >
              {camera.status === "pass" ? "Camera Active" : "Camera Pending"}
            </span>
          </div>

          {/* Mic level bar */}
          <div
            style={{
              padding: "8px 12px",
              borderTop: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <div
              className="flex items-center gap-2"
              style={{ marginBottom: 4 }}
            >
              {microphone.status === "pass" ? (
                <Mic size={12} style={{ color: "var(--indigo)" }} />
              ) : (
                <MicOff size={12} style={{ color: "var(--text-muted)" }} />
              )}
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                }}
              >
                Microphone Level
              </span>
            </div>
            <div
              style={{
                height: 4,
                borderRadius: 4,
                background: "var(--bg-elevated)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${micLevel * 100}%`,
                  borderRadius: 4,
                  background:
                    micLevel > 0.6
                      ? "#ef4444"
                      : micLevel > 0.3
                        ? "#eab308"
                        : "var(--emerald)",
                  transition: "width 0.1s ease",
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
            return (
              <div
                key={check.label}
                className="glass-card"
                style={{
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  borderColor:
                    check.status === "pass"
                      ? "rgba(21,128,61,0.2)"
                      : check.status === "fail"
                        ? "rgba(239,68,68,0.2)"
                        : check.status === "warn"
                          ? "rgba(234,179,8,0.2)"
                          : "var(--border)",
                  animation:
                    check.status !== "pending"
                      ? "fadeUp 0.3s ease both"
                      : "none",
                  animationDelay: `${i * 100}ms`,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: `${statusColor(check.status)}12`,
                    flexShrink: 0,
                  }}
                >
                  <Icon
                    size={16}
                    style={{ color: statusColor(check.status) }}
                  />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    className="flex items-center justify-between"
                    style={{ marginBottom: 2 }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "var(--text-primary)",
                      }}
                    >
                      {check.label}
                    </span>
                    {statusIcon(check.status)}
                  </div>
                  {check.detail && (
                    <span
                      style={{
                        fontSize: 11,
                        color: statusColor(check.status),
                        fontWeight: 500,
                      }}
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
      <div
        className="flex items-center gap-3 mt-6"
        style={{ justifyContent: "space-between" }}
      >
        <button className="btn-ghost" onClick={onBack}>
          ← Back to Setup
        </button>

        <button
          className="btn-primary flex items-center gap-2"
          onClick={handleProceed}
          disabled={!canProceed}
          style={{
            opacity: canProceed ? 1 : 0.5,
            cursor: canProceed ? "pointer" : "not-allowed",
          }}
        >
          {allChecksRun ? (
            <>
              Enter Proctored Interview <ChevronRight size={14} />
            </>
          ) : (
            <>
              <Loader2
                size={14}
                style={{ animation: "spin 1s linear infinite" }}
              />
              Running checks…
            </>
          )}
        </button>
      </div>

      {/* Warning if checks failed */}
      {allChecksRun && !mandatoryPassed && (
        <div
          className="glass-card p-4 mt-4 flex items-start gap-3"
          style={{
            borderColor: "rgba(239,68,68,0.25)",
            background: "rgba(239,68,68,0.04)",
          }}
        >
          <AlertTriangle
            size={18}
            style={{ color: "#ef4444", flexShrink: 0, marginTop: 2 }}
          />
          <div>
            <p
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#ef4444",
                marginBottom: 4,
              }}
            >
              Some checks failed
            </p>
            <p
              style={{
                fontSize: 12,
                color: "var(--text-secondary)",
              }}
            >
              Fix the issues above before starting your interview. Camera access
              is mandatory.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
