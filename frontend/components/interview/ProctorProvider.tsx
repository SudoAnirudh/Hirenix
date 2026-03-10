"use client";
import {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useToast } from "./ToastProvider";

/* ─── Types ─── */
export interface Violation {
  type:
    | "tab_switch"
    | "window_blur"
    | "copy_attempt"
    | "paste_attempt"
    | "right_click"
    | "restricted_shortcut"
    | "fullscreen_exit"
    | "camera_lost"
    | "no_face_detected"
    | "multiple_faces_detected"
    | "face_misaligned"
    | "microphone_lost"
    | "audio_anomaly";
  timestamp: number;
  label: string;
}

interface ProctorState {
  /** Whether proctoring is active */
  active: boolean;
  /** Webcam MediaStream (null if denied/unavailable) */
  stream: MediaStream | null;
  /** Camera status */
  cameraStatus: "pending" | "active" | "denied" | "unavailable";
  /** Mic status */
  micStatus: "pending" | "active" | "denied" | "unavailable";
  /** Accumulated violations */
  violations: Violation[];
  /** Live trust score (0–100) */
  trustScore: number;
  /** Elapsed seconds since interview started */
  elapsed: number;
  /** Has the user's tab been away at any point? */
  tabAway: boolean;
  /** Fullscreen session integrity */
  fullscreenActive: boolean;
  /** Face monitoring status */
  faceStatus:
    | "checking"
    | "single_face"
    | "no_face"
    | "multiple_faces"
    | "misaligned"
    | "unsupported";
  /** Derived live session risk */
  sessionRisk: "low" | "medium" | "high";
  /** Register a violation */
  addViolation: (type: Violation["type"]) => void;
  /** Ask browser to enter fullscreen for stronger session integrity */
  requestFullscreen: () => Promise<void>;
  /** Stop proctoring (cleanup) */
  stop: () => void;
}

const ProctorContext = createContext<ProctorState | null>(null);

export function useProctor() {
  const ctx = useContext(ProctorContext);
  if (!ctx) throw new Error("useProctor must be used inside <ProctorProvider>");
  return ctx;
}

/* ─── Scoring weights ─── */
const PENALTY: Record<Violation["type"], number> = {
  tab_switch: 8,
  window_blur: 5,
  copy_attempt: 6,
  paste_attempt: 7,
  right_click: 3,
  restricted_shortcut: 4,
  fullscreen_exit: 10,
  camera_lost: 18,
  no_face_detected: 12,
  multiple_faces_detected: 20,
  face_misaligned: 9,
  microphone_lost: 15,
  audio_anomaly: 10,
};

const LABELS: Record<Violation["type"], string> = {
  tab_switch: "Switched browser tab",
  window_blur: "Window lost focus",
  copy_attempt: "Tried to copy text",
  paste_attempt: "Tried to paste text",
  right_click: "Right-click context menu",
  restricted_shortcut: "Attempted a restricted browser shortcut",
  fullscreen_exit: "Exited fullscreen mode",
  camera_lost: "Camera feed was interrupted",
  no_face_detected: "No face detected on camera",
  multiple_faces_detected: "Multiple faces detected on camera",
  face_misaligned: "Face moved out of the interview focus area",
  microphone_lost: "Microphone feed was interrupted",
  audio_anomaly: "Unusual background noise or speaking detected",
};

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

/* ─── Provider ─── */
export function ProctorProvider({
  enabled,
  children,
}: {
  enabled: boolean;
  children: ReactNode;
}) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraStatus, setCameraStatus] =
    useState<ProctorState["cameraStatus"]>("pending");
  const [micStatus, setMicStatus] =
    useState<ProctorState["micStatus"]>("pending");
  const [violations, setViolations] = useState<Violation[]>([]);
  const [trustScore, setTrustScore] = useState(100);
  const [elapsed, setElapsed] = useState(0);
  const [tabAway, setTabAway] = useState(false);
  const [fullscreenActive, setFullscreenActive] = useState(false);
  const [faceStatus, setFaceStatus] =
    useState<ProctorState["faceStatus"]>("checking");
  const [sessionRisk, setSessionRisk] =
    useState<ProctorState["sessionRisk"]>("low");
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const startedRef = useRef(false);
  const stoppingRef = useRef(false);
  const hasBeenFullscreenRef = useRef(false);
  const lastViolationAtRef = useRef<Record<Violation["type"], number>>({
    tab_switch: 0,
    window_blur: 0,
    copy_attempt: 0,
    paste_attempt: 0,
    right_click: 0,
    restricted_shortcut: 0,
    fullscreen_exit: 0,
    camera_lost: 0,
    no_face_detected: 0,
    multiple_faces_detected: 0,
    face_misaligned: 0,
    microphone_lost: 0,
    audio_anomaly: 0,
  });

  const toast = useToast();

  /* ── Add violation ── */
  const addViolation = useCallback(
    (type: Violation["type"]) => {
      const now = Date.now();
      if (now - lastViolationAtRef.current[type] < 2500) {
        return;
      }
      lastViolationAtRef.current[type] = now;
      const v: Violation = { type, timestamp: Date.now(), label: LABELS[type] };
      setViolations((prev) => [...prev, v]);
      setTrustScore((prev) => Math.max(0, prev - PENALTY[type]));

      const severity = PENALTY[type] >= 10 ? "danger" : "warning";
      toast.showToast(LABELS[type], severity);
    },
    [toast],
  );

  /* ── Webcam ── */
  useEffect(() => {
    if (!enabled || startedRef.current) return;
    startedRef.current = true;
    stoppingRef.current = false;

    (async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 320, height: 240 },
          audio: true,
        });
        mediaStream.getVideoTracks().forEach((track) => {
          track.addEventListener("ended", () => {
            if (stoppingRef.current) return;
            setCameraStatus("unavailable");
            addViolation("camera_lost");
          });
        });
        mediaStream.getAudioTracks().forEach((track) => {
          track.addEventListener("ended", () => {
            if (stoppingRef.current) return;
            setMicStatus("unavailable");
            addViolation("microphone_lost");
          });
        });
        setStream(mediaStream);
        setCameraStatus("active");
        setMicStatus("active");
      } catch {
        setCameraStatus("denied");
        setMicStatus("denied");
      }
    })();

    return () => {
      // Cleanup handled in stop()
    };
  }, [addViolation, enabled]);

  /* ── Fullscreen integrity ── */
  useEffect(() => {
    if (!enabled) return;

    const handleFullscreenChange = () => {
      const active = Boolean(document.fullscreenElement);
      setFullscreenActive(active);
      if (active) {
        hasBeenFullscreenRef.current = true;
        return;
      }
      if (hasBeenFullscreenRef.current && !stoppingRef.current) {
        addViolation("fullscreen_exit");
      }
    };

    handleFullscreenChange();
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [addViolation, enabled]);

  /* ── Timer ── */
  useEffect(() => {
    if (!enabled) return;
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [enabled]);

  /* ── Tab visibility ── */
  useEffect(() => {
    if (!enabled) return;
    const handleVisibility = () => {
      if (document.hidden) {
        setTabAway(true);
        addViolation("tab_switch");
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  /* ── Window blur ── */
  useEffect(() => {
    if (!enabled) return;
    const handleBlur = () => {
      // Only count if the document isn't hidden (avoids double counting with tab_switch)
      if (!document.hidden) {
        addViolation("window_blur");
      }
    };
    window.addEventListener("blur", handleBlur);
    return () => window.removeEventListener("blur", handleBlur);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  /* ── Copy/Paste/Right-click blocking ── */
  useEffect(() => {
    if (!enabled) return;

    const blockCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      addViolation("copy_attempt");
    };
    const blockPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      addViolation("paste_attempt");
    };
    const blockContext = (e: MouseEvent) => {
      e.preventDefault();
      addViolation("right_click");
    };

    document.addEventListener("copy", blockCopy);
    document.addEventListener("paste", blockPaste);
    document.addEventListener("contextmenu", blockContext);

    return () => {
      document.removeEventListener("copy", blockCopy);
      document.removeEventListener("paste", blockPaste);
      document.removeEventListener("contextmenu", blockContext);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  /* ── Restricted shortcut blocking ── */
  useEffect(() => {
    if (!enabled) return;

    const blockedCodes = new Set(["KeyP", "KeyS", "KeyU", "F12"]);
    const blockedShiftCodes = new Set(["KeyI", "KeyJ", "KeyC"]);

    const handleKeydown = (event: KeyboardEvent) => {
      const usesModifier = event.ctrlKey || event.metaKey;
      const blocked =
        event.code === "F12" ||
        (usesModifier && blockedCodes.has(event.code)) ||
        (usesModifier && event.shiftKey && blockedShiftCodes.has(event.code));

      if (!blocked) return;

      event.preventDefault();
      addViolation("restricted_shortcut");
    };

    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, [addViolation, enabled]);

  /* ── Face presence monitoring ── */
  useEffect(() => {
    if (!enabled || !stream) return;
    if (typeof window === "undefined" || !window.FaceDetector) {
      setFaceStatus("unsupported");
      return;
    }

    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | null = null;
    const faceDetector = new window.FaceDetector({
      fastMode: true,
      maxDetectedFaces: 2,
    });
    const video = document.createElement("video");
    const anomalyCounts = { noFace: 0, multipleFaces: 0, misaligned: 0 };

    const evaluateFrame = async () => {
      if (cancelled || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        return;
      }

      try {
        const faces = await faceDetector.detect(video);
        if (cancelled) return;

        if (faces.length === 0) {
          anomalyCounts.noFace += 1;
          anomalyCounts.multipleFaces = 0;
          anomalyCounts.misaligned = 0;
          if (anomalyCounts.noFace >= 2) {
            setFaceStatus("no_face");
            addViolation("no_face_detected");
          }
          return;
        }

        if (faces.length > 1) {
          anomalyCounts.multipleFaces += 1;
          anomalyCounts.noFace = 0;
          anomalyCounts.misaligned = 0;
          if (anomalyCounts.multipleFaces >= 2) {
            setFaceStatus("multiple_faces");
            addViolation("multiple_faces_detected");
          }
          return;
        }

        const [face] = faces;
        const frameWidth = video.videoWidth || 1;
        const frameHeight = video.videoHeight || 1;
        const box = face.boundingBox;
        const coverage = box
          ? (box.width * box.height) / (frameWidth * frameHeight)
          : 0;
        const centerX = box ? (box.x + box.width / 2) / frameWidth : 0.5;
        const centerY = box ? (box.y + box.height / 2) / frameHeight : 0.5;
        const outOfFocusArea =
          centerX < 0.2 ||
          centerX > 0.8 ||
          centerY < 0.18 ||
          centerY > 0.82 ||
          coverage < 0.035;

        if (outOfFocusArea) {
          anomalyCounts.misaligned += 1;
          anomalyCounts.noFace = 0;
          anomalyCounts.multipleFaces = 0;
          if (anomalyCounts.misaligned >= 2) {
            setFaceStatus("misaligned");
            addViolation("face_misaligned");
          }
          return;
        }

        anomalyCounts.noFace = 0;
        anomalyCounts.multipleFaces = 0;
        anomalyCounts.misaligned = 0;
        setFaceStatus("single_face");
      } catch {
        setFaceStatus("unsupported");
      }
    };

    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;

    void video
      .play()
      .then(() => {
        if (cancelled) return;
        intervalId = setInterval(() => {
          void evaluateFrame();
        }, 3000);
      })
      .catch(() => {
        setFaceStatus("unsupported");
      });

    return () => {
      cancelled = true;
      if (intervalId) {
        clearInterval(intervalId);
      }
      video.pause();
      video.srcObject = null;
    };
  }, [addViolation, enabled, stream]);

  /* ── Audio monitoring (background noise / speaking) ── */
  useEffect(() => {
    if (!enabled || !stream || stream.getAudioTracks().length === 0) return;

    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    let anomalyFrames = 0;

    const intervalId = setInterval(() => {
      if (stoppingRef.current) return;
      analyser.getByteFrequencyData(dataArray);

      const avg =
        dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length;
      const normalizedVolume = Math.min(avg / 128, 1);

      // Simple heuristic: if volume is consistently high (speaking/noise)
      if (normalizedVolume > 0.45) {
        anomalyFrames++;
        if (anomalyFrames > 15) {
          // e.g., ~1.5 seconds of sustained noise
          addViolation("audio_anomaly");
          anomalyFrames = 0; // reset to avoid spamming
        }
      } else {
        // Decrease anomaly count if quiet
        anomalyFrames = Math.max(0, anomalyFrames - 2);
      }
    }, 100);

    return () => {
      clearInterval(intervalId);
      void audioCtx.close().catch(() => {});
    };
  }, [addViolation, enabled, stream]);

  useEffect(() => {
    if (!enabled) {
      setSessionRisk("low");
      return;
    }

    const now = Date.now();
    const recentViolations = violations.filter(
      (entry) => now - entry.timestamp <= 60_000,
    ).length;
    const elevatedFaceRisk =
      faceStatus === "no_face" ||
      faceStatus === "multiple_faces" ||
      faceStatus === "misaligned";
    const elevatedDeviceRisk =
      cameraStatus !== "active" ||
      (hasBeenFullscreenRef.current && !fullscreenActive);

    if (trustScore < 45 || recentViolations >= 4 || elevatedDeviceRisk) {
      setSessionRisk("high");
      return;
    }

    if (trustScore < 75 || recentViolations >= 2 || elevatedFaceRisk) {
      setSessionRisk("medium");
      return;
    }

    setSessionRisk("low");
  }, [
    cameraStatus,
    enabled,
    faceStatus,
    fullscreenActive,
    trustScore,
    violations,
  ]);

  const requestFullscreen = useCallback(async () => {
    if (typeof document === "undefined" || document.fullscreenElement) {
      return;
    }
    try {
      await document.documentElement.requestFullscreen();
      hasBeenFullscreenRef.current = true;
      setFullscreenActive(true);
    } catch {
      // Browser rejected fullscreen request.
    }
  }, []);

  /* ── Stop everything ── */
  const stop = useCallback(() => {
    stoppingRef.current = true;
    clearInterval(timerRef.current);
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {});
    }
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
    setCameraStatus("unavailable");
  }, [stream]);

  const value: ProctorState = {
    active: enabled,
    stream,
    cameraStatus,
    micStatus,
    violations,
    trustScore,
    elapsed,
    tabAway,
    fullscreenActive,
    faceStatus,
    sessionRisk,
    addViolation,
    requestFullscreen,
    stop,
  };

  return (
    <ProctorContext.Provider value={value}>{children}</ProctorContext.Provider>
  );
}
