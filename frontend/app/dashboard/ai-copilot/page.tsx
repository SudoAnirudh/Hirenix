"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Send,
  Sparkles,
  User,
  Bot,
  CheckCircle,
  XCircle,
  FileText,
  Github,
  Map,
  Briefcase,
  Mic,
  AlertCircle,
  Edit3,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  chatWithAgent,
  resolveAgentApproval,
  getAgentChatHistory,
  getPendingAgentApprovals,
  AgentMessage,
  AgentApprovalRecord,
} from "@/lib/api";

const AGENT_INFO = [
  {
    name: "ResumeAgent",
    icon: FileText,
    color: "text-emerald-500 bg-emerald-50 border-emerald-100",
    desc: "ATS scoring, resume formatting & grammar checks.",
  },
  {
    name: "JobAgent",
    icon: Briefcase,
    color: "text-blue-500 bg-blue-50 border-blue-100",
    desc: "JD matching, fit analysis & recruiter outreach templates.",
  },
  {
    name: "GitHubAgent",
    icon: Github,
    color: "text-indigo-500 bg-indigo-50 border-indigo-100",
    desc: "Calculates GPI index & audits repo quality.",
  },
  {
    name: "RoadmapAgent",
    icon: Map,
    color: "text-amber-500 bg-amber-50 border-amber-100",
    desc: "Builds personalized learning paths to close gaps.",
  },
  {
    name: "InterviewAgent",
    icon: Mic,
    color: "text-purple-500 bg-purple-50 border-purple-100",
    desc: "Tailors technical mock questions & reviews user answers.",
  },
];

export default function AgentAssistantPage() {
  const [threadId] = useState<string>(() => "default-thread");
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);

  // HITL States
  const [pendingApprovals, setPendingApprovals] = useState<
    AgentApprovalRecord[]
  >([]);
  const [editingApprovalId, setEditingApprovalId] = useState<string | null>(
    null,
  );
  const [editLinkedin, setEditLinkedin] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [resolvingApprovalId, setResolvingApprovalId] = useState<string | null>(
    null,
  );

  const [error, setError] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchHistory();
    fetchPendingApprovals();
  }, [threadId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchHistory = async () => {
    try {
      const history = await getAgentChatHistory(threadId);
      // Map database sender to React format
      const formatted = history.map((h) => ({
        sender: h.sender,
        content: h.content,
        created_at: h.created_at,
      }));
      setMessages(formatted);
    } catch (e: any) {
      console.error("Failed to load chat history", e);
    }
  };

  const fetchPendingApprovals = async () => {
    try {
      const approvals = await getPendingAgentApprovals();
      setPendingApprovals(approvals);

      // If there are pending approvals, populate edit states
      if (approvals.length > 0) {
        const active = approvals[0];
        setEditingApprovalId(active.id);
        setEditLinkedin(active.draft_content.linkedin_request || "");
        setEditEmail(active.draft_content.cold_email || "");
      } else {
        setEditingApprovalId(null);
      }
    } catch (e: any) {
      console.error("Failed to fetch approvals", e);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    setError("");
    setLoading(true);
    setActiveAgent("supervisor");

    // Add user message locally
    const userMsg: AgentMessage = { sender: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");

    try {
      const response = await chatWithAgent(text, threadId);

      // Update with response
      const assistantMsg: AgentMessage = {
        sender: response.sender,
        content: response.message,
      };
      setMessages((prev) => [...prev, assistantMsg]);

      await fetchPendingApprovals();
    } catch (e: any) {
      setError(e.message || "An error occurred during agent execution.");
    } finally {
      setLoading(false);
      setActiveAgent(null);
    }
  };

  const handleApprovalAction = async (
    approvalId: string,
    action: "approved" | "rejected" | "modified",
  ) => {
    setError("");
    setResolvingApprovalId(approvalId);

    const draftPayload =
      action === "modified"
        ? {
            linkedin_request: editLinkedin,
            cold_email: editEmail,
            company_name:
              pendingApprovals.find((a) => a.id === approvalId)?.draft_content
                .company_name || "[Company]",
          }
        : undefined;

    try {
      const response = await resolveAgentApproval(
        approvalId,
        action,
        draftPayload,
      );

      // Add response message to feed if graph resumed and produced text
      if (response.message) {
        setMessages((prev) => [
          ...prev,
          {
            sender: response.sender || "assistant",
            content: response.message || "",
          },
        ]);
      }

      // Reload pending approvals
      await fetchPendingApprovals();
    } catch (e: any) {
      setError(e.message || "Failed to resolve approval task.");
    } finally {
      setResolvingApprovalId(null);
    }
  };

  const getAgentBadge = (sender: string) => {
    const matched = AGENT_INFO.find((a) => a.name === sender);
    if (!matched) return null;
    const Icon = matched.icon;
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border ${matched.color}`}
      >
        <Icon size={10} />
        {matched.name}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-12 w-full mx-auto pb-24 px-4 md:px-0">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-2">
          <Brain size={16} className="text-brand-blue" />
          <span className="text-[11px] font-black uppercase tracking-[0.4em] text-brand-blue">
            Core Agentic Platform
          </span>
        </div>
        <h1 className="font-display font-black text-5xl md:text-7xl tracking-tighter text-foreground leading-none">
          AI Career{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-indigo">
            Agent
          </span>
        </h1>
        <p className="text-lg font-medium text-muted-foreground max-w-3xl leading-relaxed">
          An autonomous crew of specialized career agents coordinating via a
          Supervisor to optimize resumes, evaluate JDs, analyze public
          codebases, and draft recruiter outreach.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Interactive Chat Thread */}
        <div className="lg:col-span-12 xl:col-span-8 flex flex-col gap-6">
          <div className="glass-card rounded-[2.5rem] bg-card border border-border shadow-xl flex flex-col h-[650px] overflow-hidden relative">
            {/* Active Running Agent Status Ribbon */}
            <div className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-border px-8 py-4 flex items-center justify-between text-xs font-bold text-muted-foreground">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${loading ? "bg-amber-500 animate-ping" : "bg-emerald-500"}`}
                />
                <span>
                  {loading
                    ? `Agent Swarm active: ${activeAgent || "supervisor"} reasoning...`
                    : "System Ready. Thread active"}
                </span>
              </div>
              <span className="text-[10px] tracking-wider uppercase font-black">
                Thread Session: v2-engine
              </span>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-brand-blue/5 flex items-center justify-center text-brand-blue animate-bounce">
                    <Brain size={28} />
                  </div>
                  <h4 className="font-display font-bold text-lg text-foreground">
                    Welcome to your Agentic Assistant
                  </h4>
                  <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                    Ask me to score your resume, audit your GitHub, customize
                    outreach drafts for a target company, or help you practice
                    technical interview questions.
                  </p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isUser = msg.sender === "user";
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-4 ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      {!isUser && (
                        <div className="w-10 h-10 rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue shrink-0">
                          <Bot size={20} />
                        </div>
                      )}
                      <div className="flex flex-col gap-1.5 max-w-[80%]">
                        {!isUser && (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                              {msg.sender === "assistant"
                                ? "Supervisor"
                                : msg.sender}
                            </span>
                            {getAgentBadge(msg.sender)}
                          </div>
                        )}
                        <div
                          className={`p-6 rounded-[2rem] text-sm font-medium leading-relaxed whitespace-pre-line border ${
                            isUser
                              ? "bg-foreground text-card-foreground border-foreground rounded-tr-none"
                              : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/80 text-foreground rounded-tl-none shadow-xs"
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                      {isUser && (
                        <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white shrink-0">
                          <User size={20} />
                        </div>
                      )}
                    </motion.div>
                  );
                })
              )}
              {loading && (
                <div className="flex gap-4 justify-start">
                  <div className="w-10 h-10 rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue shrink-0 animate-pulse">
                    <Bot size={20} />
                  </div>
                  <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-tl-none shadow-xs flex items-center gap-2">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Error Indicator */}
            {error && (
              <div className="px-8 py-3 bg-red-50 border-t border-red-100 flex items-center gap-3 text-red-600 text-xs font-bold">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Input Bar Form */}
            <div className="p-6 border-t border-border bg-slate-50/50 dark:bg-slate-900/30 flex gap-4">
              <input
                className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-brand-blue/40 rounded-2xl px-6 h-14 outline-none transition-all text-sm font-medium"
                placeholder="Type your message to request assistance..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleSendMessage(inputValue)
                }
                disabled={loading}
              />
              <Button
                onClick={() => handleSendMessage(inputValue)}
                disabled={loading || !inputValue.trim()}
                className="h-14 w-14 rounded-2xl bg-foreground text-card-foreground hover:bg-foreground/90 flex items-center justify-center cursor-pointer shadow-lg shrink-0 border-0"
              >
                <Send size={18} />
              </Button>
            </div>
          </div>

          {/* Quick Prompts Row */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() =>
                handleSendMessage("Evaluate my resume and compute my ATS score")
              }
              disabled={loading}
              className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 hover:border-brand-blue/20 rounded-xl text-[10px] font-black tracking-wider uppercase text-muted-foreground transition-all hover:scale-102 active:scale-98"
            >
              Analyze Resume
            </button>
            <button
              onClick={() =>
                handleSendMessage(
                  "Audit my GitHub profile and calculate my GPI score",
                )
              }
              disabled={loading}
              className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 hover:border-brand-blue/20 rounded-xl text-[10px] font-black tracking-wider uppercase text-muted-foreground transition-all hover:scale-102 active:scale-98"
            >
              Audit GitHub
            </button>
            <button
              onClick={() =>
                handleSendMessage(
                  "Build a customized learning roadmap to get a Full-Stack Engineer job",
                )
              }
              disabled={loading}
              className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 hover:border-brand-blue/20 rounded-xl text-[10px] font-black tracking-wider uppercase text-muted-foreground transition-all hover:scale-102 active:scale-98"
            >
              Generate Roadmap
            </button>
            <button
              onClick={() =>
                handleSendMessage(
                  "Give me a mock interview question for a Backend Python Role",
                )
              }
              disabled={loading}
              className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 hover:border-brand-blue/20 rounded-xl text-[10px] font-black tracking-wider uppercase text-muted-foreground transition-all hover:scale-102 active:scale-98"
            >
              Mock Interview
            </button>
          </div>
        </div>

        {/* Right Column: Agent Swarm & Human-in-the-loop Approvals Queue */}
        <div className="lg:col-span-12 xl:col-span-4 space-y-10">
          {/* HITL Pending Approval Active Form */}
          <AnimatePresence mode="wait">
            {editingApprovalId && pendingApprovals.length > 0 ? (
              <motion.div
                key="approval-box"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-8 rounded-[2.5rem] bg-amber-500/5 border border-amber-500/20 shadow-xl space-y-6 relative overflow-hidden"
              >
                <div className="flex items-center gap-2.5 text-amber-500">
                  <Sparkles size={18} />
                  <h4 className="text-[10px] font-black uppercase tracking-widest leading-none pt-0.5">
                    Awaiting Recruiter Outreach Review
                  </h4>
                </div>

                <p className="text-xs font-bold text-muted-foreground leading-relaxed">
                  JobAgent finished generating personalized outreach copy for{" "}
                  <span className="text-foreground font-black">
                    {pendingApprovals[0].draft_content.company_name}
                  </span>
                  . Review and modify inline before approving.
                </p>

                <div className="space-y-4">
                  {/* LinkedIn Invitation */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Edit3 size={10} />
                      LinkedIn Note (Limit 300 Chars)
                    </label>
                    <textarea
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-brand-blue/40 rounded-xl p-4 min-h-[90px] resize-none outline-none text-xs font-medium leading-relaxed"
                      value={editLinkedin}
                      onChange={(e) => setEditLinkedin(e.target.value)}
                    />
                  </div>

                  {/* Cold Email Copy */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Edit3 size={10} />
                      Recruiter Email Body
                    </label>
                    <textarea
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-brand-blue/40 rounded-xl p-4 min-h-[160px] resize-none outline-none text-xs font-medium leading-relaxed"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <Button
                    disabled={resolvingApprovalId !== null}
                    onClick={() =>
                      handleApprovalAction(editingApprovalId, "modified")
                    }
                    className="w-full h-12 rounded-xl bg-foreground text-card-foreground font-black text-[10px] uppercase tracking-wider gap-2 cursor-pointer shadow-md border-0"
                  >
                    {resolvingApprovalId
                      ? "Sending decision..."
                      : "Approve & Submit Changes"}
                    <Check size={14} />
                  </Button>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      disabled={resolvingApprovalId !== null}
                      onClick={() =>
                        handleApprovalAction(editingApprovalId, "approved")
                      }
                      className="h-11 rounded-xl text-[10px] font-black uppercase tracking-wider text-emerald-600 border-emerald-200 bg-emerald-500/5 hover:bg-emerald-500/10 cursor-pointer"
                    >
                      Approve Original
                    </Button>
                    <Button
                      variant="outline"
                      disabled={resolvingApprovalId !== null}
                      onClick={() =>
                        handleApprovalAction(editingApprovalId, "rejected")
                      }
                      className="h-11 rounded-xl text-[10px] font-black uppercase tracking-wider text-red-600 border-red-200 bg-red-500/5 hover:bg-red-500/10 cursor-pointer"
                    >
                      Reject Draft
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="p-8 rounded-[2.5rem] bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 shadow-xs flex flex-col items-center text-center justify-center min-h-[220px]">
                <div className="w-12 h-12 rounded-2xl bg-card border border-border shadow-xs flex items-center justify-center text-slate-300 dark:text-slate-700 mb-4">
                  <CheckCircle size={22} />
                </div>
                <h5 className="font-display font-bold text-sm text-foreground mb-1">
                  Approvals Queue Clear
                </h5>
                <p className="text-[10px] font-bold text-muted-foreground max-w-[200px] leading-relaxed">
                  When agents generate outreach messages or recommendations,
                  they will halt here for your check.
                </p>
              </div>
            )}
          </AnimatePresence>

          {/* Swarm Status Panel */}
          <div className="p-8 rounded-[2.5rem] bg-card border border-border shadow-md space-y-6">
            <h4 className="font-display font-bold text-lg text-foreground tracking-tight">
              Swarm Directory
            </h4>
            <div className="space-y-4">
              {AGENT_INFO.map((agent) => {
                const AgentIcon = agent.icon;
                const isActive = activeAgent === agent.name;
                return (
                  <div
                    key={agent.name}
                    className={`p-4 rounded-2xl border transition-all duration-300 flex items-start gap-4 ${
                      isActive
                        ? "bg-brand-blue/5 border-brand-blue/30 shadow-xs"
                        : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/80"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${agent.color}`}
                    >
                      <AgentIcon size={18} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-foreground">
                          {agent.name}
                        </span>
                        {isActive && (
                          <span className="text-[8px] font-black uppercase tracking-wider text-amber-500 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] font-bold text-muted-foreground leading-normal">
                        {agent.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
