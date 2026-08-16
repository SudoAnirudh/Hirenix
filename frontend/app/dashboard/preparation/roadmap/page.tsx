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
import LoadingScreen from "@/components/ui/LoadingScreen";

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
        // Clean telemetry log
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

    const updateNestedStatus = (
      skills: RoadmapSkill[],
      name: string,
      status: RoadmapSkill["status"],
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

    const updatedSkills = updateNestedStatus(data.skills, skillName, newStatus);

    const getCompletedNames = (skills: RoadmapSkill[]): string[] => {
      const names: string[] = [];
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

  if (loading) {
    return (
      <LoadingScreen
        message="Architecting Your Roadmap"
        submessage="Analyzing Career Trajectories"
      />
    );
  }

  if (error)
    return (
      <main
        className="p-12 text-center space-y-6 max-w-2xl mx-auto"
        aria-label="Roadmap loading error"
      >
        <section className="bg-red-50 dark:bg-red-950/10 p-6 rounded-3xl border border-red-100 dark:border-red-900/50 flex flex-col items-center gap-4 text-center">
          <div
            className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-500"
            aria-hidden="true"
          >
            <AlertCircle size={32} strokeWidth={2} />
          </div>
          <p className="text-red-600 dark:text-red-400 font-semibold text-lg">
            {error}
          </p>
          {error.includes("No resume found") ? (
            <a
              href="/dashboard/career/resume"
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-2xl font-bold transition-colors shadow-lg shadow-red-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-red-500/50 focus-visible:ring-offset-2"
            >
              Upload Resume Now
            </a>
          ) : (
            <button
              onClick={() => handleGenerate()}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-2xl font-bold focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-red-500/50 focus-visible:ring-offset-2"
            >
              Retry Generation
            </button>
          )}
        </section>
      </main>
    );

  if (!data && !generating)
    return (
      <main
        className="min-h-[300px] flex flex-col items-center justify-center space-y-6 bg-card rounded-xl border border-dashed border-border p-8"
        aria-label="Roadmap generation starter screen"
      >
        <div
          className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center text-primary"
          aria-hidden="true"
        >
          <MapIcon size={28} strokeWidth={1.5} />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold text-foreground">
            No roadmap generated yet
          </h2>
          <p className="text-muted-foreground text-xs max-w-sm mx-auto font-medium">
            Choose a target role to generate a personalized career path based on
            your skills and gaps.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            aria-label="Select target role"
            className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm font-semibold text-foreground outline-hidden"
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
            className="w-full sm:w-auto btn-primary py-2.5 px-6 rounded-lg text-xs flex items-center justify-center gap-1.5 focus-visible:outline-hidden disabled:opacity-50"
          >
            <Sparkles size={14} />
            Generate Roadmap
          </button>
        </div>
      </main>
    );

  return (
    <main className="animate-fade-up w-full mx-auto space-y-6 pb-20">
      {/* Header & Selection */}
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 border-b border-border pb-4">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-1.5 text-primary font-bold text-xs uppercase tracking-wide">
            <MapIcon size={14} strokeWidth={2} />
            AI Career Navigator
          </div>
          <div className="space-y-0.5">
            <h1 className="text-2xl font-bold text-foreground font-heading capitalize">
              {data?.target_role || selectedRole} Roadmap
            </h1>
            <p className="text-muted-foreground text-sm">
              Dynamic path derived from your professional profile
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-1">
            <div className="relative w-full sm:w-64">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                disabled={generating}
                aria-label="Choose alternative target role"
                className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs font-semibold text-foreground outline-hidden transition-all appearance-none cursor-pointer"
              >
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                <ChevronRight size={14} className="rotate-90" strokeWidth={2} />
              </div>
            </div>
            <button
              onClick={() => handleGenerate()}
              disabled={generating}
              className="flex items-center gap-1.5 bg-card border border-border px-3.5 py-2 rounded-lg text-xs font-bold text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={generating ? "animate-spin text-primary" : ""}
                strokeWidth={2}
              />
              {generating ? "Refining..." : data ? "Regenerate" : "Generate"}
            </button>

            {data && (
              <div className="flex items-center gap-1 bg-slate-100/50 dark:bg-slate-900/30 p-1 rounded-lg border border-border ml-1">
                <button
                  onClick={() => setViewMode("tree")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${
                    viewMode === "tree"
                      ? "bg-card text-primary shadow-xs border border-border/50"
                      : "text-slate-500 hover:text-foreground"
                  }`}
                >
                  <TreeIcon size={12} strokeWidth={2} />
                  Mastery Tree
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${
                    viewMode === "list"
                      ? "bg-card text-primary shadow-xs border border-border/50"
                      : "text-slate-500 hover:text-foreground"
                  }`}
                >
                  <LayoutGrid size={12} strokeWidth={2} />
                  Detailed List
                </button>
              </div>
            )}
          </div>
        </div>

        {data && (
          <section
            className="border border-border bg-card p-4 rounded-xl flex items-center gap-4 shadow-xs"
            aria-label="Overall readiness summary progress"
          >
            <div
              className="relative w-14 h-14 flex items-center justify-center"
              role="progressbar"
              aria-valuenow={data.overall_progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <svg className="w-full h-full -rotate-90" aria-hidden="true">
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  className="text-slate-100 dark:text-slate-800"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  className="text-primary"
                  strokeDasharray={151}
                  strokeDashoffset={151 - (151 * data.overall_progress) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-xs font-bold text-foreground">
                {Math.round(data.overall_progress)}%
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-foreground">
                Career Readiness
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5 font-medium italic">
                Confidence: {data.current_level}
              </div>
            </div>
          </section>
        )}
      </header>

      <div className="relative">
        {generating && (
          <div className="absolute inset-x-0 -top-4 z-50 flex justify-center">
            <div className="bg-card px-6 py-2 rounded-full shadow-lg border border-primary/20 flex items-center gap-3">
              <RefreshCw
                size={16}
                className="animate-spin text-primary"
                strokeWidth={2}
              />
              <span className="text-sm font-bold text-primary animate-pulse">
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
              <section
                className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-5 flex items-start gap-4 shadow-xs relative overflow-hidden"
                aria-label="AI recommendation focus"
              >
                <div
                  className="p-2 bg-primary rounded-lg text-primary-foreground shadow-xs shrink-0"
                  aria-hidden="true"
                >
                  <Sparkles size={16} />
                </div>
                <div className="space-y-0.5">
                  <div className="text-[10px] font-bold text-primary uppercase tracking-wide">
                    AI Strategist Recommendation
                  </div>
                  <div className="text-sm font-medium text-muted-foreground leading-relaxed">
                    {data.next_step}
                  </div>
                </div>
              </section>

              {/* Roadmap Content */}
              {viewMode === "tree" ? (
                <section
                  className="animate-in fade-in slide-in-from-bottom-4 duration-1000"
                  aria-label="Mastery tech tree view"
                >
                  <VerticalRoadmap
                    skills={data.skills}
                    onToggle={toggleSkill}
                  />
                </section>
              ) : (
                <section className="relative" aria-label="Milestones list view">
                  <div className="absolute left-[23px] top-6 bottom-6 w-1 bg-linear-to-b from-primary via-[#CBD5E0] dark:via-slate-800 to-transparent hidden md:block opacity-30" />

                  <div className="space-y-12 relative z-10">
                    {data.skills.map((skill, index) => (
                      <div
                        key={index}
                        className="flex flex-col md:flex-row gap-6 group transition-all"
                      >
                        <div className="hidden md:flex flex-col items-center">
                          <button
                            onClick={() => toggleSkill(skill.name)}
                            aria-label={`Toggle completion of skill ${skill.name}`}
                            className={`w-9 h-9 rounded-lg flex items-center justify-center border-2 transition-colors active:scale-90 focus-visible:outline-hidden ${
                              skill.status === "completed"
                                ? "bg-emerald-500 border-white text-white shadow-xs"
                                : "bg-card border-border text-slate-300"
                            }`}
                          >
                            {skill.status === "completed" ? (
                              <CheckCircle2 size={16} strokeWidth={2} />
                            ) : (
                              <Circle size={16} strokeWidth={2} />
                            )}
                          </button>
                        </div>

                        <div className="flex-1">
                          <Card
                            className={`p-6 rounded-xl border transition-all ${
                              skill.status === "completed"
                                ? "bg-emerald-50/10 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/40"
                                : "bg-card border-border shadow-xs"
                            }`}
                          >
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                              <div className="space-y-3 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="text-lg font-bold text-foreground font-heading">
                                    {skill.name}
                                  </h3>
                                  <span
                                    className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                      skill.priority === "high"
                                        ? "bg-red-100 dark:bg-red-950/20 text-red-500"
                                        : skill.priority === "medium"
                                          ? "bg-amber-100 dark:bg-amber-950/20 text-amber-500"
                                          : "bg-blue-100 dark:bg-blue-950/20 text-blue-500"
                                    }`}
                                  >
                                    {skill.priority} Priority
                                  </span>
                                  {skill.status === "completed" && (
                                    <span className="bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                                      Mastered
                                    </span>
                                  )}
                                </div>

                                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground font-semibold">
                                  <div className="flex items-center gap-1.5">
                                    <Clock size={14} strokeWidth={2} />
                                    {skill.estimated_time}
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <Sparkles size={14} strokeWidth={2} />
                                    {skill.difficulty} difficulty
                                  </div>
                                </div>

                                <div className="space-y-2 pt-3 border-t border-border">
                                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                    Expert-Curated Resources
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {skill.resources.map((res, ridx) => (
                                      <a
                                        key={ridx}
                                        href={res.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border transition-all hover:border-primary group/res"
                                      >
                                        <div className="w-8 h-8 rounded-md bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-primary group-hover/res:bg-primary group-hover/res:text-primary-foreground transition-colors shrink-0">
                                          {res.type === "video" ? (
                                            <Sparkles
                                              size={14}
                                              strokeWidth={2}
                                            />
                                          ) : res.type === "course" ? (
                                            <MapIcon
                                              size={14}
                                              strokeWidth={2}
                                            />
                                          ) : (
                                            <ChevronRight
                                              size={14}
                                              strokeWidth={2}
                                            />
                                          )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="text-xs font-semibold text-foreground truncate group-hover/res:text-primary">
                                            {res.title}
                                          </div>
                                          <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                                              {res.type}
                                            </span>
                                            {res.is_free && (
                                              <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider">
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
                                className={`md:hidden px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all focus-visible:outline-hidden ${
                                  skill.status === "completed"
                                    ? "bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600"
                                    : "btn-primary h-9"
                                }`}
                              >
                                {skill.status === "completed" ? (
                                  <>
                                    <CheckCircle2 size={14} strokeWidth={2} />
                                    Mastered
                                  </>
                                ) : (
                                  <>
                                    <Circle size={14} strokeWidth={2} />
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
                </section>
              )}

              {/* Future Opportunities Section */}
              <section
                className="pt-10"
                aria-label="Extended Career Trait Paths"
              >
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-3">
                    <Sparkles className="text-primary" strokeWidth={2} />
                    Extended Career Trait Paths
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.future_opportunities.map((opp, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border shadow-xs group cursor-default"
                      >
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="font-semibold text-sm text-foreground">
                          {opp}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
