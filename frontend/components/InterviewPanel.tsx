"use client";
import { useState, useEffect } from "react";
import { submitAnswer } from "@/lib/api";
import {
  ChevronRight,
  CheckCircle,
  Timer,
  Brain,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

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
    <div className="flex flex-col gap-10 animate-fade-up max-w-5xl mx-auto w-full pb-20 px-4 mt-8">
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
        {!feedback && (
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

            <h3 className="font-display font-bold text-3xl md:text-5xl leading-tight mb-10 relative z-10 text-[#2D3748] tracking-tighter text-balance">
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
              {session.answer_mode !== "text" && (
                <span className="text-[10px] font-black tracking-[0.2em] uppercase px-4 py-1.5 rounded-full bg-[#7C9ADD] text-white shadow-lg shadow-[#7C9ADD]/20 animate-pulse">
                  {session.answer_mode} Mode Active
                </span>
              )}
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-linear-to-br from-[#7C9ADD]/5 to-[#98C9A3]/5 blur-[20px] rounded-[40px] opacity-0 group-focus-within:opacity-100 transition-opacity" />
              <textarea
                id={`answer-${q.question_id}`}
                className="w-full rounded-[40px] p-10 text-xl leading-relaxed resize-none min-h-[220px] transition-all duration-700 font-body outline-none bg-white/40 backdrop-blur-xl border border-white/60 text-[#2D3748] placeholder:text-[#A0AEC0] shadow-glass focus:bg-white/60 focus:border-[#7C9ADD]/50 focus:shadow-2xl focus:shadow-[#7C9ADD]/10 relative z-10"
                placeholder={
                  session.answer_mode === "text"
                    ? "Formulate your narrative here. Balance technical depth with clear structural logic..."
                    : `Respond via ${session.answer_mode === "audio" ? "voice" : "video"} and Hirenix will capture the transcript...`
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
                  className="flex items-center gap-5 px-14 py-6 rounded-[32px] bg-linear-to-r from-[#7C9ADD] to-[#6b89cc] text-white shadow-2xl shadow-[#7C9ADD]/40 hover:scale-[1.02] hover:shadow-indigo-300/50 active:scale-[0.98] transition-all group disabled:opacity-50 disabled:scale-100"
                  onClick={() => handleSubmit(false)}
                  disabled={submitting || !answer.trim()}
                >
                  <span className="font-display font-black text-2xl tracking-tighter">
                    {submitting
                      ? "Analyzing Performance..."
                      : "Evaluate Performance"}
                  </span>
                  {!submitting && (
                    <ChevronRight
                      size={28}
                      className="group-hover:translate-x-1.5 transition-transform"
                    />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Feedback Section */}
        {feedback && (
          <div className="animate-fade-up mt-12 pb-20">
            <div className="glass-card overflow-hidden rounded-[48px] border border-white/60 bg-white/40 shadow-glass backdrop-blur-2xl relative">
              {/* Feedback Header */}
              <div className="p-14 md:p-20 border-b border-white/40 relative">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-linear-to-br from-[#98C9A3]/10 to-[#7C9ADD]/5 blur-[100px] pointer-events-none" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-12 relative z-10">
                  <div className="flex items-center gap-8">
                    <div className="w-24 h-24 flex items-center justify-center rounded-[36px] bg-[#98C9A3] text-white shadow-2xl shadow-[#98C9A3]/40 shrink-0 transform hover:rotate-3 transition-transform">
                      <CheckCircle size={44} strokeWidth={1.5} />
                    </div>
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-[0.4em] text-[#98C9A3] block mb-3">
                        Hirenix Evaluation
                      </span>
                      <h4 className="font-display font-bold text-5xl text-[#2D3748] tracking-tighter leading-none">
                        Deep Insight
                      </h4>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center gap-2 px-14 py-8 rounded-[40px] bg-white/50 shrink-0 border border-white shadow-lg">
                    <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[#718096]">
                      Impact Score
                    </span>
                    <div className="font-display font-bold text-7xl tracking-tighter text-[#2D3748] leading-none">
                      {feedback.score}
                      <span className="text-3xl opacity-20 ml-3 font-medium">
                        /10
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-14 md:p-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 xl:gap-24">
                  {/* Left Column: Scores */}
                  <div className="lg:col-span-12 xl:col-span-5 flex flex-col gap-12">
                    <div className="flex items-center gap-5">
                      <span className="w-16 h-0.5 bg-linear-to-r from-[#7C9ADD] to-transparent rounded-full" />
                      <h5 className="text-[11px] font-black text-[#A0AEC0] uppercase tracking-[0.4em]">
                        Performance Metrics
                      </h5>
                    </div>
                    <div className="flex flex-col gap-12">
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
                          <div className="flex justify-between items-end mb-5">
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#718096] group-hover/metric:text-[#2D3748] transition-colors">
                              {label}
                            </span>
                            <span className="text-2xl font-display font-bold text-[#2D3748] tabular-nums">
                              {val}
                              <span className="text-sm text-[#A0AEC0] font-medium ml-1.5 opacity-50">
                                /10
                              </span>
                            </span>
                          </div>
                          <div className="h-3 rounded-full overflow-hidden bg-white/40 border border-white shadow-inner p-px">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${val * 10}%` }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                              className="h-full rounded-full shadow-lg"
                              style={{
                                background:
                                  val >= 8
                                    ? "linear-gradient(90deg, #98C9A3, #7CC18F)"
                                    : val >= 5
                                      ? "linear-gradient(90deg, #7C9ADD, #9BA6D5)"
                                      : "linear-gradient(90deg, #F28C8C, #E57373)",
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Strengths & Improvements */}
                  <div className="lg:col-span-12 xl:col-span-7 flex flex-col gap-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="p-12 rounded-[40px] bg-[#98C9A3]/5 border border-[#98C9A3]/10 group/s hover:bg-[#98C9A3]/10 transition-colors shadow-sm">
                        <div className="flex items-center gap-5 mb-10">
                          <div className="p-3.5 rounded-2xl bg-[#98C9A3] text-white shadow-xl shadow-[#98C9A3]/30 group-hover/s:scale-110 group-hover/s:rotate-6 transition-transform">
                            <CheckCircle size={22} />
                          </div>
                          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[#98C9A3]">
                            Strengths
                          </span>
                        </div>
                        <ul className="space-y-8">
                          {feedback.strengths.map((s: string, i: number) => (
                            <li
                              key={i}
                              className="flex gap-5 text-lg font-body font-medium text-[#4A5568] leading-relaxed group-hover/item:translate-x-1 transition-transform"
                            >
                              <span className="text-[#98C9A3] font-black text-xl">
                                ✓
                              </span>
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-12 rounded-[40px] bg-amber-500/5 border border-amber-500/10 group/i hover:bg-amber-500/10 transition-colors shadow-sm">
                        <div className="flex items-center gap-5 mb-10">
                          <div className="p-3.5 rounded-2xl bg-amber-500 text-white shadow-xl shadow-amber-500/30 group-hover/i:scale-110 group-hover/i:-rotate-6 transition-transform">
                            <TrendingUp size={22} />
                          </div>
                          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-amber-500">
                            Growth Areas
                          </span>
                        </div>
                        <ul className="space-y-8">
                          {feedback.improvements.map((s: string, i: number) => (
                            <li
                              key={i}
                              className="flex gap-5 text-lg font-body font-medium text-[#4A5568] leading-relaxed"
                            >
                              <span className="text-amber-500 font-black text-xl">
                                →
                              </span>
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="flex flex-col gap-10">
                      <div className="p-12 rounded-[40px] border border-white bg-white/30 backdrop-blur-md relative overflow-hidden shadow-glass border-opacity-50">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-[#7C9ADD]/10 blur-[60px] pointer-events-none" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#7C9ADD] block mb-6">
                          Hirenix Mentorship Insight
                        </span>
                        <p className="font-display font-bold text-2xl leading-relaxed text-[#2D3748] italic tracking-tight">
                          &quot;{feedback.coaching_tip}&quot;
                        </p>
                      </div>

                      <div className="pt-12 flex flex-col md:flex-row justify-between items-center gap-10 border-t border-white/60 mt-6 px-4">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-3 h-3 rounded-full ${isLast ? "bg-emerald-500" : "bg-indigo-400"} shadow-lg animate-pulse`}
                          />
                          <div className="text-[11px] font-black uppercase tracking-[0.4em] text-[#A0AEC0]">
                            {isLast
                              ? "Narrative Finalized"
                              : "Review Captured · Transition Ready"}
                          </div>
                        </div>
                        <button
                          className="flex items-center justify-center gap-6 px-16 py-7 rounded-[40px] bg-linear-to-r from-[#2D3748] to-[#4A5568] text-white shadow-2xl hover:scale-[1.03] active:scale-[0.97] transition-all group w-full md:w-auto"
                          onClick={handleNext}
                        >
                          <span className="font-display font-black text-2xl tracking-tighter">
                            {isLast
                              ? "Complete Studio Session"
                              : "Engage Next Phase"}
                          </span>
                          <ChevronRight
                            size={28}
                            className="group-hover:translate-x-1.5 transition-transform"
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
