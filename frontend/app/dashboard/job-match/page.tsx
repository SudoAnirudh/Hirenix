"use client";
import { useState } from "react";
import { matchJob, matchJobWithUpload, scrapeJobs } from "@/lib/api";
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
  fit_verdict?: string;
  pros?: string[];
  cons?: string[];
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
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jdFile, setJdFile] = useState<File | null>(null);

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

  async function handleMatchUpload() {
    if (!resumeFile || (!jdText.trim() && !jdFile)) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await matchJobWithUpload(
        resumeFile,
        jdText,
        role,
        jdFile ?? undefined,
      );
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
    <div className="flex flex-col gap-8 animate-fade-up max-w-5xl mx-auto w-full pb-20">
      <div>
        <h1 className="font-display font-black text-3xl md:text-4xl tracking-tight uppercase mb-2 text-(--text-primary)">
          Job Description Matching
        </h1>
        <p className="font-mono text-sm font-bold uppercase tracking-widest text-(--text-muted)">
          Benchmarking your profile against market requirements.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Controls */}
        <div className="lg:col-span-12">
          <div className="glass-card p-8 md:p-10 rounded-none bg-(--bg-surface) border-2 border-(--border) shadow-[8px_8px_0px_var(--border)] relative overflow-hidden group">
            <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full blur-[100px] bg-(--indigo)/10 pointer-events-none group-hover:opacity-20 transition-opacity" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase tracking-widest mb-2 block text-(--text-secondary)">
                    Professional Credentials
                  </label>
                  <div className="flex flex-col gap-4">
                    <div className="p-4 border-2 border-(--border) bg-black/40">
                      <span className="text-[10px] font-mono font-medium uppercase text-(--text-muted) block mb-2">
                        Upload Resume (PDF)
                      </span>
                      <input
                        id="jm-resume-file"
                        className="w-full text-xs font-mono text-(--text-primary) file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-2 file:border-(--indigo) file:bg-(--indigo)/10 file:text-(--indigo) file:text-xs file:font-bold file:uppercase cursor-pointer"
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={(e) =>
                          setResumeFile(e.target.files?.[0] ?? null)
                        }
                      />
                    </div>
                    <input
                      id="jm-resume-id"
                      className="input-base"
                      placeholder="OR ENTER RESUME ID FROM ANALYSIS..."
                      value={resumeId}
                      onChange={(e) => setResumeId(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono font-bold uppercase tracking-widest mb-2 block text-(--text-secondary)">
                    Target Industry Role
                  </label>
                  <select
                    id="jm-role"
                    className="input-base appearance-none cursor-pointer"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase tracking-widest mb-2 block text-(--text-secondary)">
                    Benchmark Criteria
                  </label>
                  <textarea
                    id="jm-jd-text"
                    className="input-base min-h-[160px] resize-y"
                    placeholder="PASTE FULL JOB DESCRIPTION FOR DEEP CORRELATION ANALYSIS..."
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                  />
                  <div className="mt-4 p-4 border-2 border-(--border) bg-black/40">
                    <span className="text-[10px] font-mono font-medium uppercase text-(--text-muted) block mb-2">
                      Attached JD (Optional)
                    </span>
                    <input
                      id="jm-jd-file"
                      className="w-full text-xs font-mono text-(--text-primary) file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-2 file:border-(--violet) file:bg-(--violet)/10 file:text-(--violet) file:text-xs file:font-bold file:uppercase cursor-pointer"
                      type="file"
                      accept=".pdf,.txt,.md,application/pdf,text/plain"
                      onChange={(e) => setJdFile(e.target.files?.[0] ?? null)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-6 p-4 border-2 border-red-500 bg-red-500/5 text-red-500 font-mono text-xs font-bold uppercase animate-pulse">
                ERR_MATCH_FAILED: {error}
              </div>
            )}

            <div className="mt-10 pt-8 border-t-2 border-(--border) flex flex-wrap gap-4 relative z-10">
              <button
                id="jm-match-btn"
                className="btn-primary"
                onClick={handleMatch}
                disabled={loading || !resumeId || !jdText}
              >
                <span className="flex items-center gap-2">
                  {loading ? "MATCHING..." : "ANALYSE BY ID"}
                  {!loading && <div className="w-1.5 h-1.5 bg-black" />}
                </span>
              </button>
              <button
                id="jm-match-upload-btn"
                className="btn-primary"
                onClick={handleMatchUpload}
                disabled={loading || !resumeFile || (!jdText.trim() && !jdFile)}
              >
                <span className="flex items-center gap-2">
                  {loading ? "PROCESSING..." : "PROCESS FILES"}
                  {!loading && <div className="w-1.5 h-1.5 bg-black" />}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Scraper Section */}
        <div className="lg:col-span-12">
          <div className="glass-card p-8 md:p-10 rounded-none bg-(--bg-surface) border-2 border-(--border) shadow-[8px_8px_0px_var(--border)] relative group">
            <h3 className="font-display font-black text-2xl tracking-tight uppercase mb-6 text-(--text-primary)">
              Correlated Opportunities
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase tracking-widest mb-2 block text-(--text-secondary)">
                    Search Parameters (Primary Skills)
                  </label>
                  <input
                    className="input-base"
                    placeholder="E.G. FRONTEND, REACT, TYPESCRIPT..."
                    value={fieldInput}
                    onChange={(e) => setFieldInput(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase tracking-widest mb-2 block text-(--text-secondary)">
                    Geographic Focus
                  </label>
                  <input
                    className="input-base"
                    placeholder="E.G. NEW YORK, REMOTE, GLOBAL..."
                    value={jobLocation}
                    onChange={(e) => setJobLocation(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col justify-between items-start">
                <div className="flex items-center gap-4 p-4 border-2 border-(--border) w-full bg-black/40">
                  <input
                    type="checkbox"
                    id="remote-only"
                    className="w-5 h-5 accent-(--indigo) cursor-pointer"
                    checked={remoteOnly}
                    onChange={(e) => setRemoteOnly(e.target.checked)}
                  />
                  <label
                    htmlFor="remote-only"
                    className="text-xs font-mono font-bold uppercase tracking-widest text-(--text-primary) cursor-pointer"
                  >
                    Enforce Remote Protocol
                  </label>
                </div>

                {jobsError && (
                  <div className="mt-4 p-4 border-2 border-red-500 bg-red-500/5 text-red-500 font-mono text-xs font-bold uppercase">
                    SCRAPER_ERR: {jobsError}
                  </div>
                )}

                <button
                  className="btn-primary mt-6"
                  onClick={handleScrapeJobs}
                  disabled={jobsLoading || !fieldInput.trim()}
                >
                  <span className="flex items-center gap-2">
                    {jobsLoading ? "SCRAPING..." : "EXECUTE SCRAPING"}
                    {!jobsLoading && <div className="w-1.5 h-1.5 bg-black" />}
                  </span>
                </button>
              </div>
            </div>

            {jobs.length > 0 && (
              <div className="space-y-6 pt-10 border-t-2 border-(--border) animate-fade-up">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-display font-black text-xl tracking-tight uppercase text-(--indigo)">
                    Scraped Signals ({jobs.length})
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {jobs.map((job) => (
                    <div
                      key={`${job.apply_url}-${job.title}`}
                      className="p-6 border-2 border-(--border) bg-black/40 hover:border-(--indigo) transition-all group/item"
                    >
                      <div className="flex flex-col h-full justify-between gap-4">
                        <div>
                          <h5 className="font-display font-black text-lg uppercase tracking-tight text-(--text-primary) mb-1 group-hover/item:text-(--indigo)">
                            {job.title}
                          </h5>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3">
                            <span className="text-[10px] font-mono font-bold uppercase text-(--text-muted)">
                              {job.company}
                            </span>
                            <span className="text-[10px] font-mono font-bold uppercase text-(--indigo)">
                              {job.location}
                            </span>
                            {job.remote && (
                              <span className="text-[10px] font-mono font-bold uppercase text-(--emerald)">
                                [REMOTE]
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-mono text-(--text-secondary) line-clamp-2 leading-relaxed">
                            {job.description_snippet}
                          </p>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-(--border)">
                          <span className="text-[9px] font-mono text-(--text-muted) uppercase">
                            SOURCE: {job.source.substring(0, 10)}...
                          </span>
                          <a
                            href={job.apply_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-mono font-black uppercase text-(--indigo) hover:underline flex items-center gap-1"
                          >
                            APPLY_NOW →
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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
          {result.fit_verdict && (
            <div className="glass-card p-6">
              <h3 className="font-semibold text-sm mb-2">Fit Verdict</h3>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {result.fit_verdict}
              </p>
            </div>
          )}
          {!!result.pros?.length && (
            <div className="glass-card p-6">
              <h3 className="font-semibold text-sm mb-3">Pros</h3>
              {result.pros.map((item: string, i: number) => (
                <p
                  key={i}
                  className="text-sm mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  + {item}
                </p>
              ))}
            </div>
          )}
          {!!result.cons?.length && (
            <div className="glass-card p-6">
              <h3 className="font-semibold text-sm mb-3">Cons</h3>
              {result.cons.map((item: string, i: number) => (
                <p
                  key={i}
                  className="text-sm mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  - {item}
                </p>
              ))}
            </div>
          )}
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
