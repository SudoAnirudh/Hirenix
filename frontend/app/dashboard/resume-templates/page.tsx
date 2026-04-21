"use client";

import { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { sanitize } from "@/lib/sanitize";
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
} from "lucide-react";

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

// Section IDs — personal is always first (fixed), rest are draggable
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

// ─── Preview generator ────────────────────────────────────────────────────────

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
 <div style="margin-bottom:6px;display:flex;justify-content:space-between;align-items:baseline;">
 <div>
 <strong>${a.title}</strong>
 ${a.description ? ` <span style="font-size:9.5pt;color:#555;">&mdash; ${a.description}</span>` : ""}
 </div>
 ${a.date ? `<span style="font-size:9pt;color:#555;font-style:italic;white-space:nowrap;margin-left:12px;">${a.date}</span>` : ""}
 </div>`,
            )
            .join(""),
        )
      : "",

    skills: Object.values(d.skills).some(Boolean)
      ? sec(
          "Technical Skills",
          `<div style="font-size:10pt;">
 ${d.skills.languages ? `<p style="margin:2px 0;"><strong>Languages:</strong> ${d.skills.languages}</p>` : ""}
 ${d.skills.frameworks ? `<p style="margin:2px 0;"><strong>Frameworks:</strong> ${d.skills.frameworks}</p>` : ""}
 ${d.skills.tools ? `<p style="margin:2px 0;"><strong>Tools:</strong> ${d.skills.tools}</p>` : ""}
 ${d.skills.soft ? `<p style="margin:2px 0;"><strong>Soft Skills:</strong> ${d.skills.soft}</p>` : ""}
 </div>`,
        )
      : "",

    certs: d.certifications
      ? sec(
          "Certifications",
          `<div style="font-size:10pt;">${d.certifications
            .split("\n")
            .filter(Boolean)
            .map((c) => `<p style="margin:2px 0;">${c}</p>`)
            .join("")}</div>`,
        )
      : "",
  };

  return `
 <div style="font-family:Arial,Helvetica,sans-serif;font-size:10.5pt;
 line-height:1.45;color:#111;padding:36px 44px;min-height:100%;">
 <h1 style="text-align:center;font-size:18pt;font-weight:800;margin:0 0 3px;letter-spacing:-.3px;">
 ${p.name || `<span style="color:#ccc">[Your Full Name]</span>`}
 </h1>
 <p style="text-align:center;font-size:9pt;color:#555;margin:0 0 2px;">
 ${contact || `<span style="color:#bbb">Email · Phone · LinkedIn · GitHub</span>`}
 </p>
 ${order.map((id) => blocks[id]).join("")}
 </div>`;
}

// ─── Form helpers ─────────────────────────────────────────────────────────────

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
    <div className={`flex flex-col gap-1 ${className}`}>
      <label
        className="text-[11px] font-semibold uppercase tracking-wide"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </label>
      <input
        className="input-base text-sm"
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
    <div className="flex flex-col gap-1">
      <label
        className="text-[11px] font-semibold uppercase tracking-wide"
        style={{ color: "var(--text-muted)" }}
      >
        Bullet Points
      </label>
      <p className="text-[10px] -mt-0.5" style={{ color: "var(--text-muted)" }}>
        One achievement per line · Start with • or just type
      </p>
      <textarea
        className="input-base text-sm resize-none"
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={
          "• Increased throughput by 40% through pipeline redesign\n• Mentored 3 junior engineers across 2 teams\n• Shipped feature used by 50k+ daily active users"
        }
      />
    </div>
  );
}

function AddBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <div className="p-3">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-colors"
        style={{
          border: "1.5px dashed var(--border)",
          color: "var(--indigo)",
          background: "transparent",
        }}
      >
        <Plus className="w-4 h-4" />
        {label}
      </button>
    </div>
  );
}

// ─── Accordion with drag handle ───────────────────────────────────────────────

function AccordionSection({
  sectionId,
  icon,
  title,
  open,
  onToggle,
  children,
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
  isDragOver,
}: {
  sectionId?: string;
  icon: React.ReactNode;
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  draggable?: boolean;
  onDragStart?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: () => void;
  isDragOver?: boolean;
}) {
  return (
    <div
      data-section-id={sectionId}
      style={{
        borderBottom: "1px solid var(--border)",
        transition: "opacity 0.15s, background 0.15s",
        background: isDragOver ? "rgba(11,124,118,0.07)" : undefined,
        outline: isDragOver ? "2px dashed var(--indigo)" : undefined,
        outlineOffset: "-2px",
        borderRadius: isDragOver ? "6px" : undefined,
      }}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div
        className="flex items-center"
        style={{
          background: open ? "rgba(11,124,118,0.06)" : "var(--bg-surface)",
        }}
      >
        {/* Drag handle */}
        {draggable && (
          <div
            draggable
            onDragStart={onDragStart}
            className="pl-2 pr-1 py-3 cursor-grab active:cursor-grabbing flex items-center"
            title="Drag to reorder"
          >
            <GripVertical
              className="w-4 h-4"
              style={{ color: "var(--text-muted)" }}
            />
          </div>
        )}
        {/* Header button */}
        <button
          onClick={onToggle}
          className="flex-1 flex items-center justify-between px-3 py-3 text-left"
        >
          <div className="flex items-center gap-2 font-semibold text-sm">
            <span style={{ color: "var(--indigo)" }}>{icon}</span>
            {title}
          </div>
          {open ? (
            <ChevronUp
              className="w-4 h-4"
              style={{ color: "var(--text-muted)" }}
            />
          ) : (
            <ChevronDown
              className="w-4 h-4"
              style={{ color: "var(--text-muted)" }}
            />
          )}
        </button>
      </div>
      {open && <div>{children}</div>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ResumeBuilderPage() {
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

  // Drag handlers
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

  // Section content map
  const sectionContent: Record<SectionId, React.ReactNode> = {
    summary: (
      <div className="p-4">
        <label
          className="text-[11px] font-semibold uppercase tracking-wide mb-1 block"
          style={{ color: "var(--text-muted)" }}
        >
          2–3 sentence overview
        </label>
        <textarea
          className="input-base text-sm resize-none w-full"
          rows={4}
          value={data.summary}
          onChange={(e) => setData((d) => ({ ...d, summary: e.target.value }))}
          placeholder="Results-driven software engineer with 4+ years building scalable web applications. Proven track record of reducing latency by 40% and shipping products used by 100k+ users."
        />
      </div>
    ),

    experience: (
      <>
        {data.experience.map((exp, i) => (
          <div
            key={exp.id}
            className="p-4 space-y-3"
            style={{
              borderTop:
                i > 0 ? "1px dashed var(--border)" : "1px solid var(--border)",
              background:
                i % 2 === 0 ? "var(--bg-elevated)" : "var(--bg-surface)",
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-[11px] font-bold uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
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
                  <span
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
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
            className="p-4 space-y-3"
            style={{
              borderTop:
                i > 0 ? "1px dashed var(--border)" : "1px solid var(--border)",
              background:
                i % 2 === 0 ? "var(--bg-elevated)" : "var(--bg-surface)",
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-[11px] font-bold uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
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
            className="p-4 space-y-3"
            style={{
              borderTop:
                i > 0 ? "1px dashed var(--border)" : "1px solid var(--border)",
              background:
                i % 2 === 0 ? "var(--bg-elevated)" : "var(--bg-surface)",
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-[11px] font-bold uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
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
                placeholder="My Cool Project"
              />
              <Field
                label="Tech Stack"
                value={proj.tech}
                onChange={(v) => setProj(proj.id, "tech", v)}
                placeholder="React, Node.js, PostgreSQL"
              />
            </div>
            <Field
              label="GitHub / URL (optional)"
              value={proj.link}
              onChange={(v) => setProj(proj.id, "link", v)}
              placeholder="https://github.com/you/project"
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
        {data.achievements.map((a, i) => (
          <div
            key={a.id}
            className="p-4 space-y-3"
            style={{
              borderTop:
                i > 0 ? "1px dashed var(--border)" : "1px solid var(--border)",
              background:
                i % 2 === 0 ? "var(--bg-elevated)" : "var(--bg-surface)",
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-[11px] font-bold uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Entry {i + 1}
              </span>
              {data.achievements.length > 1 && (
                <button
                  onClick={() =>
                    setData((d) => ({
                      ...d,
                      achievements: d.achievements.filter((x) => x.id !== a.id),
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
                label="Title / Award Name"
                value={a.title}
                onChange={(v) => setAchiev(a.id, "title", v)}
                placeholder="1st Place, Google Coding Contest"
              />
              <Field
                label="Date"
                value={a.date}
                onChange={(v) => setAchiev(a.id, "date", v)}
                placeholder="Nov 2023"
              />
            </div>
            <Field
              label="Description (optional)"
              value={a.description}
              onChange={(v) => setAchiev(a.id, "description", v)}
              placeholder="Competed against 1,200+ teams globally"
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
          placeholder="Python, TypeScript, Java, Go, SQL"
        />
        <Field
          label="Frameworks / Libraries"
          value={data.skills.frameworks}
          onChange={(v) => setSkill("frameworks", v)}
          placeholder="React, Next.js, FastAPI, PyTorch, Spring Boot"
        />
        <Field
          label="Tools & Platforms"
          value={data.skills.tools}
          onChange={(v) => setSkill("tools", v)}
          placeholder="AWS, Docker, Kubernetes, Git, PostgreSQL"
        />
        <Field
          label="Soft Skills (optional)"
          value={data.skills.soft}
          onChange={(v) => setSkill("soft", v)}
          placeholder="Leadership, Agile, Cross-team Collaboration"
        />
      </div>
    ),

    certs: (
      <div className="p-4">
        <label
          className="text-[11px] font-semibold uppercase tracking-wide mb-1 block"
          style={{ color: "var(--text-muted)" }}
        >
          One per line
        </label>
        <textarea
          className="input-base text-sm resize-none w-full"
          rows={3}
          value={data.certifications}
          onChange={(e) =>
            setData((d) => ({ ...d, certifications: e.target.value }))
          }
          placeholder={
            "AWS Certified Developer — Amazon Web Services, 2024\nGoogle Cloud Professional Data Engineer — Google, 2023"
          }
        />
      </div>
    ),
  };

  const sectionMeta: Record<
    SectionId,
    { icon: React.ReactNode; title: string }
  > = {
    summary: {
      icon: <FileText className="w-4 h-4" />,
      title: "Professional Summary",
    },
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

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-3.5 shrink-0"
        style={{
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-surface)",
        }}
      >
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <LayoutTemplate
              className="w-5 h-5"
              style={{ color: "var(--indigo)" }}
            />
            Resume Builder
          </h1>
          <p
            className="text-xs mt-0.5"
            style={{ color: "var(--text-secondary)" }}
          >
            Fill in your details · Drag{""}
            <GripVertical className="w-3 h-3 inline" /> to reorder sections ·
            Preview updates live
          </p>
        </div>
        <button
          onClick={() => handlePrint()}
          className="flex items-center gap-2 px-4 py-2 btn-primary text-sm rounded-lg"
        >
          <Download className="w-4 h-4" /> Export PDF
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left — Form */}
        <div
          className="w-[400px] shrink-0 overflow-y-auto"
          style={{ borderRight: "1px solid var(--border)" }}
        >
          {/* Personal — fixed, not draggable */}
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

          {/* Draggable sections in user-defined order */}
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

        {/* Right — Live A4 Preview */}
        <div
          className="flex-1 overflow-y-auto p-8 print:p-0"
          style={{ background: "#ddd8d0" }}
        >
          <div
            ref={previewRef}
            className="bg-white mx-auto w-full max-w-[210mm] min-h-[297mm]"
            style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.22)" }}
            dangerouslySetInnerHTML={{
              __html: sanitize(generateHTML(data, sectionOrder)),
            }}
          />
        </div>
      </div>
    </div>
  );
}
