"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Shield,
  CreditCard,
  LogOut,
  ChevronRight,
  UserCircle,
  Key,
  Bell,
  Zap,
  Star,
  Github,
  Linkedin,
  Globe,
  Briefcase,
  History,
  Target,
  Sun,
  Moon,
  ExternalLink,
  Map as MapPin,
} from "lucide-react";
import { getSession, signOut } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface UserSession {
  user?: {
    email?: string;
    user_metadata?: {
      full_name?: string;
      plan?: string;
    };
  };
}

export default function AccountPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchSession() {
      const sess = await getSession();
      setSession(sess);
      setLoading(false);
    }
    fetchSession();
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

  const fullName = session?.user?.user_metadata?.full_name || "Guest User";
  const email = session?.user?.email || "Not signed in";
  const plan = session?.user?.user_metadata?.plan || "free";

  const activityLog = [
    {
      action: "Resume Analyzed",
      date: "2 hours ago",
      icon: Zap,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      action: "LinkedIn Connected",
      date: "Developing",
      icon: Linkedin,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      action: "Mock Interview Done",
      date: "Yesterday",
      icon: UserCircle,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      action: "Roadmap Generated",
      date: "3 days ago",
      icon: Target,
      color: "text-violet-500",
      bg: "bg-violet-50",
    },
  ];

  return (
    <div className="animate-fade-up max-w-[1200px] mx-auto space-y-10 pb-20 relative">
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

        <div className="flex items-center gap-2 p-1 bg-white/40 border border-white/80 rounded-2xl shadow-sm backdrop-blur-md">
          <button
            onClick={() => setIsDarkMode(false)}
            className={`p-2.5 rounded-xl transition-all ${!isDarkMode ? "bg-white text-amber-500 shadow-sm" : "text-[#64748B] hover:bg-white/50"}`}
          >
            <Sun size={18} />
          </button>
          <button
            onClick={() => setIsDarkMode(true)}
            className={`p-2.5 rounded-xl transition-all ${isDarkMode ? "bg-[#1E293B] text-violet-400 shadow-sm" : "text-[#64748B] hover:bg-white/50"}`}
          >
            <Moon size={18} />
          </button>
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
                  Software Engineer
                </span>
              </div>
              <div className="flex items-center justify-between text-sm py-1">
                <span className="text-[#64748B] font-medium flex items-center gap-2">
                  <MapPin size={16} className="opacity-40" /> Location
                </span>
                <span className="font-bold text-emerald-600">Remote Only</span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-full mt-10 rounded-2xl border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 transition-all font-bold text-xs h-12 flex items-center justify-center gap-2"
            >
              <LogOut size={16} />
              Terminate Session
            </Button>
          </Card>

          {/* Connected Accounts */}
          <Card className="p-6 border-white/80 bg-white/40 shadow-premium backdrop-blur-xl">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#64748B] mb-6 px-1">
              Integrations
            </h3>
            <div className="space-y-3">
              {[
                {
                  name: "GitHub",
                  icon: Github,
                  connected: true,
                  color: "text-[#181717]",
                },
                {
                  name: "LinkedIn",
                  icon: Linkedin,
                  connected: false,
                  color: "text-[#0A66C2]",
                },
              ].map((social) => (
                <div
                  key={social.name}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white/50 border border-white hover:border-indigo-100 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl bg-slate-50 border border-slate-100 ${social.color} group-hover:scale-110 transition-transform`}
                    >
                      <social.icon size={18} />
                    </div>
                    <span className="text-sm font-bold text-[#1E293B]">
                      {social.name}
                    </span>
                  </div>
                  {social.connected ? (
                    <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                      Connected
                    </span>
                  ) : (
                    <button className="text-[9px] font-black uppercase text-indigo-500 hover:underline">
                      Connect
                    </button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Settings & Activity */}
        <div className="lg:col-span-8 space-y-8">
          {/* Career Preferences */}
          <section className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#64748B] opacity-60 ml-2">
              Career Radar Preferences
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-6 border-white/80 bg-white/60 shadow-premium backdrop-blur-xl hover:bg-white group transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-100">
                    <Target size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                    Active
                  </span>
                </div>
                <h4 className="font-bold text-[#1E293B] mb-1">Target Roles</h4>
                <p className="text-xs text-[#64748B] mb-4">
                  You are primarily being matched for Senior Front-end roles.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-bold text-[#64748B]">
                    Next.js
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-bold text-[#64748B]">
                    TypeScript
                  </span>
                </div>
              </Card>

              <Card className="p-6 border-white/80 bg-white/60 shadow-premium backdrop-blur-xl hover:bg-white group transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-100">
                    <CreditCard size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-[#64748B] opacity-40">
                    Private
                  </span>
                </div>
                <h4 className="font-bold text-[#1E293B] mb-1">Salary Range</h4>
                <p className="text-xs text-[#64748B] mb-6">
                  Target: $140,000 - $180,000 USD / Year
                </p>
                <Button
                  variant="ghost"
                  className="w-full text-[10px] font-bold h-9 rounded-xl border-slate-100 bg-slate-50/50 hover:bg-white"
                >
                  Update Insights
                </Button>
              </Card>
            </div>
          </section>

          {/* Activity Log & Usage */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#64748B] opacity-60 ml-2">
                Recent AI Activity
              </h3>
              <Card className="p-6 border-white/80 bg-white/60 shadow-premium backdrop-blur-xl space-y-6">
                <div className="space-y-5">
                  {activityLog.map((log, i) => (
                    <div key={i} className="flex items-start gap-4 group/item">
                      <div
                        className={`p-2.5 rounded-xl ${log.bg} ${log.color} border border-white shadow-sm mt-0.5 group-hover/item:scale-110 transition-transform`}
                      >
                        <log.icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-bold text-[#1E293B] truncate">
                            {log.action}
                          </p>
                          <span className="text-[10px] font-medium text-[#64748B] opacity-40">
                            {log.date}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#64748B] line-clamp-1 mt-0.5 italic">
                          Transaction ID: HIX-
                          {Math.floor(Math.random() * 90000 + 10000)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  className="w-full text-xs font-bold text-indigo-500 hover:bg-indigo-50 border-t border-slate-50 pt-6 rounded-none h-auto"
                >
                  View Full Audit Log
                </Button>
              </Card>
            </section>

            <section className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#64748B] opacity-60 ml-2">
                Usage Metrics
              </h3>
              <Card className="p-8 border-white/80 bg-white/60 shadow-premium backdrop-blur-xl relative overflow-hidden h-full">
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-indigo-500 to-violet-500" />
                <div className="flex flex-col h-full justify-between">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-[#64748B] uppercase tracking-wider">
                        <span>API Computes</span>
                        <span className="text-indigo-600">72%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "72%" }}
                          className="h-full bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/20"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-[#64748B] uppercase tracking-wider">
                        <span>Tokens Remaining</span>
                        <span className="text-emerald-600">2.4k</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "45%" }}
                          className="h-full bg-emerald-500 rounded-full"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 p-4 rounded-2xl bg-indigo-500 text-white shadow-xl shadow-indigo-500/20 group cursor-pointer overflow-hidden relative">
                    <div className="relative z-10 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1 leading-none">
                          Upgrade Pro
                        </div>
                        <div className="text-sm font-bold">
                          Unlimited Analysis
                        </div>
                      </div>
                      <Star
                        size={24}
                        className="group-hover:rotate-12 transition-transform opacity-50"
                      />
                    </div>
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </Card>
            </section>
          </div>

          {/* Settings Grid */}
          <section className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#64748B] opacity-60 ml-2">
              Platform Protocol
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: UserCircle, title: "Profile", extra: "Public info" },
                { icon: Key, title: "Keys", extra: "MFA Active" },
                { icon: Bell, title: "Alerts", extra: "Email: Weekly" },
              ].map((item, i) => (
                <button
                  key={i}
                  className="p-4 rounded-[28px] bg-white/50 border border-white shadow-glass hover:bg-white hover:border-indigo-100 transition-all text-left flex items-center gap-4 group active:scale-[0.98]"
                >
                  <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-[#1E293B] group-hover:bg-indigo-500 group-hover:text-white transition-all">
                    <item.icon size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#1E293B]">
                      {item.title}
                    </div>
                    <div className="text-[10px] text-[#64748B] opacity-50 font-medium">
                      {item.extra}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Security Deep-link */}
          <section className="pt-4">
            <Card className="p-6 border-red-100/30 bg-red-50/10 shadow-premium backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-red-500/5 rounded-full -mr-16 -mt-16 blur-2xl" />
              <div className="relative z-10">
                <h4 className="font-bold text-red-600 flex items-center gap-2">
                  <Shield size={18} /> Danger Protocol
                </h4>
                <p className="text-xs text-red-500/70 mt-1 max-w-sm">
                  Deleting your account will purge all resume history, interview
                  results, and career tokens permanently.
                </p>
              </div>
              <Button
                variant="ghost"
                className="relative z-10 rounded-[20px] border border-red-200 bg-white text-red-500 hover:bg-red-500 hover:text-white font-black text-[10px] uppercase tracking-widest h-12 px-8 transition-all active:scale-95 shadow-sm"
              >
                Destroy Data
              </Button>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
