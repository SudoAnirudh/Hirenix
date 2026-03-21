"use client";
import { useState, useEffect } from "react";
import { submitAnswer } from "@/lib/api";
import {
  ChevronRight,
  CheckCircle,
  Timer,
  Brain,
  TrendingUp,
} from "lucide-react";

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

interface Props {
  session: Session;
  proctoringEnabled: boolean;
  onComplete: (scores: Feedback[]) => void;
}

export default function InterviewPanel({
  session,
  proctoringEnabled,
  onComplete,
}: Props) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [allFeedback, setAllFeedback] = useState<Feedback[]>([]);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes per question

  const q = session.questions[currentIdx];
  const isLast = currentIdx === session.questions.length - 1;

  useEffect(() => {
    if (feedback || submitting) return;

    if (timeLeft <= 0) {
      if (!feedback && !submitting) {
        void handleSubmit(true);
      }
      return;
    }

    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, feedback, submitting]);

  async function handleSubmit(autoSubmit = false) {
    let finalAnswer = answer.trim();
    if (!finalAnswer && !autoSubmit) return;
    if (!finalAnswer && autoSubmit) finalAnswer = "No answer provided.";

    setSubmitting(true);
    try {
      const fb = await submitAnswer(
        session.session_id,
        q.question_id,
        finalAnswer,
      );
      const fbTyped = fb as Feedback;
      setFeedback(fbTyped);
      setAllFeedback((prev) => [...prev, fbTyped]);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }

  function handleNext() {
    if (isLast) {
      onComplete(allFeedback);
      return;
    }
    setCurrentIdx((i) => i + 1);
    setAnswer("");
    setFeedback(null);
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
    <div className="flex flex-col gap-10 animate-fade-up max-w-5xl mx-auto w-full pb-20">
      {/* Header / Progress Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-4">
        <div className="flex-1">
          <h2 className="font-display font-bold text-3xl tracking-tight text-[#2D3748] mb-2">
            Question {currentIdx + 1}
            <span className="text-lg font-medium ml-3 text-[#A0AEC0]">
              / {session.questions.length}
            </span>
          </h2>
          <div className="flex items-center gap-3">
            {session.questions.map((_, i) => (
              <div
                key={i}
                className={`h-2 transition-all duration-700 rounded-full ${
                  i < currentIdx
                    ? "bg-[#7C9ADD] w-10 opacity-40"
                    : i === currentIdx
                      ? "bg-[#7C9ADD] w-16 shadow-lg shadow-[#7C9ADD]/20"
                      : "bg-[#E2E8F0] w-10"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Timer */}
        {!feedback && (
          <div
            className={`flex items-center gap-3 px-8 py-4 rounded-[20px] text-sm font-bold transition-all duration-500 border border-(--border) ${
              isUrgent
                ? "animate-pulse bg-[#F28C8C]/5 text-[#F28C8C] shadow-lg shadow-[#F28C8C]/10"
                : "bg-white/40 backdrop-blur-sm text-[#4A5568] shadow-glass"
            }`}
          >
            <Timer
              size={20}
              className={isUrgent ? "text-[#F28C8C]" : "text-[#7C9ADD]"}
            />
            <span className="tabular-nums tracking-tight">{timeString}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-6 px-4">
        {/* Main Question Card */}
        <div className="flex flex-col gap-4">
          <div className="glass-card p-10 md:p-12 relative overflow-hidden group rounded-[40px] shadow-glass bg-white/50 border border-white/60">
            {/* Decorative Glow */}
            <div
              className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-[100px] opacity-10 pointer-events-none transition-opacity duration-1000 group-hover:opacity-20"
              style={{ background: categoryColor }}
            />

            <div className="flex flex-wrap items-center gap-3 mb-6 relative z-10 transition-transform duration-500">
              <span
                className="px-4 py-1 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full bg-white/80 backdrop-blur-sm shadow-sm border border-white/40"
                style={{ color: categoryColor }}
              >
                {q.category.replace("_", " ")}
              </span>
              <span className="px-4 py-1 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full bg-white/80 backdrop-blur-sm shadow-sm border border-white/40 text-[#718096]">
                {q.difficulty}
              </span>
            </div>

            <h3 className="font-display font-bold text-2xl md:text-4xl leading-[1.1] mb-8 relative z-10 text-[#2D3748] tracking-tighter text-balance">
              {q.question}
            </h3>

            {q.expected_topics.length > 0 && (
              <div className="mb-8 relative z-10">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] mb-3 block text-[#A0AEC0]">
                  Target Topics
                </span>
                <div className="flex flex-wrap gap-2">
                  {q.expected_topics.map((topic) => (
                    <span
                      key={topic}
                      className="px-4 py-2 rounded-xl bg-white/40 text-[12px] font-semibold text-[#4A5568] border border-white/60 hover:bg-white/80 hover:shadow-glass hover:-translate-y-0.5 transition-all cursor-default"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="p-6 rounded-[24px] relative z-10 bg-[#7C9ADD]/5 border border-[#7C9ADD]/10 backdrop-blur-sm shadow-inner group/tip">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-[#7C9ADD] text-white shadow-lg shadow-[#7C9ADD]/20 group-hover/tip:scale-110 transition-transform">
                  <Brain size={16} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#7C9ADD]">
                  Strategy Guide
                </span>
              </div>
              <p className="text-sm font-body text-[#4A5568] leading-relaxed">
                {q.category === "behavioral"
                  ? "Use the STAR method (Situation, Task, Action, Result). Focus on specific contributions and quantified results."
                  : q.category === "system_design"
                    ? "Outline high-level architecture first, then explain specific bottlenecks and tradeoffs."
                    : "Define the core concept, explore tradeoffs, and provide a concrete real-world example."}
              </p>
            </div>
          </div>

          {/* Answer Area */}
          <div className="flex flex-col gap-6 mt-4">
            <div className="flex items-center justify-between px-4">
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#718096]">
                Your Response
              </span>
              {session.answer_mode !== "text" && (
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-full bg-[#7C9ADD] text-white shadow-lg shadow-[#7C9ADD]/20">
                  {session.answer_mode} ACTIVE
                </span>
              )}
            </div>
            <div className="relative group">
              <textarea
                id={`answer-${q.question_id}`}
                className="w-full rounded-[32px] p-8 text-lg leading-relaxed resize-none min-h-[160px] transition-all duration-500 font-body outline-none bg-white/40 backdrop-blur-md border border-white/60 text-[#2D3748] placeholder:text-[#A0AEC0] shadow-glass focus:bg-white/60 focus:border-[#7C9ADD]/50 focus:shadow-xl focus:shadow-[#7C9ADD]/10"
                placeholder={
                  session.answer_mode === "text"
                    ? "Draft your response here. Anchor your points with clear examples and technical depth..."
                    : `Respond via ${session.answer_mode === "audio" ? "voice" : "video"}, then summarize key points here...`
                }
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={!!feedback}
              />
            </div>

            {!feedback && (
              <div className="mt-4 flex justify-end">
                <button
                  id="submit-answer-btn"
                  className="flex items-center gap-4 px-12 py-5 rounded-[24px] bg-[#7C9ADD] text-white shadow-lg shadow-[#7C9ADD]/30 hover:bg-[#7C9ADD]/90 hover:shadow-2xl hover:-translate-y-1 transition-all group disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
                  onClick={() => handleSubmit(false)}
                  disabled={submitting || !answer.trim()}
                >
                  <span className="font-display font-bold text-xl tracking-tight">
                    {submitting
                      ? "Analyzing performance..."
                      : "Submit Response"}
                  </span>
                  {!submitting && (
                    <ChevronRight
                      size={24}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Feedback Section */}
        {feedback && (
          <div className="animate-fade-up mt-10">
            <div className="glass-card overflow-hidden rounded-[40px] border border-white/60 bg-white/60 shadow-glass relative">
              {/* Feedback Header */}
              <div className="p-12 md:p-16 border-b border-white/40 relative">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#98C9A3]/10 blur-[90px] pointer-events-none" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 relative z-10">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 flex items-center justify-center rounded-[32px] bg-[#98C9A3] text-white shadow-xl shadow-[#98C9A3]/30 shrink-0">
                      <CheckCircle size={36} strokeWidth={1.5} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#98C9A3] block mb-2">
                        Evaluation Complete
                      </span>
                      <h4 className="font-display font-bold text-4xl text-[#2D3748] tracking-tighter">
                        Insightful Analysis
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 px-10 py-6 rounded-[32px] bg-white/40 shrink-0 border border-white/60 shadow-inner">
                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#718096] block mb-1">
                        Impact Score
                      </span>
                      <div className="font-display font-bold text-6xl tracking-tighter text-[#98C9A3] leading-none">
                        {feedback.score}
                        <span className="text-2xl opacity-30 ml-2">/ 10</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-12 md:p-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
                  {/* Left Column: Scores */}
                  <div className="lg:col-span-12 xl:col-span-5 flex flex-col gap-10">
                    <div className="flex items-center gap-4">
                      <span className="w-12 h-0.5 bg-[#7C9ADD]/20 rounded-full" />
                      <h5 className="text-[10px] font-bold text-[#A0AEC0] uppercase tracking-[0.3em]">
                        Performance Metrics
                      </h5>
                    </div>
                    <div className="flex flex-col gap-10">
                      {[
                        { label: "Clarity", val: feedback.clarity_score },
                        { label: "Technical", val: feedback.technical_score },
                        { label: "Depth", val: feedback.depth_score },
                        {
                          label: "Communication",
                          val: feedback.communication_score,
                        },
                        {
                          label: "Problem Solving",
                          val: feedback.problem_solving_score,
                        },
                      ].map(({ label, val }) => (
                        <div key={label} className="group/metric">
                          <div className="flex justify-between items-end mb-4">
                            <span className="text-xs font-bold uppercase tracking-widest text-[#718096] group-hover/metric:text-[#2D3748] transition-colors">
                              {label}
                            </span>
                            <span className="text-lg font-bold text-[#2D3748] tabular-nums">
                              {val}{" "}
                              <span className="text-xs text-[#A0AEC0] font-medium ml-1">
                                / 10
                              </span>
                            </span>
                          </div>
                          <div className="h-2.5 rounded-full overflow-hidden bg-white/40 border border-white/60 shadow-inner">
                            <div
                              className="h-full rounded-full transition-all duration-1000 ease-out shadow-glass"
                              style={{
                                width: `${val * 10}%`,
                                background:
                                  val >= 8
                                    ? "#98C9A3"
                                    : val >= 5
                                      ? "#7C9ADD"
                                      : "#F28C8C",
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Strengths & Improvements */}
                  <div className="lg:col-span-12 xl:col-span-7 flex flex-col gap-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="p-10 rounded-[32px] bg-[#98C9A3]/5 border border-[#98C9A3]/10 group/s">
                        <div className="flex items-center gap-4 mb-8">
                          <div className="p-3 rounded-2xl bg-[#98C9A3] text-white shadow-lg shadow-[#98C9A3]/30 group-hover/s:scale-110 transition-transform">
                            <CheckCircle size={20} />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#98C9A3]">
                            Strengths
                          </span>
                        </div>
                        <ul className="space-y-6">
                          {feedback.strengths.map((s: string, i: number) => (
                            <li
                              key={i}
                              className="flex gap-4 text-[15px] font-medium text-[#4A5568] leading-relaxed"
                            >
                              <span className="text-[#98C9A3] font-bold">
                                ✓
                              </span>
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-10 rounded-[32px] bg-[#E6B17E]/5 border border-[#E6B17E]/10 group/i">
                        <div className="flex items-center gap-4 mb-8">
                          <div className="p-3 rounded-2xl bg-[#E6B17E] text-white shadow-lg shadow-[#E6B17E]/30 group-hover/i:scale-110 transition-transform">
                            <TrendingUp size={20} />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#E6B17E]">
                            Focus Areas
                          </span>
                        </div>
                        <ul className="space-y-6">
                          {feedback.improvements.map((s: string, i: number) => (
                            <li
                              key={i}
                              className="flex gap-4 text-[15px] font-medium text-[#4A5568] leading-relaxed"
                            >
                              <span className="text-[#E6B17E] font-bold">
                                →
                              </span>
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="flex flex-col gap-8">
                      <div className="p-10 rounded-[32px] bg-[#7C9ADD]/5 border border-[#7C9ADD]/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#7C9ADD]/10 blur-[50px] pointer-events-none" />
                        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#7C9ADD] block mb-4">
                          Coaching Insight
                        </span>
                        <p className="font-display font-bold text-xl leading-relaxed text-[#2D3748] italic">
                          &quot;{feedback.coaching_tip}&quot;
                        </p>
                      </div>

                      <div className="pt-10 flex flex-col md:flex-row justify-between items-center gap-8 border-t border-white/40 mt-4">
                        <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#A0AEC0]">
                          {isLast
                            ? "Session Complete"
                            : "Reviewed · Ready for next"}
                        </div>
                        <button
                          className="flex items-center justify-center gap-4 px-12 py-5 rounded-[24px] bg-[#7C9ADD] text-white shadow-lg shadow-[#7C9ADD]/30 hover:bg-[#7C9ADD]/90 hover:shadow-2xl hover:-translate-y-1 transition-all group w-full md:w-auto"
                          onClick={handleNext}
                        >
                          <span className="font-display font-bold text-xl tracking-tight">
                            {isLast
                              ? "Finish Studio Session"
                              : "Next Challenge"}
                          </span>
                          <ChevronRight
                            size={24}
                            className="group-hover:translate-x-1 transition-transform"
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
