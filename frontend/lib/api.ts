import { getAccessToken, refreshSession, signOut } from "./auth";

const PROD_API_FALLBACK = "https://hirenix-backend.onrender.com";

function getBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configured) return configured;

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    const isLocal = host === "localhost" || host === "127.0.0.1";
    return isLocal ? "http://127.0.0.1:8000" : PROD_API_FALLBACK;
  }

  return "http://127.0.0.1:8000";
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
        `Could not reach the API server at ${getBaseUrl()}. Check NEXT_PUBLIC_API_URL and backend CORS ALLOWED_ORIGINS.`,
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

// ─── GitHub ───────────────────────────────────────────────────────────────────
export async function analyzeGithub(username: string) {
  return request("/github/analyze-github", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  });
}

// ─── Interview ────────────────────────────────────────────────────────────────
export async function startInterview(
  resumeId: string,
  targetRole: string,
  difficulty = "medium",
  numQuestions = 5,
) {
  return request("/interview/start-interview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      resume_id: resumeId,
      target_role: targetRole,
      difficulty,
      num_questions: numQuestions,
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

export async function saveProctorReport(
  sessionId: string,
  report: Record<string, any>,
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

// ─── Analytics ────────────────────────────────────────────────────────────────
export async function getProgress() {
  return request("/analytics/progress");
}
