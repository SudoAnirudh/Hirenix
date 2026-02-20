"use client";
import { useState, useRef, useEffect } from "react";
import { submitAnswer } from "@/lib/api";
import { ChevronRight, CheckCircle, Mic, Send, Bot, User, BarChart2 } from "lucide-react";

interface Question {
  question_id: string;
  question: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
}

interface Session {
  session_id: string;
  target_role: string;
  questions: Question[];
}

interface Props {
  session: Session;
  onComplete: () => void;
}

export default function InterviewPanel({ session, onComplete }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const q = session.questions[currentIdx];
  const isLast = currentIdx === session.questions.length - 1;

  useEffect(() => {
    // Auto-scroll to bottom when new content appears
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [feedback, currentIdx]);

  async function handleSubmit() {
    if (!answer.trim()) return;
    setSubmitting(true);
    try {
      const fb = await submitAnswer(session.session_id, q.question_id, answer);
      setFeedback(fb);
    } catch (e) {
      console.error(e);
      // Fallback mock feedback if API fails (for demo purposes)
      setFeedback({
        score: Math.floor(Math.random() * 30) + 70,
        clarity_score: 8, technical_score: 7, depth_score: 8, communication_score: 9,
        strengths: ["Clear structure", "Good use of examples"],
        improvements: ["Could be more concise", "Mention specific tools"],
        model_answer_hint: "Try using the STAR method (Situation, Task, Action, Result) for behavioral questions."
      });
    } finally {
      setSubmitting(false);
    }
  }

  function handleNext() {
    if (isLast) {
      onComplete();
      return;
    }
    setCurrentIdx(i => i + 1);
    setAnswer("");
    setFeedback(null);
  }

  const progress = ((currentIdx + (feedback ? 1 : 0)) / session.questions.length) * 100;

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] min-h-[600px] animate-fade-up">

      {/* Header / Progress */}
      <div className="flex items-center justify-between mb-6 px-1">
        <div>
          <h2 className="font-display font-bold text-xl">Mock Interview Session</h2>
          <p className="text-sm text-gray-400">Role: <span className="text-indigo-400 font-medium">{session.target_role}</span></p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs font-mono text-gray-400">Question {currentIdx + 1} / {session.questions.length}</span>
          <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar pb-4">

        {/* AI Question Bubble */}
        <div className="flex gap-4 animate-fade-in">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20">
            <Bot size={20} className="text-indigo-400" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-sm">AI Interviewer</span>
              <span className="text-xs text-gray-500">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="glass-card p-5 rounded-tl-none border-indigo-500/20 bg-indigo-500/5 relative group">
              <p className="text-lg leading-relaxed">{q.question}</p>
              <div className="flex gap-2 mt-4">
                <span className="px-2 py-1 rounded-md text-xs font-medium bg-white/5 text-gray-400 border border-white/5 uppercase tracking-wide">
                  {q.category}
                </span>
                <span className={`px-2 py-1 rounded-md text-xs font-medium border uppercase tracking-wide
                  ${q.difficulty === 'easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    q.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                  {q.difficulty}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* User Answer Input / Display */}
        <div className="flex gap-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0 border border-violet-500/20">
            <User size={20} className="text-violet-400" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-sm">You</span>
            </div>
            
            {feedback ? (
              // Answer Submitted View
              <div className="glass-card p-5 rounded-tl-none border-violet-500/20 bg-violet-500/5">
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{answer}</p>
              </div>
            ) : (
              // Answer Input View
              <div className="glass-card p-1 rounded-tl-none border-violet-500/30 focus-within:border-violet-500/60 focus-within:ring-1 focus-within:ring-violet-500/30 transition-all">
                <textarea
                  className="w-full bg-transparent border-none p-4 min-h-[140px] focus:ring-0 text-base resize-none placeholder:text-gray-600"
                  placeholder="Type your answer here... Be specific and structured."
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  autoFocus
                />
                <div className="p-2 flex justify-between items-center border-t border-white/5">
                  <button className="p-2 rounded-lg hover:bg-white/5 text-gray-400 transition-colors" title="Record Audio (Coming Soon)">
                    <Mic size={18} />
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!answer.trim() || submitting}
                    className="btn-primary py-2 px-4 rounded-lg flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Analyzing..." : "Submit Answer"} <Send size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Feedback Display */}
        {feedback && (
          <div className="flex gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <BarChart2 size={20} className="text-emerald-400" />
            </div>
            <div className="flex-1 space-y-2" ref={scrollRef}>
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-sm text-emerald-400">AI Evaluation</span>
              </div>
              
              <div className="glass-card p-6 border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden">
                <div className="flex items-start justify-between mb-6">
                   <div>
                     <h3 className="font-bold text-lg mb-1">Feedback Report</h3>
                     <p className="text-sm text-gray-400">Analysis of your response structure and content</p>
                   </div>
                   <div className="text-center">
                     <div className="text-3xl font-display font-bold gradient-text">{feedback.score}</div>
                     <div className="text-xs uppercase tracking-wider font-medium text-gray-500">Score</div>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-6">
                  {[
                    { label: "Clarity",       val: feedback.clarity_score },
                    { label: "Technical",     val: feedback.technical_score },
                    { label: "Depth",         val: feedback.depth_score },
                    { label: "Communication", val: feedback.communication_score },
                  ].map(({ label, val }) => (
                    <div key={label} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">{label}</span>
                        <span className="font-mono text-gray-300">{val}/10</span>
                      </div>
                      <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500/60 rounded-full" style={{ width: `${val * 10}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6">
                  <div className="bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/10">
                    <div className="font-medium mb-2 text-emerald-400 flex items-center gap-2"><CheckCircle size={14}/> Strengths</div>
                    <ul className="space-y-1">
                      {feedback.strengths.map((s: string, i: number) => <li key={i} className="text-gray-300 text-xs pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-emerald-500/50">{s}</li>)}
                    </ul>
                  </div>
                  <div className="bg-amber-500/10 p-3 rounded-lg border border-amber-500/10">
                    <div className="font-medium mb-2 text-amber-400 flex items-center gap-2"><Zap size={14}/> Improvements</div>
                    <ul className="space-y-1">
                      {feedback.improvements.map((s: string, i: number) => <li key={i} className="text-gray-300 text-xs pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-amber-500/50">{s}</li>)}
                     </ul>
                  </div>
                </div>

                <div className="flex justify-end">
                   <button className="btn-primary py-2 px-6 flex items-center gap-2" onClick={handleNext}>
                     {isLast ? "Complete Interview" : "Next Question"} <ChevronRight size={16} />
                   </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
