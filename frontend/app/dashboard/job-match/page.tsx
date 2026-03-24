"use client";
import { useState } from "react";
import { matchJob, matchJobWithUpload, scrapeJobs } from "@/lib/api";
import ScoreCard from "@/components/ScoreCard";
import SkillGapList from "@/components/SkillGapList";
import {
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Search,
  MapPin,
  Globe,
  ExternalLink,
  Sparkles,
} from "lucide-react";

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
        <h1 className="font-display font-bold text-3xl md:text-5xl tracking-tight text-[#2D3748] mb-3">
          Job Description <span className="text-[#7C9ADD]">Matching</span>
        </h1>
        <p className="text-sm font-medium text-[#718096]">
          Benchmarking your profile against market requirements with AI-driven
          precision.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Controls */}
        <div className="lg:col-span-12">
          <div className="glass-card p-10 rounded-[40px] bg-white/60 backdrop-blur-xl border border-white/60 shadow-glass relative overflow-hidden">
            <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full blur-[100px] bg-[#7C9ADD]/10 pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-bold text-[#A0AEC0] uppercase tracking-[0.2em] mb-4 block">
                    Professional Credentials
                  </label>
                  <div className="flex flex-col gap-6">
                    <div className="p-8 rounded-3xl bg-white/50 border border-white focus-within:border-[#7C9ADD]/40 group/upload transition-all shadow-sm">
                      <span className="text-[10px] font-bold uppercase text-[#A0AEC0] tracking-widest block mb-4">
                        Upload Resume (PDF)
                      </span>
                      <input
                        id="jm-resume-file"
                        className="w-full text-xs text-[#4A5568] file:mr-4 file:py-2.5 file:px-6 file:rounded-full file:border-0 file:bg-[#7C9ADD] file:text-white file:text-[10px] file:font-bold file:uppercase file:tracking-widest cursor-pointer transition-all hover:file:bg-[#7C9ADD]/90"
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={(e) =>
                          setResumeFile(e.target.files?.[0] ?? null)
                        }
                      />
                    </div>
                    <div className="relative">
                      <input
                        id="jm-resume-id"
                        className="input-base bg-white! shadow-none! border-[#7C9ADD]/20! focus:border-[#7C9ADD]/50!"
                        placeholder="Or enter Resume ID from analysis..."
                        value={resumeId}
                        onChange={(e) => setResumeId(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#A0AEC0] uppercase tracking-[0.2em] mb-4 block">
                    Target Industry Role
                  </label>
                  <div className="relative group/select">
                    <select
                      id="jm-role"
                      className="w-full appearance-none bg-white/50 border border-white focus:border-[#7C9ADD]/40 rounded-3xl px-8 h-16 outline-none transition-all cursor-pointer font-display font-bold text-xl text-[#2D3748] shadow-sm"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none text-[#7C9ADD] transition-transform group-hover/select:translate-x-1">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-[#A0AEC0] uppercase tracking-[0.2em] mb-4 block">
                    Benchmark Criteria
                  </label>
                  <textarea
                    id="jm-jd-text"
                    className="w-full bg-white/50 border border-white focus:border-[#7C9ADD]/40 rounded-[32px] p-8 min-h-[220px] resize-none outline-none transition-all font-body font-medium text-sm text-[#4A5568] placeholder:text-[#A0AEC0] shadow-sm leading-relaxed"
                    placeholder="Paste the full job description here for deep AI correlation analysis..."
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                  />
                  <div className="mt-8 p-8 rounded-3xl bg-white/50 border border-white focus-within:border-[#7C9ADD]/40 group transition-all shadow-sm">
                    <span className="text-[10px] font-bold uppercase text-[#A0AEC0] tracking-widest block mb-4">
                      Attached JD (Optional)
                    </span>
                    <input
                      id="jm-jd-file"
                      className="w-full text-xs text-[#4A5568] file:mr-4 file:py-2.5 file:px-6 file:rounded-full file:border-0 file:bg-white/80 file:text-[#4A5568] file:text-[10px] file:font-bold file:uppercase file:tracking-widest cursor-pointer transition-all hover:file:bg-white shadow-sm"
                      type="file"
                      accept=".pdf,.txt,.md,application/pdf,text/plain"
                      onChange={(e) => setJdFile(e.target.files?.[0] ?? null)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-8 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
                Analysis failed: {error}
              </div>
            )}

            <div className="mt-12 pt-8 border-t border-white/40 flex flex-wrap gap-6 relative z-10">
              <button
                id="jm-match-btn"
                className="px-8 py-4 rounded-full bg-[#7C9ADD] text-white font-bold text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-[#7C9ADD]/20 hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
                onClick={handleMatch}
                disabled={loading || !resumeId || !jdText}
              >
                {loading ? "Matching..." : "Analyse by ID"}
              </button>
              <button
                id="jm-match-upload-btn"
                className="px-8 py-4 rounded-full bg-[#2D3748] text-white font-bold text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-[#2D3748]/10 hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
                onClick={handleMatchUpload}
                disabled={loading || !resumeFile || (!jdText.trim() && !jdFile)}
              >
                {loading ? "Processing..." : "Process Files"}
              </button>
            </div>
          </div>
        </div>

        {/* Scraper Section */}
        <div className="lg:col-span-12">
          <div className="glass-card p-10 rounded-[40px] bg-white/60 border border-white/60 shadow-glass backdrop-blur-xl">
            <h3 className="font-display font-bold text-2xl text-[#2D3748] mb-8 flex items-center gap-3">
              <Sparkles className="text-[#7C9ADD]" size={24} />
              Correlated Opportunities
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-bold text-[#A0AEC0] uppercase tracking-[0.2em] mb-4 block">
                    Search Parameters
                  </label>
                  <div className="relative">
                    <input
                      className="w-full bg-white/50 border border-white focus:border-[#7C9ADD]/40 rounded-3xl px-8 h-14 outline-none transition-all font-body font-medium text-sm text-[#4A5568] shadow-sm"
                      placeholder="e.g. Frontend, React, TypeScript..."
                      value={fieldInput}
                      onChange={(e) => setFieldInput(e.target.value)}
                    />
                    <Search
                      className="absolute right-6 top-1/2 -translate-y-1/2 text-[#7C9ADD]/40"
                      size={18}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#A0AEC0] uppercase tracking-[0.2em] mb-4 block">
                    Geographic Focus
                  </label>
                  <div className="relative">
                    <input
                      className="w-full bg-white/50 border border-white focus:border-[#7C9ADD]/40 rounded-3xl px-8 h-14 outline-none transition-all font-body font-medium text-sm text-[#4A5568] shadow-sm"
                      placeholder="e.g. New York, Remote, Global..."
                      value={jobLocation}
                      onChange={(e) => setJobLocation(e.target.value)}
                    />
                    <MapPin
                      className="absolute right-6 top-1/2 -translate-y-1/2 text-[#7C9ADD]/40"
                      size={18}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-between items-start">
                <div className="flex items-center gap-4 p-6 rounded-3xl bg-white/50 border border-white w-full group transition-all shadow-sm">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      id="remote-only"
                      className="peer w-6 h-6 rounded-lg border-2 border-[#E2E8F0] checked:bg-[#7C9ADD] checked:border-[#7C9ADD] appearance-none cursor-pointer transition-all"
                      checked={remoteOnly}
                      onChange={(e) => setRemoteOnly(e.target.checked)}
                    />
                    <CheckCircle
                      size={14}
                      className="absolute left-1 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                    />
                  </div>
                  <label
                    htmlFor="remote-only"
                    className="text-sm font-bold text-[#4A5568] cursor-pointer select-none"
                  >
                    Priority Remote Search
                  </label>
                </div>

                {jobsError && (
                  <div className="mt-4 p-4 rounded-2xl bg-[#F28C8C]/5 border border-[#F28C8C]/10 text-[#F28C8C] text-xs font-bold uppercase tracking-wider">
                    Search error: {jobsError}
                  </div>
                )}

                <button
                  className="px-8 py-4 mt-8 w-full md:w-auto rounded-full bg-[#7C9ADD] text-white font-bold text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-[#7C9ADD]/20 hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0"
                  onClick={handleScrapeJobs}
                  disabled={jobsLoading || !fieldInput.trim()}
                >
                  {jobsLoading ? "Searching..." : "Execute Search"}
                </button>
              </div>
            </div>

            {jobs.length > 0 && (
              <div className="space-y-8 pt-10 border-t border-white/40">
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-bold text-xl text-[#7C9ADD]">
                    Results{" "}
                    <span className="text-[#A0AEC0] ml-2">({jobs.length})</span>
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {jobs.map((job) => (
                    <div
                      key={`${job.apply_url}-${job.title}`}
                      className="p-8 rounded-[32px] bg-white/50 border border-white hover:border-[#7C9ADD]/40 hover:shadow-glass transition-all group/card"
                    >
                      <div className="flex flex-col h-full justify-between gap-6">
                        <div>
                          <h5 className="font-display font-bold text-lg text-[#2D3748] mb-4 group-hover/card:text-[#7C9ADD] transition-colors leading-tight">
                            {job.title}
                          </h5>
                          <div className="flex flex-wrap gap-2 mb-6">
                            <span className="px-3 py-1 rounded-full bg-white/80 border border-white text-[10px] font-bold text-[#718096] uppercase tracking-wider shadow-sm">
                              {job.company}
                            </span>
                            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#7C9ADD]/10 text-[#7C9ADD] text-[10px] font-bold uppercase tracking-wider border border-[#7C9ADD]/20">
                              <MapPin size={10} />
                              {job.location}
                            </div>
                            {job.remote && (
                              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#98C9A3]/10 text-[#98C9A3] text-[10px] font-bold uppercase tracking-wider border border-[#98C9A3]/20">
                                <Globe size={10} />
                                Remote
                              </div>
                            )}
                          </div>
                          <p className="text-sm font-medium text-[#718096] line-clamp-3 leading-relaxed">
                            {job.description_snippet}
                          </p>
                        </div>
                        <div className="flex items-center justify-between pt-6 border-t border-white/40">
                          <span className="text-[9px] font-bold text-[#A0AEC0] uppercase tracking-[0.2em]">
                            Via {job.source}
                          </span>
                          <a
                            href={job.apply_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] font-bold text-[#7C9ADD] uppercase tracking-widest hover:text-[#7C9ADD]/80 transition-all flex items-center gap-2 group/link"
                          >
                            Apply
                            <ExternalLink
                              size={12}
                              className="transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
                            />
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
            <div className="glass-card p-10 rounded-[40px] bg-white/60 shadow-glass border border-white/60 backdrop-blur-xl">
              <h3 className="font-display font-bold text-xl text-[#2D3748] mb-6 flex items-center gap-3">
                <CheckCircle className="text-[#98C9A3]" size={20} />
                Fit Verdict
              </h3>
              <p className="text-md font-medium text-[#4A5568] leading-relaxed italic">
                &quot;{result.fit_verdict}&quot;
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {!!result.pros?.length && (
              <div className="glass-card p-10 rounded-[40px] bg-[#98C9A3]/5 border border-[#98C9A3]/20 shadow-glass backdrop-blur-xl">
                <h3 className="font-display font-bold text-xl text-[#2D3748] mb-8 flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#98C9A3] shadow-[0_0_10px_rgba(152,201,163,0.5)]" />
                  Key Strengths
                </h3>
                <div className="space-y-5">
                  {result.pros.map((item: string, i: number) => (
                    <div key={i} className="flex gap-4 items-start group">
                      <div className="w-6 h-6 rounded-full bg-white border border-[#98C9A3]/20 text-[#98C9A3] flex items-center justify-center shrink-0 mt-0.5 shadow-sm group-hover:scale-110 transition-transform">
                        <CheckCircle size={12} strokeWidth={3} />
                      </div>
                      <p className="text-sm text-[#4A5568] font-bold leading-relaxed">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!!result.cons?.length && (
              <div className="glass-card p-10 rounded-[40px] bg-[#F28C8C]/5 border border-[#F28C8C]/20 shadow-glass backdrop-blur-xl">
                <h3 className="font-display font-bold text-xl text-[#2D3748] mb-8 flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#F28C8C] shadow-[0_0_10px_rgba(242,140,140,0.5)]" />
                  Identified Gaps
                </h3>
                <div className="space-y-5">
                  {result.cons.map((item: string, i: number) => (
                    <div key={i} className="flex gap-4 items-start group">
                      <div className="w-6 h-6 rounded-full bg-white border border-[#F28C8C]/20 text-[#F28C8C] flex items-center justify-center shrink-0 mt-0.5 shadow-sm group-hover:scale-110 transition-transform">
                        <AlertCircle size={12} strokeWidth={3} />
                      </div>
                      <p className="text-sm text-[#4A5568] font-bold leading-relaxed">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="glass-card p-12 rounded-[48px] bg-[#2D3748] text-white shadow-2xl shadow-[#2D3748]/20 border border-[#2D3748] overflow-hidden relative group/rec">
            <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full blur-[100px] bg-[#7C9ADD]/10 pointer-events-none group-hover/rec:bg-[#7C9ADD]/20 transition-all duration-1000" />
            <h3 className="font-display font-bold text-2xl text-[#7C9ADD] mb-10 flex items-center gap-4 relative z-10">
              <div className="w-3 h-3 rounded-full bg-[#7C9ADD] shadow-[0_0_15px_#7C9ADD]" />
              Strategic Recommendations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10 relative z-10">
              {result.recommendations.map((r: string, i: number) => (
                <div key={i} className="flex gap-6 items-start group/item">
                  <div className="text-[#7C9ADD] font-display font-black text-2xl h-10 w-10 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 shrink-0 group-hover/item:bg-[#7C9ADD] group-hover/item:text-white transition-all duration-300">
                    {i + 1}
                  </div>
                  <p className="text-md text-[#A0AEC0] font-medium leading-[1.6] group-hover/item:text-white transition-colors duration-300 pt-1">
                    {r}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
