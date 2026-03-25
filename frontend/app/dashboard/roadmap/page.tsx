"use client";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  Map as MapIcon,
  ChevronRight,
  Sparkles,
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
      } catch {
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
    } catch {
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

      {/* AI Next Step & Main Content with Coming Soon Overlay */}
      <div className="relative min-h-[600px] rounded-[48px] overflow-hidden">
        <div className="space-y-10 opacity-40 blur-sm pointer-events-none select-none">
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
                            ? "bg-[#7C9ADD] border-white text-white shadow-lg shadow-[#7C9ADD]/30"
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
                      className={`p-8 rounded-[32px] border border-white/80 shadow-glass ${
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
                          </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.future_opportunities.map((opp, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-5 rounded-2xl bg-white/80 border border-white"
                  >
                    <div className="w-2 h-2 rounded-full bg-[#7C9ADD]" />
                    <span className="text-slate-700 font-semibold">{opp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Overlay */}
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-8 text-center backdrop-blur-xl bg-white/30 rounded-[48px] border-2 border-white/50 shadow-2xl animate-fade-in">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-blue-400 blur-3xl opacity-20 animate-pulse rounded-full" />
            <div className="relative bg-linear-to-br from-[#7C9ADD] to-[#4A5568] p-6 rounded-[32px] shadow-2xl shadow-blue-500/20 text-white transform hover:scale-105 transition-transform duration-500">
              <Sparkles size={48} className="animate-bounce" />
            </div>
          </div>

          <div className="max-w-md space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#7C9ADD]/10 border border-[#7C9ADD]/20 text-[#7C9ADD] text-xs font-black uppercase tracking-[0.2em]">
              Feature Pipeline
            </div>

            <h2 className="text-5xl md:text-6xl font-black text-[#2D3748] font-display tracking-tight leading-tight">
              Roadmap <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-[#7C9ADD] to-[#4A5568]">
                Coming Soon
              </span>
            </h2>

            <p className="text-[#718096] text-lg font-medium leading-relaxed">
              We&apos;re fine-tuning your AI career strategist to give you the
              most accurate path forward. Get ready for a game-changing
              experience.
            </p>

            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[#718096]">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
                AI Model Training
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-[#718096]">
                <div className="w-2 h-2 rounded-full bg-[#7C9ADD] shadow-lg shadow-blue-500/50 animate-pulse" />
                Market Analysis
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
