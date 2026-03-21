"use client";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  Map as MapIcon,
  ChevronRight,
  TrendingUp,
  Brain,
  Video,
  BookOpen,
  GraduationCap,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { Card } from "@/components/ui/card";

interface Resource {
  title: string;
  url: string;
  type: "video" | "course" | "article";
  is_free: boolean;
}

interface RoadmapSkill {
  name: string;
  status: "completed" | "in_progress" | "to_learn";
  priority: "high" | "medium" | "low";
  difficulty: "easy" | "medium" | "hard";
  estimated_time: string;
  resources: Resource[];
}

interface RoadmapData {
  target_role: string;
  current_level: string;
  skills: RoadmapSkill[];
  next_step: string;
  overall_progress: number;
  future_opportunities: string[];
}

export default function RoadmapPage() {
  const [data, setData] = useState<RoadmapData | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState("Frontend Engineer");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRoles() {
      try {
        // In a real app, this would be an API call
        const response = await fetch("http://localhost:8000/roadmap/roles");
        if (response.ok) {
          const rolesList = await response.json();
          setRoles(rolesList);
        } else {
          setRoles([
            "Frontend Engineer",
            "Backend Engineer",
            "Full Stack Engineer",
            "Data Scientist",
            "ML Engineer",
            "DevOps Engineer",
          ]);
        }
      } catch (err) {
        setRoles([
          "Frontend Engineer",
          "Backend Engineer",
          "Full Stack Engineer",
          "Data Scientist",
          "ML Engineer",
          "DevOps Engineer",
        ]);
      }
    }
    fetchRoles();
    fetchRoadmap("Frontend Engineer");
  }, []);

  async function fetchRoadmap(role: string) {
    setGenerating(true);
    try {
      const session = await getSession();
      if (!session) return;

      // Mocking the API call for now, but following the new structure
      const mockData: RoadmapData = {
        target_role: role,
        current_level: "Entry Level",
        overall_progress: 35,
        next_step: "Focus on mastering React Hooks and State Management",
        skills: [
          {
            name: "React & Next.js",
            status: "in_progress",
            priority: "high",
            difficulty: "medium",
            estimated_time: "3 weeks",
            resources: [
              {
                title: "React Official Docs",
                url: "https://react.dev",
                type: "article",
                is_free: true,
              },
              { title: "Epic React", url: "#", type: "course", is_free: false },
              {
                title: "React Crash Course",
                url: "#",
                type: "video",
                is_free: true,
              },
            ],
          },
          {
            name: "TypeScript",
            status: "completed",
            priority: "medium",
            difficulty: "medium",
            estimated_time: "Completed",
            resources: [
              {
                title: "TS Handbook",
                url: "#",
                type: "article",
                is_free: true,
              },
            ],
          },
          {
            name: "Tailwind CSS",
            status: "completed",
            priority: "low",
            difficulty: "easy",
            estimated_time: "Completed",
            resources: [
              {
                title: "Tailwind Docs",
                url: "#",
                type: "article",
                is_free: true,
              },
            ],
          },
          {
            name: "Node.js Basics",
            status: "to_learn",
            priority: "medium",
            difficulty: "medium",
            estimated_time: "2 weeks",
            resources: [
              {
                title: "Node.js Tutorial",
                url: "#",
                type: "video",
                is_free: true,
              },
              {
                title: "Node Patterns",
                url: "#",
                type: "course",
                is_free: false,
              },
            ],
          },
        ],
        future_opportunities: [
          "Senior Frontend Engineer roles in top tech companies",
          "Transition into Full Stack development",
          "UI/UX Architect specializations",
          "Mobile development with React Native",
        ],
      };

      // Simulating network delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      setData(mockData);
    } catch (err) {
      setError("Failed to load roadmap. Please try again later.");
    } finally {
      setLoading(false);
      setGenerating(false);
    }
  }

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(e.target.value);
    fetchRoadmap(e.target.value);
  };

  if (loading)
    return (
      <div className="p-12 text-center text-[#718096] animate-pulse font-medium">
        Preparing your career path...
      </div>
    );
  if (error)
    return (
      <div className="p-8 text-center text-red-500 bg-red-50 rounded-2xl border border-red-100">
        {error}
      </div>
    );
  if (!data) return null;

  return (
    <div className="animate-fade-up max-w-5xl mx-auto space-y-10 pb-20">
      {/* Header & Selection */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4 flex-1">
          <div className="flex items-center gap-2 text-[#7C9ADD] font-bold text-sm uppercase tracking-widest">
            <MapIcon size={16} />
            AI Career Navigator
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-bold text-[#2D3748] font-display">
              {data.target_role} Roadmap
            </h1>
            <p className="text-[#718096] text-lg">
              Personalized path based on your current skills
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
            <div className="relative w-full sm:w-72">
              <select
                value={selectedRole}
                onChange={handleRoleChange}
                className="w-full bg-white border-2 border-[#E2E8F0] hover:border-[#7C9ADD] focus:border-[#7C9ADD] rounded-2xl px-5 py-3 text-sm font-semibold text-[#2D3748] outline-hidden transition-all appearance-none cursor-pointer shadow-sm"
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
            {generating && (
              <div className="text-xs text-[#7C9ADD] font-bold animate-pulse">
                Regenerating roadmap...
              </div>
            )}
          </div>
        </div>

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
              Roadmap Progress
            </div>
            <div className="text-xs text-[#718096] mt-1 font-medium italic">
              Level: {data.current_level}
            </div>
          </div>
        </div>
      </div>

      {/* AI Next Step */}
      <div className="bg-linear-to-r from-[#EBF1FF] to-[#F5F8FF] border border-[#7C9ADD]/20 rounded-[32px] p-8 flex items-start gap-6 shadow-xs">
        <div className="p-3 bg-[#7C9ADD] rounded-2xl text-white shadow-lg shadow-[#7C9ADD]/30">
          <Sparkles size={24} />
        </div>
        <div className="space-y-1">
          <div className="text-sm font-bold text-[#2D3748] uppercase tracking-wider opacity-60">
            AI Strategist Recommendation
          </div>
          <div className="text-lg font-semibold text-[#4A5568] leading-relaxed">
            {data.next_step}
          </div>
        </div>
      </div>

      {/* Roadmap Content */}
      <div className="relative">
        <div className="absolute left-[23px] top-6 bottom-6 w-1 bg-linear-to-b from-[#7C9ADD] via-[#CBD5E0] to-transparent hidden md:block opacity-30" />

        <div className="space-y-12 relative z-10">
          {data.skills.map((skill, index) => (
            <div
              key={index}
              className={`flex flex-col md:flex-row gap-8 group transition-all ${generating ? "opacity-50 grayscale" : ""}`}
            >
              <div className="hidden md:flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center border-4 transition-all shadow-md ${
                    skill.status === "completed"
                      ? "bg-[#98C9A3] border-white text-white"
                      : skill.status === "in_progress"
                        ? "bg-[#7C9ADD] border-white text-white shadow-lg shadow-[#7C9ADD]/30 animate-pulse"
                        : "bg-white border-[#EDF2F7] text-[#CBD5E0]"
                  }`}
                >
                  {skill.status === "completed" ? (
                    <CheckCircle2 size={24} />
                  ) : skill.status === "in_progress" ? (
                    <Clock size={24} />
                  ) : (
                    <Circle size={24} />
                  )}
                </div>
              </div>

              <div className="flex-1">
                <Card
                  className={`p-8 rounded-[32px] border border-white/80 shadow-glass group-hover:shadow-2xl transition-all duration-300 ${
                    skill.status === "in_progress"
                      ? "bg-white ring-8 ring-[#7C9ADD]/5"
                      : "bg-white/60"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-2xl font-bold text-[#2D3748] font-display">
                          {skill.name}
                        </h3>
                        <span
                          className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest border ${
                            skill.priority === "high"
                              ? "bg-red-50 text-red-600 border-red-100"
                              : skill.priority === "medium"
                                ? "bg-orange-50 text-orange-600 border-orange-100"
                                : "bg-blue-50 text-blue-600 border-blue-100"
                          }`}
                        >
                          {skill.priority} Priority
                        </span>
                      </div>
                      <div className="flex items-center gap-5 text-xs text-[#718096] font-bold">
                        <span className="flex items-center gap-1.5">
                          <TrendingUp size={14} className="text-[#A0AEC0]" />{" "}
                          {skill.difficulty}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={14} className="text-[#A0AEC0]" />{" "}
                          {skill.estimated_time}
                        </span>
                      </div>
                    </div>

                    {skill.status === "to_learn" && (
                      <button className="whitespace-nowrap px-6 py-3 rounded-2xl bg-[#7C9ADD] text-white font-bold text-sm shadow-lg shadow-[#7C9ADD]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 group-hover:bg-[#6B8ACD]">
                        Unlock Track <ArrowRight size={18} />
                      </button>
                    )}
                  </div>

                  <div className="space-y-5">
                    <div className="text-[11px] font-bold text-[#A0AEC0] uppercase tracking-widest flex items-center gap-2">
                      <BookOpen size={14} /> Smart Learning resources
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {skill.resources.map((res, ridx) => (
                        <a
                          key={ridx}
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-col p-4 rounded-2xl bg-white border border-[#EDF2F7] hover:border-[#7C9ADD] hover:shadow-lg transition-all group/res"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="p-2 rounded-lg bg-slate-50 group-hover/res:bg-[#7C9ADD]/10 text-slate-400 group-hover/res:text-[#7C9ADD] transition-colors">
                              {res.type === "video" ? (
                                <Video size={16} />
                              ) : res.type === "course" ? (
                                <GraduationCap size={16} />
                              ) : (
                                <BookOpen size={16} />
                              )}
                            </div>
                            <span
                              className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter ${
                                res.is_free
                                  ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                  : "bg-amber-50 text-amber-600 border border-amber-100"
                              }`}
                            >
                              {res.is_free ? "Free" : "Premium"}
                            </span>
                          </div>
                          <div className="text-[13px] font-bold text-[#4A5568] group-hover/res:text-[#2D3748] line-clamp-1">
                            {res.title}
                          </div>
                          <div className="text-[10px] text-[#A0AEC0] mt-1 capitalize">
                            {res.type} Resource
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Future Opportunities Section */}
      <div className="pt-10">
        <div className="glass-card p-10 rounded-[40px] border border-white/60 bg-white/40 shadow-2xl space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="text-[#7C9ADD] font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                <TrendingUp size={16} /> Global Market Outlook
              </div>
              <h2 className="text-3xl font-bold text-[#2D3748] font-display">
                Future Opportunities
              </h2>
            </div>
            <div className="px-6 py-2 rounded-full border border-[#7C9ADD]/20 bg-[#7C9ADD]/5 text-[#7C9ADD] text-sm font-bold">
              Market Sentiment: Bullish 📈
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.future_opportunities.map((opp, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 p-5 rounded-2xl bg-white/80 border border-white hover:border-[#7C9ADD]/20 transition-all hover:translate-x-1 group"
              >
                <div className="w-2 h-2 rounded-full bg-[#7C9ADD] group-hover:scale-150 transition-transform" />
                <span className="text-slate-700 font-semibold">{opp}</span>
              </div>
            ))}
          </div>

          <div className="p-6 rounded-3xl bg-[#2D3748] text-white flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="text-xl font-bold mb-1">
                Scale Your Career with Premium Insights
              </div>
              <div className="text-slate-400 text-sm">
                Get real-time salary data and personalized job matching for this
                role.
              </div>
            </div>
            <button className="px-8 py-3 rounded-2xl bg-[#7C9ADD] text-white font-bold hover:bg-[#6B8ACD] transition-all whitespace-nowrap shadow-lg shadow-[#7C9ADD]/20">
              Unlock Pro Insights
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
