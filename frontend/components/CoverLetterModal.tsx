"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  X,
  Sparkles,
  Download,
  FileText,
  Copy,
  Check,
  ChevronRight,
  Settings2,
} from "lucide-react";
import { generateCoverLetter, downloadCoverLetter } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  resumeId: string;
  jdText: string;
  initialRole?: string;
}

export default function CoverLetterModal({
  isOpen,
  onClose,
  resumeId,
  jdText,
  initialRole,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [letterId, setLetterId] = useState("");
  const [tone, setTone] = useState("Professional");
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    try {
      const data = await generateCoverLetter(
        resumeId,
        jdText,
        initialRole,
        tone,
      );
      setContent(data.content);
      setLetterId(data.id);
      toast.success("Cover letter generated!");
    } catch (err: any) {
      toast.error(err.message || "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDownload(format: "pdf" | "docx") {
    try {
      await downloadCoverLetter(letterId, format);
      toast.success(`Exporting as ${format.toUpperCase()}...`);
    } catch (err: any) {
      toast.error(err.message || "Download failed");
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl bg-white rounded-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[85vh]"
      >
        {/* Left: Controls */}
        <div className="w-full md:w-80 bg-slate-50 p-8 border-r border-slate-100 flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 rounded-xl bg-[#7C9ADD]/10 text-[#7C9ADD]">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="font-display font-black text-lg text-[#1E293B]">
                AI Writer
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Cover Letter Alpha
              </p>
            </div>
          </div>

          <div className="space-y-6 flex-1">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Settings2 size={12} />
                Style & Tone
              </label>
              {["Professional", "Creative", "Concise", "Enthusiastic"].map(
                (t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={`w-full px-4 py-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C9ADD]/50 ${
                      tone === t
                        ? "bg-white border-[#7C9ADD] text-[#7C9ADD] shadow-sm scale-[1.02]"
                        : "bg-transparent border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    {t}
                    {tone === t && <Check size={14} />}
                  </button>
                ),
              )}
            </div>

            <div className="p-4 rounded-2xl bg-[#7C9ADD]/5 border border-[#7C9ADD]/10">
              <p className="text-[10px] leading-relaxed text-[#7C9ADD] font-medium">
                Our AI analyzes your resume against the JD to highlight specific
                synergies and cultural fit.
              </p>
            </div>
          </div>

          <Button
            className="w-full h-14 rounded-2xl bg-linear-to-r from-[#7C9ADD] to-[#6366F1] text-white font-black text-[11px] uppercase tracking-widest shadow-lg shadow-[#7C9ADD]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
            onClick={handleGenerate}
            disabled={loading || !resumeId}
          >
            {loading ? "Crafting..." : "Generate Draft"}
            <ChevronRight size={16} className="ml-2" />
          </Button>
        </div>

        {/* Right: Preview */}
        <div className="flex-1 flex flex-col relative bg-white">
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute right-6 top-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <X size={20} />
          </button>

          <div className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar">
            {content ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-2xl mx-auto space-y-6"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2 text-[10px] font-black text-[#A0AEC0] uppercase tracking-widest">
                    <FileText size={14} />
                    Document Preview
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      aria-label="Copy to Clipboard"
                      className="p-2 text-slate-400 hover:text-[#7C9ADD] hover:bg-[#7C9ADD]/5 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C9ADD]/50"
                      title="Copy to Clipboard"
                    >
                      {copied ? (
                        <Check size={18} className="text-emerald-500" />
                      ) : (
                        <Copy size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="font-body text-sm leading-[1.8] text-[#334155] whitespace-pre-wrap selection:bg-[#7C9ADD]/20">
                  {content}
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-200">
                  <FileText size={40} />
                </div>
                <div className="space-y-2">
                  <h3 className="font-display font-bold text-xl text-[#1E293B]">
                    No document generated
                  </h3>
                  <p className="text-sm text-slate-400 max-w-[240px]">
                    Configure your tone and hit generate to craft a tailored
                    cover letter.
                  </p>
                </div>
              </div>
            )}
          </div>

          {content && (
            <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => handleDownload("docx")}
                className="rounded-xl border border-slate-200 bg-white text-slate-600 text-[10px] font-black uppercase tracking-widest hover:border-[#7C9ADD] hover:text-[#7C9ADD] transition-all h-11 px-6"
              >
                <Download size={14} className="mr-2" />
                Word (.docx)
              </Button>
              <Button
                onClick={() => handleDownload("pdf")}
                className="rounded-xl bg-[#1E293B] text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-md h-11 px-6"
              >
                <Download size={14} className="mr-2" />
                PDF Export
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
