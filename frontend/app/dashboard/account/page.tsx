"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Shield,
  LogOut,
  ChevronRight,
  UserCircle,
  Bell,
  Zap,
  Star,
  Github,
  Linkedin,
  Globe,
  Briefcase,
  History,
  Target,
  Map as MapPin,
} from "lucide-react";
import { getSession, signOut } from "@/lib/auth";
import { getProfile, getProgress } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface UserSession {
  user?: {
    email?: string;
    user_metadata?: {
      full_name?: string;
      plan?: string;
      role?: string;
      location?: string;
      salary?: string;
    };
  };
}

export default function AccountPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [progress, setProgress] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        const [sess, prog, prof] = await Promise.all([
          getSession(),
          getProgress().catch(() => null),
          getProfile().catch(() => null),
        ]);
        setSession(sess);
        setProgress(prog);
        setProfile(prof);
      } catch (error) {
        console.error("Error fetching account data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  const fullName = session?.user?.user_metadata?.full_name || "Hirenix Member";
  const email = session?.user?.email || "No email linked";
  const plan = (session?.user?.user_metadata?.plan || "free").toLowerCase();

  // Sort and combine activity from trends
  const rawActivities = [
    ...(progress?.ats_trend || []).map((t: any) => ({
      action: "Resume Analyzed",
      date: t.date,
      score: t.score,
      icon: Zap,
      color: "text-amber-500",
      bg: "bg-amber-50",
    })),
    ...(progress?.interview_trend || []).map((t: any) => ({
      action: `Interview: ${t.role}`,
      date: t.date,
      score: t.score,
      icon: UserCircle,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    })),
    ...(progress?.github_trend || []).map((t: any) => ({
      action: `GitHub: ${t.username}`,
      date: t.date,
      score: t.gpi,
      icon: Github,
      color: "text-blue-600",
      bg: "bg-blue-50",
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const activityLog = rawActivities.slice(0, 4).map((act) => ({
    ...act,
    date: new Date(act.date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  }));
  return (
    <div className="animate-fade-up w-full mx-auto space-y-10 pb-20 relative">
      {/* Decorative Orbs */}
      <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full blur-[100px] bg-[#7C9ADD]/10 pointer-events-none -z-10" />
      <div className="absolute top-1/2 -right-20 w-96 h-96 rounded-full blur-[120px] bg-[#B8C1EC]/10 pointer-events-none -z-10" />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-[#1E293B] font-heading">
            Account Command Center
          </h1>
          <p className="text-[#64748B] text-lg max-w-xl leading-relaxed">
            Manage your career identity, integrations, and preferences.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Profile & Summary */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-8 border-white/80 bg-white/60 shadow-premium backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-indigo-500/10 transition-colors" />

            <div className="flex flex-col items-center text-center space-y-4 relative z-10">
              <div className="h-28 w-28 rounded-full bg-linear-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-xl border-4 border-white mb-2 relative group/avatar">
                <User size={56} strokeWidth={1} />
                <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-slate-100 text-indigo-500 hover:scale-110 transition-transform">
                  <Globe size={14} />
                </button>
              </div>
              <div>
                <h2 className="text-2xl font-black font-heading text-[#1E293B]">
                  {fullName}
                </h2>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
                    {plan} Plan
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-10 space-y-5 relative z-10 pt-8 border-t border-slate-100/50">
              <div className="flex items-center justify-between text-sm py-1">
                <span className="text-[#64748B] font-medium flex items-center gap-2">
                  <Mail size={16} className="opacity-40" /> Email
                </span>
                <span className="text-[#1E293B] font-bold text-wrap break-all">
                  {email}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm py-1">
                <span className="text-[#64748B] font-medium flex items-center gap-2">
                  <Briefcase size={16} className="opacity-40" /> Role
                </span>
                <span className="text-[#1E293B] font-bold">
                  {session?.user?.user_metadata?.role ||
                    "Senior Cloud Engineer"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm py-1">
                <span className="text-[#64748B] font-medium flex items-center gap-2">
                  <MapPin size={16} className="opacity-40" /> Location
                </span>
                <span className="font-bold text-emerald-600">
                  {session?.user?.user_metadata?.location || "Remote Only"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm py-1">
                <span className="text-[#64748B] font-medium flex items-center gap-2">
                  <Star size={16} className="opacity-40" /> Salary Expectation
                </span>
                <span className="text-[#1E293B] font-bold">
                  {session?.user?.user_metadata?.salary || "$140k - $180k"}
                </span>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <Button
                variant="outline"
                className="w-full justify-between h-12 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30 group/btn transition-all"
              >
                <span className="flex items-center gap-3 text-slate-600">
                  <Shield
                    size={18}
                    className="group-hover/btn:text-indigo-500"
                  />{" "}
                  Security Settings
                </span>
                <ChevronRight size={16} className="text-slate-300" />
              </Button>
              <Button
                variant="outline"
                className="w-full justify-between h-12 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30 group/btn transition-all"
              >
                <span className="flex items-center gap-3 text-slate-600">
                  <Bell size={18} className="group-hover/btn:text-indigo-500" />{" "}
                  Notification Preferences
                </span>
                <ChevronRight size={16} className="text-slate-300" />
              </Button>
            </div>
          </Card>

          {/* Integrations Card */}
          <Card className="p-8 border-white/80 bg-white/60 shadow-premium backdrop-blur-xl">
            <h3 className="text-lg font-bold text-[#1E293B] mb-6 flex items-center gap-2">
              <Zap size={20} className="text-amber-500" /> Power-Ups
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-indigo-200 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Github size={20} className="text-[#1E293B]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1E293B]">GitHub</p>
                    <p className="text-[11px] text-[#64748B]">
                      Commit Analysis Active
                    </p>
                  </div>
                </div>
                <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-indigo-200 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Linkedin size={20} className="text-[#0A66C2]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1E293B]">LinkedIn</p>
                    <p className="text-[11px] text-[#64748B]">
                      Profile Sync Ready
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-indigo-600 font-bold hover:bg-indigo-50 text-xs"
                >
                  Connect
                </Button>
              </div>
            </div>
          </Card>

          <Button
            onClick={handleSignOut}
            className="w-full h-14 bg-white hover:bg-rose-50 border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 shadow-sm"
          >
            <LogOut size={20} /> Terminate Session
          </Button>
        </div>

        {/* Right Column: Analytics & Activity */}
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 border-white/80 bg-white/60 shadow-premium backdrop-blur-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Target size={80} />
              </div>
              <h4 className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-4">
                Career Evolution
              </h4>
              <div className="flex items-end gap-3 mb-4">
                <span className="text-4xl font-black text-[#1E293B]">
                  +{progress?.resume_evolution_score || 24}%
                </span>
                <span className="text-emerald-500 font-bold text-sm mb-1 flex items-center bg-emerald-50 px-2 py-0.5 rounded-lg">
                  <ChevronRight size={14} className="-rotate-90" /> Monthly
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${progress?.resume_evolution_score || 24}%`,
                  }}
                  className="h-full bg-linear-to-r from-emerald-500 to-teal-400"
                />
              </div>
              <p className="text-[11px] text-[#64748B] mt-3">
                Semantic strength improvement across your portfolio.
              </p>
            </Card>

            <Card className="p-6 border-white/80 bg-white/60 shadow-premium backdrop-blur-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Zap size={80} />
              </div>
              <h4 className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-4">
                Analysis Velocity
              </h4>
              <div className="flex items-end gap-3 mb-4">
                <span className="text-4xl font-black text-[#1E293B]">
                  {rawActivities.length}
                </span>
                <span className="text-slate-400 font-bold text-sm mb-1 uppercase tracking-tighter">
                  Snapshots
                </span>
              </div>
              <div className="flex gap-1.5 h-6 items-end">
                {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: i * 0.1 }}
                    className={`flex-1 rounded-sm ${i === 3 ? "bg-indigo-500" : "bg-slate-200"}`}
                  />
                ))}
              </div>
              <p className="text-[11px] text-[#64748B] mt-3">
                Active career optimization frequency (last 30 days).
              </p>
            </Card>
          </div>

          <Card className="border-white/80 bg-white/60 shadow-premium backdrop-blur-xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#1E293B] flex items-center gap-2">
                <History size={20} className="text-indigo-500" /> Recent AI
                Activity
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-indigo-600 font-bold hover:bg-indigo-50"
              >
                View All
              </Button>
            </div>
            <div className="divide-y divide-slate-100/50">
              {activityLog.length > 0 ? (
                activityLog.map((log, i) => (
                  <div
                    key={i}
                    className="p-6 flex items-center justify-between hover:bg-white/40 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`h-12 w-12 rounded-2xl ${log.bg} flex items-center justify-center transition-transform group-hover:scale-110`}
                      >
                        <log.icon size={22} className={log.color} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#1E293B] group-hover:text-indigo-600 transition-colors">
                          {log.action}
                        </p>
                        <p className="text-xs text-[#64748B]">{log.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-[#1E293B]">
                        {log.score}
                      </p>
                      <p className="text-[10px] text-[#64748B] font-bold uppercase tracking-tighter">
                        Score
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <History size={24} className="text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-medium">
                    No activity recorded yet.
                  </p>
                  <Button
                    variant="ghost"
                    className="text-indigo-600 mt-2 underline"
                    onClick={() => router.push("/dashboard")}
                  >
                    Start your first analysis
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
