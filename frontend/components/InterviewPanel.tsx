"use client";
import { useRef, useState, useEffect, useMemo } from "react";
import { evaluateInterviewSession } from "@/lib/api";
import {
  ChevronRight,
  CheckCircle,
  Timer,
  Brain,
  TrendingUp,
  Sparkles,
  Mic,
  MicOff,
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
}

export default function InterviewPanel({ session, onComplete }: Props) {
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

  const SpeechRecognitionCtor = useMemo(() => {
    if (typeof window === "undefined") return null;
    const w = window as unknown as {
      SpeechRecognition?: SpeechRecognitionCtorLike;
      webkitSpeechRecognition?: SpeechRecognitionCtorLike;
    };
    return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
  }, []);

  const q = session.questions[currentIdx];
  const isLast = currentIdx === session.questions.length - 1;

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
    // Best-effort: fullscreen must be entered to continue.
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

    // Initialize fullscreen state
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
  }, [isVoiceMode, SpeechRecognitionCtor]);

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

  function persistCurrentAnswer(fallbackIfEmpty?: string) {
    const trimmed = answer.trim();
    const finalAnswer = trimmed || fallbackIfEmpty || "";
    setAnswersByQuestionId((prev) => ({
      ...prev,
      [q.question_id]: finalAnswer,
    }));
  }

  async function handleFinish(
    terminatedForMalpractice = false,
    reason?: string,
  ) {
    if (isListening) stopListening();
    persistCurrentAnswer("No answer provided.");

    const payloadAnswers = session.questions.map((qq) => ({
      question_id: qq.question_id,
      answer: (answersByQuestionId[qq.question_id] ?? "").trim(),
    }));

    setSubmitting(true);
    try {
      const summary = (await evaluateInterviewSession(
        session.session_id,
        payloadAnswers.map((a) => ({
          ...a,
          answer: a.answer || "No answer provided.",
        })),
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
    }
  }

  function handleNext(autoAdvance = false) {
    if (isListening) stopListening();
    persistCurrentAnswer(autoAdvance ? "No answer provided." : undefined);
    if (isLast) return;
    setCurrentIdx((i) => i + 1);
    setTimeLeft(120);
  }

  const categoryColor =
    q.category === "technical"
      ? "#7C9ADD"
      : q.category === "system_design"
        ? "#98C9A3"
        : "#B8C1EC"; // Soft violet

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeString = `${mins}:${secs.toString().padStart(2, "0")}`;
  const isUrgent = timeLeft <= 30;

  return (
    <div className="flex flex-col gap-10 animate-fade-up max-w-6xl lg:max-w-7xl mx-auto w-full pb-20 px-4 mt-8">
      {needsFullscreen && !terminated && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="glass-card w-full max-w-xl p-10 rounded-[40px] bg-white/70 border border-white shadow-2xl">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#718096] mb-3">
              Fullscreen required
            </div>
            <h3 className="font-display font-black text-3xl tracking-tight text-[#17232E] mb-4">
              Enter fullscreen to continue
            </h3>
            <p className="text-sm font-body text-[#4A5568] leading-relaxed font-medium mb-8">
              This is a proctored interview. Leaving fullscreen or switching
              tabs triggers warnings.
            </p>
            <div className="flex gap-4 justify-end">
              <button
                type="button"
                onClick={() => void requestFullscreen()}
                className="px-10 py-4 rounded-[28px] bg-linear-to-r from-[#2D3748] to-[#4A5568] text-white font-display font-black shadow-2xl hover:scale-[1.01] active:scale-[0.98] transition-all"
              >
                Enter fullscreen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header / Progress Area */}
      <div className="w-full flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#7C9ADD]/10 flex items-center justify-center border border-[#7C9ADD]/20 shadow-sm">
              <Brain size={24} className="text-[#7C9ADD]" />
            </div>
            <div>
              <h2 className="font-display font-bold text-3xl tracking-tight text-[#2D3748]">
                Question {currentIdx + 1}
                <span className="text-lg font-medium ml-3 text-[#A0AEC0]">
                  / {session.questions.length}
                </span>
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {session.questions.map((_, i) => (
              <div
                key={i}
                className={`h-2 transition-all duration-700 rounded-full ${
                  i < currentIdx
                    ? "bg-[#7C9ADD] w-10 opacity-40 shadow-sm"
                    : i === currentIdx
                      ? "bg-linear-to-r from-[#7C9ADD] to-[#98C9A3] w-20 shadow-lg shadow-[#7C9ADD]/20"
                      : "bg-[#E2E8F0] w-10"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Timer */}
        {true && (
          <div className="flex items-center gap-4 flex-wrap justify-end">
            <div
              className={`flex items-center gap-3 px-8 py-5 rounded-[24px] text-sm font-bold transition-all duration-500 border border-white/60 ${
                isUrgent
                  ? "animate-pulse bg-red-50 text-red-500 shadow-lg shadow-red-200"
                  : "bg-white/40 backdrop-blur-md text-[#4A5568] shadow-glass"
              }`}
            >
              <Timer
                size={20}
                className={isUrgent ? "text-red-500" : "text-[#7C9ADD]"}
              />
              <span className="tabular-nums tracking-wider">{timeString}</span>
            </div>

            <div
              className={`flex items-center gap-2 px-6 py-4 rounded-[24px] text-[11px] font-black uppercase tracking-[0.25em] border ${
                malpracticeWarnings > 0
                  ? "bg-amber-50 text-amber-700 border-amber-100"
                  : "bg-white/40 text-[#718096] border-white/60"
              }`}
            >
              Warnings:{" "}
              <span className="tabular-nums">{malpracticeWarnings}</span>/3
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-8 px-4">
        {/* Main Question Card */}
        <div className="flex flex-col gap-6">
          <div className="glass-card p-12 md:p-16 relative overflow-hidden group rounded-[48px] shadow-glass bg-white/40 border border-white/60 backdrop-blur-xl">
            {/* Ambient Background Aura */}
            <div
              className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full blur-[120px] opacity-10 pointer-events-none transition-all duration-1000 group-hover:opacity-20 translate-y-[-20%] translate-x-[20%]"
              style={{ background: categoryColor }}
            />

            <div className="flex flex-wrap items-center gap-4 mb-8 relative z-10">
              <span
                className="px-5 py-2 text-[10px] font-black uppercase tracking-[0.25em] rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm border border-white"
                style={{ color: categoryColor }}
              >
                {q.category.replace("_", " ")}
              </span>
              <span className="px-5 py-2 text-[10px] font-black uppercase tracking-[0.25em] rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm border border-white text-[#718096]">
                {q.difficulty}
              </span>
            </div>

            <h3
              className="font-display font-bold text-3xl md:text-5xl leading-tight mb-10 relative z-10 text-[#2D3748] tracking-tighter text-balance select-none"
              onCopy={(e) => e.preventDefault()}
              onCut={(e) => e.preventDefault()}
              onContextMenu={(e) => e.preventDefault()}
            >
              {q.question}
            </h3>

            {q.expected_topics.length > 0 && (
              <div className="mb-10 relative z-10">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 block text-[#A0AEC0]">
                  Core Paradigms
                </span>
                <div className="flex flex-wrap gap-3">
                  {q.expected_topics.map((topic) => (
                    <span
                      key={topic}
                      className="px-5 py-2.5 rounded-2xl bg-white/60 text-[11px] font-bold uppercase tracking-wider text-[#4A5568] border border-white shadow-sm hover:bg-white hover:shadow-md hover:-translate-y-1 transition-all cursor-default"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="p-8 rounded-[32px] relative z-10 bg-[#7C9ADD]/5 border border-[#7C9ADD]/10 backdrop-blur-sm shadow-glass group/tip">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-[#7C9ADD] text-white shadow-lg shadow-[#7C9ADD]/30 group-hover/tip:scale-110 transition-transform">
                  <Sparkles size={18} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#7C9ADD]">
                  Strategic Insight
                </span>
              </div>
              <p className="text-[15px] font-body text-[#4A5568] leading-relaxed font-medium">
                {q.category === "behavioral"
                  ? "Utilize the STAR framework. Weave a narrative that highlights decision-making under pressure and quantifiable impact."
                  : q.category === "system_design"
                    ? "Architect from first principles. Address scalability bottlenecks and data consistency tradeoffs head-on."
                    : "Unpack the technical rationale. Elaborate on implementation tradeoffs and share a battle-tested perspective."}
              </p>
            </div>
          </div>

          {/* Answer Area */}
          <div className="flex flex-col gap-6 mt-6">
            <div className="flex items-center justify-between px-6">
              <div className="flex items-center gap-3">
                <span className="w-8 h-px bg-[#718096]/20" />
                <span className="text-[11px] font-black tracking-[0.25em] uppercase text-[#718096]">
                  Your Technical Response
                </span>
              </div>
              <div className="flex items-center gap-3">
                {session.answer_mode !== "text" && (
                  <span className="text-[10px] font-black tracking-[0.2em] uppercase px-4 py-1.5 rounded-full bg-[#7C9ADD] text-white shadow-lg shadow-[#7C9ADD]/20 animate-pulse">
                    {session.answer_mode} Mode Active
                  </span>
                )}
                {isVoiceMode && (
                  <button
                    type="button"
                    onClick={toggleListening}
                    disabled={!speechSupported || submitting}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border transition-all ${
                      isListening
                        ? "bg-red-50 text-red-600 border-red-100"
                        : "bg-white/60 text-[#2D3748] border-white/60 hover:bg-white/80"
                    } disabled:opacity-50`}
                    aria-pressed={isListening}
                  >
                    {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                    {isListening ? "Stop" : "Record"}
                  </button>
                )}
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-linear-to-br from-[#7C9ADD]/5 to-[#98C9A3]/5 blur-[20px] rounded-[40px] opacity-0 group-focus-within:opacity-100 transition-opacity" />
              <textarea
                id={`answer-${q.question_id}`}
                className="w-full rounded-[40px] p-10 text-xl leading-relaxed resize-none min-h-[220px] transition-all duration-700 font-body outline-none bg-white/40 backdrop-blur-xl border border-white/60 text-[#2D3748] placeholder:text-[#A0AEC0] shadow-glass focus:bg-white/60 focus:border-[#7C9ADD]/50 focus:shadow-2xl focus:shadow-[#7C9ADD]/10 relative z-10"
                placeholder={
                  session.answer_mode === "text"
                    ? "Formulate your narrative here. Balance technical depth with clear structural logic..."
                    : session.answer_mode === "voice"
                      ? speechSupported
                        ? "Press Record and speak. Your transcript will appear here..."
                        : "Voice transcript isn’t supported in this browser. Please type your answer instead."
                      : "Type your answer here..."
                }
                value={answer}
                onChange={(e) => {
                  const next = e.target.value;
                  setAnswer(next);
                  setAnswersByQuestionId((prev) => ({
                    ...prev,
                    [q.question_id]: next,
                  }));
                }}
                onPaste={(e) => {
                  e.preventDefault();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                }}
                disabled={submitting || needsFullscreen || terminated}
              />
            </div>

            <div className="mt-4 flex justify-end gap-4">
              {!isLast ? (
                <button
                  type="button"
                  className="flex items-center gap-5 px-14 py-6 rounded-[32px] bg-linear-to-r from-[#7C9ADD] to-[#6b89cc] text-white shadow-2xl shadow-[#7C9ADD]/40 hover:scale-[1.02] hover:shadow-indigo-300/50 active:scale-[0.98] transition-all group disabled:opacity-50 disabled:scale-100"
                  onClick={() => handleNext(false)}
                  disabled={submitting || needsFullscreen || terminated}
                >
                  <span className="font-display font-black text-2xl tracking-tighter">
                    Next Question
                  </span>
                  <ChevronRight
                    size={28}
                    className="group-hover:translate-x-1.5 transition-transform"
                  />
                </button>
              ) : (
                <button
                  type="button"
                  className="flex items-center gap-5 px-14 py-6 rounded-[32px] bg-linear-to-r from-[#2D3748] to-[#4A5568] text-white shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all group disabled:opacity-50 disabled:scale-100"
                  onClick={() => void handleFinish()}
                  disabled={submitting || needsFullscreen || terminated}
                >
                  <span className="font-display font-black text-2xl tracking-tighter">
                    {submitting ? "Evaluating Session..." : "Finish & Evaluate"}
                  </span>
                  {!submitting && (
                    <ChevronRight
                      size={28}
                      className="group-hover:translate-x-1.5 transition-transform"
                    />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
