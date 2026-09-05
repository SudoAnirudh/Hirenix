"use client";

import React, { useState } from "react";
import {
  Search,
  Filter,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  MapPin,
  DollarSign,
  Building2,
  Sparkles,
  ChevronRight,
  Zap,
  Bookmark,
  FileText,
  Mic,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import Link from "next/link";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  score: number;
  postedDate: string;
  requiredSkills: string[];
  candidateSkills: { name: string; matched: boolean }[];
  description: string;
}

export default function JobDiscoveryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const jobs: Job[] = [
    {
      id: "job-1",
      title: "Senior AI Infrastructure Engineer",
      company: "Anthropic",
      location: "San Francisco, CA (Hybrid)",
      type: "Full-time",
      salary: "$190,000 - $240,000",
      score: 92,
      postedDate: "2 days ago",
      requiredSkills: [
        "Python",
        "FastAPI",
        "PyTorch",
        "RAG Architecture",
        "AWS Bedrock",
        "Docker",
      ],
      candidateSkills: [
        { name: "Python", matched: true },
        { name: "FastAPI", matched: true },
        { name: "RAG Architecture", matched: true },
        { name: "Docker", matched: true },
        { name: "PyTorch", matched: true },
        { name: "AWS Bedrock", matched: false },
      ],
      description:
        "Building production LLM inference pipelines, fine-tuning infrastructure, and vector search systems at scale.",
    },
    {
      id: "job-2",
      title: "Backend Platform Engineer",
      company: "Stripe",
      location: "Remote (US/Canada)",
      type: "Full-time",
      salary: "$180,000 - $220,000",
      score: 87,
      postedDate: "1 day ago",
      requiredSkills: [
        "Go",
        "PostgreSQL",
        "Kafka",
        "Docker",
        "Kubernetes",
        "gRPC",
      ],
      candidateSkills: [
        { name: "Go", matched: true },
        { name: "PostgreSQL", matched: true },
        { name: "Docker", matched: true },
        { name: "Kafka", matched: true },
        { name: "Kubernetes", matched: false },
        { name: "gRPC", matched: false },
      ],
      description:
        "Architect high-throughput payment processing APIs and distributed database storage primitives.",
    },
    {
      id: "job-3",
      title: "LLM Systems Engineer",
      company: "Scale AI",
      location: "New York, NY",
      type: "Full-time",
      salary: "$175,000 - $215,000",
      score: 84,
      postedDate: "3 days ago",
      requiredSkills: [
        "Python",
        "Vector Databases",
        "LangChain",
        "Ray",
        "AWS",
        "FastAPI",
      ],
      candidateSkills: [
        { name: "Python", matched: true },
        { name: "FastAPI", matched: true },
        { name: "Vector Databases", matched: true },
        { name: "LangChain", matched: true },
        { name: "AWS", matched: false },
        { name: "Ray", matched: false },
      ],
      description:
        "Scale automated data labeling agent loops and vector retrieval models for enterprise foundation models.",
    },
  ];

  const activeJob = selectedJob || jobs[0];

  const filteredJobs = jobs.filter((j) => {
    const matchesQuery =
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.requiredSkills.some((s) =>
        s.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    return matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-xl bg-card border border-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-primary uppercase tracking-wider">
            <Briefcase size={14} /> Recruiting Intelligence
          </div>
          <h1 className="text-2xl font-bold font-heading text-foreground mt-1">
            Job Discovery & Compatibility Matrix
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Search verified positions and evaluate side-by-side technical skill
            alignment.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter roles, companies, or tech stack (e.g. 'FastAPI', 'Anthropic', 'Go')..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-card border border-border rounded-lg focus:outline-none focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm">
            <SlidersHorizontal size={14} className="mr-1.5" /> Filter Parameters
          </Button>
        </div>
      </div>

      {/* Split Workstation View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Job Search Table/List */}
        <div className="lg:col-span-6 space-y-3">
          <div className="text-xs font-mono uppercase text-muted-foreground font-bold px-1">
            Matched Openings ({filteredJobs.length})
          </div>

          {filteredJobs.map((job) => {
            const isSelected = activeJob.id === job.id;
            return (
              <div
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-xs"
                    : "border-border bg-card hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-sm text-foreground">
                      {job.title}
                    </h3>
                    <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                      <span className="font-medium text-foreground">
                        {job.company}
                      </span>{" "}
                      • <span>{job.location}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                    {job.score}% Match
                  </span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {job.requiredSkills.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded bg-muted text-[10px] font-mono text-foreground"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/60">
                  <span>{job.salary}</span>
                  <span>{job.postedDate}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Compatibility Matrix Detail Workstation */}
        <div className="lg:col-span-6 space-y-6">
          <Card className="border-primary/30">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-lg font-bold">
                    {activeJob.title}
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    {activeJob.company} • {activeJob.location}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded font-mono font-bold text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {activeJob.score}% Alignment
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <Link href="/dashboard/career/resume">
                  <Button size="sm" variant="primary">
                    <FileText size={14} className="mr-1.5" /> Tailor Resume for
                    Role
                  </Button>
                </Link>
                <Link href="/dashboard/preparation/interviews">
                  <Button size="sm" variant="outline">
                    <Mic size={14} className="mr-1.5" /> Practice Role Interview
                  </Button>
                </Link>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 text-xs">
              {/* Description */}
              <div className="space-y-1">
                <div className="font-mono text-[10px] font-bold uppercase text-muted-foreground">
                  Role Overview
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {activeJob.description}
                </p>
              </div>

              {/* Candidate vs Job Matrix */}
              <div className="space-y-3">
                <div className="font-mono text-[10px] font-bold uppercase text-muted-foreground flex justify-between">
                  <span>Skill Requirement Alignment</span>
                  <span>Candidate Status</span>
                </div>

                <div className="divide-y divide-border border border-border rounded-lg overflow-hidden bg-card">
                  {activeJob.candidateSkills.map((sk) => (
                    <div
                      key={sk.name}
                      className="flex items-center justify-between p-3 text-xs"
                    >
                      <span className="font-medium text-foreground">
                        {sk.name}
                      </span>
                      {sk.matched ? (
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 size={13} /> Matched in Resume
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-amber-600 dark:text-amber-400">
                          <AlertCircle size={13} /> Missing Gap
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Recommendation */}
              <div className="p-4 rounded-lg bg-muted/60 border border-border space-y-2">
                <div className="font-mono text-[10px] font-bold uppercase text-primary flex items-center gap-1.5">
                  <Zap size={12} /> Hirenix Analysis Insight
                </div>
                <p className="text-muted-foreground leading-relaxed text-[11px]">
                  You have matched 5 out of 6 core technical requirements.
                  Adding &quot;AWS Bedrock&quot; or hands-on cloud deployment
                  experience will increase your score to 96%+.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
