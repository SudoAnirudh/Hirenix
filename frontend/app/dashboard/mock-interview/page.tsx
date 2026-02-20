"use client";
import { useState } from "react";
import InterviewPanel from "@/components/InterviewPanel";
import { startInterview } from "@/lib/api";

const ROLES = [
  "Software Engineer",
  "Frontend Engineer",
  "Backend Engineer",
  "Data Scientist",
  "ML Engineer",
  "DevOps Engineer",
];

type Phase = "setup" | "interview" | "done";

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

export default function MockInterviewPage() {
  const [resumeId, setResumeId] = useState("");
  const [role, setRole] = useState(ROLES[0]);
  const [session, setSession] = useState<Session | null>(null);
  const [phase, setPhase] = useState<Phase>("setup");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleStart() {
    if (!resumeId) return;
    setLoading(true);
    setError("");
    try {
      const s = await startInterview(resumeId, role, 5);
      setSession(s as Session);
      setPhase("interview");
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-up max-w-3xl">
      <h1 className="font-display font-bold text-3xl mb-2">
        Mock Interview Engine
      </h1>
      <p className="mb-8" style={{ color: "var(--text-secondary)" }}>
        Practice AI-generated interview questions tailored to your role and
        resume.
      </p>

      {phase === "setup" && (
        <div className="glass-card p-6 flex flex-col gap-4">
          <div>
            <label
              className="text-xs font-medium mb-1 block"
              style={{ color: "var(--text-secondary)" }}
            >
              Resume ID
            </label>
            <input
              id="mi-resume-id"
              className="input-base"
              placeholder="Paste your resume ID"
              value={resumeId}
              onChange={(e) => setResumeId(e.target.value)}
            />
          </div>
          <div>
            <label
              className="text-xs font-medium mb-1 block"
              style={{ color: "var(--text-secondary)" }}
            >
              Target Role
            </label>
            <select
              id="mi-role"
              className="input-base"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          {error && (
            <p className="text-sm" style={{ color: "#f87171" }}>
              {error}
            </p>
          )}
          <button
            id="mi-start-btn"
            className="btn-primary self-start"
            onClick={handleStart}
            disabled={loading || !resumeId}
          >
            {loading ? "Preparing questions…" : "Start Interview"}
          </button>
        </div>
      )}

      {phase === "interview" && session && (
        <InterviewPanel session={session} onComplete={() => setPhase("done")} />
      )}

      {phase === "done" && (
        <div className="glass-card p-10 text-center animate-fade-up">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="font-display font-bold text-2xl mb-2">
            Interview Complete!
          </h2>
          <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
            Check your feedback for each answer above.
          </p>
          <button
            className="btn-ghost"
            onClick={() => {
              setPhase("setup");
              setSession(null);
            }}
          >
            Start Another Session
          </button>
        </div>
      )}
    </div>
  );
}
