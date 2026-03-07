"use client";
import { useState } from "react";
import { matchJob, scrapeJobs } from "@/lib/api";
import ScoreCard from "@/components/ScoreCard";
import SkillGapList from "@/components/SkillGapList";

const ROLES = [
  "Software Engineer",
  "Frontend Engineer",
  "Backend Engineer",
  "Full Stack Engineer",
  "Data Scientist",
  "Data Engineer",
  "ML Engineer",
  "DevOps Engineer",
];

interface JobMatchResult {
  match_score: number;
  semantic_similarity: number;
  skill_gap: {
    mandatory_missing: string[];
    competitive_missing: string[];
    matched_skills: string[];
  };
  recommendations: string[];
}

interface ScrapedJob {
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
}

export default function JobMatchPage() {
  const [resumeId, setResumeId] = useState("");
  const [jdText, setJdText] = useState("");
  const [role, setRole] = useState(ROLES[0]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<JobMatchResult | null>(null);
  const [fieldInput, setFieldInput] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobs, setJobs] = useState<ScrapedJob[]>([]);
  const [error, setError] = useState("");
  const [jobsError, setJobsError] = useState("");

  async function handleMatch() {
    if (!resumeId || !jdText) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await matchJob(resumeId, jdText, role);
      setResult(data as JobMatchResult);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleScrapeJobs() {
    const fields = fieldInput
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);
    if (!fields.length) return;

    setJobsLoading(true);
    setJobsError("");
    setJobs([]);
    try {
      const data = (await scrapeJobs(
        fields,
        jobLocation || undefined,
        remoteOnly,
        20,
      )) as { jobs: ScrapedJob[] };
      setJobs(data.jobs ?? []);
    } catch (e: unknown) {
      setJobsError((e as Error).message);
    } finally {
      setJobsLoading(false);
    }
  }

  return (
    <div className="animate-fade-up max-w-4xl">
      <h1 className="font-display font-bold text-3xl mb-2">
        Job Description Matching
      </h1>
      <p className="mb-8" style={{ color: "var(--text-secondary)" }}>
        Paste a job description to get a match score and skill gap analysis.
      </p>

      <div className="glass-card p-6 mb-8 flex flex-col gap-4">
        <div>
          <label
            className="text-xs font-medium mb-1 block"
            style={{ color: "var(--text-secondary)" }}
          >
            Resume ID
          </label>
          <input
            id="jm-resume-id"
            className="input-base"
            placeholder="Paste your resume ID from the analysis page"
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
            id="jm-role"
            className="input-base"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{ cursor: "pointer" }}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            className="text-xs font-medium mb-1 block"
            style={{ color: "var(--text-secondary)" }}
          >
            Job Description
          </label>
          <textarea
            id="jm-jd-text"
            className="input-base min-h-[140px] resize-y"
            placeholder="Paste the full job description here…"
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
          />
        </div>
        {error && (
          <p className="text-sm" style={{ color: "#f87171" }}>
            {error}
          </p>
        )}
        <button
          id="jm-match-btn"
          className="btn-primary self-start"
          onClick={handleMatch}
          disabled={loading || !resumeId || !jdText}
        >
          {loading ? "Matching…" : "Analyse Match"}
        </button>
      </div>

      <div className="glass-card p-6 mb-8 flex flex-col gap-4">
        <h3 className="font-semibold text-lg">Job Scraper</h3>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Enter user-specific fields (comma-separated) to fetch matching jobs
          with apply links.
        </p>
        <div>
          <label
            className="text-xs font-medium mb-1 block"
            style={{ color: "var(--text-secondary)" }}
          >
            Fields / Skills / Roles
          </label>
          <input
            className="input-base"
            placeholder="e.g. frontend, react, typescript"
            value={fieldInput}
            onChange={(e) => setFieldInput(e.target.value)}
          />
        </div>
        <div>
          <label
            className="text-xs font-medium mb-1 block"
            style={{ color: "var(--text-secondary)" }}
          >
            Location (optional)
          </label>
          <input
            className="input-base"
            placeholder="e.g. Bangalore, India"
            value={jobLocation}
            onChange={(e) => setJobLocation(e.target.value)}
          />
        </div>
        <label
          className="text-sm flex items-center gap-2"
          style={{ color: "var(--text-secondary)" }}
        >
          <input
            type="checkbox"
            checked={remoteOnly}
            onChange={(e) => setRemoteOnly(e.target.checked)}
          />
          Remote only
        </label>
        {jobsError && (
          <p className="text-sm" style={{ color: "#f87171" }}>
            {jobsError}
          </p>
        )}
        <button
          className="btn-primary self-start"
          onClick={handleScrapeJobs}
          disabled={jobsLoading || !fieldInput.trim()}
        >
          {jobsLoading ? "Scraping…" : "Scrape Jobs"}
        </button>
      </div>

      {jobs.length > 0 && (
        <div className="space-y-4 mb-8 animate-fade-up">
          <h3 className="font-semibold text-xl">
            Scraped Jobs ({jobs.length})
          </h3>
          {jobs.map((job) => (
            <div
              key={`${job.apply_url}-${job.title}`}
              className="glass-card p-5"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-lg">{job.title}</h4>
                  <p
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {job.company} · {job.location} · {job.job_type}
                    {job.remote ? " · Remote" : ""}
                  </p>
                  <p
                    className="text-sm mt-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {job.description_snippet}
                  </p>
                  {job.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {job.tags.slice(0, 6).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 rounded text-xs"
                          style={{
                            background: "rgba(11,124,118,0.12)",
                            color: "var(--indigo)",
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <a
                  href={job.apply_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary text-sm text-center"
                >
                  Apply
                </a>
              </div>
              <p
                className="text-xs mt-3"
                style={{ color: "var(--text-muted)" }}
              >
                Source: {job.source}
                {job.posted_at ? ` · Posted: ${job.posted_at}` : ""}
              </p>
            </div>
          ))}
        </div>
      )}

      {result && (
        <div className="animate-fade-up space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ScoreCard
              title="Match Score"
              score={result.match_score}
              subtitle={`vs ${role}`}
            />
            <ScoreCard
              title="Semantic Similarity"
              score={result.semantic_similarity}
              subtitle="Embedding cosine similarity"
            />
          </div>
          <SkillGapList skillGap={result.skill_gap} />
          <div className="glass-card p-6">
            <h3 className="font-semibold text-sm mb-3">Recommendations</h3>
            {result.recommendations.map((r: string, i: number) => (
              <p
                key={i}
                className="text-sm mb-2"
                style={{ color: "var(--text-secondary)" }}
              >
                → {r}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
