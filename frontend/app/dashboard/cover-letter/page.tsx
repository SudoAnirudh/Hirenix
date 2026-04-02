"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Sparkles,
  Download,
  Printer,
  Loader2,
  CheckCircle2,
  Copy,
  PenTool,
  Briefcase,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  generateCoverLetter,
  getCoverLetterExportUrl,
  getProgress,
} from "@/lib/api";
import { toast } from "sonner";

interface Resume {
  id: string;
  file_name: string;
  ats_score: number;
}

interface CoverLetter {
  id: string;
  content: string;
  resume_id: string;
  target_role: string;
}

interface ProgressResponse {
  ats_trend?: Resume[];
}

const TONES = [
  {
    id: "Professional",
    label: "Executive",
    icon: Briefcase,
    description: "Formal, balanced, and achievement-oriented.",
  },
  {
    id: "Creative",
    label: "Vibrant",
    icon: Sparkles,
    description: "Bold, personality-driven, and engaging.",
  },
  {
    id: "Persuasive",
    label: "Impactful",
    icon: Zap,
    description: "Sales-focused, high energy, and direct.",
  },
];

export default function CoverLetterPage() {
  const [resumeId, setResumeId] = useState("");
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jdText, setJdText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [tone, setTone] = useState("Professional");
  const [isGenerating, setIsGenerating] = useState(false);
  const [letter, setLetter] = useState<CoverLetter | null>(null);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Fetch resumes for dropdown
  useEffect(() => {
    async function loadResumes() {
      try {
        const progress = (await getProgress()) as ProgressResponse;
        if (progress?.ats_trend) {
          setResumes(progress.ats_trend);
          if (progress.ats_trend.length > 0) {
            setResumeId(progress.ats_trend[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load resumes:", err);
      }
    }
    loadResumes();
  }, []);

  // Typewriter effect
  useEffect(() => {
    if (letter?.content && isTyping) {
      let i = 0;
      const timer = setInterval(() => {
        setDisplayText(letter.content.slice(0, i));
        i += 15; // Speed up typing for UX
        if (i > letter.content.length) {
          clearInterval(timer);
          setIsTyping(false);
        }
      }, 10);
      return () => clearInterval(timer);
    }
  }, [letter, isTyping]);

  const handleGenerate = async () => {
    if (!resumeId || !jdText) {
      toast.error("Please provide both a resume and job description.");
      return;
    }

    setIsGenerating(true);
    setLetter(null);
    setDisplayText("");

    try {
      const result = await generateCoverLetter(
        resumeId,
        jdText,
        targetRole,
        tone,
      );
      setLetter(result);
      setIsTyping(true);
      toast.success("Cover letter generated!");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to generate cover letter.";
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = (format: "pdf" | "docx") => {
    if (!letter?.id) return;
    window.open(getCoverLetterExportUrl(letter.id, format), "_blank");
  };

  const handleCopy = () => {
    if (!letter?.content) return;
    navigator.clipboard.writeText(letter.content);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="w-full mx-auto space-y-12 pb-20 relative">
      {/* Decorative BG */}
      <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full blur-[120px] bg-indigo-500/10 pointer-events-none -z-10" />
      <div className="absolute top-1/4 -right-20 w-[500px] h-[500px] rounded-full blur-[150px] bg-violet-500/10 pointer-events-none -z-10" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-slate-200/60 relative z-10">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-[0.2em]">
            <Sparkles size={14} />
            AI Document Engine
          </div>
          <h1 className="text-5xl font-black tracking-tight text-[#1E293B] font-heading">
            Cover <span className="text-indigo-600">Letter</span> Studio
          </h1>
          <p className="text-[#64748B] text-lg max-w-xl leading-relaxed">
            Generate high-conversion cover letters tailored to your specific
            experience and the role requirements.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
        {/* Left: Input Panel */}
        <div className="xl:col-span-12 2xl:col-span-5 space-y-8">
          <Card className="p-8 rounded-4xl bg-white/70 backdrop-blur-xl border-white/80 shadow-2xl space-y-10">
            {/* Resume Selection */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-1">
                01. Source Identity
              </label>
              <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {resumes.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setResumeId(r.id)}
                    className={`p-5 rounded-2xl border-2 transition-all text-left flex items-center justify-between group ${
                      resumeId === r.id
                        ? "border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-500/10"
                        : "border-slate-100 bg-white hover:border-indigo-200"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-xl ${resumeId === r.id ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-500"}`}
                      >
                        <FileText size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 truncate max-w-[200px]">
                          {r.file_name}
                        </div>
                        <div className="text-xs text-slate-400">
                          ATS Score: {r.ats_score}%
                        </div>
                      </div>
                    </div>
                    {resumeId === r.id && (
                      <CheckCircle2 size={20} className="text-indigo-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Context */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-1">
                02. Opportunity Context
              </label>
              <div className="space-y-4">
                <input
                  placeholder="Target Role (e.g. Senior Product Designer)"
                  className="w-full p-5 rounded-2xl border-2 border-slate-100 bg-white/50 focus:border-indigo-500 focus:bg-white transition-all outline-none font-medium placeholder:text-slate-300"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                />
                <textarea
                  placeholder="Paste the Job Description or requirements here..."
                  className="w-full h-48 p-5 rounded-2xl border-2 border-slate-100 bg-white/50 focus:border-indigo-500 focus:bg-white transition-all outline-none font-medium placeholder:text-slate-300 resize-none"
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                />
              </div>
            </div>

            {/* Tone Selection */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-1">
                03. Narrative Tone
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {TONES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTone(t.id)}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 text-center group ${
                      tone === t.id
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-slate-50 bg-slate-50/50 hover:border-slate-200"
                    }`}
                  >
                    <t.icon
                      size={18}
                      className={
                        tone === t.id ? "text-indigo-500" : "text-slate-400"
                      }
                    />
                    <span
                      className={`text-xs font-bold ${tone === t.id ? "text-indigo-700" : "text-slate-500"}`}
                    >
                      {t.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <Button
              className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-xl shadow-indigo-500/20 gap-3 group"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin" /> Synthesizing Strategy...
                </>
              ) : (
                <>
                  Generate Cover Letter{" "}
                  <Sparkles
                    size={20}
                    className="group-hover:rotate-12 transition-transform"
                  />
                </>
              )}
            </Button>
          </Card>
        </div>

        {/* Right: Preview Panel */}
        <div className="xl:col-span-12 2xl:col-span-7 sticky top-10">
          <AnimatePresence mode="wait">
            {!letter && !isGenerating ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-[800px] rounded-4xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-10 bg-slate-50/30"
              >
                <div className="w-20 h-20 rounded-3xl bg-white shadow-xl flex items-center justify-center text-slate-300 mb-6">
                  <PenTool size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-400">
                  Ready to Draft
                </h3>
                <p className="text-slate-300 max-w-xs mt-2 italic">
                  Fill in the details on the left to start your AI-powered
                  career narrative.
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                {/* Actions Toolbar */}
                <Card className="p-4 rounded-3xl bg-white/80 backdrop-blur-xl border-white shadow-xl flex items-center justify-between">
                  <div className="flex items-center gap-2 pl-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {isTyping ? "Generating Output..." : "Ready for Export"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      className="h-10 rounded-xl gap-2 text-slate-600"
                      onClick={handleCopy}
                    >
                      <Copy size={16} />{" "}
                      <span className="hidden sm:inline">Copy</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-10 rounded-xl gap-2 border-slate-200 text-slate-600"
                      onClick={() => handleExport("docx")}
                    >
                      <Download size={16} />{" "}
                      <span className="hidden sm:inline">Word</span>
                    </Button>
                    <Button
                      className="h-10 rounded-xl gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                      onClick={() => handleExport("pdf")}
                    >
                      <Printer size={16} /> Export PDF
                    </Button>
                  </div>
                </Card>

                {/* Paper Mockup */}
                <Card className="rounded-4xl bg-white shadow-2xl border-white overflow-hidden relative min-h-[700px] group">
                  {/* Subtle Paper Texture Gradient */}
                  <div className="absolute inset-0 bg-linear-to-br from-slate-50/50 to-transparent pointer-events-none" />

                  <div className="p-16 md:p-24 space-y-12 relative z-10 font-[Inter, sans-serif]">
                    {/* Placeholder Header Area */}
                    <div className="space-y-2 border-b border-slate-100 pb-8 opacity-40">
                      <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
                      <div className="h-3 w-48 bg-slate-100 rounded animate-pulse shadow-sm" />
                    </div>

                    {/* Actual Content Area */}
                    <div className="text-slate-800 leading-[1.8] text-lg whitespace-pre-wrap max-w-2xl selection:bg-indigo-100 selection:text-indigo-900">
                      {displayText ||
                        (isGenerating && (
                          <div className="space-y-4">
                            <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
                            <div className="h-4 w-[90%] bg-slate-100 rounded animate-pulse delay-75" />
                            <div className="h-4 w-[95%] bg-slate-100 rounded animate-pulse delay-150" />
                            <div className="h-4 w-[85%] bg-slate-100 rounded animate-pulse delay-300" />
                          </div>
                        ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
