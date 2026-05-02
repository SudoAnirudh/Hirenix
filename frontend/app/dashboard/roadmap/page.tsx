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
  CareerRoadmap,
  RoadmapSkill,
} from "@/lib/api";
import { toast } from "sonner";
import VerticalRoadmap from "@/components/dashboard/VerticalRoadmap";
import { motion } from "framer-motion";

export default function RoadmapPage() {
  const [data, setData] = useState<CareerRoadmap | null>(null);
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

    // Helper to find skill and its status recursively
    const findSkill = (
      skills: RoadmapSkill[],
      name: string,
    ): RoadmapSkill | undefined => {
      for (const s of skills) {
        if (s.name === name) return s;
        if (s.children) {
          const found = findSkill(s.children, name);
          if (found) return found;
        }
      }
    };

    const target = findSkill(data.skills, skillName);
    if (!target) return;

    const isCurrentlyCompleted = target.status === "completed";
    const newStatus = isCurrentlyCompleted ? "to_learn" : "completed";

    // Recursive update helper
    const updateNestedStatus = (
      skills: RoadmapSkill[],
      name: string,
      status: any,
    ): RoadmapSkill[] => {
      return skills.map((s) => {
        if (s.name === name) return { ...s, status };
        if (s.children)
          return {
            ...s,
            children: updateNestedStatus(s.children, name, status),
          };
        return s;
      });
    };

    // Optimistic update
    const updatedSkills = updateNestedStatus(data.skills, skillName, newStatus);

    // Flatten all completed skills for the backend
    const getCompletedNames = (skills: RoadmapSkill[]): string[] => {
      let names: string[] = [];
      skills.forEach((s) => {
        if (s.status === "completed") names.push(s.name);
        if (s.children) names.push(...getCompletedNames(s.children));
      });
      return names;
    };

    const completedSkillNames = getCompletedNames(updatedSkills);

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
          <div className="w-12 h-12 border-4 border-brand-blue/20 border-t-[#7C9ADD] rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium animate-pulse">
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
              className="bg-red-500 text-card-foreground px-6 py-3 rounded-2xl font-bold transition-colors shadow-lg shadow-red-200"
            >
              Upload Resume Now
            </a>
          ) : (
            <button
              onClick={() => handleGenerate()}
              className="bg-red-500 text-card-foreground px-6 py-3 rounded-2xl font-bold"
            >
              Retry Generation
            </button>
          )}
        </div>
      </div>
    );

  if (!data && !generating)
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-8 bg-card/50 rounded-[40px] border-2 border-dashed border-border p-12">
        <div className="w-20 h-20 bg-[#F0F4FF] rounded-full flex items-center justify-center text-brand-blue">
          <MapIcon size={40} />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-foreground">
            No roadmap generated yet
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Choose a target role to generate a personalized career path based on
            your skills and gaps.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-lg">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full bg-card border-2 border-brand-blue/20 rounded-2xl px-5 py-4 text-lg font-bold text-foreground outline-hidden focus:ring-4 focus:ring-brand-blue/10 transition-all"
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
            className="w-full sm:w-auto whitespace-nowrap bg-brand-blue text-card-foreground px-10 py-4 rounded-2xl font-black shadow-lg shadow-brand-blue/30 active:scale-95 transition-all text-lg flex items-center justify-center gap-2"
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
          <div className="flex items-center gap-2 text-brand-blue font-bold text-sm uppercase tracking-widest">
            <MapIcon size={16} />
            AI Career Navigator
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-bold text-foreground font-display capitalize">
              {data?.target_role || selectedRole} Roadmap
            </h1>
            <p className="text-muted-foreground text-lg">
              Dynamic path derived from your professional profile
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
            <div className="relative w-full sm:w-72">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                disabled={generating}
                className="w-full bg-card border-2 border-border focus:border-brand-blue rounded-2xl px-5 py-3 text-sm font-semibold text-foreground outline-hidden transition-all appearance-none cursor-pointer shadow-sm disabled:opacity-50"
              >
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                <ChevronRight size={18} className="rotate-90" />
              </div>
            </div>
            <button
              onClick={() => handleGenerate()}
              disabled={generating}
              className="flex items-center gap-2 bg-card border-2 border-[#EDF2F7] px-5 py-3 rounded-2xl text-sm font-bold text-muted-foreground transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw
                size={18}
                className={generating ? "animate-spin text-brand-blue" : ""}
              />
              {generating ? "Refining..." : data ? "Regenerate" : "Generate"}
            </button>

            {data && (
              <div className="flex items-center gap-1 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200 ml-2">
                <button
                  onClick={() => setViewMode("tree")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    viewMode === "tree"
                      ? "bg-card text-indigo-500 shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  <TreeIcon size={14} />
                  Mastery Tree
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    viewMode === "list"
                      ? "bg-card text-indigo-500 shadow-sm"
                      : "text-slate-500"
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
          <div className="glass-card p-6 rounded-[32px] flex items-center gap-6 border border-white/60 shadow-xl bg-card/40">
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
                  className="text-brand-blue"
                  strokeDasharray={226}
                  strokeDashoffset={226 - (226 * data.overall_progress) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-sm font-black text-foreground">
                {Math.round(data.overall_progress)}%
              </span>
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">
                Career Readiness
              </div>
              <div className="text-xs text-muted-foreground mt-1 font-medium italic">
                Confidence: {data.current_level}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="relative">
        {generating && (
          <div className="absolute inset-x-0 -top-4 z-50 flex justify-center">
            <div className="bg-card px-6 py-2 rounded-full shadow-lg border border-brand-blue/20 flex items-center gap-3">
              <RefreshCw size={16} className="animate-spin text-brand-blue" />
              <span className="text-sm font-bold text-brand-blue animate-pulse">
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
              <div className="bg-linear-to-r from-[#EBF1FF] to-[#F5F8FF] border border-brand-blue/20 rounded-[32px] p-8 flex items-start gap-6 shadow-xs relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Sparkles size={80} />
                </div>
                <div className="p-3 bg-brand-blue rounded-2xl text-card-foreground shadow-lg shadow-brand-blue/30 relative">
                  <Sparkles size={24} />
                </div>
                <div className="space-y-1 relative">
                  <div className="text-sm font-bold text-foreground uppercase tracking-wider opacity-60">
                    AI Strategist Recommendation
                  </div>
                  <div className="text-lg font-semibold text-muted-foreground leading-relaxed">
                    {data.next_step}
                  </div>
                </div>
              </div>

              {/* Roadmap Content */}
              {viewMode === "tree" ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
                  <VerticalRoadmap
                    skills={data.skills}
                    onToggle={toggleSkill}
                  />
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-[23px] top-6 bottom-6 w-1 bg-linear-to-b from-brand-blue via-[#CBD5E0] to-transparent hidden md:block opacity-30" />

                  <div className="space-y-12 relative z-10">
                    {data.skills.map((skill, index) => (
                      <div
                        key={index}
                        className="flex flex-col md:flex-row gap-8 group transition-all"
                      >
                        <div className="hidden md:flex flex-col items-center">
                          <button
                            onClick={() => toggleSkill(skill.name)}
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center border-4 transition-all shadow-md active:scale-90 ${
                              skill.status === "completed"
                                ? "bg-emerald-500 border-white text-card-foreground"
                                : "bg-card border-[#EDF2F7] text-[#CBD5E0]"
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
                            className={`p-8 rounded-[32px] border transition-all ${
                              skill.status === "completed"
                                ? "bg-emerald-50/20 border-emerald-100"
                                : "bg-card border-white/80 shadow-glass"
                            }`}
                          >
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                              <div className="space-y-4 flex-1">
                                <div className="flex flex-wrap items-center gap-3">
                                  <h3 className="text-2xl font-bold text-foreground font-display">
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

                                <div className="flex flex-wrap gap-6 text-sm text-muted-foreground font-medium">
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
                                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                    Expert-Curated Resources
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {skill.resources.map((res, ridx) => (
                                      <a
                                        key={ridx}
                                        href={res.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border transition-all group/res"
                                      >
                                        <div className="w-10 h-10 rounded-xl bg-[#F7FAFC] flex items-center justify-center text-brand-blue group-hover/res:bg-brand-blue group-hover/res:text-card-foreground transition-colors">
                                          {res.type === "video" ? (
                                            <Sparkles size={18} />
                                          ) : res.type === "course" ? (
                                            <MapIcon size={18} />
                                          ) : (
                                            <ChevronRight size={18} />
                                          )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="text-sm font-bold text-foreground truncate">
                                            {res.title}
                                          </div>
                                          <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] text-muted-foreground font-bold uppercase">
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
                                    : "bg-brand-blue text-card-foreground"
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
                  <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-3">
                    <Sparkles className="text-brand-blue" />
                    Extended Career Trait Paths
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.future_opportunities.map((opp, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-4 p-6 rounded-[24px] bg-card border-2 border-white shadow-sm transition-all group cursor-default"
                      >
                        <div className="w-3 h-3 rounded-full bg-brand-blue transition-transform" />
                        <span className="text-muted-foreground font-bold text-lg">
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
