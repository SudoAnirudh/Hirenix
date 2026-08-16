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
  Shield,
  Sparkles,
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

      {/* Proctoring Shell Canvas */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch w-full">
        {/* Left Column: Interview Focus */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Active Question Card */}
          <div className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden shadow-sm flex-shrink-0">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-1 text-primary font-bold text-xs uppercase tracking-wide">
                <BrainCircuit size={14} />
                Question {currentIdx + 1} of {totalQuestionsLimit}
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
                <Timer size={14} />
                <span className="font-mono">{timeString}</span>
              </div>
            </div>
            <h3 className="font-heading text-lg font-bold text-foreground leading-snug mb-4">
              "{q.question}"
            </h3>
            <div className="flex gap-2">
              <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-muted-foreground uppercase">
                {q.category.replace("_", " ")}
              </span>
              <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-muted-foreground uppercase">
                {q.difficulty}
              </span>
            </div>
          </div>

          {/* Transcript / Speech Output Area */}
          <div className="bg-card border border-border rounded-2xl flex-1 flex flex-col overflow-hidden shadow-sm min-h-[280px]">
            <div className="px-5 py-3 border-b border-border bg-slate-50/50 dark:bg-slate-900/30 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Mic
                  size={16}
                  className={
                    isListening
                      ? "text-red-500 animate-pulse"
                      : "text-muted-foreground"
                  }
                />
                <span className="text-xs font-bold text-foreground">
                  Live Transcript
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${isListening ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"}`}
                />
                <span className="text-[10px] font-bold text-muted-foreground uppercase">
                  {isListening ? "Listening" : "Muted"}
                </span>
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between gap-4">
              <textarea
                id={`answer-${q.question_id}`}
                className="w-full bg-slate-50/50 dark:bg-slate-900/30 border border-border rounded-xl p-4 text-sm leading-relaxed resize-none flex-1 focus:outline-none focus:border-indigo-500 font-body placeholder:text-muted-foreground"
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
                disabled={
                  submitting || transcribing || needsFullscreen || terminated
                }
              />
            </div>
          </div>

          {/* Control Bar */}
          <div className="flex items-center justify-between p-4 bg-card border border-border rounded-2xl shadow-sm shrink-0">
            <div>
              <button
                type="button"
                onClick={() => handleNext(true)}
                disabled={submitting || transcribing}
                className="px-4 py-2 border border-border rounded-xl text-xs font-semibold text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors flex items-center gap-1.5"
              >
                Skip Question
              </button>
            </div>
            <div className="flex gap-3">
              {onExit && (
                <button
                  type="button"
                  onClick={onExit}
                  className="px-4 py-2 border border-rose-200 hover:border-rose-500 text-rose-500 rounded-xl text-xs font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                >
                  End Interview
                </button>
              )}
              {!isLast ? (
                <button
                  type="button"
                  onClick={() => handleNext(false)}
                  disabled={submitting || transcribing}
                  className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold shadow-md hover:opacity-90 transition-opacity flex items-center gap-1.5"
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void handleFinish()}
                  disabled={submitting || transcribing}
                  className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
                >
                  {submitting ? "Submitting..." : "Finish Interview"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Intel & Webcam */}
        <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-6">
          {/* Webcam / Proctoring Card */}
          <div className="bg-slate-950 rounded-2xl overflow-hidden shadow-sm relative aspect-video lg:h-48 lg:aspect-auto shrink-0 flex items-center justify-center border border-slate-800">
            {cameraOn && cameraStatus === "active" ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 gap-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">
                  Biometrics Feed Offline
                </span>
              </div>
            )}

            {/* Proctoring Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/45 pointer-events-none flex flex-col justify-between p-3">
              <div className="flex justify-between items-start">
                <span className="px-2 py-0.5 bg-black/40 backdrop-blur-md rounded border border-white/10 text-[9px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
                  <Shield size={10} className="text-emerald-400" /> Proctored
                </span>
                <span className="px-2 py-0.5 bg-black/40 backdrop-blur-md rounded border border-white/10 text-[9px] font-bold uppercase text-white tracking-wider flex items-center gap-1">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: faceBadge.color }}
                  />
                  {faceBadge.label}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-black text-white/80 uppercase">
                  <span>Focus State</span>
                  <span
                    className={
                      faceStatus === "single_face"
                        ? "text-emerald-400"
                        : "text-rose-400"
                    }
                  >
                    {faceStatus === "single_face" ? "High" : "Low"}
                  </span>
                </div>
                <div className="flex justify-between text-[9px] font-black text-white/80 uppercase">
                  <span>Trust Score</span>
                  <span>{100 - malpracticeWarnings * 20}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interview Intel Panel */}
          <div className="bg-card rounded-2xl border border-border shadow-sm flex-1 flex flex-col overflow-hidden min-h-[300px]">
            <div className="px-4 py-3 border-b border-border bg-slate-50/50 dark:bg-slate-900/30 flex items-center gap-2">
              <Sparkles size={14} className="text-primary" />
              <span className="text-xs font-bold text-foreground">
                Interview Intel
              </span>
            </div>
            <div className="p-4 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
              <div className="space-y-2">
                <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  Evaluating Skills
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {q.expected_topics.map((topic) => (
                    <span
                      key={topic}
                      className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold border border-primary/10 tracking-wide"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              <div className="h-px bg-border w-full"></div>

              {/* STAR Method Helper */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  STAR Method Guide
                </h4>
                <div className="space-y-4 relative pl-4 border-l border-border ml-2">
                  {[
                    {
                      key: "situation",
                      label: "Situation",
                      desc: "Setting up the context.",
                      minWords: 0,
                      maxWords: 15,
                    },
                    {
                      key: "task",
                      label: "Task",
                      desc: "Defining the problem/goals.",
                      minWords: 15,
                      maxWords: 40,
                    },
                    {
                      key: "action",
                      label: "Action",
                      desc: "Steps taken & technology used.",
                      minWords: 40,
                      maxWords: 120,
                    },
                    {
                      key: "result",
                      label: "Result",
                      desc: "Outcomes, metrics, and latency benefits.",
                      minWords: 120,
                      maxWords: Infinity,
                    },
                  ].map((step) => {
                    const words = answer
                      .trim()
                      .split(/\s+/)
                      .filter(Boolean).length;
                    const isCurrent =
                      words >= step.minWords && words < step.maxWords;
                    const isPassed = words >= step.maxWords;
                    return (
                      <div key={step.key} className="relative">
                        <span
                          className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 border-card transition-all ${
                            isPassed
                              ? "bg-emerald-500 ring-2 ring-emerald-500/20"
                              : isCurrent
                                ? "bg-primary ring-4 ring-primary/20 scale-110"
                                : "bg-slate-200 dark:bg-slate-800"
                          }`}
                        />
                        <p
                          className={`text-xs font-bold transition-colors ${isCurrent ? "text-primary" : "text-foreground"}`}
                        >
                          {step.label}
                        </p>
                        <p className="text-[10px] text-muted-foreground leading-normal mt-0.5">
                          {step.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
