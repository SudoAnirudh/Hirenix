"use client";
import { useRef, useState, useEffect, useMemo } from "react";
import {
  evaluateInterviewSession,
  transcribeAudio,
  getNextQuestion,
} from "@/lib/api";
import { useProctor } from "./interview/ProctorProvider";
import {
  ChevronRight,
  Timer,
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  BrainCircuit,
  CameraOff,
} from "lucide-react";
import { motion } from "framer-motion";

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: unknown) => void) | null;
  onerror: ((event: unknown) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionCtorLike = new () => SpeechRecognitionLike;

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

interface Question {
  question_id: string;
  question: string;
  category: string;
  difficulty: string;
  expected_topics: string[];
  follow_up_prompt?: string | null;
}

interface Session {
  session_id: string;
  target_role: string;
  experience_level: string;
  interview_type: string;
  answer_mode: string;
  questions: Question[];
  interview_plan?: InterviewPlan;
}

interface Feedback {
  question_id: string;
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

export interface SessionSummary {
  session_id: string;
  overall_score: number; // 0-100
  feedback: Feedback[];
  overall_strengths: string[];
  overall_improvements: string[];
  terminated?: boolean;
  termination_reason?: string;
  malpractice_warnings?: number;
}

interface Props {
  session: Session;
  onComplete: (summary: SessionSummary) => void;
  onExit?: () => void;
}

export default function InterviewPanel({ session, onComplete, onExit }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [answersByQuestionId, setAnswersByQuestionId] = useState<
    Record<string, string>
  >({});
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes per question

  const isVoiceMode = session.answer_mode === "voice";
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  const [malpracticeWarnings, setMalpracticeWarnings] = useState(0);
  const [terminated, setTerminated] = useState(false);
  const [needsFullscreen, setNeedsFullscreen] = useState(false);
  const malpracticeEndRequestedRef = useRef(false);

  // F2F Media States
  const [cameraOn, setCameraOn] = useState(true);
  const [aiState, setAiState] = useState<
    "idle" | "speaking" | "listening" | "analyzing"
  >("idle");
  const { stream, cameraStatus, faceStatus } = useProctor();
  const videoRef = useRef<HTMLVideoElement>(null);

  const SpeechRecognitionCtor = useMemo(() => {
    if (typeof window === "undefined") return null;
    const w = window as unknown as {
      SpeechRecognition?: SpeechRecognitionCtorLike;
      webkitSpeechRecognition?: SpeechRecognitionCtorLike;
    };
    return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
  }, []);

  // MediaRecorder states for Whisper transcription
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [transcribing, setTranscribing] = useState(false);

  const [questionsList, setQuestionsList] = useState<Question[]>(
    session.questions,
  );
  const totalQuestionsLimit = session.interview_plan?.num_questions || 5;
  const q = questionsList[currentIdx];
  const isLast = currentIdx === totalQuestionsLimit - 1;

  const currentQuestionIdRef = useRef(q.question_id);
  useEffect(() => {
    currentQuestionIdRef.current = q.question_id;
  }, [q.question_id]);

  const pendingActionRef = useRef<"next" | "finish" | null>(null);

  // Sync candidate local webcam feed
  useEffect(() => {
    if (videoRef.current && stream && cameraOn) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, cameraOn]);

  // Handle high-accuracy MediaRecorder recording and Whisper transcription trigger
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (isListening && stream) {
      audioChunksRef.current = [];
      try {
        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };
        recorder.onstop = async () => {
          const activeQId = currentQuestionIdRef.current;
          if (audioChunksRef.current.length === 0) {
            setTranscribing(false);
            const action = pendingActionRef.current;
            pendingActionRef.current = null;
            if (action === "next") {
              void executeNext("");
            } else if (action === "finish") {
              void executeFinish("");
            }
            return;
          }
          const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          setTranscribing(true);
          let finalTranscription = "";
          try {
            const res = await transcribeAudio(blob);
            if (res.text && res.text.trim()) {
              finalTranscription = res.text.trim();
              setAnswer(finalTranscription);
              setAnswersByQuestionId((prev) => ({
                ...prev,
                [activeQId]: finalTranscription,
              }));
            }
          } catch (err) {
            console.error("Transcription error:", err);
          } finally {
            setTranscribing(false);
            const action = pendingActionRef.current;
            pendingActionRef.current = null;
            if (action === "next") {
              void executeNext(finalTranscription);
            } else if (action === "finish") {
              void executeFinish(finalTranscription);
            }
          }
        };
        recorder.start(100);
        mediaRecorderRef.current = recorder;
      } catch (err) {
        console.error("Failed to start MediaRecorder:", err);
      }
    } else {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        try {
          mediaRecorderRef.current.stop();
        } catch {
          // ignore
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening, stream]);

  // Read question aloud via SpeechSynthesis (TTS)
  const speakQuestion = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Cancel any active speak queue

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const englishVoice =
      voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.includes("Google") ||
            v.name.includes("Natural") ||
            v.name.includes("Microsoft")),
      ) ||
      voices.find((v) => v.lang.startsWith("en")) ||
      voices[0];

    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.rate = 0.95; // Slightly slower, more natural pace
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setAiState("speaking");
    };

    utterance.onend = () => {
      setAiState("listening");
      // Auto-start recording/listening when interviewer finishes speaking
      if (isVoiceMode && speechSupported && !isListening) {
        try {
          recognitionRef.current?.start();
          setIsListening(true);
        } catch (e) {
          console.error("Speech recognition auto-start failed:", e);
        }
      }
    };

    utterance.onerror = () => {
      setAiState("listening");
    };

    window.speechSynthesis.speak(utterance);
  };

  // Trigger speech synthesis whenever current question index changes
  useEffect(() => {
    setAiState("speaking");
    const handleVoices = () => {
      speakQuestion(q.question);
    };

    if (typeof window !== "undefined" && window.speechSynthesis) {
      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = handleVoices;
      } else {
        handleVoices();
      }
    }

    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx]);

  async function requestFullscreen() {
    try {
      if (typeof document === "undefined") return;
      if (document.fullscreenElement) return;
      await document.documentElement.requestFullscreen();
      setNeedsFullscreen(false);
    } catch {
      setNeedsFullscreen(true);
    }
  }

  function bumpMalpractice(reason: string) {
    setMalpracticeWarnings((prev) => {
      const next = prev + 1;
      if (next >= 3 && !malpracticeEndRequestedRef.current) {
        malpracticeEndRequestedRef.current = true;
        setTerminated(true);
        void handleFinish(true, `Session ended: ${reason}`);
      }
      return next;
    });
  }

  useEffect(() => {
    void requestFullscreen();
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        bumpMalpractice("tab switch detected");
      }
    };
    const onBlur = () => {
      bumpMalpractice("window focus lost");
    };
    const onFullscreen = () => {
      const inFullscreen = !!document.fullscreenElement;
      setNeedsFullscreen(!inFullscreen);
      if (!inFullscreen) {
        bumpMalpractice("fullscreen exited");
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    document.addEventListener("fullscreenchange", onFullscreen);

    setNeedsFullscreen(!document.fullscreenElement);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("fullscreenchange", onFullscreen);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setAnswer(answersByQuestionId[q.question_id] ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q.question_id]);

  useEffect(() => {
    if (!isVoiceMode) return;
    setSpeechSupported(!!SpeechRecognitionCtor);
  }, [isVoiceMode, SpeechRecognitionCtor]);

  useEffect(() => {
    if (!isVoiceMode || !SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: unknown) => {
      const e = event as {
        resultIndex: number;
        results: ArrayLike<{
          isFinal: boolean;
          0?: { transcript?: string };
        }>;
      };
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        const text = result?.[0]?.transcript ?? "";
        if (result.isFinal) finalTranscript += text;
        else interimTranscript += text;
      }

      const transcript = (finalTranscript + interimTranscript).trim();
      if (!transcript) return;
      setAnswer(transcript);
      setAnswersByQuestionId((prev) => ({
        ...prev,
        [q.question_id]: transcript,
      }));
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    return () => {
      try {
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
        recognition.stop();
      } catch {
        // ignore
      } finally {
        recognitionRef.current = null;
      }
    };
  }, [isVoiceMode, SpeechRecognitionCtor, q.question_id]);

  function stopListening() {
    try {
      recognitionRef.current?.stop();
    } catch {
      // ignore
    } finally {
      setIsListening(false);
    }
  }

  function toggleListening() {
    if (!isVoiceMode || !speechSupported) return;
    if (isListening) {
      stopListening();
      return;
    }
    try {
      recognitionRef.current?.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
    }
  }

  useEffect(() => {
    if (submitting) return;

    if (timeLeft <= 0) {
      void handleNext(true);
      return;
    }

    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, submitting]);

  async function executeFinish(
    finalAnswer: string,
    terminatedForMalpractice = false,
    reason?: string,
  ) {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setAiState("analyzing");

    const finalAnswerStr = finalAnswer.trim() || "No answer provided.";
    setAnswersByQuestionId((prev) => ({
      ...prev,
      [q.question_id]: finalAnswerStr,
    }));

    const payloadAnswers = questionsList.map((qq) => ({
      question_id: qq.question_id,
      answer:
        qq.question_id === q.question_id
          ? finalAnswerStr
          : (answersByQuestionId[qq.question_id] ?? "").trim() ||
            "No answer provided.",
    }));

    setSubmitting(true);
    try {
      const summary = (await evaluateInterviewSession(
        session.session_id,
        payloadAnswers,
      )) as SessionSummary;
      onComplete({
        ...summary,
        terminated: terminatedForMalpractice,
        termination_reason: terminatedForMalpractice ? reason : undefined,
        malpractice_warnings: terminatedForMalpractice
          ? malpracticeWarnings
          : 0,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
      setAiState("idle");
    }
  }

  async function handleFinish(
    terminatedForMalpractice = false,
    reason?: string,
  ) {
    if (isListening) {
      pendingActionRef.current = "finish";
      stopListening();
      return;
    }
    if (transcribing) {
      pendingActionRef.current = "finish";
      return;
    }
    await executeFinish(answer, terminatedForMalpractice, reason);
  }

  async function executeNext(finalAnswer: string, autoAdvance = false) {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    const finalAnswerStr =
      finalAnswer.trim() || (autoAdvance ? "No answer provided." : "");
    setAnswersByQuestionId((prev) => ({
      ...prev,
      [q.question_id]: finalAnswerStr,
    }));

    if (isLast) return;

    setSubmitting(true);
    setAiState("analyzing");
    try {
      const nextQ = await getNextQuestion(
        session.session_id,
        q.question_id,
        finalAnswerStr || "No answer provided.",
        {
          difficulty: session.interview_plan?.difficulty,
          experienceLevel: session.interview_plan?.experience_level,
          interviewType: session.interview_plan?.interview_type,
          numQuestions: session.interview_plan?.num_questions,
        },
      );
      setQuestionsList((prev) => [...prev, nextQ]);
      setCurrentIdx((i) => i + 1);
      setTimeLeft(120);
    } catch (err) {
      console.error("Failed to load next question:", err);
    } finally {
      setSubmitting(false);
      setAiState("idle");
    }
  }

  async function handleNext(autoAdvance = false) {
    if (isListening) {
      pendingActionRef.current = "next";
      stopListening();
      return;
    }
    if (transcribing) {
      pendingActionRef.current = "next";
      return;
    }
    await executeNext(answer, autoAdvance);
  }

  const categoryColor =
    q.category === "technical"
      ? "#3B82F6"
      : q.category === "system_design"
        ? "#10B981"
        : "#8B5CF6";

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeString = `${mins}:${secs.toString().padStart(2, "0")}`;
  const isUrgent = timeLeft <= 30;

  const faceBadge = {
    label:
      faceStatus === "single_face"
        ? "Attentive"
        : faceStatus === "no_face"
          ? "Camera check"
          : faceStatus === "multiple_faces"
            ? "Multiple people"
            : faceStatus === "misaligned"
              ? "Attention drift"
              : faceStatus === "checking"
                ? "Checking position..."
                : "Biometrics Offline",
    color:
      faceStatus === "single_face"
        ? "#10B981"
        : faceStatus === "unsupported" || faceStatus === "checking"
          ? "#64748B"
          : "#EF4444",
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-up max-w-7xl mx-auto w-full pb-24 px-4 mt-6">
      {needsFullscreen && !terminated && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-6">
          <div className="glass-card w-full max-w-xl p-10 rounded-[40px] bg-slate-900 border border-slate-800 shadow-2xl text-center">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-3">
              Fullscreen Required
            </div>
            <h3 className="font-display font-black text-3xl tracking-tight text-white mb-4">
              Enter Fullscreen Mode
            </h3>
            <p className="text-sm font-body text-slate-400 leading-relaxed font-medium mb-8">
              This is a proctored face-to-face simulation. Leaving fullscreen or
              switching tabs triggers malpractice warnings.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                type="button"
                onClick={() => void requestFullscreen()}
                className="px-10 py-4 rounded-[24px] bg-brand-blue hover:bg-blue-600 text-white font-display font-black shadow-2xl active:scale-[0.98] transition-all"
              >
                Restore Fullscreen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Info */}
      <div className="w-full flex justify-between items-center px-4">
        <div>
          <h2 className="font-display font-bold text-2xl tracking-tight text-slate-800">
            F2F Mock Interview Studio
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Question {currentIdx + 1} of {totalQuestionsLimit} ·{" "}
            {q.category.toUpperCase().replace("_", " ")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {[...Array(totalQuestionsLimit)].map((_, i) => (
            <div
              key={i}
              className={`h-2.5 rounded-full transition-all duration-500 ${
                i < currentIdx
                  ? "bg-brand-blue/35 w-6"
                  : i === currentIdx
                    ? "bg-brand-blue w-12 shadow-md shadow-brand-blue/30"
                    : "bg-slate-200 w-6"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Video Call Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        {/* 1. AI Interviewer Card */}
        <div
          className="relative aspect-video rounded-[32px] bg-slate-900 overflow-hidden shadow-xl border flex flex-col items-center justify-center p-6 select-none transition-all duration-500"
          style={{ borderColor: `${categoryColor}30` }}
        >
          {/* Speaking Pulsar Aura */}
          {aiState === "speaking" && (
            <motion.div
              className="absolute w-36 h-36 rounded-full blur-md"
              style={{ backgroundColor: `${categoryColor}20` }}
              animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0.2, 0.6] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          )}

          {/* AI Avatar */}
          <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-white relative z-10 shadow-lg">
            <BrainCircuit
              size={44}
              style={{ color: categoryColor }}
              className={aiState === "speaking" ? "animate-pulse" : ""}
            />
          </div>

          {/* Audio Visualizer Wave (only when speaking) */}
          {aiState === "speaking" && (
            <div className="absolute bottom-5 right-5 flex items-end gap-1.5 h-6">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 rounded-full"
                  style={{ backgroundColor: categoryColor }}
                  animate={{ height: [6, Math.random() * 20 + 8, 6] }}
                  transition={{ repeat: Infinity, duration: 0.4 + i * 0.1 }}
                />
              ))}
            </div>
          )}

          {/* Question Overlay Banner */}
          <div className="absolute top-5 inset-x-6 text-center bg-black/30 backdrop-blur-md py-3 px-6 rounded-2xl border border-white/10 select-none">
            <p className="text-sm font-semibold text-slate-200 leading-snug">
              {q.question}
            </p>
          </div>

          {/* AI Identity Label */}
          <div className="absolute bottom-5 left-5 flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 text-white font-bold text-xs tracking-wider">
            <div
              className={`w-2 h-2 rounded-full ${
                aiState === "speaking"
                  ? "bg-emerald-500 animate-pulse"
                  : aiState === "listening"
                    ? "bg-sky-400 animate-ping"
                    : "bg-amber-500 animate-pulse"
              }`}
            />
            <span>Sarah (AI Recruiter) · {aiState.toUpperCase()}</span>
          </div>
        </div>

        {/* 2. Candidate Webcam Card */}
        <div className="relative aspect-video rounded-[32px] bg-slate-950 overflow-hidden shadow-xl border border-slate-800 flex items-center justify-center">
          {cameraOn && cameraStatus === "active" ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 gap-3">
              <div className="p-4 rounded-full bg-slate-800 border border-slate-700 text-slate-400">
                <CameraOff size={28} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {cameraStatus === "denied"
                  ? "Camera Permissions Blocked"
                  : "Video Feed Muted"}
              </span>
            </div>
          )}

          {/* Recording & Mute Indicators */}
          <div className="absolute top-5 left-5 flex items-center gap-2">
            {isListening && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600/30 border border-red-500/30 backdrop-blur-md text-white font-black text-[9px] tracking-widest uppercase">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span>RECORDING VOICE</span>
              </div>
            )}
            <span className="px-3 py-1.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-md text-[9px] font-black text-white uppercase tracking-wider">
              YOU (CANDIDATE)
            </span>
          </div>

          {/* Proctor Biometric indicator */}
          <div className="absolute top-5 right-5 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-md text-[9px] font-black uppercase text-white tracking-wider">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: faceBadge.color }}
            />
            <span>{faceBadge.label}</span>
          </div>

          {/* Sound wave simulation in recorder */}
          {isListening && (
            <div className="absolute bottom-5 right-5 flex items-center gap-1">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-red-500 rounded-full animate-pulse"
                  style={{
                    height: `${8 + i * 3}px`,
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Zoom/Meet Floating-style Toolbar */}
      <div className="flex items-center justify-between p-5 rounded-[28px] bg-slate-900 border border-slate-800 text-slate-200 shadow-xl max-w-4xl mx-auto w-full transition-all mt-4 select-none">
        <div className="flex items-center gap-3">
          {/* Toggle Mic */}
          <button
            type="button"
            onClick={toggleListening}
            disabled={!speechSupported || submitting || transcribing}
            className={`p-3.5 rounded-full transition-all active:scale-90 ${
              isListening
                ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            } disabled:opacity-50`}
            title={isListening ? "Mute Microphone" : "Unmute Microphone"}
          >
            {isListening ? <Mic size={18} /> : <MicOff size={18} />}
          </button>

          {/* Toggle Camera */}
          <button
            type="button"
            onClick={() => setCameraOn(!cameraOn)}
            disabled={submitting || transcribing}
            className={`p-3.5 rounded-full transition-all active:scale-90 ${
              cameraOn
                ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                : "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20"
            }`}
            title={cameraOn ? "Stop Video" : "Start Video"}
          >
            {cameraOn ? <Video size={18} /> : <VideoOff size={18} />}
          </button>
        </div>

        {/* Timer / Counter */}
        <div className="flex items-center gap-5">
          <div
            className={`flex items-center gap-2 px-4.5 py-2.5 rounded-2xl border text-xs font-black uppercase tracking-wider ${
              isUrgent
                ? "bg-red-500/10 text-red-500 border-red-500/25 animate-pulse"
                : "bg-slate-800/80 border-slate-700 text-slate-300"
            }`}
          >
            <Timer size={14} />
            <span className="tabular-nums tracking-widest">{timeString}</span>
          </div>

          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Violations:{" "}
            <span className="text-amber-500">{malpracticeWarnings}</span>/3
          </div>
        </div>

        {/* Session Action Toggles */}
        <div className="flex items-center gap-3">
          {onExit && (
            <button
              type="button"
              onClick={onExit}
              className="p-3.5 rounded-full bg-slate-800 hover:bg-slate-700 text-red-400 border border-slate-700 transition-all active:scale-90"
              title="Hang Up / Exit Interview"
            >
              <PhoneOff size={18} />
            </button>
          )}

          {!isLast ? (
            <button
              type="button"
              onClick={() => handleNext(false)}
              disabled={submitting || transcribing}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-blue hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all"
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void handleFinish()}
              disabled={submitting || transcribing}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all"
            >
              <span>{submitting ? "Submitting..." : "Submit Call"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Transcript & Response Area */}
      <div className="glass-card p-6.5 rounded-[32px] border border-slate-200 bg-white/40 shadow-glass w-full max-w-4xl mx-auto transition-all duration-500">
        <div className="flex justify-between items-center mb-3 px-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-px bg-slate-300" />
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Live Call Transcription
            </h4>
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
            Editable Script
          </span>
        </div>

        <textarea
          id={`answer-${q.question_id}`}
          className="w-full bg-white/60 border border-slate-200 rounded-2xl p-5 text-slate-800 text-base leading-relaxed resize-none min-h-[140px] focus:outline-none focus:border-brand-blue/50 font-body placeholder:text-slate-400"
          placeholder={
            transcribing
              ? "Refining transcription with high-accuracy AI..."
              : session.answer_mode === "text"
                ? "Formulate your response here. Type your complete answer structure..."
                : speechSupported
                  ? "Talk naturally into your microphone. Sarah will listen and generate transcripts here. Correct any spelling details if needed before hitting next."
                  : "Voice transcription is unavailable in this browser. Please type your response directly."
          }
          value={
            transcribing
              ? "Refining transcription with high-accuracy AI..."
              : answer
          }
          onChange={(e) => {
            if (
              typeof window !== "undefined" &&
              window.speechSynthesis &&
              window.speechSynthesis.speaking
            ) {
              window.speechSynthesis.cancel();
            }
            const next = e.target.value;
            setAnswer(next);
            setAnswersByQuestionId((prev) => ({
              ...prev,
              [q.question_id]: next,
            }));
          }}
          disabled={submitting || transcribing || needsFullscreen || terminated}
        />

        {q.expected_topics.length > 0 && (
          <div className="mt-4 px-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-2">
              Expected Technical Topics to Cover
            </span>
            <div className="flex flex-wrap gap-2">
              {q.expected_topics.map((topic) => (
                <span
                  key={topic}
                  className="px-3.5 py-1.5 rounded-full bg-white/80 text-[10px] font-bold text-slate-600 border border-slate-200 shadow-sm uppercase tracking-wider"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
