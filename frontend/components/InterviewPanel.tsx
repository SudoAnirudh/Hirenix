"use client";
import { useState, useEffect } from "react";
import { submitAnswer } from "@/lib/api";
import { ChevronRight, CheckCircle, Timer } from "lucide-react";

interface Question {
  question_id: string;
  question: string;
  category: string;
  difficulty: string;
}

interface Session {
  session_id: string;
  target_role: string;
  questions: Question[];
}

interface Feedback {
  score: number;
  clarity_score: number;
  technical_score: number;
  depth_score: number;
  communication_score: number;
  strengths: string[];
  improvements: string[];
  model_answer_hint: string;
}

interface Props {
  session: Session;
  onComplete: (scores: Feedback[]) => void;
}

export default function InterviewPanel({ session, onComplete }: Props) {
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
    q.category === "technical" ? "var(--cyan)" : "var(--violet)";

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeString = `${mins}:${secs.toString().padStart(2, "0")}`;
  const isUrgent = timeLeft <= 30;

  return (
    <div className="flex flex-col gap-5 animate-fade-up">
      {/* Progress */}
      <div className="flex items-center gap-3">
        {session.questions.map((_, i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full"
            style={{
              background:
                i < currentIdx
                  ? "var(--indigo)"
                  : i === currentIdx
                    ? "var(--violet)"
                    : "var(--bg-elevated)",
              transition: "background 0.3s",
            }}
          />
        ))}
      </div>
      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
        Question {currentIdx + 1} of {session.questions.length}
      </span>

      {/* Question card */}
      <div className="glass-card p-7 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span
            className="px-2 py-0.5 rounded text-xs font-medium"
            style={{ background: `${categoryColor}1a`, color: categoryColor }}
          >
            {q.category}
          </span>
          <span
            className="px-2 py-0.5 rounded text-xs"
            style={{
              background: "var(--bg-elevated)",
              color: "var(--text-muted)",
            }}
          >
            {q.difficulty}
          </span>

          {!feedback && (
            <div
              className={`ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${isUrgent ? "animate-timer-pulse" : ""}`}
              style={{
                background: isUrgent
                  ? "rgba(239,68,68,0.1)"
                  : "var(--bg-elevated)",
                color: isUrgent ? "#ef4444" : "var(--text-secondary)",
                border: `1px solid ${isUrgent ? "rgba(239,68,68,0.3)" : "var(--border)"}`,
              }}
            >
              <Timer size={14} />
              {timeString}
            </div>
          )}
        </div>
        <p className="font-medium text-base leading-relaxed">{q.question}</p>

        <textarea
          id={`answer-${q.question_id}`}
          className="input-base min-h-[120px] resize-y mt-2"
          placeholder="Type your answer here… Try to be specific and use examples."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={!!feedback}
          onPaste={(e) => e.preventDefault()}
          onCopy={(e) => e.preventDefault()}
          onCut={(e) => e.preventDefault()}
        />

        {!feedback && (
          <button
            id="submit-answer-btn"
            className="btn-primary self-start flex items-center gap-2"
            onClick={() => handleSubmit(false)}
            disabled={submitting || !answer.trim()}
          >
            {submitting ? "Evaluating…" : "Submit Answer"}{" "}
            {!submitting && <ChevronRight size={14} />}
          </button>
        )}
      </div>

      {/* Feedback */}
      {feedback && (
        <div className="glass-card p-6 flex flex-col gap-4 animate-fade-up">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} style={{ color: "var(--emerald)" }} />
            <span className="font-semibold text-sm">Answer Evaluated</span>
            <span className="ml-auto font-display font-bold text-lg gradient-text">
              {feedback.score}/10
            </span>
          </div>

          {/* Mini score bars */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Clarity", val: feedback.clarity_score },
              { label: "Technical", val: feedback.technical_score },
              { label: "Depth", val: feedback.depth_score },
              { label: "Communication", val: feedback.communication_score },
            ].map(({ label, val }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: "var(--text-secondary)" }}>
                    {label}
                  </span>
                  <span>{val}/10</span>
                </div>
                <div
                  className="h-1.5 rounded-full"
                  style={{ background: "var(--bg-elevated)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${val * 10}%`,
                      background:
                        "linear-gradient(90deg, var(--indigo), var(--violet))",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div
                className="font-medium mb-1"
                style={{ color: "var(--emerald)" }}
              >
                Strengths
              </div>
              {feedback.strengths.map((s: string, i: number) => (
                <p key={i} style={{ color: "var(--text-secondary)" }}>
                  ✓ {s}
                </p>
              ))}
            </div>
            <div>
              <div
                className="font-medium mb-1"
                style={{ color: "var(--indigo)" }}
              >
                To Improve
              </div>
              {feedback.improvements.map((s: string, i: number) => (
                <p key={i} style={{ color: "var(--text-secondary)" }}>
                  → {s}
                </p>
              ))}
            </div>
          </div>

          <p
            className="text-xs p-3 rounded-lg"
            style={{
              background: "var(--bg-elevated)",
              color: "var(--text-secondary)",
            }}
          >
            💡 {feedback.model_answer_hint}
          </p>

          <button className="btn-primary self-start" onClick={handleNext}>
            {isLast ? "Finish Interview" : "Next Question"}{" "}
            <ChevronRight size={14} className="inline ml-1" />
          </button>
        </div>
      )}
    </div>
  );
}
