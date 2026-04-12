"use client";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  Map as MapIcon,
  ChevronRight,
  Sparkles,
  RefreshCw,
  AlertCircle,
  LayoutGrid,
  Trees as TreeIcon,
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import {
  getRoadmapRoles,
  getSavedRoadmap,
  generateRoadmap,
  updateSkillStatus,
  Roadmap,
} from "@/lib/api";
import { toast } from "sonner";
import TechTree from "@/components/dashboard/TechTree";
import { motion } from "framer-motion";

export default function RoadmapPage() {
  const [data, setData] = useState<Roadmap | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"tree" | "list">("tree");

  useEffect(() => {
    async function init() {
      try {
        const rolesList = await getRoadmapRoles();
        setRoles(rolesList || []);
        if (rolesList?.length > 0) {
          setSelectedRole(rolesList[0]);
        }

        const saved = await getSavedRoadmap();
        if (saved) {
          setData(saved);
          setSelectedRole(saved.target_role);
        }
      } catch (err) {
        console.error("Init failed:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const handleGenerate = async (roleToGen?: string) => {
    const role = roleToGen || selectedRole;
    if (!role) return;

    setGenerating(true);
    setError(null);
    try {
      const session = await getSession();
      const username = session?.user?.user_metadata?.github_username || "guest";
      const roadmap = await generateRoadmap(role, username);
      setData(roadmap);
      toast.success("New roadmap generated successfully!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("No resume found")) {
        setError(
          "No resume found. Please upload your resume in the Resume Analysis section first.",
        );
      } else {
        setError("Failed to generate roadmap. Please try again later.");
      }
    } finally {
      setGenerating(false);
    }
  };

  const toggleSkill = async (skillName: string) => {
    if (!data) return;

    const isCurrentlyCompleted =
      data.skills.find((s) => s.name === skillName)?.status === "completed";

    // Optimistic update
    const updatedSkills = data.skills.map((s) => {
      if (s.name === skillName) {
        return {
          ...s,
          status: (isCurrentlyCompleted ? "to_learn" : "completed") as
            | "completed"
            | "in_progress"
            | "to_learn",
        };
      }
      return s;
    });

    const completedSkillNames = updatedSkills
      .filter((s) => s.status === "completed")
      .map((s) => s.name);

    try {
      const updatedData = await updateSkillStatus(
        data.target_role,
        completedSkillNames,
      );
      setData(updatedData);
      toast.success(
        isCurrentlyCompleted
          ? "Skill marked as uncompleted"
          : "Skill completed! Keep going!",
      );
    } catch {
      toast.error("Failed to update skill status");
    }
  };

  if (loading)
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#7C9ADD]/20 border-t-[#7C9ADD] rounded-full animate-spin" />
          <p className="text-[#718096] font-medium animate-pulse">
            Loading your career path...
          </p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="p-12 text-center space-y-6 max-w-2xl mx-auto">
        <div className="bg-red-50 p-6 rounded-3xl border border-red-100 flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500">
            <AlertCircle size={32} />
          </div>
          <p className="text-red-600 font-semibold text-lg">{error}</p>
          {error.includes("No resume found") ? (
            <a
              href="/dashboard/resume-analysis"
              className="bg-red-500 text-white px-6 py-3 rounded-2xl font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
            >
              Upload Resume Now
            </a>
          ) : (
            <button
              onClick={() => handleGenerate()}
              className="bg-red-500 text-white px-6 py-3 rounded-2xl font-bold"
            >
              Retry Generation
            </button>
          )}
        </div>
      </div>
    );

  if (!data && !generating)
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-8 bg-white/50 rounded-[40px] border-2 border-dashed border-[#E2E8F0] p-12">
        <div className="w-20 h-20 bg-[#F0F4FF] rounded-full flex items-center justify-center text-[#7C9ADD]">
          <MapIcon size={40} />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-[#2D3748]">
            No roadmap generated yet
          </h2>
          <p className="text-[#718096] max-w-md mx-auto">
            Choose a target role to generate a personalized career path based on
            your skills and gaps.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-lg">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full bg-white border-2 border-[#7C9ADD]/20 rounded-2xl px-5 py-4 text-lg font-bold text-[#2D3748] outline-hidden focus:ring-4 focus:ring-[#7C9ADD]/10 transition-all"
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <button
            onClick={() => handleGenerate()}
            disabled={!selectedRole || generating}
            className="w-full sm:w-auto whitespace-nowrap bg-[#7C9ADD] text-white px-10 py-4 rounded-2xl font-black shadow-lg shadow-[#7C9ADD]/30 hover:scale-105 active:scale-95 transition-all text-lg flex items-center justify-center gap-2"
          >
            <Sparkles size={24} />
            Generate Roadmap
          </button>
        </div>
      </div>
    );

  return (
    <div className="animate-fade-up w-full mx-auto space-y-10 pb-20">
      {/* Header & Selection */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
        <div className="space-y-4 flex-1">
          <div className="flex items-center gap-2 text-[#7C9ADD] font-bold text-sm uppercase tracking-widest">
            <MapIcon size={16} />
            AI Career Navigator
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-bold text-[#2D3748] font-display capitalize">
              {data?.target_role || selectedRole} Roadmap
            </h1>
            <p className="text-[#718096] text-lg">
              Dynamic path derived from your professional profile
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
            <div className="relative w-full sm:w-72">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                disabled={generating}
                className="w-full bg-white border-2 border-[#E2E8F0] hover:border-[#7C9ADD] focus:border-[#7C9ADD] rounded-2xl px-5 py-3 text-sm font-semibold text-[#2D3748] outline-hidden transition-all appearance-none cursor-pointer shadow-sm disabled:opacity-50"
              >
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#A0AEC0]">
                <ChevronRight size={18} className="rotate-90" />
              </div>
            </div>
            <button
              onClick={() => handleGenerate()}
              disabled={generating}
              className="flex items-center gap-2 bg-white border-2 border-[#EDF2F7] hover:border-[#7C9ADD] px-5 py-3 rounded-2xl text-sm font-bold text-[#4A5568] transition-all hover:shadow-md active:scale-95 disabled:opacity-50"
            >
              <RefreshCw
                size={18}
                className={generating ? "animate-spin text-[#7C9ADD]" : ""}
              />
              {generating ? "Refining..." : data ? "Regenerate" : "Generate"}
            </button>

            {data && (
              <div className="flex items-center gap-1 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200 ml-2">
                <button
                  onClick={() => setViewMode("tree")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    viewMode === "tree"
                      ? "bg-white text-indigo-500 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <TreeIcon size={14} />
                  Mastery Tree
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    viewMode === "list"
                      ? "bg-white text-indigo-500 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <LayoutGrid size={14} />
                  Detailed List
                </button>
              </div>
            )}
          </div>
        </div>

        {data && (
          <div className="glass-card p-6 rounded-[32px] flex items-center gap-6 border border-white/60 shadow-xl bg-white/40">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="transparent"
                  className="text-slate-100"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="transparent"
                  className="text-[#7C9ADD]"
                  strokeDasharray={226}
                  strokeDashoffset={226 - (226 * data.overall_progress) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-sm font-black text-[#2D3748]">
                {Math.round(data.overall_progress)}%
              </span>
            </div>
            <div>
              <div className="text-sm font-bold text-[#2D3748]">
                Career Readiness
              </div>
              <div className="text-xs text-[#718096] mt-1 font-medium italic">
                Confidence: {data.current_level}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="relative">
        {generating && (
          <div className="absolute inset-x-0 -top-4 z-50 flex justify-center">
            <div className="bg-white px-6 py-2 rounded-full shadow-lg border border-[#7C9ADD]/20 flex items-center gap-3">
              <RefreshCw size={16} className="animate-spin text-[#7C9ADD]" />
              <span className="text-sm font-bold text-[#7C9ADD] animate-pulse">
                AI is re-calculating your professional trajectory...
              </span>
            </div>
          </div>
        )}

        <div
          className={`space-y-10 transition-all ${generating ? "opacity-30 blur-[2px] pointer-events-none" : "opacity-100"}`}
        >
          {data && (
            <>
              {/* AI Next Step */}
              <div className="bg-linear-to-r from-[#EBF1FF] to-[#F5F8FF] border border-[#7C9ADD]/20 rounded-[32px] p-8 flex items-start gap-6 shadow-xs relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Sparkles size={80} />
                </div>
                <div className="p-3 bg-[#7C9ADD] rounded-2xl text-white shadow-lg shadow-[#7C9ADD]/30 relative">
                  <Sparkles size={24} />
                </div>
                <div className="space-y-1 relative">
                  <div className="text-sm font-bold text-[#2D3748] uppercase tracking-wider opacity-60">
                    AI Strategist Recommendation
                  </div>
                  <div className="text-lg font-semibold text-[#4A5568] leading-relaxed">
                    {data.next_step}
                  </div>
                </div>
              </div>

              {/* Roadmap Content */}
              {viewMode === "tree" ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
                  <TechTree skills={data.skills} onToggle={toggleSkill} />
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-[23px] top-6 bottom-6 w-1 bg-linear-to-b from-[#7C9ADD] via-[#CBD5E0] to-transparent hidden md:block opacity-30" />

                  <div className="space-y-12 relative z-10">
                    {data.skills.map((skill, index) => (
                      <div
                        key={index}
                        className="flex flex-col md:flex-row gap-8 group transition-all"
                      >
                        <div className="hidden md:flex flex-col items-center">
                          <button
                            onClick={() => toggleSkill(skill.name)}
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center border-4 transition-all shadow-md group-hover:scale-110 active:scale-90 ${
                              skill.status === "completed"
                                ? "bg-emerald-500 border-white text-white"
                                : "bg-white border-[#EDF2F7] text-[#CBD5E0]"
                            }`}
                          >
                            {skill.status === "completed" ? (
                              <CheckCircle2 size={24} />
                            ) : (
                              <Circle size={24} />
                            )}
                          </button>
                        </div>

                        <div className="flex-1">
                          <Card
                            className={`p-8 rounded-[32px] border transition-all hover:shadow-xl ${
                              skill.status === "completed"
                                ? "bg-emerald-50/20 border-emerald-100"
                                : "bg-white border-white/80 shadow-glass"
                            }`}
                          >
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                              <div className="space-y-4 flex-1">
                                <div className="flex flex-wrap items-center gap-3">
                                  <h3 className="text-2xl font-bold text-[#2D3748] font-display">
                                    {skill.name}
                                  </h3>
                                  <span
                                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                      skill.priority === "high"
                                        ? "bg-red-100 text-red-500"
                                        : skill.priority === "medium"
                                          ? "bg-amber-100 text-amber-500"
                                          : "bg-blue-100 text-blue-500"
                                    }`}
                                  >
                                    {skill.priority} Priority
                                  </span>
                                  {skill.status === "completed" && (
                                    <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                      Mastered
                                    </span>
                                  )}
                                </div>

                                <div className="flex flex-wrap gap-6 text-sm text-[#718096] font-medium">
                                  <div className="flex items-center gap-2">
                                    <Clock size={16} />
                                    {skill.estimated_time}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Sparkles size={16} />
                                    {skill.difficulty} difficulty
                                  </div>
                                </div>

                                <div className="space-y-3 pt-4 border-t border-[#EDF2F7]">
                                  <div className="text-xs font-bold text-[#A0AEC0] uppercase tracking-widest">
                                    Expert-Curated Resources
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {skill.resources.map((res, ridx) => (
                                      <a
                                        key={ridx}
                                        href={res.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#7C9ADD] hover:shadow-lg hover:shadow-[#7C9ADD]/10 transition-all group/res"
                                      >
                                        <div className="w-10 h-10 rounded-xl bg-[#F7FAFC] flex items-center justify-center text-[#7C9ADD] group-hover/res:bg-[#7C9ADD] group-hover/res:text-white transition-colors">
                                          {res.type === "video" ? (
                                            <Sparkles size={18} />
                                          ) : res.type === "course" ? (
                                            <MapIcon size={18} />
                                          ) : (
                                            <ChevronRight size={18} />
                                          )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="text-sm font-bold text-[#2D3748] truncate">
                                            {res.title}
                                          </div>
                                          <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] text-[#A0AEC0] font-bold uppercase">
                                              {res.type}
                                            </span>
                                            {res.is_free && (
                                              <span className="text-[10px] text-emerald-500 font-bold uppercase">
                                                FREE
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              <button
                                onClick={() => toggleSkill(skill.name)}
                                className={`md:hidden px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                                  skill.status === "completed"
                                    ? "bg-emerald-100 text-emerald-600"
                                    : "bg-[#7C9ADD] text-white"
                                }`}
                              >
                                {skill.status === "completed" ? (
                                  <>
                                    <CheckCircle2 size={18} />
                                    Mastered
                                  </>
                                ) : (
                                  <>
                                    <Circle size={18} />
                                    Mark Complete
                                  </>
                                )}
                              </button>
                            </div>
                          </Card>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Future Opportunities Section */}
              <div className="pt-10">
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-[#2D3748] font-display flex items-center gap-3">
                    <Sparkles className="text-[#7C9ADD]" />
                    Extended Career Trait Paths
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.future_opportunities.map((opp, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-4 p-6 rounded-[24px] bg-white border-2 border-white shadow-sm hover:shadow-md transition-all group cursor-default"
                      >
                        <div className="w-3 h-3 rounded-full bg-[#7C9ADD] group-hover:scale-150 transition-transform" />
                        <span className="text-[#4A5568] font-bold text-lg">
                          {opp}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
