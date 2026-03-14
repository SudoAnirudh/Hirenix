"use client";
import { useState, useEffect } from "react";
import { submitAnswer } from "@/lib/api";
import { ChevronRight, CheckCircle, Timer } from "lucide-react";

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
      ? "var(--cyan)"
      : q.category === "system_design"
        ? "var(--indigo)"
        : "var(--violet)";

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeString = `${mins}:${secs.toString().padStart(2, "0")}`;
  const isUrgent = timeLeft <= 30;

  return (
    <div className="flex flex-col gap-8 animate-fade-up max-w-5xl mx-auto w-full">
      {/* Header / Progress Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-black text-2xl tracking-tight uppercase mb-1 text-[var(--text-primary)]">
            Question {currentIdx + 1}
            <span className="text-lg font-bold ml-2 text-[var(--text-muted)]">
              / {session.questions.length}
            </span>
          </h2>
          <div className="flex items-center gap-1.5 mt-2">
            {session.questions.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-none border-2 border-[var(--border)] transition-all ${
                  i < currentIdx
                    ? "bg-[var(--indigo)] border-[var(--indigo)] w-4"
                    : i === currentIdx
                      ? "bg-[var(--violet)] border-[var(--violet)] w-8"
                      : "bg-[#111] w-4"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Timer */}
        {!feedback && (
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-none text-sm font-bold border-2 transition-all ${
              isUrgent
                ? "animate-timer-pulse border-red-500 bg-red-500/10 text-red-500 shadow-[4px_4px_0px_rgba(239,68,68,1)] translate-x-[-2px] translate-y-[-2px]"
                : "border-[var(--border)] bg-[#111] text-[var(--text-primary)] shadow-[4px_4px_0px_var(--border)]"
            }`}
          >
            <Timer size={16} className={isUrgent ? "animate-pulse" : ""} />
            <span className="tracking-widest tabular-nums font-mono">
              {timeString}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left/Top Area: Question Details */}
        <div className="lg:col-span-12 flex flex-col gap-6">
          <div className="glass-card p-8 md:p-10 relative overflow-hidden group rounded-none border-2 border-[var(--border)] bg-[#050505] shadow-[8px_8px_0px_var(--border)]">
            {/* Decorative Element */}
            <div
              className="absolute -top-32 -right-32 w-80 h-80 rounded-full blur-[100px] opacity-10 pointer-events-none transition-opacity duration-1000 group-hover:opacity-20"
              style={{ background: categoryColor }}
            />

            <div className="flex flex-wrap items-center gap-3 mb-6 relative z-10">
              <span
                className="px-3 py-1 text-[11px] font-mono font-bold uppercase tracking-widest border-2 bg-black shadow-[2px_2px_0px_currentColor]"
                style={{ color: categoryColor, borderColor: categoryColor }}
              >
                {q.category.replace("_", " ")}
              </span>
              <span className="px-3 py-1 text-[11px] font-mono font-bold uppercase tracking-widest border-2 border-[var(--border)] bg-[#111] text-[var(--text-secondary)] shadow-[2px_2px_0px_var(--border)]">
                {q.difficulty}
              </span>
            </div>

            <h3 className="font-display font-black text-2xl md:text-3xl lg:text-4xl leading-tight mb-8 relative z-10 text-balance tracking-tight text-[var(--text-primary)] uppercase">
              {q.question}
            </h3>

            {q.expected_topics.length > 0 && (
              <div className="mb-8 relative z-10">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest mb-3 block text-[var(--text-secondary)]">
                  Target Topics
                </span>
                <div className="flex flex-wrap gap-2">
                  {q.expected_topics.map((topic) => (
                    <span
                      key={topic}
                      className="px-3 py-1.5 border-2 border-[var(--border)] bg-[#111] text-xs font-mono font-bold text-[var(--text-primary)] shadow-[2px_2px_0px_var(--border)] uppercase"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="p-5 md:p-6 text-sm leading-relaxed relative z-10 border-2 border-[var(--indigo)] bg-[var(--indigo)]/5">
              <div className="flex items-center gap-2 mb-2">
                <div className="text-[var(--indigo)]">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
                </div>
                <span className="font-mono font-bold uppercase tracking-widest text-[var(--indigo)]">
                  Coaching Structure
                </span>
              </div>
              <span className="font-mono font-medium text-[var(--text-primary)]">
                {q.category === "behavioral"
                  ? "Use the STAR method (Situation, Task, Action, Result) and keep the Action section concrete. Focus on your specific contributions."
                  : q.category === "system_design"
                    ? "State assumptions clearly, outline the high-level architecture, then explain potential bottlenecks and tradeoffs."
                    : "Define the core concept, explain tradeoffs objectively, then anchor your explanation with a concrete, real-world example."}
              </span>
            </div>
          </div>

          {/* Answer Area */}
          <div className="flex flex-col gap-4">
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase flex items-center justify-between text-[var(--text-secondary)]">
              <span>Your Response</span>
              {session.answer_mode !== "text" && (
                <span className="text-[10px] font-bold tracking-widest uppercase border-2 border-[var(--border)] px-2 py-0.5 bg-[#111] text-[var(--text-primary)]">
                  {session.answer_mode} MODE
                </span>
              )}
            </span>
            <div className="relative group">
              <textarea
                id={`answer-${q.question_id}`}
                className="w-full rounded-none p-6 text-base leading-relaxed resize-y min-h-[180px] transition-all duration-200 font-mono font-medium outline-none bg-[#050505] border-2 border-[var(--border)] text-[var(--text-primary)] focus:border-[var(--primary)] focus:shadow-[4px_4px_0px_var(--primary)] focus:-translate-y-1 focus:-translate-x-1"
                placeholder={
                  session.answer_mode === "text"
                    ? "Type your answer here. Be specific, mention tradeoffs, and use examples..."
                    : `Respond via ${session.answer_mode === "audio" ? "voice" : "video"}, then summarize or provide key points here for analysis...`
                }
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={!!feedback}
                onPaste={(e) => {
                  if (proctoringEnabled) e.preventDefault();
                }}
                onCopy={(e) => {
                  if (proctoringEnabled) e.preventDefault();
                }}
                onCut={(e) => {
                  if (proctoringEnabled) e.preventDefault();
                }}
              />
            </div>

            {!feedback && (
              <div className="mt-2 flex justify-end">
                <button
                  id="submit-answer-btn"
                  className="btn-primary flex items-center gap-3 px-8 py-4"
                  onClick={() => handleSubmit(false)}
                  disabled={submitting || !answer.trim()}
                >
                  <span className="font-display font-black tracking-tight uppercase">
                    {submitting ? "Evaluating Response…" : "Submit Answer"}
                  </span>
                  {!submitting && <ChevronRight size={18} strokeWidth={3} />}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Feedback Section */}
        {feedback && (
          <div className="lg:col-span-12 animate-fade-up mt-6">
            <div className="glass-card overflow-hidden rounded-none border-2 border-[var(--emerald)] bg-[#050505] shadow-[8px_8px_0px_var(--emerald)] relative">
              {/* Feedback Header */}
              <div className="p-8 md:p-10 border-b-2 border-[var(--emerald)] relative bg-black">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--emerald)]/10 blur-[50px] pointer-events-none" />
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 flex items-center justify-center border-2 border-[var(--emerald)] bg-[var(--emerald)]/20 text-[var(--emerald)]">
                        <CheckCircle size={24} strokeWidth={2.5} />
                      </div>
                      <span className="font-display font-black text-2xl lg:text-3xl tracking-tight uppercase text-[var(--emerald)]">
                        Evaluation Complete
                      </span>
                    </div>
                    <p className="text-sm font-mono text-[var(--text-secondary)]">
                      Detailed breakdown of your response based on the rubric
                      for {q.category.replace("_", " ")} questions.
                    </p>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-widest mb-1 text-[var(--emerald)]">
                      Overall Score
                    </span>
                    <div className="font-display font-black text-6xl tracking-tighter leading-none text-[var(--emerald)]">
                      {feedback.score}
                      <span className="text-3xl opacity-40">/10</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 md:p-10 bg-[#050505]">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
                  {/* Left Column: Scores */}
                  <div className="lg:col-span-4 flex flex-col gap-6">
                    <h4 className="font-mono font-bold text-xs uppercase tracking-widest text-[var(--text-secondary)]">
                      Metrics Dashboard
                    </h4>
                    <div className="flex flex-col gap-6">
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
                        <div key={label} className="group">
                          <div className="flex justify-between items-end mb-2.5">
                            <span className="text-sm font-display font-bold uppercase tracking-tight text-[var(--text-primary)] opacity-80 group-hover:opacity-100 transition-opacity">
                              {label}
                            </span>
                            <span className="text-sm font-bold font-mono text-[var(--text-primary)]">
                              {val}
                              <span className="opacity-40 text-xs">/10</span>
                            </span>
                          </div>
                          <div className="h-2.5 rounded-none overflow-hidden bg-[#111] border border-[var(--border)]">
                            <div
                              className="h-full rounded-none transition-all duration-1000 ease-out"
                              style={{
                                width: `${val * 10}%`,
                                background:
                                  val >= 8
                                    ? "var(--emerald)"
                                    : val >= 5
                                      ? "var(--cyan)"
                                      : "var(--pink)",
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Strengths, Improvements & Coaching */}
                  <div className="lg:col-span-8 flex flex-col gap-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-6 border-2 border-[var(--emerald)] bg-[var(--emerald)]/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--emerald)]/10 transition-transform group-hover:scale-110" />
                        <div className="flex items-center gap-2 mb-5 relative z-10">
                          <div className="w-2.5 h-2.5 rounded-none bg-[var(--emerald)]" />
                          <div className="font-mono font-bold text-sm tracking-widest uppercase text-[var(--emerald)]">
                            Key Strengths
                          </div>
                        </div>
                        <div className="flex flex-col gap-4 relative z-10">
                          {feedback.strengths.map((s: string, i: number) => (
                            <div key={i} className="flex items-start gap-3">
                              <span className="text-[var(--emerald)] font-bold mt-0.5">
                                ✓
                              </span>
                              <p className="text-sm leading-relaxed font-mono font-medium text-[var(--text-primary)]">
                                {s}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-6 border-2 border-[var(--pink)] bg-[var(--pink)]/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--pink)]/10 transition-transform group-hover:scale-110" />
                        <div className="flex items-center gap-2 mb-5 relative z-10">
                          <div className="w-2.5 h-2.5 rounded-none bg-[var(--pink)]" />
                          <div className="font-mono font-bold text-sm tracking-widest uppercase text-[var(--pink)]">
                            Areas to Improve
                          </div>
                        </div>
                        <div className="flex flex-col gap-4 relative z-10">
                          {feedback.improvements.map((s: string, i: number) => (
                            <div key={i} className="flex items-start gap-3">
                              <span className="text-[var(--pink)] font-bold mt-0.5">
                                →
                              </span>
                              <p className="text-sm leading-relaxed font-mono font-medium text-[var(--text-primary)]">
                                {s}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-5">
                      <div className="p-6 relative border-2 border-[var(--violet)] bg-[var(--violet)]/5">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[var(--violet)]">
                            Actionable Coaching Tip
                          </span>
                        </div>
                        <p className="text-sm font-mono font-bold leading-relaxed text-[var(--text-primary)]">
                          {feedback.coaching_tip}
                        </p>
                      </div>

                      <div className="p-6 border-2 border-[var(--border)] bg-[#111]">
                        <span className="text-[11px] font-mono font-bold uppercase tracking-widest mb-3 block text-[var(--text-muted)]">
                          Model Answer Pattern
                        </span>
                        <p className="text-sm leading-relaxed font-mono font-medium text-[var(--text-secondary)] italic">
                          &quot;{feedback.model_answer}&quot;
                        </p>
                      </div>

                      {q.follow_up_prompt && (
                        <div className="p-6 border-2 border-[var(--indigo)] bg-[var(--indigo)]/5">
                          <span className="text-[11px] font-mono font-bold uppercase tracking-widest mb-2 block text-[var(--indigo)]">
                            Follow-up Prompt (Next Step)
                          </span>
                          <p className="text-sm font-mono font-bold leading-relaxed text-[var(--text-primary)]">
                            {q.follow_up_prompt}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="pt-6 flex flex-col md:flex-row justify-between items-center gap-4 border-t-2 border-[var(--border)] mt-4">
                      <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--text-secondary)] text-center md:text-left">
                        {isLast
                          ? "You've reached the end."
                          : "Ready to proceed?"}
                      </div>
                      <button
                        className="btn-primary flex items-center justify-center gap-2 px-8 py-4 w-full md:w-auto"
                        onClick={handleNext}
                      >
                        <span className="font-display font-black tracking-tight uppercase">
                          {isLast ? "View Final Report" : "Next Question"}
                        </span>
                        <ChevronRight size={18} strokeWidth={3} />
                      </button>
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
