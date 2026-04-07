"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  matchJob,
  matchJobWithUpload,
  scrapeJobs,
  createApplication,
  getJobSuggestions,
  SuggestedJob,
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
  Zap,
  Target,
  ArrowUpRight,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import CoverLetterModal from "@/components/CoverLetterModal";
import OutreachModal from "@/components/OutreachModal";
import { Mail as MailIcon } from "lucide-react";

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
  technical_score: number;
  experience_score: number;
  soft_skills_score: number;
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
  bridge_advice?: string[];
  match_id?: string;
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
  const [isOutreachModalOpen, setIsOutreachModalOpen] = useState(false);

  // New States
  const [suggestions, setSuggestions] = useState<SuggestedJob[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [readinessMeta, setReadinessMeta] = useState<{
    score: number;
    summary: string;
  } | null>(null);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  async function fetchSuggestions() {
    setSuggestionsLoading(true);
    try {
      const data = await getJobSuggestions(6);
      setSuggestions(data.suggestions);
      setReadinessMeta({
        score: data.evolution_score,
        summary: data.readiness_summary,
      });
    } catch (e) {
      console.error("Failed to fetch suggestions", e);
    } finally {
      setSuggestionsLoading(false);
    }
  }

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
    <div className="flex flex-col gap-16 w-full mx-auto pb-24 px-4 md:px-0">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-8"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-[#FFB800] fill-[#FFB800]" />
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-[#7C9ADD]">
              AI Career Copilot
            </span>
          </div>
          <h1 className="font-display font-black text-5xl md:text-7xl tracking-tighter text-[#1A202C] leading-none">
            Precision{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#7C9ADD] to-[#6366F1]">
              Match
            </span>
          </h1>
          <p className="text-lg font-medium text-[#718096] max-w-2xl leading-relaxed">
            Correlate your verified production readiness with live market
            opportunities using Hirenix&apos;s adaptive matching engine.
          </p>
        </div>

        {/* Readiness Snapshot */}
        {readinessMeta && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-4xl bg-white border border-[#E2E8F0] shadow-xl flex items-center gap-6 min-w-[320px]"
          >
            <div className="relative">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-gray-100"
                />
                <motion.circle
                  cx="40"
                  cy="40"
                  r="34"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={213.6}
                  initial={{ strokeDashoffset: 213.6 }}
                  animate={{
                    strokeDashoffset:
                      213.6 - (readinessMeta.score / 100) * 213.6,
                  }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="text-[#7C9ADD]"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-lg font-black text-[#2D3748]">
                {readinessMeta.score}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#A0AEC0]">
                Production Index
              </p>
              <p className="text-xs font-bold text-[#4A5568] leading-tight max-w-[180px]">
                {readinessMeta.summary}
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* AI Recommendations Carousel */}
      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display font-black text-2xl text-[#2D3748] tracking-tight flex items-center gap-3">
                <Star className="text-[#FFB800] fill-[#FFB800]" size={24} />
                Prime <span className="text-[#7C9ADD]">Opportunities</span>
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-[10px] font-bold uppercase tracking-widest"
                  onClick={fetchSuggestions}
                >
                  <History size={14} className="mr-2" /> Refresh
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestions.map((job, idx) => (
                <motion.div
                  key={job.id}
                  whileHover={{ y: -8 }}
                  className="p-8 rounded-[3rem] bg-white border border-[#E2E8F0] shadow-sm hover:shadow-2xl hover:border-[#7C9ADD]/30 transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-6">
                    <div className="flex flex-col items-end">
                      <span className="text-[24px] font-black text-[#7C9ADD] leading-none opacity-20">
                        {job.alignment_score}%
                      </span>
                      <span className="text-[8px] font-bold uppercase tracking-widest text-[#A0AEC0]">
                        Match
                      </span>
                    </div>
                  </div>

                  <div className="space-y-6 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#7C9ADD]/10 flex items-center justify-center text-[#7C9ADD]">
                        <Briefcase size={22} />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-lg text-[#1A202C] line-clamp-1">
                          {job.title}
                        </h4>
                        <p className="text-xs font-bold text-[#718096]">
                          {job.company}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 italic">
                      <p className="text-[11px] font-medium text-[#4A5568] leading-relaxed line-clamp-2">
                        &quot;{job.reason}&quot;
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-1.5 text-[#A0AEC0]">
                        <MapPin size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          {job.location}
                        </span>
                      </div>
                      <a
                        href={job.apply_url}
                        target="_blank"
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#7C9ADD] hover:text-[#6366F1]"
                      >
                        Apply <ArrowUpRight size={14} />
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Benchmarking Engine */}
        <motion.div className="lg:col-span-12 xl:col-span-7 space-y-10">
          <div className="glass-card overflow-hidden rounded-4xl bg-white border border-[#E2E8F0] shadow-2xl relative">
            <div className="p-10 md:p-14 space-y-12 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex p-1.5 bg-[#F8FAFC] rounded-2xl border border-slate-100">
                  <button
                    onClick={() => setInputMode("upload")}
                    className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${inputMode === "upload" ? "bg-white text-[#7C9ADD] shadow-md" : "text-[#A0AEC0]"}`}
                  >
                    Upload
                  </button>
                  <button
                    onClick={() => setInputMode("id")}
                    className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${inputMode === "id" ? "bg-white text-[#7C9ADD] shadow-md" : "text-[#A0AEC0]"}`}
                  >
                    ID
                  </button>
                </div>
              </div>

              <div className="space-y-10">
                <div className="space-y-4">
                  <span className="text-[10px] font-black text-[#7C9ADD] uppercase tracking-[0.3em]">
                    01. Profile Injection
                  </span>
                  {inputMode === "upload" ? (
                    <div className="p-10 rounded-4xl bg-linear-to-br from-white to-[#F8FAFC] border-2 border-dashed border-[#E2E8F0] hover:border-[#7C9ADD]/40 transition-all flex flex-col items-center justify-center text-center cursor-pointer group">
                      <div className="w-16 h-16 rounded-3xl bg-[#7C9ADD]/5 text-[#7C9ADD] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <FileText size={32} />
                      </div>
                      <p className="text-xs font-bold text-[#4A5568] mb-2">
                        Drop Master Resume
                      </p>
                      <p className="text-[10px] uppercase font-bold text-[#A0AEC0] tracking-widest mb-6">
                        PDF / MAX 5MB
                      </p>
                      <input
                        type="file"
                        className="hidden"
                        id="resume-input"
                        onChange={(e) =>
                          setResumeFile(e.target.files?.[0] ?? null)
                        }
                      />
                      <Button
                        variant="outline"
                        className="rounded-xl px-10 h-11 text-[10px] font-black uppercase tracking-widest"
                        onClick={() =>
                          document.getElementById("resume-input")?.click()
                        }
                      >
                        {resumeFile ? resumeFile.name : "Select File"}
                      </Button>
                    </div>
                  ) : (
                    <div className="relative">
                      <Fingerprint
                        className="absolute left-8 top-1/2 -translate-y-1/2 text-[#7C9ADD]"
                        size={24}
                      />
                      <input
                        className="w-full bg-[#F8FAFC] border-2 border-[#E2E8F0] focus:border-[#7C9ADD]/30 rounded-3xl px-16 h-20 outline-none transition-all font-display font-medium text-xl text-[#1A202C]"
                        placeholder="Analysis Fingerprint..."
                        value={resumeId}
                        onChange={(e) => setResumeId(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <span className="text-[10px] font-black text-[#7C9ADD] uppercase tracking-[0.3em]">
                    02. Market Criteria
                  </span>
                  <div className="relative">
                    <textarea
                      className="w-full bg-[#F8FAFC] border-2 border-[#E2E8F0] focus:border-[#7C9ADD]/30 rounded-[2.5rem] p-10 min-h-[220px] resize-none outline-none transition-all font-body text-sm font-medium leading-relaxed"
                      placeholder="Paste the Job Description to initialize semantic cross-referencing..."
                      value={jdText}
                      onChange={(e) => setJdText(e.target.value)}
                    />
                    <div className="absolute top-8 right-8 flex gap-2">
                      <Target size={24} className="text-[#7C9ADD] opacity-20" />
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-6 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-4 text-red-600 text-xs font-bold">
                  <AlertCircle size={20} />
                  <span>Analysis aborted: {error}</span>
                </div>
              )}

              <Button
                onClick={handleMainAction}
                disabled={loading}
                className="w-full h-20 rounded-[2rem] bg-[#1A202C] hover:bg-[#2D3748] text-white font-black text-xs uppercase tracking-[0.4em] shadow-2xl transition-all"
              >
                {loading ? (
                  <div className="animate-spin h-6 w-6 border-2 border-white/20 border-t-white rounded-full" />
                ) : (
                  "Run Correlation Scan"
                )}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Analytics Dashboard */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-10">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-10"
              >
                {/* Radial Multi-Score */}
                <div className="p-10 rounded-[3rem] bg-white border border-[#E2E8F0] shadow-xl space-y-12">
                  <div className="flex flex-col items-center gap-6">
                    <MatchGauge
                      score={result.match_score}
                      label="AI Correlation"
                      size={240}
                    />
                    <div className="text-center">
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#7C9ADD] mb-2">
                        Benchmarking Result
                      </p>
                      <h4 className="font-display font-bold text-3xl text-[#1A202C]">
                        {result.fit_verdict}
                      </h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 pt-10 border-t border-slate-50">
                    <div className="space-y-1 text-center">
                      <p className="text-[20px] font-black text-[#2D3748]">
                        {result.technical_score}%
                      </p>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-[#A0AEC0]">
                        Technical
                      </p>
                    </div>
                    <div className="space-y-1 text-center">
                      <p className="text-[20px] font-black text-[#2D3748]">
                        {result.experience_score}%
                      </p>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-[#A0AEC0]">
                        Experience
                      </p>
                    </div>
                    <div className="space-y-1 text-center">
                      <p className="text-[20px] font-black text-[#2D3748]">
                        {result.soft_skills_score}%
                      </p>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-[#A0AEC0]">
                        Leadership/Soft
                      </p>
                    </div>
                    <div className="space-y-1 text-center">
                      <p className="text-[20px] font-black text-[#2D3748]">
                        {result.semantic_similarity}%
                      </p>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-[#A0AEC0]">
                        Narrative Fit
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bridge Advice */}
                {result.bridge_advice && result.bridge_advice.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-10 rounded-[3rem] bg-[#1A202C] text-white space-y-8 relative overflow-hidden"
                  >
                    <Sparkles
                      className="absolute top-10 right-10 text-[#7C9ADD] opacity-30"
                      size={40}
                    />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#7C9ADD]">
                      Strategic Pivot Advice
                    </h4>
                    <div className="space-y-6">
                      {result.bridge_advice.map((advice, i) => (
                        <div
                          key={i}
                          className="flex gap-4 group cursor-default"
                        >
                          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#7C9ADD] transition-colors">
                            <CheckCircle size={14} className="text-white" />
                          </div>
                          <p className="text-xs font-medium leading-relaxed text-gray-300 pt-1">
                            {advice}
                          </p>
                        </div>
                      ))}
                    </div>
                    <Button
                      className="w-full bg-white text-[#1A202C] hover:bg-slate-100 rounded-2xl h-14 text-[10px] font-black uppercase tracking-widest gap-3"
                      onClick={() => setIsCLModalOpen(true)}
                    >
                      Optimize Cover Letter <ArrowUpRight size={16} />
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-white/20 bg-transparent text-white hover:bg-white/5 rounded-2xl h-14 text-[10px] font-black uppercase tracking-widest gap-3"
                      onClick={() => setIsOutreachModalOpen(true)}
                    >
                      Generate Outreach Drafts <MailIcon size={16} />
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <div className="p-16 rounded-[4rem] bg-slate-50 border-2 border-dashed border-[#E2E8F0] flex flex-col items-center text-center justify-center min-h-[500px]">
                <div className="w-32 h-32 rounded-full bg-white shadow-xl flex items-center justify-center text-[#E2E8F0] mb-10 animate-pulse">
                  <Target size={60} />
                </div>
                <h4 className="font-display font-bold text-2xl text-[#2D3748] mb-4">
                  Awaiting Signal
                </h4>
                <p className="text-sm font-medium text-[#718096] max-w-[280px] leading-relaxed">
                  Start a correlation scan to see high-fidelity matching
                  analytics and bridge advice.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Extended Diagnostics */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <div className="h-px bg-slate-100 w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <SkillGapList skillGap={result.skill_gap} />
            <div className="space-y-8">
              <div className="p-10 rounded-[3rem] bg-white border border-[#E2E8F0] shadow-sm">
                <h4 className="font-display font-bold text-2xl text-[#1A202C] mb-8">
                  Competitive Edge
                </h4>
                <div className="space-y-4">
                  {result.pros?.map((pro, i) => (
                    <div
                      key={i}
                      className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-start gap-4"
                    >
                      <CheckCircle
                        size={18}
                        className="text-emerald-500 mt-0.5"
                      />
                      <p className="text-sm font-bold text-[#4A5568]">{pro}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-10 rounded-[3rem] bg-white border border-[#E2E8F0] shadow-sm">
                <h4 className="font-display font-bold text-2xl text-[#1A202C] mb-8">
                  Growth Mitigation
                </h4>
                <div className="space-y-4">
                  {result.cons?.map((con, i) => (
                    <div
                      key={i}
                      className="p-5 rounded-2xl bg-red-50/50 border border-red-100 flex items-start gap-4"
                    >
                      <AlertCircle size={18} className="text-red-500 mt-0.5" />
                      <p className="text-sm font-bold text-[#4A5568]">{con}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Manual Market Search */}
      <div className="space-y-10 pt-10">
        <div className="flex flex-col gap-6">
          <h3 className="font-display font-black text-3xl text-[#1A202C] tracking-tight">
            Market <span className="text-[#7C9ADD]">Discovery</span>
          </h3>
          <div className="p-10 rounded-[3rem] bg-[#F8FAFC] border border-[#E2E8F0] grid grid-cols-1 md:grid-cols-4 gap-8 items-end">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#A0AEC0]">
                Specialization
              </label>
              <input
                className="w-full bg-white border border-[#E2E8F0] rounded-xl px-5 h-12 text-sm font-bold outline-none"
                placeholder="e.g. LLM, React..."
                value={fieldInput}
                onChange={(e) => setFieldInput(e.target.value)}
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#A0AEC0]">
                Geo Preference
              </label>
              <input
                className="w-full bg-white border border-[#E2E8F0] rounded-xl px-5 h-12 text-sm font-bold outline-none"
                placeholder="Worldwide..."
                value={jobLocation}
                onChange={(e) => setJobLocation(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4 h-12 px-6 rounded-xl bg-white border border-[#E2E8F0]">
              <Globe size={16} className="text-[#7C9ADD]" />
              <span className="text-[10px] font-black uppercase tracking-widest flex-1">
                Remote Focus
              </span>
              <input
                type="checkbox"
                checked={remoteOnly}
                onChange={(e) => setRemoteOnly(e.target.checked)}
                className="accent-[#7C9ADD] w-4 h-4"
              />
            </div>
            <Button
              onClick={handleScrapeJobs}
              disabled={jobsLoading}
              className="h-12 bg-[#1A202C] text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
            >
              {jobsLoading ? "Searching..." : "Pulse Survey"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {jobs.map((job, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 rounded-[3rem] bg-white border border-[#E2E8F0] hover:shadow-xl transition-all group"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#A0AEC0]">
                    Market Sync
                  </span>
                  <TrendingUp size={16} className="text-[#7C9ADD] opacity-40" />
                </div>
                <h5 className="font-display font-bold text-lg text-[#1A202C] line-clamp-2 min-h-[56px] leading-snug group-hover:text-[#7C9ADD] transition-colors">
                  {job.title}
                </h5>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#718096]">
                  {job.company}
                </p>
                <p className="text-xs font-medium text-[#718096] line-clamp-3 leading-relaxed">
                  {job.description_snippet}
                </p>
                <div className="flex items-center justify-between pt-6">
                  <button
                    onClick={() => {
                      setJdText(job.description_snippet);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="text-[9px] font-black uppercase tracking-widest text-[#7C9ADD]"
                  >
                    Analyze
                  </button>
                  <a
                    href={job.apply_url}
                    target="_blank"
                    className="px-6 py-2 rounded-xl bg-[#7C9ADD] text-white text-[9px] font-black uppercase tracking-widest hover:bg-[#1A202C] transition-all"
                  >
                    Secure Spot
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
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

      <AnimatePresence>
        {isOutreachModalOpen && result?.match_id && (
          <OutreachModal
            isOpen={isOutreachModalOpen}
            onClose={() => setIsOutreachModalOpen(false)}
            matchId={result.match_id}
            tone="Formal"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
