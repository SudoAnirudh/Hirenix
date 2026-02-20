// Subscription plans and feature limits
export const PLANS = {
  free: {
    label: "Free",
    resumeUploads: 3,
    jobMatches: 5,
    githubAnalysis: false,
    mockInterviews: 2,
    progressTracker: false,
  },
  pro: {
    label: "Pro",
    resumeUploads: 50,
    jobMatches: 100,
    githubAnalysis: true,
    mockInterviews: 20,
    progressTracker: true,
  },
  enterprise: {
    label: "Enterprise",
    resumeUploads: -1,  // unlimited
    jobMatches: -1,
    githubAnalysis: true,
    mockInterviews: -1,
    progressTracker: true,
  },
} as const;

export type PlanType = keyof typeof PLANS;

export const API_ROUTES = {
  uploadResume: "/resume/upload-resume",
  getResume: (id: string) => `/resume/${id}`,
  matchJob: "/jobs/match-job",
  analyzeGithub: "/github/analyze-github",
  startInterview: "/interview/start-interview",
  submitAnswer: "/interview/submit-answer",
  getProgress: "/analytics/progress",
} as const;
