"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  matchJob,
  matchJobWithUpload,
  scrapeJobs,
  createApplication,
} from "@/lib/api";
import MatchGauge from "@/components/MatchGauge";
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
  FileText,
  Fingerprint,
  Briefcase,
  History,
  Info,
  TrendingUp,
  FileEdit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import CoverLetterModal from "@/components/CoverLetterModal";

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
  id?: string;
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
  match_score?: number;
}

export default function JobMatchPage() {
  const [inputMode, setInputMode] = useState<"upload" | "id">("upload");
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
  const [isCLModalOpen, setIsCLModalOpen] = useState(false);

  async function handleMainAction() {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      let data;
      if (inputMode === "id") {
        if (!resumeId || !jdText)
          throw new Error("Resume ID and Job Description are required.");
        data = await matchJob(resumeId, jdText, role);
      } else {
        if (!resumeFile || (!jdText.trim() && !jdFile))
          throw new Error("Resume file and JD (text or file) are required.");
        data = await matchJobWithUpload(
          resumeFile,
          jdText,
          role,
          jdFile ?? undefined,
        );
      }
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
    <div className="flex flex-col gap-12 w-full mx-auto pb-20 px-4 md:px-0">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-6 w-1 bg-[#7C9ADD] rounded-full" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#A0AEC0]">
              Career Intelligence
            </span>
          </div>
          <h1 className="font-display font-black text-4xl md:text-6xl tracking-tight text-[#2D3748]">
            Job{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#7C9ADD] to-[#9F7AEA]">
              Matching
            </span>
          </h1>
          <p className="mt-4 text-md font-medium text-[#718096] max-w-xl leading-relaxed">
            Harness semantic AI to benchmark your professional profile against
            market requirements with high-fidelity precision.
          </p>
        </div>
        <div className="hidden lg:flex items-center gap-3 p-4 rounded-3xl bg-white/40 border border-white/60 shadow-sm backdrop-blur-md">
          <div className="p-3 rounded-2xl bg-[#7C9ADD]/10 text-[#7C9ADD]">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-[#2D3748]">
              AI Accuracy
            </div>
            <div className="text-xs font-bold text-[#718096]">
              98.4% Confidence Rate
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Input Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-12 xl:col-span-7 space-y-8"
        >
          <div className="glass-card overflow-hidden rounded-[3rem] bg-white/70 border border-white/80 shadow-2xl relative">
            <div className="p-8 md:p-12 space-y-10 relative z-10">
              {/* Input Mode Switcher */}
              <div className="flex p-1.5 bg-gray-100/50 rounded-2xl w-fit border border-gray-200/50">
                <button
                  onClick={() => setInputMode("upload")}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
                    inputMode === "upload"
                      ? "bg-white text-[#7C9ADD] shadow-sm"
                      : "text-[#A0AEC0] hover:text-[#4A5568]"
                  }`}
                >
                  <FileText size={14} />
                  Direct Upload
                </button>
                <button
                  onClick={() => setInputMode("id")}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
                    inputMode === "id"
                      ? "bg-white text-[#7C9ADD] shadow-sm"
                      : "text-[#A0AEC0] hover:text-[#4A5568]"
                  }`}
                >
                  <Fingerprint size={14} />
                  Analysis ID
                </button>
              </div>

              <div className="grid grid-cols-1 gap-10">
                <div className="space-y-6">
                  {/* Step 1: Identity */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-[0.25em] flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-[#7C9ADD]" />
                      Step 01: Professional Context
                    </label>

                    <AnimatePresence mode="wait">
                      {inputMode === "upload" ? (
                        <motion.div
                          key="upload"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="p-8 rounded-4xl bg-linear-to-br from-white to-[#F8FAFC] border border-white/80 shadow-inner group transition-all hover:bg-white"
                        >
                          <span className="text-[10px] font-bold text-[#718096] uppercase tracking-wider block mb-4">
                            Upload Master Resume (PDF)
                          </span>
                          <input
                            id="jm-resume-file"
                            className="w-full text-xs text-[#4A5568] file:mr-4 file:py-3 file:px-8 file:rounded-xl file:border-0 file:bg-[#2D3748] file:text-white file:text-[10px] file:font-bold file:uppercase file:tracking-widest cursor-pointer transition-all hover:file:bg-[#1A202C]"
                            type="file"
                            accept=".pdf,application/pdf"
                            onChange={(e) =>
                              setResumeFile(e.target.files?.[0] ?? null)
                            }
                          />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="id"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="relative"
                        >
                          <Fingerprint
                            className="absolute left-6 top-1/2 -translate-y-1/2 text-[#7C9ADD]/40"
                            size={20}
                          />
                          <input
                            id="jm-resume-id"
                            className="w-full bg-white/80 border border-white/60 focus:border-[#7C9ADD]/40 rounded-2xl px-14 h-16 outline-none transition-all font-display font-medium text-lg text-[#2D3748] shadow-sm placeholder:text-[#CBD5E0]"
                            placeholder="Paste Resume Analysis ID..."
                            value={resumeId}
                            onChange={(e) => setResumeId(e.target.value)}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Step 2: Role Selection */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-[0.25em] flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-[#7C9ADD]" />
                      Step 02: Target Horizon
                    </label>
                    <div className="relative group">
                      <Briefcase
                        className="absolute left-6 top-1/2 -translate-y-1/2 text-[#7C9ADD]/40"
                        size={20}
                      />
                      <select
                        id="jm-role"
                        className="w-full appearance-none bg-white/80 border border-white/60 focus:border-[#7C9ADD]/40 rounded-2xl px-14 h-16 outline-none transition-all cursor-pointer font-display font-bold text-lg text-[#2D3748] shadow-sm"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none text-[#7C9ADD]/40 group-hover:text-[#7C9ADD]">
                        <ChevronRight size={20} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3: Benchmarking */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-[0.25em] flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-[#7C9ADD]" />
                      Step 03: Benchmark Criteria
                    </label>
                    <div className="relative">
                      <textarea
                        id="jm-jd-text"
                        className="w-full bg-white/80 border border-white/60 focus:border-[#7C9ADD]/40 rounded-[2rem] p-8 min-h-[160px] resize-none outline-none transition-all font-body font-medium text-sm text-[#4A5568] placeholder:text-[#CBD5E0] shadow-sm leading-relaxed"
                        placeholder="Paste the full job description here for deep AI correlation analysis..."
                        value={jdText}
                        onChange={(e) => setJdText(e.target.value)}
                      />
                    </div>

                    <div className="p-6 rounded-2xl bg-[#7C9ADD]/5 border border-[#7C9ADD]/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText size={18} className="text-[#7C9ADD]" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C9ADD]">
                          Or Attach JD PDF
                        </span>
                      </div>
                      <input
                        id="jm-jd-file"
                        className="text-[10px] text-[#718096] file:mr-4 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:bg-white file:text-[#7C9ADD] file:text-[9px] file:font-bold file:uppercase file:cursor-pointer transition-all"
                        type="file"
                        accept=".pdf,.txt,.md"
                        onChange={(e) => setJdFile(e.target.files?.[0] ?? null)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-2xl bg-red-50 border border-red-100/50 flex items-center gap-4 text-red-600 text-xs font-bold leading-normal"
                >
                  <AlertCircle size={20} />
                  <span>Analysis Error: {error}</span>
                </motion.div>
              )}

              <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row gap-6">
                <button
                  id="jm-match-btn"
                  onClick={handleMainAction}
                  disabled={loading}
                  className="flex-1 h-16 rounded-2xl bg-linear-to-r from-[#7C9ADD] to-[#6366F1] text-white font-black text-[12px] uppercase tracking-[0.25em] shadow-xl shadow-[#7C9ADD]/20 hover:shadow-2xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none flex items-center justify-center gap-3 group"
                >
                  {loading ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Correlate Credentials
                      <ChevronRight
                        size={16}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Visual Decoration */}
            <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-[#7C9ADD]/5 blur-3xl pointer-events-none" />
          </div>
        </motion.div>

        {/* Right Column: Dynamic Results / Meta Information */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-8">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {/* Primary Scores */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="glass-card p-8 rounded-4xl bg-white/80 border border-white flex flex-col items-center">
                    <MatchGauge
                      score={result.match_score}
                      label="Match Score"
                      size={160}
                    />
                  </div>
                  <div className="glass-card p-8 rounded-4xl bg-white/80 border border-white flex flex-col items-center">
                    <MatchGauge
                      score={result.semantic_similarity}
                      label="Profile Similarity"
                      size={160}
                    />
                  </div>
                </div>

                {/* Fit Verdict */}
                <div className="glass-card p-8 rounded-4xl bg-[#2D3748] text-white overflow-hidden relative group/verdict">
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                    <CheckCircle size={60} />
                  </div>
                  <div className="relative z-10">
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#7C9ADD] mb-4">
                      Fit Verdict
                    </div>
                    <p className="text-xl font-display font-medium italic leading-relaxed">
                      &quot;{result.fit_verdict}&quot;
                    </p>
                  </div>
                </div>

                {/* Cover Letter Prompt */}
                <div className="glass-card p-4 rounded-3xl bg-linear-to-r from-[#7C9ADD]/5 to-[#6366F1]/5 border border-[#7C9ADD]/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-white shadow-sm text-[#7C9ADD]">
                      <FileEdit size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-[#2D3748] uppercase tracking-wider">
                        Ready to Apply?
                      </p>
                      <p className="text-[10px] font-bold text-[#718096]">
                        Generate a tailored cover letter.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#7C9ADD] hover:text-white transition-all shadow-sm"
                    onClick={() => setIsCLModalOpen(true)}
                  >
                    Build Letter
                  </Button>
                </div>

                {/* Quick Strategy */}
                <div className="glass-card p-8 rounded-4xl bg-white/80 border border-white">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#A0AEC0] mb-8 flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#9F7AEA]" />
                    Strategic Wins
                  </h3>
                  <div className="space-y-6">
                    {result.recommendations.slice(0, 3).map((r, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="w-8 h-8 rounded-xl bg-[#7C9ADD]/10 text-[#7C9ADD] flex items-center justify-center shrink-0 font-display font-bold text-xs">
                          {i + 1}
                        </div>
                        <p className="text-xs font-bold text-[#4A5568] leading-relaxed pt-1.5">
                          {r}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card p-12 rounded-[3rem] bg-white/60 border border-white/60 flex flex-col items-center text-center justify-center min-h-[400px]"
              >
                <div className="w-24 h-24 rounded-full bg-[#E2E8F0]/30 flex items-center justify-center text-[#A0AEC0] mb-8 animate-pulse shadow-inner">
                  <Info size={40} />
                </div>
                <h3 className="font-display font-bold text-2xl text-[#2D3748] mb-4 tracking-tight">
                  Ready for Correlation
                </h3>
                <p className="text-sm font-medium text-[#718096] max-w-[280px] leading-relaxed">
                  Input your credentials and target JD to unlock deep semantic
                  alignment analysis.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Detailed Analysis Section */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <div className="h-px bg-linear-to-r from-transparent via-gray-200 to-transparent w-full" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <SkillGapList skillGap={result.skill_gap} />

            <div className="space-y-8">
              {/* Comprehensive Strengths */}
              <div className="glass-card p-10 rounded-[3rem] bg-white/80 border border-white/80 shadow-glass">
                <h3 className="font-display font-bold text-2xl text-[#2D3748] mb-10 flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-[#98C9A3]/10 text-[#98C9A3]">
                    <CheckCircle size={24} />
                  </div>
                  Core Strengths
                </h3>
                <div className="grid grid-cols-1 gap-6">
                  {result.pros?.map((item, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ x: 5 }}
                      className="p-5 rounded-2xl bg-white/50 border border-white/50 flex items-start gap-4"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-[#98C9A3] mt-2 shrink-0" />
                      <p className="text-sm font-bold text-[#4A5568] leading-relaxed">
                        {item}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Comprehensive Gaps */}
              <div className="glass-card p-10 rounded-[3rem] bg-white/80 border border-white/80 shadow-glass">
                <h3 className="font-display font-bold text-2xl text-[#2D3748] mb-10 flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-[#F28C8C]/10 text-[#F28C8C]">
                    <AlertCircle size={24} />
                  </div>
                  Growth Vectors
                </h3>
                <div className="grid grid-cols-1 gap-6">
                  {result.cons?.map((item, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ x: 5 }}
                      className="p-5 rounded-2xl bg-white/50 border border-white/50 flex items-start gap-4"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-[#F28C8C] mt-2 shrink-0" />
                      <p className="text-sm font-bold text-[#4A5568] leading-relaxed">
                        {item}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Correlated Opportunities (Jobs) */}
      <div className="space-y-10">
        <div className="flex flex-col gap-6">
          <div className="space-y-2">
            <h3 className="font-display font-black text-3xl text-[#2D3748] tracking-tight flex items-center gap-3">
              <Sparkles className="text-[#7C9ADD]" size={32} />
              Open Market <span className="text-[#7C9ADD]">Opportunities</span>
            </h3>
            <p className="text-sm font-medium text-[#718096]">
              Refine your search preferences to discover roles correlated to
              your profile.
            </p>
          </div>

          <div className="glass-card p-8 rounded-4xl bg-white/80 border border-white/80 shadow-sm backdrop-blur-md">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Roles Selection */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-widest flex items-center gap-2">
                  <Briefcase size={12} className="text-[#7C9ADD]" />
                  Target Roles
                </label>
                <div className="relative group">
                  <input
                    className="w-full bg-slate-50/50 border border-slate-100 focus:border-[#7C9ADD]/30 rounded-xl px-4 py-3 text-xs font-bold text-[#4A5568] outline-none transition-all"
                    placeholder="e.g. Frontend, React..."
                    value={fieldInput}
                    onChange={(e) => setFieldInput(e.target.value)}
                  />
                  <p className="mt-2 text-[9px] text-[#A0AEC0] font-medium italic">
                    Separate by comma for multi-role search
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-widest flex items-center gap-2">
                  <MapPin size={12} className="text-[#7C9ADD]" />
                  Preferred Location
                </label>
                <div className="relative group">
                  <input
                    className="w-full bg-slate-50/50 border border-slate-100 focus:border-[#7C9ADD]/30 rounded-xl px-4 py-3 text-xs font-bold text-[#4A5568] outline-none transition-all"
                    placeholder="e.g. London, Remote..."
                    value={jobLocation}
                    onChange={(e) => setJobLocation(e.target.value)}
                  />
                </div>
              </div>

              {/* Mode Toggle */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-widest flex items-center gap-2">
                  <Globe size={12} className="text-[#7C9ADD]" />
                  Work Arrangement
                </label>
                <button
                  onClick={() => setRemoteOnly(!remoteOnly)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-[10px] font-bold uppercase tracking-wider ${
                    remoteOnly
                      ? "bg-[#7C9ADD]/10 text-[#7C9ADD] border-[#7C9ADD]/20"
                      : "bg-slate-50/50 text-slate-400 border-slate-100"
                  }`}
                >
                  <span>{remoteOnly ? "Remote Only" : "Any Mode"}</span>
                  <div
                    className={`w-8 h-4 rounded-full relative transition-all ${remoteOnly ? "bg-[#7C9ADD]" : "bg-slate-200"}`}
                  >
                    <div
                      className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${remoteOnly ? "right-0.5" : "left-0.5"}`}
                    />
                  </div>
                </button>
              </div>

              {/* Action */}
              <div className="flex items-end">
                <button
                  id="pulseSearchBtn"
                  onClick={handleScrapeJobs}
                  disabled={jobsLoading}
                  className="w-full h-12 rounded-xl bg-[#2D3748] text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-[#2D3748]/10 hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {jobsLoading ? (
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Search size={14} />
                      Pulse Search
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {jobsError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl bg-red-50 border border-red-100/50 flex items-center gap-4 text-red-600 text-xs font-bold"
          >
            <AlertCircle size={20} />
            <span>Search Error: {jobsError}</span>
          </motion.div>
        )}

        {jobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {jobs.map((job, idx) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                key={job.id || `${job.apply_url}-${idx}`}
                className="p-8 rounded-4xl bg-white/70 border border-white/80 hover:border-[#7C9ADD]/40 hover:shadow-2xl transition-all group/card relative overflow-hidden"
              >
                <div className="flex flex-col h-full justify-between gap-8 relative z-10">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#A0AEC0]">
                        Via {job.source}
                      </span>
                      <div className="px-3 py-1 rounded-full bg-[#7C9ADD]/10 text-[#7C9ADD] text-[9px] font-bold uppercase tracking-widest border border-[#7C9ADD]/20">
                        {job.match_score
                          ? `${Math.floor(job.match_score)}% Match`
                          : "Auto-Matching..."}
                      </div>
                    </div>
                    <h5 className="font-display font-bold text-xl text-[#2D3748] mb-6 group-hover/card:text-[#7C9ADD] transition-colors leading-tight min-h-[56px] line-clamp-2">
                      {job.title}
                    </h5>
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="px-3 py-1.5 rounded-xl bg-white/80 border border-white text-[10px] font-bold text-[#718096] uppercase tracking-wider shadow-sm">
                        {job.company}
                      </span>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-[#718096] text-[10px] font-bold uppercase tracking-wider border border-white shadow-sm">
                        <MapPin size={10} className="text-[#7C9ADD]" />
                        {job.location}
                      </div>
                    </div>
                    <p className="text-xs font-medium text-[#718096] line-clamp-3 leading-relaxed opacity-80 group-hover/card:opacity-100 transition-opacity">
                      {job.description_snippet}
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => {
                          setJdText(job.description_snippet);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="text-[9px] font-black text-[#A0AEC0] uppercase tracking-[0.2em] hover:text-[#7C9ADD] transition-colors flex items-center gap-2"
                      >
                        <History size={12} />
                        Analyze Match
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={async (e) => {
                            e.preventDefault();
                            try {
                              await createApplication({
                                company: job.company,
                                role: job.title,
                                location: job.location,
                                apply_url: job.apply_url,
                                match_score: job.match_score,
                              });
                              toast.success("Added to Applications CRM!");
                            } catch (error) {
                              const message =
                                error instanceof Error
                                  ? error.message
                                  : "Failed to add application";
                              toast.error(message);
                            }
                          }}
                          className="p-2.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-[#7C9ADD]/10 hover:text-[#7C9ADD] transition-all"
                          title="Track Application"
                        >
                          <TrendingUp size={14} />
                        </button>
                        <a
                          href={job.apply_url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-6 py-2.5 rounded-xl bg-[#7C9ADD] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#6366F1] transition-all flex items-center gap-2 group/link"
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
                </div>
                {/* Subtle Gradient Shadow */}
                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#7C9ADD]/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-[#7C9ADD]/10 transition-colors" />
              </motion.div>
            ))}
          </div>
        ) : jobsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 opacity-50">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-8 rounded-4xl bg-gray-100 animate-pulse h-64 border border-gray-200"
              />
            ))}
          </div>
        ) : (
          <div className="p-20 rounded-[3rem] bg-gray-50 border border-gray-100 flex flex-col items-center text-center">
            <div className="p-10 rounded-full bg-white shadow-xl mb-8">
              <Search size={40} className="text-[#CBD5E0]" />
            </div>
            <h4 className="font-display font-bold text-xl text-[#A0AEC0]">
              Search market correlation to see jobs
            </h4>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isCLModalOpen && (
          <CoverLetterModal
            isOpen={isCLModalOpen}
            onClose={() => setIsCLModalOpen(false)}
            resumeId={resumeId || "default"}
            jdText={jdText}
            initialRole={role}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
