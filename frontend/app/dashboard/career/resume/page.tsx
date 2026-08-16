"use client";

import { useState, useRef, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import { sanitize } from "@/lib/sanitize";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  LayoutTemplate,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  User,
  Briefcase,
  GraduationCap,
  Code,
  FolderOpen,
  Award,
  FileText,
  Star,
  GripVertical,
  Activity,
  CheckCircle,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import ResumeUploader from "@/components/ResumeUploader";
import ScoreCard from "@/components/ScoreCard";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExpEntry {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string;
}
interface EduEntry {
  id: string;
  degree: string;
  major: string;
  school: string;
  location: string;
  graduationDate: string;
  gpa: string;
  honors: string;
}
interface ProjEntry {
  id: string;
  name: string;
  tech: string;
  link: string;
  bullets: string;
}
interface AchievEntry {
  id: string;
  title: string;
  date: string;
  description: string;
}
interface ResumeData {
  personal: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
    portfolio: string;
  };
  summary: string;
  experience: ExpEntry[];
  education: EduEntry[];
  projects: ProjEntry[];
  achievements: AchievEntry[];
  skills: {
    languages: string;
    frameworks: string;
    tools: string;
    soft: string;
  };
  certifications: string;
}

type SectionId =
  | "summary"
  | "experience"
  | "education"
  | "projects"
  | "achievements"
  | "skills"
  | "certs";

const DEFAULT_ORDER: SectionId[] = [
  "summary",
  "experience",
  "education",
  "projects",
  "achievements",
  "skills",
  "certs",
];

// ─── ID helper ────────────────────────────────────────────────────────────────
let _n = 0;
const uid = () => `r${++_n}${Math.random().toString(36).slice(2, 6)}`;

const mkExp = (): ExpEntry => ({
  id: uid(),
  title: "",
  company: "",
  location: "",
  startDate: "",
  endDate: "",
  current: false,
  bullets: "",
});
const mkEdu = (): EduEntry => ({
  id: uid(),
  degree: "",
  major: "",
  school: "",
  location: "",
  graduationDate: "",
  gpa: "",
  honors: "",
});
const mkProj = (): ProjEntry => ({
  id: uid(),
  name: "",
  tech: "",
  link: "",
  bullets: "",
});
const mkAchiev = (): AchievEntry => ({
  id: uid(),
  title: "",
  date: "",
  description: "",
});

const DEFAULT: ResumeData = {
  personal: {
    name: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    portfolio: "",
  },
  summary: "",
  experience: [mkExp()],
  education: [mkEdu()],
  projects: [mkProj()],
  achievements: [mkAchiev()],
  skills: { languages: "", frameworks: "", tools: "", soft: "" },
  certifications: "",
};

// ─── HTML Preview Generator ──────────────────────────────────────────────────

function toBullets(text: string): string {
  return text
    .split("\n")
    .filter((l) => l.trim())
    .map(
      (l) => `<li style="margin:2px 0;">${l.replace(/^[•\-\*]\s*/, "")}</li>`,
    )
    .join("");
}
const stripHttp = (u: string) => u.replace(/https?:\/\/(www\.)?/, "");

function sec(title: string, body: string) {
  return `<h2 style="font-size:9.5pt;font-weight:800;text-transform:uppercase;
 letter-spacing:.9px;border-bottom:1.5px solid #111;
 padding-bottom:2px;margin:14px 0 5px;">${title}</h2>${body}`;
}

function generateHTML(d: ResumeData, order: SectionId[]): string {
  const p = d.personal;
  const contact = [
    p.location,
    p.phone && `<a href="tel:${p.phone}">${p.phone}</a>`,
    p.email && `<a href="mailto:${p.email}">${p.email}</a>`,
    p.linkedin && `<a href="${p.linkedin}">${stripHttp(p.linkedin)}</a>`,
    p.github && `<a href="${p.github}">${stripHttp(p.github)}</a>`,
    p.portfolio && `<a href="${p.portfolio}">${stripHttp(p.portfolio)}</a>`,
  ]
    .filter(Boolean)
    .join(" &nbsp;|&nbsp;");

  const blocks: Record<SectionId, string> = {
    summary: d.summary
      ? sec("Summary", `<p style="margin:0;font-size:10pt;">${d.summary}</p>`)
      : "",

    experience: d.experience.filter((e) => e.title || e.company).length
      ? sec(
          "Experience",
          d.experience
            .filter((e) => e.title || e.company)
            .map(
              (e) => `
 <div style="margin-bottom:10px;">
 <div style="display:flex;justify-content:space-between;align-items:baseline;">
 <strong style="font-size:10.5pt;">${e.title || "[Job Title]"}</strong>
 <span style="font-size:9pt;color:#555;font-style:italic;">${[e.startDate, e.current ? "Present" : e.endDate].filter(Boolean).join(" –")}</span>
 </div>
 <div style="font-size:9.5pt;color:#555;margin-bottom:2px;">${e.company || "[Company]"}${e.location ? " &mdash;" + e.location : ""}</div>
 ${e.bullets ? `<ul style="margin:3px 0 0;padding-left:17px;font-size:10pt;">${toBullets(e.bullets)}</ul>` : ""}
 </div>`,
            )
            .join(""),
        )
      : "",

    education: d.education.filter((e) => e.school || e.degree).length
      ? sec(
          "Education",
          d.education
            .filter((e) => e.school || e.degree)
            .map(
              (e) => `
 <div style="margin-bottom:8px;">
 <div style="display:flex;justify-content:space-between;align-items:baseline;">
 <strong>${e.degree || "[Degree]"}${e.major ? " in" + e.major : ""}</strong>
 <span style="font-size:9pt;color:#555;font-style:italic;">${e.graduationDate}</span>
 </div>
 <div style="font-size:9.5pt;color:#555;">${e.school || "[School]"}${e.location ? "," + e.location : ""}${e.gpa ? " &nbsp;|&nbsp; GPA:" + e.gpa : ""}${e.honors ? " &nbsp;|&nbsp;" + e.honors : ""}</div>
 </div>`,
            )
            .join(""),
        )
      : "",

    projects: d.projects.filter((p) => p.name).length
      ? sec(
          "Projects",
          d.projects
            .filter((p) => p.name)
            .map(
              (p) => `
 <div style="margin-bottom:8px;">
 <div>
 <strong>${p.name}</strong>
 ${p.tech ? `<span style="font-size:9.5pt;color:#555;"> | ${p.tech}</span>` : ""}
 ${p.link ? `<a href="${p.link}" style="font-size:9pt;color:#0b7c76;margin-left:6px;">${stripHttp(p.link)}</a>` : ""}
 </div>
 ${p.bullets ? `<ul style="margin:3px 0 0;padding-left:17px;font-size:10pt;">${toBullets(p.bullets)}</ul>` : ""}
 </div>`,
            )
            .join(""),
        )
      : "",

    achievements: d.achievements.filter((a) => a.title).length
      ? sec(
          "Achievements & Awards",
          d.achievements
            .filter((a) => a.title)
            .map(
              (a) => `
 <div style="margin-bottom:6px;">
 <div style="display:flex;justify-content:space-between;align-items:baseline;">
 <strong>${a.title}</strong>
 <span style="font-size:9pt;color:#555;font-style:italic;">${a.date}</span>
 </div>
 ${a.description ? `<p style="margin:2px 0 0;font-size:9.5pt;color:#444;">${a.description}</p>` : ""}
 </div>`,
            )
            .join(""),
        )
      : "",

    skills:
      d.skills.languages ||
      d.skills.frameworks ||
      d.skills.tools ||
      d.skills.soft
        ? sec(
            "Skills",
            `
 <table style="width:100%;border-collapse:collapse;font-size:9.5pt;margin-top:2px;">
 ${
   d.skills.languages
     ? `<tr><td style="width:100px;font-weight:bold;padding:3px 0;vertical-align:top;">Languages:</td><td style="padding:3px 0;">${d.skills.languages}</td></tr>`
     : ""
 }
 ${
   d.skills.frameworks
     ? `<tr><td style="font-weight:bold;padding:3px 0;vertical-align:top;">Frameworks:</td><td style="padding:3px 0;">${d.skills.frameworks}</td></tr>`
     : ""
 }
 ${
   d.skills.tools
     ? `<tr><td style="font-weight:bold;padding:3px 0;vertical-align:top;">Tools / Databases:</td><td style="padding:3px 0;">${d.skills.tools}</td></tr>`
     : ""
 }
 ${
   d.skills.soft
     ? `<tr><td style="font-weight:bold;padding:3px 0;vertical-align:top;">Soft Skills:</td><td style="padding:3px 0;">${d.skills.soft}</td></tr>`
     : ""
 }
 </table>`,
          )
        : "",

    certs: d.certifications
      ? sec(
          "Certifications",
          `<ul style="margin:3px 0 0;padding-left:17px;font-size:9.5pt;">${toBullets(d.certifications)}</ul>`,
        )
      : "",
  };

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
body {
  font-family: 'Inter', sans-serif;
  color: #111111;
  background: #ffffff;
  line-height: 1.35;
  margin: 0;
  padding: 24px 32px;
}
a { color: #111111; text-decoration: none; }
h1 { margin: 0 0 4px; font-size: 18pt; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; text-align: center; }
p, li { font-size: 9.5pt; color: #222222; }
</style>
</head>
<body>
  <h1>${p.name || "[Your Name]"}</h1>
  <div style="text-align:center;font-size:8.5pt;color:#555;margin-bottom:12px;">${contact}</div>
  ${order.map((id) => blocks[id]).join("")}
</body>
</html>`;
}

// ─── Mini Components ─────────────────────────────────────────────────────────

function Field({
  label,
  value,
  onChange,
  placeholder = "",
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <input
        type="text"
        className="input-base py-1.5 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:border-indigo-500 w-full"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function BulletsField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1 w-full mt-2">
      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex justify-between">
        <span>Roles & Achievements</span>
        <span className="opacity-60 lowercase font-medium">
          One bullet per line
        </span>
      </label>
      <textarea
        className="input-base py-1.5 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-xl resize-none w-full"
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="• Developed backend microservices using FastAPI, reducing response time by 30%&#10;• Implemented automated CI/CD deployments on AWS"
      />
    </div>
  );
}

function AddBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center gap-1.5 py-2 border-2 border-dashed border-border hover:border-indigo-500 rounded-xl text-xs font-bold text-muted-foreground hover:text-indigo-500 transition-colors mt-3"
    >
      <Plus className="w-4 h-4" /> {label}
    </button>
  );
}

function AccordionSection({
  sectionId,
  icon,
  title,
  open,
  onToggle,
  children,
  draggable = false,
  isDragOver = false,
  onDragStart,
  onDragOver,
  onDrop,
}: {
  sectionId: string;
  icon: React.ReactNode;
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  draggable?: boolean;
  isDragOver?: boolean;
  onDragStart?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: () => void;
}) {
  return (
    <div
      draggable={draggable}
      onDragStart={draggable ? onDragStart : undefined}
      onDragOver={draggable ? onDragOver : undefined}
      onDrop={draggable ? onDrop : undefined}
      className={`border-b border-border transition-colors ${
        isDragOver ? "bg-indigo-50/20 dark:bg-indigo-950/10" : ""
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3 select-none">
        <div
          onClick={onToggle}
          className="flex items-center gap-2.5 cursor-pointer flex-1"
        >
          <div className="text-muted-foreground">{icon}</div>
          <span className="text-xs font-bold uppercase tracking-wider text-foreground">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {draggable && (
            <div className="cursor-grab p-1 text-muted-foreground opacity-45 hover:opacity-100 active:cursor-grabbing">
              <GripVertical className="w-3.5 h-3.5" />
            </div>
          )}
          <button onClick={onToggle} className="p-1 text-muted-foreground">
            {open ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-slate-50/50 dark:bg-slate-900/30 border-t border-border"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── ATS Scanner Types ────────────────────────────────────────────────────────

interface Section {
  section_type: string;
  content?: string;
}

interface BulletRewrite {
  original_bullet: string;
  rewritten_bullet: string;
  rationale: string;
}

interface AnalysisResult {
  resume_id?: string;
  ats_score: number;
  ats_breakdown: Record<string, number>;
  sections: Section[];
  feedback: string[];
  xyz_score?: number;
  multi_aspect_scores?: Record<string, number>;
  gap_analysis?: string[];
  synthetic_bullet_rewrites?: BulletRewrite[];
}

// ─── Main Consolidated Component ────────────────────────────────────────────────

export default function ResumeWorkspacePage() {
  const [activeTab, setActiveTab] = useState<"builder" | "scanner">("builder");

  // Builder States
  const [data, setData] = useState<ResumeData>(DEFAULT);
  const [sectionOrder, setSectionOrder] = useState<SectionId[]>(DEFAULT_ORDER);
  const [open, setOpen] = useState<Record<string, boolean>>({
    personal: true,
    summary: true,
    experience: true,
    education: false,
    projects: false,
    achievements: false,
    skills: false,
    certs: false,
  });

  const dragFrom = useRef<SectionId | null>(null);
  const dragOver = useRef<SectionId | null>(null);
  const [dragOverId, setDragOverId] = useState<SectionId | null>(null);

  const previewRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: previewRef,
    documentTitle: "Resume",
  });

  const toggle = (key: string) => setOpen((o) => ({ ...o, [key]: !o[key] }));

  // Drag-and-Drop handlers
  const onDragStart = (id: SectionId) => {
    dragFrom.current = id;
  };
  const onDragOver = (id: SectionId) => (e: React.DragEvent) => {
    e.preventDefault();
    dragOver.current = id;
    setDragOverId(id);
  };
  const onDrop = (id: SectionId) => () => {
    if (!dragFrom.current || dragFrom.current === id) {
      setDragOverId(null);
      return;
    }
    const newOrder = [...sectionOrder];
    const fromIdx = newOrder.indexOf(dragFrom.current);
    const toIdx = newOrder.indexOf(id);
    newOrder.splice(fromIdx, 1);
    newOrder.splice(toIdx, 0, dragFrom.current);
    setSectionOrder(newOrder);
    dragFrom.current = null;
    dragOver.current = null;
    setDragOverId(null);
  };

  // Data setters
  const setP = (f: keyof ResumeData["personal"], v: string) =>
    setData((d) => ({ ...d, personal: { ...d.personal, [f]: v } }));
  const setSkill = (f: keyof ResumeData["skills"], v: string) =>
    setData((d) => ({ ...d, skills: { ...d.skills, [f]: v } }));
  const setExp = (id: string, f: keyof ExpEntry, v: string | boolean) =>
    setData((d) => ({
      ...d,
      experience: d.experience.map((e) => (e.id === id ? { ...e, [f]: v } : e)),
    }));
  const setEdu = (id: string, f: keyof EduEntry, v: string) =>
    setData((d) => ({
      ...d,
      education: d.education.map((e) => (e.id === id ? { ...e, [f]: v } : e)),
    }));
  const setProj = (id: string, f: keyof ProjEntry, v: string) =>
    setData((d) => ({
      ...d,
      projects: d.projects.map((p) => (p.id === id ? { ...p, [f]: v } : p)),
    }));
  const setAchiev = (id: string, f: keyof AchievEntry, v: string) =>
    setData((d) => ({
      ...d,
      achievements: d.achievements.map((a) =>
        a.id === id ? { ...a, [f]: v } : a,
      ),
    }));

  const sectionMeta: Record<
    SectionId,
    { icon: React.ReactNode; title: string }
  > = {
    summary: { icon: <FileText className="w-4 h-4" />, title: "Summary" },
    experience: {
      icon: <Briefcase className="w-4 h-4" />,
      title: "Experience",
    },
    education: {
      icon: <GraduationCap className="w-4 h-4" />,
      title: "Education",
    },
    projects: { icon: <FolderOpen className="w-4 h-4" />, title: "Projects" },
    achievements: {
      icon: <Star className="w-4 h-4" />,
      title: "Achievements & Awards",
    },
    skills: { icon: <Code className="w-4 h-4" />, title: "Technical Skills" },
    certs: { icon: <Award className="w-4 h-4" />, title: "Certifications" },
  };

  const sectionContent: Record<SectionId, React.ReactNode> = {
    summary: (
      <div className="p-4">
        <label className="text-[10px] font-semibold uppercase tracking-wide mb-1 block text-muted-foreground">
          2–3 sentence overview
        </label>
        <textarea
          className="input-base text-xs resize-none w-full"
          rows={4}
          value={data.summary}
          onChange={(e) => setData((d) => ({ ...d, summary: e.target.value }))}
          placeholder="Results-driven software engineer with 4+ years building scalable web applications. Proven track record of reducing latency by 40%."
        />
      </div>
    ),

    experience: (
      <>
        {data.experience.map((exp, i) => (
          <div
            key={exp.id}
            className="p-4 space-y-3 border-t border-border"
            style={{
              background:
                i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Position {i + 1}
              </span>
              {data.experience.length > 1 && (
                <button
                  onClick={() =>
                    setData((d) => ({
                      ...d,
                      experience: d.experience.filter((e) => e.id !== exp.id),
                    }))
                  }
                  className="p-1 rounded transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Job Title"
                value={exp.title}
                onChange={(v) => setExp(exp.id, "title", v)}
                placeholder="Software Engineer"
              />
              <Field
                label="Company"
                value={exp.company}
                onChange={(v) => setExp(exp.id, "company", v)}
                placeholder="Acme Corp"
              />
            </div>
            <Field
              label="Location"
              value={exp.location}
              onChange={(v) => setExp(exp.id, "location", v)}
              placeholder="New York, NY (or Remote)"
            />
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Start Date"
                value={exp.startDate}
                onChange={(v) => setExp(exp.id, "startDate", v)}
                placeholder="Jun 2022"
              />
              <div>
                <Field
                  label="End Date"
                  value={exp.current ? "Present" : exp.endDate}
                  onChange={(v) => setExp(exp.id, "endDate", v)}
                  placeholder="May 2024"
                  className={
                    exp.current ? "opacity-40 pointer-events-none" : ""
                  }
                />
                <label className="flex items-center gap-1.5 mt-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={exp.current}
                    onChange={(e) =>
                      setExp(exp.id, "current", e.target.checked)
                    }
                  />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">
                    Currently working here
                  </span>
                </label>
              </div>
            </div>
            <BulletsField
              value={exp.bullets}
              onChange={(v) => setExp(exp.id, "bullets", v)}
            />
          </div>
        ))}
        <AddBtn
          label="Add Experience"
          onClick={() =>
            setData((d) => ({ ...d, experience: [...d.experience, mkExp()] }))
          }
        />
      </>
    ),

    education: (
      <>
        {data.education.map((edu, i) => (
          <div
            key={edu.id}
            className="p-4 space-y-3 border-t border-border"
            style={{
              background:
                i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Entry {i + 1}
              </span>
              {data.education.length > 1 && (
                <button
                  onClick={() =>
                    setData((d) => ({
                      ...d,
                      education: d.education.filter((e) => e.id !== edu.id),
                    }))
                  }
                  className="p-1 rounded transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Degree"
                value={edu.degree}
                onChange={(v) => setEdu(edu.id, "degree", v)}
                placeholder="B.S."
              />
              <Field
                label="Major / Field"
                value={edu.major}
                onChange={(v) => setEdu(edu.id, "major", v)}
                placeholder="Computer Science"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="School"
                value={edu.school}
                onChange={(v) => setEdu(edu.id, "school", v)}
                placeholder="MIT"
              />
              <Field
                label="Location"
                value={edu.location}
                onChange={(v) => setEdu(edu.id, "location", v)}
                placeholder="Cambridge, MA"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Graduation Date"
                value={edu.graduationDate}
                onChange={(v) => setEdu(edu.id, "graduationDate", v)}
                placeholder="May 2024"
              />
              <Field
                label="GPA (optional)"
                value={edu.gpa}
                onChange={(v) => setEdu(edu.id, "gpa", v)}
                placeholder="3.9 / 4.0"
              />
            </div>
            <Field
              label="Honors / Awards (optional)"
              value={edu.honors}
              onChange={(v) => setEdu(edu.id, "honors", v)}
              placeholder="Dean's List, Magna Cum Laude"
            />
          </div>
        ))}
        <AddBtn
          label="Add Education"
          onClick={() =>
            setData((d) => ({ ...d, education: [...d.education, mkEdu()] }))
          }
        />
      </>
    ),

    projects: (
      <>
        {data.projects.map((proj, i) => (
          <div
            key={proj.id}
            className="p-4 space-y-3 border-t border-border"
            style={{
              background:
                i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Project {i + 1}
              </span>
              {data.projects.length > 1 && (
                <button
                  onClick={() =>
                    setData((d) => ({
                      ...d,
                      projects: d.projects.filter((p) => p.id !== proj.id),
                    }))
                  }
                  className="p-1 rounded transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Project Name"
                value={proj.name}
                onChange={(v) => setProj(proj.id, "name", v)}
                placeholder="E-Commerce Engine"
              />
              <Field
                label="Tech Stack"
                value={proj.tech}
                onChange={(v) => setProj(proj.id, "tech", v)}
                placeholder="React, Next.js, Go"
              />
            </div>
            <Field
              label="Project URL"
              value={proj.link}
              onChange={(v) => setProj(proj.id, "link", v)}
              placeholder="https://myproject.com"
            />
            <BulletsField
              value={proj.bullets}
              onChange={(v) => setProj(proj.id, "bullets", v)}
            />
          </div>
        ))}
        <AddBtn
          label="Add Project"
          onClick={() =>
            setData((d) => ({ ...d, projects: [...d.projects, mkProj()] }))
          }
        />
      </>
    ),

    achievements: (
      <>
        {data.achievements.map((ach, i) => (
          <div
            key={ach.id}
            className="p-4 space-y-3 border-t border-border"
            style={{
              background:
                i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Achievement {i + 1}
              </span>
              {data.achievements.length > 1 && (
                <button
                  onClick={() =>
                    setData((d) => ({
                      ...d,
                      achievements: d.achievements.filter(
                        (a) => a.id !== ach.id,
                      ),
                    }))
                  }
                  className="p-1 rounded transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Title"
                value={ach.title}
                onChange={(v) => setAchiev(ach.id, "title", v)}
                placeholder="1st Place Hackathon"
              />
              <Field
                label="Date"
                value={ach.date}
                onChange={(v) => setAchiev(ach.id, "date", v)}
                placeholder="Oct 2023"
              />
            </div>
            <Field
              label="Description (optional)"
              value={ach.description}
              onChange={(v) => setAchiev(ach.id, "description", v)}
              placeholder="Competed against 100+ devs to build an automated portfolio analysis pipeline."
            />
          </div>
        ))}
        <AddBtn
          label="Add Achievement"
          onClick={() =>
            setData((d) => ({
              ...d,
              achievements: [...d.achievements, mkAchiev()],
            }))
          }
        />
      </>
    ),

    skills: (
      <div className="p-4 space-y-3">
        <Field
          label="Languages"
          value={data.skills.languages}
          onChange={(v) => setSkill("languages", v)}
          placeholder="TypeScript, Python, Go, SQL"
        />
        <Field
          label="Frameworks / Libraries"
          value={data.skills.frameworks}
          onChange={(v) => setSkill("frameworks", v)}
          placeholder="React, Next.js, FastAPI, Node.js"
        />
        <Field
          label="Tools / Databases"
          value={data.skills.tools}
          onChange={(v) => setSkill("tools", v)}
          placeholder="PostgreSQL, Redis, Docker, Git"
        />
        <Field
          label="Soft Skills"
          value={data.skills.soft}
          onChange={(v) => setSkill("soft", v)}
          placeholder="Technical Leadership, System Architecture"
        />
      </div>
    ),

    certs: (
      <div className="p-4">
        <BulletsField
          value={data.certifications}
          onChange={(v) => setData((d) => ({ ...d, certifications: v }))}
        />
      </div>
    ),
  };

  // ATS Scanner States
  const [scannerTab, setScannerTab] = useState<
    "breakdown" | "rewrites" | "gaps" | "sections"
  >("breakdown");
  const [scannerResult, setScannerResult] = useState<AnalysisResult | null>(
    () => {
      if (typeof window === "undefined") return null;
      const latest = localStorage.getItem("latest_resume");
      if (!latest) return null;
      try {
        return JSON.parse(latest) as AnalysisResult;
      } catch {
        return null;
      }
    },
  );

  return (
    <div className="animate-fade-up w-full flex flex-col gap-6">
      {/* Title & Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-4 gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold font-heading text-foreground">
            Resume Workspace
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Consolidated portal to build professional resumes and run ATS
            diagnostic checks.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-50 dark:bg-slate-900 border border-border p-1 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab("builder")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "builder"
                ? "bg-indigo-500 text-white shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutTemplate className="w-4 h-4" /> Resume Builder
          </button>
          <button
            onClick={() => setActiveTab("scanner")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "scanner"
                ? "bg-indigo-500 text-white shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Activity className="w-4 h-4" /> ATS Scanner
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === "builder" ? (
        <div className="flex flex-col xl:flex-row border border-border rounded-3xl overflow-hidden bg-card/45 shadow-sm min-h-[680px]">
          {/* Left panel: Form editor */}
          <div className="w-full xl:w-[420px] shrink-0 border-b xl:border-b-0 xl:border-r border-border flex flex-col overflow-y-auto max-h-[680px] custom-scrollbar bg-slate-50/20 dark:bg-slate-900/10">
            <AccordionSection
              sectionId="personal"
              icon={<User className="w-4 h-4" />}
              title="Personal Information"
              open={open.personal}
              onToggle={() => toggle("personal")}
            >
              <div className="p-4 space-y-3">
                <Field
                  label="Full Name"
                  value={data.personal.name}
                  onChange={(v) => setP("name", v)}
                  placeholder="Jane Smith"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label="Email"
                    value={data.personal.email}
                    onChange={(v) => setP("email", v)}
                    placeholder="jane@email.com"
                  />
                  <Field
                    label="Phone"
                    value={data.personal.phone}
                    onChange={(v) => setP("phone", v)}
                    placeholder="+1 555-123-4567"
                  />
                </div>
                <Field
                  label="Location"
                  value={data.personal.location}
                  onChange={(v) => setP("location", v)}
                  placeholder="San Francisco, CA"
                />
                <Field
                  label="LinkedIn URL"
                  value={data.personal.linkedin}
                  onChange={(v) => setP("linkedin", v)}
                  placeholder="https://linkedin.com/in/janedoe"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label="GitHub URL"
                    value={data.personal.github}
                    onChange={(v) => setP("github", v)}
                    placeholder="https://github.com/jane"
                  />
                  <Field
                    label="Portfolio / Website"
                    value={data.personal.portfolio}
                    onChange={(v) => setP("portfolio", v)}
                    placeholder="https://jane.dev"
                  />
                </div>
              </div>
            </AccordionSection>

            {sectionOrder.map((id) => {
              const meta = sectionMeta[id];
              return (
                <AccordionSection
                  key={id}
                  sectionId={id}
                  icon={meta.icon}
                  title={meta.title}
                  open={!!open[id]}
                  onToggle={() => toggle(id)}
                  draggable
                  isDragOver={dragOverId === id}
                  onDragStart={() => onDragStart(id)}
                  onDragOver={onDragOver(id)}
                  onDrop={onDrop(id)}
                >
                  {sectionContent[id]}
                </AccordionSection>
              );
            })}
          </div>

          {/* Right panel: A4 Preview */}
          <div className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-950 p-6 min-h-[680px]">
            <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4 shrink-0">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Document Preview (A4 Formatter)
              </span>
              <button
                onClick={() => handlePrint()}
                className="btn-primary flex items-center gap-1.5 py-1.5 px-3 text-xs"
              >
                <Download className="w-3.5 h-3.5" /> Print / Export PDF
              </button>
            </div>
            <div className="flex-1 overflow-y-auto flex justify-center">
              <div
                ref={previewRef}
                className="bg-white text-black w-full max-w-[210mm] min-h-[297mm] p-8 shadow-premium rounded-sm"
                dangerouslySetInnerHTML={{
                  __html: sanitize(generateHTML(data, sectionOrder)),
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-up">
          {/* Uploader Left */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-4">
                ATS Document Scan
              </h3>
              <ResumeUploader
                onResult={(res) => {
                  const parsed = res as AnalysisResult;
                  setScannerResult(parsed);
                  localStorage.setItem("latest_resume", JSON.stringify(parsed));
                }}
              />
            </div>

            {scannerResult && (
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>

                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg
                    className="w-full h-full transform -rotate-90"
                    viewBox="0 0 100 100"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="44"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-slate-100 dark:text-slate-800"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="44"
                      fill="none"
                      stroke="var(--primary)"
                      strokeWidth="8"
                      strokeDasharray="276.4"
                      strokeDashoffset={
                        276.4 - (276.4 * scannerResult.ats_score) / 100
                      }
                      className="transition-all duration-1000 ease-out text-primary"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="font-heading text-4xl font-extrabold text-primary leading-none">
                      {scannerResult.ats_score}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">
                      {scannerResult.ats_score >= 80
                        ? "Premium Fit"
                        : scannerResult.ats_score >= 60
                          ? "Strong Fit"
                          : "Needs Review"}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 w-full">
                  <p className="text-xs font-bold text-foreground">
                    ATS Compliance Index
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Based on formatting audits, keyword recency, XYZ statements,
                    and parser extraction.
                  </p>
                </div>
              </div>
            )}

            {/* Structure Checklist */}
            {scannerResult && (
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Formatting & structure audit
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      label: "Contact Details",
                      status:
                        scannerResult.ats_breakdown?.formatting_quality >= 70,
                      desc: "Email, phone & links detected",
                    },
                    {
                      label: "XYZ Formulation",
                      status: (scannerResult.xyz_score || 0) >= 60,
                      desc: "Quantitative accomplishments parsed",
                    },
                    {
                      label: "Core sections",
                      status: scannerResult.sections?.length >= 4,
                      desc: "All mandatory sections detected",
                    },
                    {
                      label: "Recency check",
                      status:
                        scannerResult.ats_breakdown?.skill_recency_score >= 70,
                      desc: "Active experience aligns with targets",
                    },
                  ].map((chk, idx) => (
                    <div key={idx} className="flex gap-3 items-start text-xs">
                      {chk.status ? (
                        <CheckCircle
                          size={16}
                          className="text-emerald-500 shrink-0 mt-0.5"
                        />
                      ) : (
                        <AlertCircle
                          size={16}
                          className="text-amber-500 shrink-0 mt-0.5"
                        />
                      )}
                      <div>
                        <p className="font-bold text-foreground leading-none">
                          {chk.label}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {chk.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Feedback details Right */}
          <div className="lg:col-span-8 space-y-6">
            {!scannerResult ? (
              <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border bg-card rounded-2xl h-80">
                <FileText className="w-12 h-12 text-muted-foreground mb-4 opacity-40" />
                <h3 className="font-bold text-sm text-foreground">
                  No analysis logged
                </h3>
                <p className="text-xs text-muted-foreground max-w-xs mt-1">
                  Upload your resume PDF in the scanner panel on the left to see
                  recommendations.
                </p>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col min-h-[500px]">
                {/* Navigation header for analysis tabs */}
                <div className="px-6 py-4 border-b border-border bg-slate-50/50 dark:bg-slate-900/30 flex flex-wrap gap-2 shrink-0">
                  {[
                    { id: "breakdown", label: "ATS Breakdown" },
                    { id: "rewrites", label: "XYZ Bullet Rewriter" },
                    { id: "gaps", label: "AI Recommendations" },
                    { id: "sections", label: "Parsed Sections" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setScannerTab(tab.id as any)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        scannerTab === tab.id
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab content scrollable view */}
                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                  {/* 1. Breakdown */}
                  {scannerTab === "breakdown" && (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Grading Category Breakdown
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {Object.entries(scannerResult.ats_breakdown)
                            .filter(([k]) => k !== "final_ats_score")
                            .map(([key, val]) => (
                              <div key={key} className="space-y-2">
                                <div className="flex justify-between text-xs font-bold">
                                  <span className="text-foreground capitalize">
                                    {key.replace(/_/g, " ")}
                                  </span>
                                  <span className="text-muted-foreground">
                                    {Math.round(val)}%
                                  </span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-primary rounded-full transition-all duration-1000"
                                    style={{ width: `${Number(val)}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. XYZ Rewriter */}
                  {scannerTab === "rewrites" && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="p-4 rounded-xl bg-purple-50/20 dark:bg-purple-950/10 border border-purple-100 dark:border-purple-900/50 space-y-1">
                        <h4 className="text-xs font-bold text-purple-500 flex items-center gap-1.5">
                          <Sparkles size={14} /> XYZ Formula Optimization
                        </h4>
                        <p className="text-[10px] text-muted-foreground leading-normal">
                          The XYZ Formula (Google standard) measures
                          achievements as:{" "}
                          <strong>
                            "Accomplished [X] as measured by [Y], by doing [Z]"
                          </strong>
                          . AI-generated rewrites below suggest optimized bullet
                          structures.
                        </p>
                      </div>

                      {scannerResult.synthetic_bullet_rewrites &&
                      scannerResult.synthetic_bullet_rewrites.length > 0 ? (
                        <div className="space-y-4">
                          {scannerResult.synthetic_bullet_rewrites.map(
                            (item, idx) => (
                              <div
                                key={idx}
                                className="border border-border rounded-xl p-4 space-y-3 bg-slate-50/20 dark:bg-slate-900/10"
                              >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                    <span className="text-[9px] font-black uppercase text-rose-500 tracking-wider">
                                      Original statement
                                    </span>
                                    <p className="text-xs text-muted-foreground bg-card border border-border p-3 rounded-lg leading-relaxed">
                                      {item.original_bullet}
                                    </p>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                      <span className="text-[9px] font-black uppercase text-emerald-500 tracking-wider">
                                        Suggested rewrite
                                      </span>
                                      <button
                                        onClick={() => {
                                          navigator.clipboard.writeText(
                                            item.rewritten_bullet,
                                          );
                                          toast.success(
                                            "Rewrite statement copied!",
                                          );
                                        }}
                                        className="text-primary hover:underline text-[10px] font-bold uppercase"
                                      >
                                        Copy rewrite
                                      </button>
                                    </div>
                                    <p className="text-xs text-foreground bg-card border border-indigo-500/30 p-3 rounded-lg leading-relaxed font-medium">
                                      {item.rewritten_bullet}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-[10px] text-muted-foreground flex gap-1.5 items-start">
                                  <span className="font-bold text-foreground">
                                    Rationale:
                                  </span>
                                  <span>{item.rationale}</span>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border border-dashed border-border rounded-xl">
                          <CheckCircle className="w-8 h-8 text-emerald-500 mb-2" />
                          <p className="text-xs font-bold">
                            Excellent statement phrasing!
                          </p>
                          <p className="text-[10px] mt-0.5">
                            No critical XYZ modifications recommended.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 3. AI Gap Analysis & Recommendations */}
                  {scannerTab === "gaps" && (
                    <div className="space-y-4 animate-fade-in">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Actionable Improvement Guidelines
                      </h4>
                      <ul className="space-y-3">
                        {(
                          scannerResult.gap_analysis ||
                          scannerResult.feedback ||
                          []
                        ).map((tip, idx) => (
                          <li
                            key={idx}
                            className="flex gap-3 text-xs leading-relaxed text-muted-foreground"
                          >
                            <div className="h-6 w-6 rounded-lg bg-slate-100 dark:bg-slate-900 border border-border text-foreground flex items-center justify-center font-bold text-[10px] shrink-0">
                              {idx + 1}
                            </div>
                            <span className="mt-0.5">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 4. Parsed Document Sections */}
                  {scannerTab === "sections" && (
                    <div className="space-y-4 animate-fade-in">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Extracted Section Profiles (
                        {scannerResult.sections?.length || 0})
                      </h4>
                      <div className="space-y-3">
                        {scannerResult.sections?.map((s, idx) => (
                          <div
                            key={idx}
                            className="border border-border rounded-xl overflow-hidden bg-card"
                          >
                            <div className="px-4 py-2 border-b border-border bg-slate-50/50 dark:bg-slate-900/30 text-[10px] font-black uppercase text-muted-foreground tracking-wider">
                              {s.section_type}
                            </div>
                            <pre className="p-4 text-xs font-mono text-foreground whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto bg-slate-50/20 dark:bg-slate-900/10">
                              {s.content ||
                                "Content block parsed successfully."}
                            </pre>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
