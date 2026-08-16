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
  const [activeHeadlineTab, setActiveHeadlineTab] = useState<
    "seo" | "impact" | "evangelist"
  >("seo");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-amber-500";
    return "text-red-500";
  };

  const getHeadlineForTab = () => {
    if (!analysis?.headline_variations)
      return analysis?.headline.improved || "";
    switch (activeHeadlineTab) {
      case "seo":
        return analysis.headline_variations.seo_specialist;
      case "impact":
        return analysis.headline_variations.impact_leader;
      case "evangelist":
        return analysis.headline_variations.tech_evangelist;
    }
  };

  return (
    <div className="animate-fade-up space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-blue/10 text-brand-blue text-[10px] font-black uppercase tracking-[0.2em] border border-brand-blue/20">
            <Sparkles size={14} />
            Professional Optimization
          </div>
          <h1 className="font-display font-black text-5xl text-foreground tracking-tight">
            LinkedIn <span className="text-brand-blue">Intelligence</span>
          </h1>
          <p className="max-w-2xl text-lg font-medium text-muted-foreground leading-relaxed">
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
                color:
                  "bg-amber-500/10 text-amber-400 border border-amber-500/20",
              },
              {
                icon: ShieldCheck,
                title: "Section Integrity",
                desc: "Verifying section completeness and professional depth across your entire profile.",
                color:
                  "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
              },
              {
                icon: Trophy,
                title: "Impact Analysis",
                desc: "Transforming passive job descriptions into active, result-driven narratives.",
                color: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="p-8 rounded-[32px] bg-slate-900/40 border border-white/5 backdrop-blur-md hover:border-blue-500/20 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] transition-all duration-300 group"
              >
                <div
                  className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6 transition-transform shadow-sm border`}
                >
                  <feature.icon size={24} />
                </div>
                <h3 className="font-display font-bold text-lg text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm font-medium text-slate-400 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-slate-950/80 p-8 md:p-12 rounded-[40px] border border-white/5 backdrop-blur-xl relative overflow-hidden text-slate-100 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
          {/* Decorative backdrop glow spots */}
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10"
          >
            {/* Main Content Area (Left Column on Desktop) */}
            <div className="lg:col-span-8 space-y-8">
              {/* Overall Score Header Banner */}
              <div className="relative overflow-hidden p-8 md:p-10 rounded-[32px] bg-slate-900/60 border border-white/10 backdrop-blur-md flex flex-col md:flex-row items-center gap-8 shadow-2xl hover:border-blue-500/20 transition-all duration-300">
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full -mr-24 -mt-24 blur-[60px]" />

                <div className="relative z-10 shrink-0">
                  <MatchGauge
                    score={analysis.overall_score}
                    label="Profile Score"
                    size={200}
                  />
                </div>

                <div className="flex-1 space-y-4 relative z-10 text-center md:text-left">
                  <div className="flex flex-wrap justify-center md:justify-start gap-2.5">
                    <span className="px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                      <CheckCircle2 size={12} /> Completeness:{" "}
                      {analysis.completeness_score}%
                    </span>
                  </div>
                  <h2 className="font-display font-black text-2xl md:text-3xl text-white">
                    LinkedIn Brand Health
                  </h2>
                  <p className="text-slate-400 text-sm font-medium leading-relaxed">
                    Based on your profile audit, your skills section is well
                    aligned, but adding quantified impact metrics and resolving
                    the checklist gaps will significantly boost your recruiter
                    visibility.
                  </p>
                  <div>
                    <button
                      onClick={() => setAnalysis(null)}
                      className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 transition-all"
                    >
                      Analyze Another Profile
                    </button>
                  </div>
                </div>
              </div>

              {/* Headline Optimization Playbook */}
              <div className="p-8 md:p-10 rounded-[32px] bg-slate-900/60 border border-white/10 backdrop-blur-md space-y-6 hover:border-blue-500/20 transition-all duration-300">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <h3 className="font-display font-black text-xl text-white flex items-center gap-2">
                      <Sparkles
                        size={18}
                        className="text-blue-400 animate-pulse"
                      />
                      Headline A/B Playbook
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      Select a structured model tailored to your target
                      application style
                    </p>
                  </div>
                  <div className="font-display font-black text-3xl text-blue-400">
                    {analysis.headline.score}
                    <span className="text-xs opacity-50 font-normal">/100</span>
                  </div>
                </div>

                <div className="flex bg-white/5 p-1 rounded-xl gap-1 w-full sm:w-auto overflow-x-auto">
                  {[
                    { id: "seo", label: "SEO Specialist" },
                    { id: "impact", label: "Impact Leader" },
                    { id: "evangelist", label: "Tech Evangelist" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveHeadlineTab(tab.id as any)}
                      className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                        activeHeadlineTab === tab.id
                          ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                          : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      CURRENT LINKEDIN VERSION
                    </span>
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/5 text-slate-400 italic text-xs leading-relaxed min-h-[90px] flex items-center">
                      &quot;{analysis.headline.current}&quot;
                    </div>
                  </div>

                  <div className="space-y-2.5 relative">
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                      <Sparkles size={12} /> AI RECOMMENDED COPY
                    </span>
                    <div className="group relative p-5 rounded-2xl bg-blue-950/30 border border-blue-500/20 text-blue-200 text-xs font-bold leading-relaxed min-h-[90px] flex items-center pr-14 shadow-inner">
                      &quot;{getHeadlineForTab()}&quot;
                      <button
                        onClick={() => copyToClipboard(getHeadlineForTab())}
                        className="absolute right-4 p-2.5 rounded-xl bg-white/5 border border-white/10 text-blue-400 hover:text-blue-300 hover:bg-white/10 transition-all active:scale-95 shadow-sm"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2.5 pt-4 border-t border-white/5">
                  {analysis.headline.tips.map((tip, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/5 text-xs text-slate-400 font-medium"
                    >
                      <ChevronRight
                        size={14}
                        className="text-blue-400 shrink-0"
                      />
                      {tip}
                    </div>
                  ))}
                </div>
              </div>

              {/* Executive Summary (About) */}
              <div className="p-8 md:p-10 rounded-[32px] bg-slate-900/60 border border-white/10 backdrop-blur-md space-y-6 hover:border-blue-500/20 transition-all duration-300">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <h3 className="font-display font-black text-xl text-white">
                      Executive Biography
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      Storytelling optimization & technical summaries
                    </p>
                  </div>
                  <div className="font-display font-black text-3xl text-purple-400">
                    {analysis.about.score}
                    <span className="text-xs opacity-50 font-normal">/100</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                    <Sparkles size={12} /> HIGH-CONVERTING BIO TEMPLATE
                  </span>
                  <div className="p-6 rounded-2xl bg-purple-950/10 border border-purple-500/15 text-slate-300 text-xs leading-relaxed font-medium relative group shadow-inner">
                    <div className="line-clamp-6 leading-[1.8]">
                      {analysis.about.improved}
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-900/90 to-transparent flex items-end justify-center pb-4">
                      <button
                        onClick={() =>
                          copyToClipboard(analysis.about.improved || "")
                        }
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg shadow-purple-600/20"
                      >
                        <Copy size={12} /> Copy Bio Copy
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {analysis.about.tips.map((tip, i) => (
                    <div
                      key={i}
                      className="flex gap-3 p-4 rounded-xl bg-white/5 border border-white/5 items-start"
                    >
                      <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                        <Zap size={14} />
                      </div>
                      <p className="text-xs font-medium text-slate-400 leading-relaxed mt-0.5">
                        {tip}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Google XYZ Accomplishment Scanner */}
              {analysis.xyz_bullet_audits &&
                analysis.xyz_bullet_audits.length > 0 && (
                  <div className="p-8 md:p-10 rounded-[32px] bg-slate-900/60 border border-white/10 backdrop-blur-md space-y-6 hover:border-blue-500/20 transition-all duration-300">
                    <div className="space-y-1">
                      <h3 className="font-display font-black text-xl text-white">
                        Google XYZ Achievement Scanner
                      </h3>
                      <p className="text-xs text-slate-400 font-medium">
                        Inject metric-driven outcomes instead of list of tasks
                      </p>
                    </div>

                    <div className="space-y-4">
                      {analysis.xyz_bullet_audits.map((audit, i) => (
                        <div
                          key={i}
                          className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-4"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 mb-1.5 block">
                                RESPONSIBILITY-ONLY BULLET
                              </span>
                              <p className="text-xs font-medium text-slate-400 italic leading-relaxed">
                                &quot;{audit.weak_bullet}&quot;
                              </p>
                            </div>
                            <div>
                              <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400 mb-1.5 block flex items-center gap-1">
                                <Sparkles size={10} /> GOOGLE XYZ FORMULA BULLET
                              </span>
                              <p className="text-xs font-bold text-white leading-relaxed">
                                {audit.xyz_rewritten}
                              </p>
                            </div>
                          </div>
                          <div className="pt-2.5 border-t border-white/5 flex items-start gap-2 text-[11px] text-slate-400">
                            <AlertCircle
                              size={14}
                              className="text-amber-500 shrink-0 mt-0.5"
                            />
                            <span>
                              <strong>Formula Tip:</strong>{" "}
                              {audit.impact_metric_tip}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            {/* Sidebar Sticky Area (Right Column on Desktop) */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-8">
              {/* Recruiter Completeness Checklist */}
              {analysis.recruiter_checklist &&
                analysis.recruiter_checklist.length > 0 && (
                  <div className="p-6 md:p-8 rounded-[32px] bg-slate-900/60 border border-white/10 backdrop-blur-md space-y-5 hover:border-blue-500/20 transition-all duration-300">
                    <h3 className="font-display font-black text-lg text-white">
                      Recruiter Audit
                    </h3>
                    <div className="space-y-4">
                      {analysis.recruiter_checklist.map((item, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="mt-0.5 shrink-0">
                            {item.completed ? (
                              <div className="w-5 h-5 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                                <CheckCircle2 size={12} />
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                                <AlertCircle size={12} />
                              </div>
                            )}
                          </div>
                          <div className="space-y-0.5">
                            <p
                              className={`text-xs font-bold ${item.completed ? "text-slate-200" : "text-slate-400"}`}
                            >
                              {item.label}
                            </p>
                            <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                              {item.tip}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Keyword Density Index */}
              {analysis.keyword_density &&
                analysis.keyword_density.length > 0 && (
                  <div className="p-6 md:p-8 rounded-[32px] bg-slate-900/60 border border-white/10 backdrop-blur-md space-y-5 hover:border-blue-500/20 transition-all duration-300">
                    <h3 className="font-display font-black text-lg text-white">
                      SEO Density Index
                    </h3>
                    <div className="space-y-3">
                      {analysis.keyword_density.map((item, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5"
                        >
                          <div>
                            <p className="text-xs font-bold text-slate-200">
                              {item.keyword}
                            </p>
                            <p className="text-[10px] text-slate-500 font-medium">
                              Matches: {item.current_count} / Target:{" "}
                              {item.recommended_count}
                            </p>
                          </div>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                              item.priority === "High"
                                ? "bg-red-500/10 text-red-400 border-red-500/20"
                                : item.priority === "Medium"
                                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                  : "bg-white/5 text-slate-400 border-white/5"
                            }`}
                          >
                            {item.priority}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Target Suggested Roles */}
              <div className="p-6 md:p-8 rounded-[32px] bg-gradient-to-br from-blue-950/40 to-slate-900/40 border border-white/10 backdrop-blur-md space-y-5 hover:border-blue-500/20 transition-all duration-300">
                <h3 className="font-display font-black text-lg text-white">
                  Market suggested roles
                </h3>
                <div className="space-y-2">
                  {analysis.suggested_roles.map((role, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5 transition-all text-xs font-bold text-slate-300"
                    >
                      <span>{role}</span>
                      <ArrowRight size={14} className="text-blue-400" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Plan */}
              <div className="p-6 md:p-8 rounded-[32px] bg-slate-900/60 border border-white/10 backdrop-blur-md space-y-5 hover:border-blue-500/20 transition-all duration-300">
                <h3 className="font-display font-black text-lg text-white">
                  Action Steps
                </h3>
                <div className="space-y-4">
                  {analysis.general_tips.slice(0, 4).map((tip, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-5 h-5 rounded-md bg-white/5 text-slate-400 flex items-center justify-center shrink-0 font-display font-black text-[10px] border border-white/5">
                        {i + 1}
                      </div>
                      <p className="text-xs font-medium text-slate-400 leading-relaxed mt-0.5">
                        {tip}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
