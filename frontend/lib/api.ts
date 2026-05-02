import { getAccessToken, refreshSession, signOut } from "./auth";

const PROD_API_FALLBACK = "https://hirenix-backend.onrender.com";
const LOCAL_API_FALLBACK = "http://127.0.0.1:8000";

export function getBaseUrl(): string {
  // If the user explicitly provided an API URL, use it.
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configured) return configured;

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    const isLocal =
      host === "localhost" ||
      host === "127.0.0.1" ||
      host.startsWith("192.168.");

    // Use the same host type (localhost vs 127.0.0.1) as the frontend
    // to avoid cross-origin protocol/DNs mismatches.
    return isLocal ? `http://${host}:8000` : PROD_API_FALLBACK;
  }

  return LOCAL_API_FALLBACK;
}

function toApiError(error: unknown) {
  if (error instanceof Error) {
    const networkErrors = [
      "Failed to fetch",
      "NetworkError when attempting to fetch resource.",
    ];
    if (networkErrors.includes(error.message)) {
      if (
        typeof window !== "undefined" &&
        window.location.protocol === "https:" &&
        /^http:\/\/(localhost|127\.0\.0\.1)/.test(getBaseUrl())
      ) {
        return new Error(
          `This page is running on HTTPS (${window.location.origin}) but API is set to local HTTP (${getBaseUrl()}). Open the frontend on http://localhost:3000 for local development, or set NEXT_PUBLIC_API_URL to an HTTPS backend URL.`,
        );
      }
      return new Error(
        `Could not reach the API server at ${getBaseUrl()}. If this is a deployed app, verify the frontend deployment's NEXT_PUBLIC_API_URL points to the live backend and redeploy. For local development, start the backend with \`npm run dev\` from the repo root or \`cd backend && . venv/bin/activate && uvicorn main:app --reload\`, then verify NEXT_PUBLIC_API_URL and backend CORS ALLOWED_ORIGINS.`,
      );
    }
    return error;
  }
  return new Error("Unexpected API error");
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  attempt = 0,
): Promise<T> {
  const token = await getAccessToken();
  const headers: HeadersInit = {
    ...(init.headers ?? {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  let res: Response;
  try {
    res = await fetch(`${getBaseUrl()}${path}`, { ...init, headers });
  } catch (error: unknown) {
    throw toApiError(error);
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    const detail = err.detail ?? "API error";

    if (
      res.status === 401 &&
      attempt === 0 &&
      typeof detail === "string" &&
      (detail.includes("Authentication timed out") ||
        detail.includes("Could not validate credentials via Supabase"))
    ) {
      try {
        const refreshed = await refreshSession();
        if (refreshed?.access_token) {
          return request<T>(path, init, attempt + 1);
        }
      } catch {
        // Fall through to sign-out and error.
      }
    }

    if (
      res.status === 401 &&
      typeof detail === "string" &&
      (detail.includes("Authentication timed out") ||
        detail.includes("Could not validate credentials via Supabase") ||
        detail.includes("Not authenticated"))
    ) {
      await signOut().catch(() => {});
      throw new Error(
        "Your session expired or could not be verified. Please sign in again.",
      );
    }
    throw new Error(detail);
  }
  return res.json();
}

// ─── Profile ──────────────────────────────────────────────────────────────────
export async function getProfile() {
  return request<{
    user_id: string;
    email: string;
    plan: string;
  }>("/auth/me");
}

// ─── Resume ───────────────────────────────────────────────────────────────────
export async function uploadResume(file: File) {
  const token = await getAccessToken();
  const formData = new FormData();
  formData.append("file", file);
  const headers: HeadersInit = token
    ? { Authorization: `Bearer ${token}` }
    : {};
  let res: Response;
  try {
    res = await fetch(`${getBaseUrl()}/resume/upload-resume`, {
      method: "POST",
      headers,
      body: formData,
    });
  } catch (error: unknown) {
    throw toApiError(error);
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "Upload failed");
  }
  return res.json();
}

export async function getResume(id: string) {
  return request(`/resume/${id}`);
}

// ─── Job Matching ─────────────────────────────────────────────────────────────
export async function matchJob(
  resumeId: string,
  jdText: string,
  targetRole?: string,
) {
  return request("/jobs/match-job", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      resume_id: resumeId,
      jd_text: jdText,
      target_role: targetRole,
    }),
  });
}

export async function matchJobWithUpload(
  resumeFile: File,
  jdText?: string,
  targetRole?: string,
  jdFile?: File,
) {
  const token = await getAccessToken();
  const formData = new FormData();
  formData.append("resume_file", resumeFile);
  if (jdText?.trim()) formData.append("jd_text", jdText.trim());
  if (targetRole?.trim()) formData.append("target_role", targetRole.trim());
  if (jdFile) formData.append("jd_file", jdFile);

  const headers: HeadersInit = token
    ? { Authorization: `Bearer ${token}` }
    : {};
  let res: Response;
  try {
    res = await fetch(`${getBaseUrl()}/jobs/match-job-upload`, {
      method: "POST",
      headers,
      body: formData,
    });
  } catch (error: unknown) {
    throw toApiError(error);
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "API error");
  }
  return res.json();
}

export async function generateOutreachDrafts(matchId: string, tone = "Formal") {
  return request<{
    match_id: string;
    linkedin_request: string;
    cold_email: string;
    company_name?: string;
  }>("/jobs/outreach-drafts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      match_id: matchId,
      tone: tone,
    }),
  });
}

export async function scrapeJobs(
  fields: string[],
  location?: string,
  remoteOnly = false,
  limit = 20,
) {
  return request("/jobs/scrape-jobs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fields,
      location,
      remote_only: remoteOnly,
      limit,
    }),
  });
}

export interface SuggestedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  job_type: string;
  tags: string[];
  apply_url: string;
  source: string;
  posted_at: string;
  description_snippet: string;
  match_score: number;
  reason: string;
  alignment_score: number;
}

export async function getJobSuggestions(limit = 6) {
  return request<{
    user_id: string;
    suggestions: SuggestedJob[];
    evolution_score: number;
    readiness_summary: string;
  }>(`/jobs/suggestions?limit=${limit}`);
}

// ─── GitHub ───────────────────────────────────────────────────────────────────
export async function analyzeGithub(username: string) {
  return request("/github/analyze-github", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  });
}

// ─── LinkedIn ─────────────────────────────────────────────────────────────────
export interface LinkedInAnalysis {
  overall_score: number;
  headline: {
    score: number;
    current: string;
    improved?: string;
    tips: string[];
    missing_keywords: string[];
  };
  about: {
    score: number;
    current: string;
    improved?: string;
    tips: string[];
    missing_keywords: string[];
  };
  experience: {
    score: number;
    current: string;
    tips: string[];
    missing_keywords: string[];
  };
  skills: {
    score: number;
    current: string;
    tips: string[];
    missing_keywords: string[];
  };
  completeness_score: number;
  general_tips: string[];
  suggested_roles: string[];
}

export async function analyzeLinkedin(file: File): Promise<LinkedInAnalysis> {
  const token = await getAccessToken();
  const formData = new FormData();
  formData.append("file", file);
  const headers: HeadersInit = token
    ? { Authorization: `Bearer ${token}` }
    : {};
  let res: Response;
  try {
    res = await fetch(`${getBaseUrl()}/linkedin/analyze`, {
      method: "POST",
      headers,
      body: formData,
    });
  } catch (error: unknown) {
    throw toApiError(error);
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "LinkedIn analysis failed");
  }
  return res.json();
}

// ─── Interview ────────────────────────────────────────────────────────────────
export async function startInterview(
  resumeId: string | null,
  targetRole: string,
  options: {
    difficulty?: string;
    numQuestions?: number;
    experienceLevel?: string;
    interviewType?: string;
    answerMode?: string;
    proctoringEnabled?: boolean;
  } = {},
) {
  return request("/interview/start-interview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      resume_id: resumeId,
      target_role: targetRole,
      difficulty: options.difficulty ?? "medium",
      num_questions: options.numQuestions ?? 5,
      experience_level: options.experienceLevel ?? "junior",
      interview_type: options.interviewType ?? "mixed",
      answer_mode: options.answerMode ?? "text",
      proctoring_enabled: options.proctoringEnabled ?? false,
    }),
  });
}

export async function submitAnswer(
  sessionId: string,
  questionId: string,
  answer: string,
) {
  return request("/interview/submit-answer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id: sessionId,
      question_id: questionId,
      answer,
    }),
  });
}

export async function evaluateInterviewSession(
  sessionId: string,
  answers: Array<{ question_id: string; answer: string }>,
) {
  return request("/interview/evaluate-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id: sessionId,
      answers,
    }),
  });
}

export async function saveProctorReport(
  sessionId: string,
  report: Record<string, unknown>,
) {
  return request("/interview/save-proctor-report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id: sessionId,
      report,
    }),
  });
}

// ─── Roadmap ───────────────────────────────────────────────────────────────────
export interface RoadmapResource {
  title: string;
  url: string;
  type: "video" | "course" | "article";
  is_free: boolean;
}

export interface RoadmapSkill {
  id: string;
  name: string;
  description?: string;
  status: "completed" | "in_progress" | "to_learn";
  priority?: "high" | "medium" | "low";
  difficulty?: "easy" | "medium" | "hard";
  estimated_time?: string;
  resources: RoadmapResource[];
  children?: RoadmapSkill[];
  is_optional?: boolean;
}

export interface CareerRoadmap {
  user_id?: string;
  target_role: string;
  current_level: string;
  skills: RoadmapSkill[];
  next_step?: string;
  overall_progress: number;
  future_opportunities: string[];
}

export async function getRoadmapRoles(): Promise<string[]> {
  return request<string[]>("/roadmap/roles");
}

export async function getSavedRoadmap(): Promise<CareerRoadmap | null> {
  return request<CareerRoadmap | null>("/roadmap/current");
}

export async function generateRoadmap(
  targetRole: string,
  username = "guest",
): Promise<CareerRoadmap> {
  return request<CareerRoadmap>(
    `/roadmap/generate?target_role=${encodeURIComponent(targetRole)}&username=${encodeURIComponent(username)}`,
    { method: "POST" },
  );
}

export async function updateSkillStatus(
  targetRole: string,
  completedSkills: string[],
): Promise<CareerRoadmap> {
  return request<CareerRoadmap>("/roadmap/skills", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      target_role: targetRole,
      completed_skills: completedSkills,
    }),
  });
}

// Deprecated: use getSavedRoadmap or generateRoadmap instead
export async function getRoadmap(username: string, targetRole: string) {
  return request<CareerRoadmap>(
    `/roadmap/${username}?target_role=${encodeURIComponent(targetRole)}`,
  );
}

// ─── Analytics ────────────────────────────────────────────────────────────────
export async function getProgress() {
  return request("/analytics/progress");
}

export async function getAISummary() {
  return request<{
    summary: string;
    generated_at: number;
  }>("/analytics/summary", { method: "POST" });
}

// ─── Cover Letter ─────────────────────────────────────────────────────────────
export async function generateCoverLetter(
  resumeId: string,
  jdText: string,
  targetRole?: string,
  tone = "Professional",
) {
  return request<{
    id: string;
    content: string;
    resume_id: string;
    target_role: string;
  }>("/cover-letter/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      resume_id: resumeId,
      jd_text: jdText,
      target_role: targetRole,
      tone,
    }),
  });
}

export async function downloadCoverLetter(
  letterId: string,
  format: "pdf" | "docx",
) {
  const token = await getAccessToken();
  const res = await fetch(
    `${getBaseUrl()}/cover-letter/export/${letterId}?format=${format}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "Download failed");
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `cover_letter_${letterId.slice(0, 8)}.${format}`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

// ─── Applications CRM ─────────────────────────────────────────────────────────
export interface JobApplication {
  id: string;
  company: string;
  role: string;
  location?: string;
  status: "wishlist" | "applied" | "interviewing" | "offer" | "rejected";
  apply_url?: string;
  match_score?: number;
  notes?: string;
  created_at: string;
}

export async function getApplications() {
  return request<JobApplication[]>("/applications/");
}

export async function createApplication(data: {
  company: string;
  role: string;
  location?: string;
  status?: string;
  apply_url?: string;
  match_score?: number;
  notes?: string;
}) {
  return request("/applications/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function updateApplication(
  appId: string,
  data: { status?: string; notes?: string },
) {
  return request(`/applications/${appId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function deleteApplication(appId: string) {
  return request(`/applications/${appId}`, { method: "DELETE" });
}
