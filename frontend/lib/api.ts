import { getAccessToken } from "./auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getAccessToken();
  const headers: HeadersInit = {
    ...(init.headers ?? {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "API error");
  }
  return res.json();
}

// ─── Resume ───────────────────────────────────────────────────────────────────
export async function uploadResume(file: File) {
  const token = await getAccessToken();
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE_URL}/resume/upload-resume`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) throw new Error((await res.json()).detail ?? "Upload failed");
  return res.json();
}

export async function getResume(id: string) {
  return request(`/resume/${id}`);
}

// ─── Job Matching ─────────────────────────────────────────────────────────────
export async function matchJob(resumeId: string, jdText: string, targetRole?: string) {
  return request("/jobs/match-job", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resume_id: resumeId, jd_text: jdText, target_role: targetRole }),
  });
}

// ─── GitHub ───────────────────────────────────────────────────────────────────
export async function analyzeGithub(username: string) {
  return request("/github/analyze-github", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  });
}

// ─── Interview ────────────────────────────────────────────────────────────────
export async function startInterview(resumeId: string, targetRole: string, numQuestions = 5) {
  return request("/interview/start-interview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resume_id: resumeId, target_role: targetRole, num_questions: numQuestions }),
  });
}

export async function submitAnswer(sessionId: string, questionId: string, answer: string) {
  return request("/interview/submit-answer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, question_id: questionId, answer }),
  });
}

// ─── Analytics ────────────────────────────────────────────────────────────────
export async function getProgress() {
  return request("/analytics/progress");
}
