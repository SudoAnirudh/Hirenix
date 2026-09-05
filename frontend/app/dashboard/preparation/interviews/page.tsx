"use client";

import React, { useState } from "react";
import {
  Mic,
  MicOff,
  Play,
  Square,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  BarChart3,
  MessageSquare,
  RefreshCw,
  Award,
  Send,
  Code2,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

type Stage = "READY" | "QUESTION" | "RECORDING" | "EVALUATING" | "FEEDBACK";

export default function InterviewSimulatorPage() {
  const [stage, setStage] = useState<Stage>("READY");
  const [responseMode, setResponseMode] = useState<"audio" | "text">("text");
  const [textAnswer, setTextAnswer] = useState("");

  const question = {
    role: "Senior AI Engineer",
    topic: "RAG & Vector Retrieval Architecture",
    prompt:
      "Explain how you design a hybrid search pipeline combining dense vector embeddings with sparse keyword BM25 retrieval. How do you prevent latency spikes during high-concurrency query loads?",
  };

  const analyticalFeedback = {
    technicalAccuracy: 88,
    systemDesign: 84,
    communicationClarity: 90,
    overallRating: "Strong Pass",
    strengths: [
      "Correctly explained reciprocal rank fusion (RRF) for combining vector & BM25 results.",
      "Identified HNSW index quantization techniques for memory reduction.",
    ],
    gaps: [
      "Could elaborate on circuit breaker patterns when vector database latency exceeds 200ms.",
    ],
    modelAnswerSnippet:
      "A production hybrid retrieval engine uses dense embeddings (e.g. MiniLM / OpenAI) for semantic context alongside BM25 for precise keyword matching. Results are merged via RRF (k=60). For high concurrency, caching hot vector queries in Redis and using read-replica IVFFlat / HNSW indexes prevents GPU/CPU bottlenecks.",
  };

  const handleStart = () => {
    setStage("QUESTION");
  };

  const handleSubmit = () => {
    setStage("EVALUATING");
    setTimeout(() => {
      setStage("FEEDBACK");
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-xl bg-card border border-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-primary uppercase tracking-wider">
            <Mic size={14} /> Technical Assessment Environment
          </div>
          <h1 className="text-2xl font-bold font-heading text-foreground mt-1">
            AI Technical Interview Simulator
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Simulate real technical & system design interview rounds with
            explainable feedback.
          </p>
        </div>

        {/* Stage Status Stepper */}
        <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold shrink-0">
          {(
            [
              "READY",
              "QUESTION",
              "RECORDING",
              "EVALUATING",
              "FEEDBACK",
            ] as Stage[]
          ).map((s) => (
            <span
              key={s}
              className={`px-2 py-1 rounded border ${
                stage === s
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-muted-foreground border-border"
              }`}
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Main Assessment Workstation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interview Prompt & Answer Editor */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-primary/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-primary uppercase">
                  Target Role: {question.role}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">
                  Topic: {question.topic}
                </span>
              </div>
              <CardTitle className="text-base mt-2 font-bold leading-snug">
                {question.prompt}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {stage === "READY" && (
                <div className="py-8 text-center space-y-3">
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    Click Start Session to launch the technical question. You
                    can answer via text response or voice audio.
                  </p>
                  <Button onClick={handleStart} variant="primary">
                    <Play size={14} className="mr-1.5" /> Begin Interview Round
                  </Button>
                </div>
              )}

              {(stage === "QUESTION" || stage === "RECORDING") && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <MessageSquare size={14} className="text-primary" />{" "}
                      Candidate Answer Mode
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-mono">
                      <button
                        onClick={() => setResponseMode("text")}
                        className={`px-2.5 py-1 rounded ${
                          responseMode === "text"
                            ? "bg-primary text-primary-foreground font-bold"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        Text Response
                      </button>
                      <button
                        onClick={() => setResponseMode("audio")}
                        className={`px-2.5 py-1 rounded ${
                          responseMode === "audio"
                            ? "bg-primary text-primary-foreground font-bold"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        Voice Audio
                      </button>
                    </div>
                  </div>

                  {responseMode === "text" ? (
                    <textarea
                      value={textAnswer}
                      onChange={(e) => setTextAnswer(e.target.value)}
                      rows={6}
                      placeholder="Type your technical response here (e.g. explain architectural decisions, algorithms, latency tradeoffs)..."
                      className="w-full p-3 text-xs bg-muted/40 border border-border rounded-lg focus:outline-none focus:border-primary font-mono"
                    />
                  ) : (
                    <div className="p-6 rounded-lg border border-border bg-slate-50 dark:bg-slate-900/50 text-center space-y-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
                        <Mic size={20} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Microphone Ready. Click Record to capture voice
                        response.
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button
                      onClick={handleSubmit}
                      disabled={responseMode === "text" && !textAnswer.trim()}
                      variant="primary"
                      size="sm"
                    >
                      <Send size={14} className="mr-1.5" /> Submit Response for
                      Evaluation
                    </Button>
                  </div>
                </div>
              )}

              {stage === "EVALUATING" && (
                <div className="py-12 text-center space-y-3">
                  <RefreshCw
                    size={24}
                    className="animate-spin text-primary mx-auto"
                  />
                  <div className="text-xs font-mono font-bold text-foreground">
                    EVALUATING TECHNICAL ACCURACY...
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Comparing candidate response against system design
                    benchmarks.
                  </p>
                </div>
              )}

              {stage === "FEEDBACK" && (
                <div className="space-y-4 pt-2">
                  <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
                    <div className="font-bold text-emerald-700 dark:text-emerald-300 font-mono uppercase text-[10px]">
                      ASSESSMENT VERDICT: {analyticalFeedback.overallRating}
                    </div>
                    <p className="text-muted-foreground text-[11px]">
                      Your response demonstrated strong system architecture
                      fundamentals and correct keyword usage.
                    </p>
                  </div>

                  <Button
                    onClick={() => setStage("QUESTION")}
                    variant="outline"
                    size="sm"
                  >
                    Next Question <Send size={12} className="ml-1" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Analytical Feedback Dashboard */}
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <BarChart3 size={16} className="text-primary" /> Evaluation
                Metrics
              </CardTitle>
              <CardDescription className="text-xs">
                Quantitative score breakdown by evaluation category
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 text-xs">
              <div className="space-y-3">
                {[
                  {
                    name: "Technical Accuracy",
                    score: analyticalFeedback.technicalAccuracy,
                  },
                  {
                    name: "System Design Depth",
                    score: analyticalFeedback.systemDesign,
                  },
                  {
                    name: "Communication Clarity",
                    score: analyticalFeedback.communicationClarity,
                  },
                ].map((m) => (
                  <div key={m.name} className="space-y-1">
                    <div className="flex justify-between font-semibold text-foreground">
                      <span>{m.name}</span>
                      <span className="font-mono">{m.score}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${m.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {stage === "FEEDBACK" && (
                <div className="space-y-4 pt-4 border-t border-border">
                  <div>
                    <div className="font-mono text-[10px] font-bold text-emerald-600 uppercase mb-1">
                      Strengths Identified
                    </div>
                    <ul className="space-y-1 text-[11px] text-muted-foreground">
                      {analyticalFeedback.strengths.map((s, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2
                            size={13}
                            className="text-emerald-500 shrink-0 mt-0.5"
                          />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="font-mono text-[10px] font-bold text-amber-600 uppercase mb-1">
                      Targeted Improvement Areas
                    </div>
                    <ul className="space-y-1 text-[11px] text-muted-foreground">
                      {analyticalFeedback.gaps.map((g, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <AlertTriangle
                            size={13}
                            className="text-amber-500 shrink-0 mt-0.5"
                          />
                          <span>{g}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-lg border border-border bg-slate-50/50 dark:bg-slate-900/50 space-y-1">
                    <div className="font-mono text-[10px] font-bold uppercase text-foreground">
                      Reference Model Answer
                    </div>
                    <p className="text-[11px] text-muted-foreground font-mono leading-relaxed">
                      &quot;{analyticalFeedback.modelAnswerSnippet}&quot;
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
