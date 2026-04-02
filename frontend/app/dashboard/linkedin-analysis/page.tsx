"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Zap,
  ShieldCheck,
  Trophy,
  Copy,
  ChevronRight,
} from "lucide-react";
import LinkedinUploader from "@/components/LinkedinUploader";
import MatchGauge from "@/components/MatchGauge";
import { LinkedInAnalysis } from "@/lib/api";
import { toast } from "sonner";

export default function LinkedinAnalysisPage() {
  const [analysis, setAnalysis] = useState<LinkedInAnalysis | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <div className="animate-fade-up space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0A66C2]/10 text-[#0A66C2] text-[10px] font-black uppercase tracking-[0.2em] border border-[#0A66C2]/20">
            <Sparkles size={14} />
            Professional Optimization
          </div>
          <h1 className="font-display font-black text-5xl text-[#1E293B] tracking-tight">
            LinkedIn <span className="text-[#0A66C2]">Intelligence</span>
          </h1>
          <p className="max-w-2xl text-lg font-medium text-[#64748B] leading-relaxed">
            Unleash the full potential of your professional brand. Upload your
            LinkedIn profile PDF for an AI-powered deep dive into your
            profile&apos;s impact.
          </p>
        </div>
      </div>

      {!analysis ? (
        <div className="max-w-4xl">
          <LinkedinUploader onResult={(res) => setAnalysis(res)} />

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Headline ROI",
                desc: "Does your headline stop the scroll? We optimize for both recruiters and algorithms.",
                color: "bg-amber-50 text-amber-600",
              },
              {
                icon: ShieldCheck,
                title: "Section Integrity",
                desc: "Verifying section completeness and professional depth across your entire profile.",
                color: "bg-emerald-50 text-emerald-600",
              },
              {
                icon: Trophy,
                title: "Impact Analysis",
                desc: "Transforming passive job descriptions into active, result-driven narratives.",
                color: "bg-blue-50 text-blue-600",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="p-8 rounded-[32px] bg-white shadow-premium border border-slate-100 hover:border-blue-100 transition-all hover:shadow-premium-hover group"
              >
                <div
                  className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm`}
                >
                  <feature.icon size={24} />
                </div>
                <h3 className="font-display font-bold text-lg text-[#1E293B] mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm font-medium text-[#64748B] leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 xl:grid-cols-12 gap-8"
        >
          {/* Main Content Area */}
          <div className="xl:col-span-8 space-y-8">
            {/* Overall Score Banner */}
            <div className="relative overflow-hidden p-10 rounded-[48px] bg-white border border-slate-100 shadow-premium flex flex-col md:flex-row items-center gap-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#0A66C2]/10 rounded-full -mr-32 -mt-32 blur-[80px]" />

              <div className="relative z-10">
                <MatchGauge
                  score={analysis.overall_score}
                  label="Profile Score"
                  size={240}
                />
              </div>

              <div className="flex-1 space-y-6 relative z-10">
                <div className="flex flex-wrap gap-3">
                  <div className="px-4 py-2 rounded-2xl bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <CheckCircle2 size={14} /> Profile Completeness:{" "}
                    {analysis.completeness_score}%
                  </div>
                </div>
                <div className="space-y-4">
                  <h2 className="font-display font-black text-3xl text-[#1E293B]">
                    Professional Outlook
                  </h2>
                  <p className="text-[#64748B] font-medium leading-relaxed">
                    Based on your analysis, your profile is exceptionally strong
                    in technical depth but could benefit from more specific,
                    metric-driven achievements in your Experience section.
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap gap-4">
                  <button
                    onClick={() => setAnalysis(null)}
                    className="px-6 py-3 rounded-2xl border-2 border-slate-100 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all flex items-center gap-2"
                  >
                    Analyze New Profile
                  </button>
                </div>
              </div>
            </div>

            {/* Headline Section */}
            <div className="p-10 rounded-[48px] bg-white border border-slate-100 shadow-premium space-y-10">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="font-display font-black text-2xl text-[#1E293B]">
                    Headline Optimization
                  </h2>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A0AEC0]">
                    SEO & Value Proposition
                  </p>
                </div>
                <div
                  className={`font-display font-black text-4xl ${getScoreColor(analysis.headline.score)}`}
                >
                  {analysis.headline.score}
                  <span className="text-lg opacity-40 italic">/100</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#64748B] flex items-center gap-2">
                    CURRENT VERSION
                  </span>
                  <div className="p-6 rounded-[32px] bg-slate-50 border border-slate-100 italic text-slate-600 text-sm font-medium leading-relaxed">
                    &quot;{analysis.headline.current}&quot;
                  </div>
                </div>

                <div className="space-y-4 relative">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#0A66C2] flex items-center gap-2">
                    <Sparkles size={14} /> AI IMPROVED VERSION
                  </span>
                  <div className="group relative p-6 rounded-[32px] bg-blue-50/50 border border-blue-100 text-[#0A66C2] text-sm font-black leading-relaxed shadow-sm">
                    &quot;{analysis.headline.improved}&quot;
                    <button
                      onClick={() =>
                        copyToClipboard(analysis.headline.improved || "")
                      }
                      className="absolute bottom-4 right-4 p-3 rounded-xl bg-white shadow-md text-[#0A66C2] hover:scale-110 transition-transform active:scale-95"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                {analysis.headline.tips.map((tip, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white border border-slate-100 text-xs font-bold text-[#64748B] shadow-xs"
                  >
                    <ChevronRight size={14} className="text-[#0A66C2]" />
                    {tip}
                  </div>
                ))}
              </div>
            </div>

            {/* About Section */}
            <div className="p-10 rounded-[48px] bg-white border border-slate-100 shadow-premium space-y-8">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="font-display font-black text-2xl text-[#1E293B]">
                    Executive Summary (About)
                  </h2>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A0AEC0]">
                    Storytelling & Narratives
                  </p>
                </div>
                <div
                  className={`font-display font-black text-4xl ${getScoreColor(analysis.about.score)}`}
                >
                  {analysis.about.score}
                  <span className="text-lg opacity-40 italic">/100</span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#0A66C2] flex items-center gap-2">
                    <Sparkles size={14} /> OPTIMIZED BIO PREVIEW
                  </span>
                  <div className="p-8 rounded-[40px] bg-slate-50 border border-slate-100 text-[#1E293B] text-sm font-medium leading-[1.8] relative group">
                    <div className="line-clamp-6">
                      {analysis.about.improved}
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-slate-50 to-transparent flex items-end justify-center pb-6">
                      <button
                        onClick={() =>
                          copyToClipboard(analysis.about.improved || "")
                        }
                        className="px-6 py-2.5 rounded-xl bg-white shadow-lg text-[#0A66C2] text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform flex items-center gap-2"
                      >
                        <Copy size={14} /> Copy Full BIO
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {analysis.about.tips.map((tip, i) => (
                    <div
                      key={i}
                      className="flex gap-4 p-5 rounded-[24px] bg-white border border-slate-100"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0A66C2] flex items-center justify-center shrink-0">
                        <Zap size={14} />
                      </div>
                      <p className="text-xs font-bold text-[#64748B] leading-relaxed">
                        {tip}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="xl:col-span-4 space-y-8">
            {/* Suggested Roles */}
            <div className="p-8 rounded-[40px] bg-linear-to-br from-indigo-900 to-slate-900 shadow-premium relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[#0A66C2]/10 opacity-50" />
              <div className="relative z-10 space-y-6">
                <h3 className="font-display font-black text-xl text-white">
                  Target Market
                </h3>
                <div className="space-y-3">
                  {analysis.suggested_roles.map((role, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 rounded-2xl bg-white/10 border border-white/10 hover:bg-white/20 transition-all cursor-default"
                    >
                      <span className="text-sm font-bold text-blue-100">
                        {role}
                      </span>
                      <ArrowRight size={14} className="text-blue-300" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Keyword Intelligence */}
            <div className="p-8 rounded-[40px] bg-white border border-slate-100 shadow-premium space-y-8">
              <h3 className="font-display font-black text-xl text-[#1E293B]">
                Keyword Gap
              </h3>
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#F59E0B] mb-4">
                    CRITICAL MISSING TERMS
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      ...new Set([
                        ...analysis.headline.missing_keywords,
                        ...analysis.about.missing_keywords,
                      ]),
                    ].map((word, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest border border-amber-100"
                      >
                        + {word}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                  <h4 className="text-xs font-bold text-[#1E293B] mb-2 flex items-center gap-2">
                    <AlertCircle size={14} className="text-amber-500" />{" "}
                    Improvement Strategy
                  </h4>
                  <p className="text-[11px] font-medium text-[#64748B] leading-relaxed">
                    Integration of these terms into your Headline and Skills
                    section will increase your recruiter search visibility by an
                    estimated 40%.
                  </p>
                </div>
              </div>
            </div>

            {/* General tips list */}
            <div className="p-8 rounded-[40px] bg-white border border-slate-100 shadow-premium">
              <h3 className="font-display font-black text-xl text-[#1E293B] mb-6">
                Action Plan
              </h3>
              <div className="space-y-6">
                {analysis.general_tips.slice(0, 4).map((tip, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 font-display font-black text-[10px]">
                      {i + 1}
                    </div>
                    <p className="text-xs font-bold text-[#64748B] leading-relaxed mt-0.5">
                      {tip}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
