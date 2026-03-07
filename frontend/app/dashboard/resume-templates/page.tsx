"use client";

import { useState, useRef, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import { ResumeEditor } from "@/components/ResumeEditor";
import { Download, Loader2, LayoutTemplate, ChevronRight } from "lucide-react";

// ─── Templates ────────────────────────────────────────────────────────────────

const ATS_TEMPLATES = [
  {
    id: "jakes",
    name: "Jake's Resume",
    tag: "Most Popular",
    tagColor: "#0b7c76",
    description:
      "The legendary Overleaf template — clean single-column with bold section rules. Preferred by big tech recruiters.",
    preview: (
      <div className="text-[5px] leading-tight font-mono p-2 text-gray-700 select-none">
        <div className="text-center font-bold text-[7px]">JAKE RYAN</div>
        <div className="text-center text-[4px]">jake@email.com · 555-1234</div>
        <div className="border-b border-gray-800 mt-1 mb-0.5" />
        <div className="font-bold text-[5.5px] uppercase tracking-wider">
          Education
        </div>
        <div className="border-b border-gray-800 mb-0.5" />
        <div>Southwestern University, B.S. CS</div>
        <div className="border-b border-gray-800 mt-0.5 mb-0.5" />
        <div className="font-bold text-[5.5px] uppercase tracking-wider">
          Experience
        </div>
        <div className="border-b border-gray-800 mb-0.5" />
        <div className="font-bold">Software Engineer Intern</div>
        <div>• Built REST APIs · Reduced latency 40%</div>
        <div className="border-b border-gray-800 mt-0.5 mb-0.5" />
        <div className="font-bold text-[5.5px] uppercase tracking-wider">
          Skills
        </div>
        <div className="border-b border-gray-800 mb-0.5" />
        <div>Python · TypeScript · React · AWS</div>
      </div>
    ),
    content: `
      <h1 style="text-align:center; font-size:1.6rem; font-weight:800; letter-spacing:-0.5px; margin-bottom:2px;">[Your Full Name]</h1>
      <p style="text-align:center; font-size:0.8rem; color:#444; margin-bottom:12px;">
        [City, ST] &nbsp;|&nbsp; <a href="tel:+15551234567">555-123-4567</a> &nbsp;|&nbsp; <a href="mailto:you@email.com">you@email.com</a> &nbsp;|&nbsp; <a href="https://linkedin.com/in/you">linkedin.com/in/you</a> &nbsp;|&nbsp; <a href="https://github.com/you">github.com/you</a>
      </p>

      <h2 style="font-size:0.85rem; font-weight:800; text-transform:uppercase; letter-spacing:1px; border-bottom:1.5px solid #111; padding-bottom:2px; margin-top:14px; margin-bottom:6px;">Education</h2>
      <p style="margin:0;"><strong>[University Name]</strong> &nbsp;&nbsp; <em style="float:right;">[City, ST]</em></p>
      <p style="margin:0; font-size:0.85rem;"><em>[Degree] in [Major]</em> &nbsp;&nbsp; <em style="float:right;">Aug. 20XX – May 20XX</em></p>
      <ul style="margin:4px 0 0 0;">
        <li>Cumulative GPA: [X.X/4.0] &nbsp;|&nbsp; Relevant Coursework: [Course 1], [Course 2], [Course 3]</li>
      </ul>

      <h2 style="font-size:0.85rem; font-weight:800; text-transform:uppercase; letter-spacing:1px; border-bottom:1.5px solid #111; padding-bottom:2px; margin-top:14px; margin-bottom:6px;">Experience</h2>
      <p style="margin:0;"><strong>[Job Title]</strong> &nbsp;&nbsp; <em style="float:right;">Month 20XX – Month 20XX</em></p>
      <p style="margin:0; font-size:0.85rem; color:#555;">[Company Name] &mdash; [City, ST]</p>
      <ul style="margin:4px 0 8px 0;">
        <li>Led development of [feature/product], reducing [metric] by <strong>X%</strong> and increasing [other metric] by <strong>Y%</strong>.</li>
        <li>Collaborated with [team of N engineers] to deliver [project] on schedule, using [technologies].</li>
        <li>Implemented [system/algorithm] resulting in [measurable outcome].</li>
      </ul>

      <p style="margin:0;"><strong>[Previous Job Title]</strong> &nbsp;&nbsp; <em style="float:right;">Month 20XX – Month 20XX</em></p>
      <p style="margin:0; font-size:0.85rem; color:#555;">[Company Name] &mdash; [City, ST]</p>
      <ul style="margin:4px 0 0 0;">
        <li>Built and deployed [service/tool] using [technologies], serving <strong>[X]+ users</strong>.</li>
        <li>Optimised [system component] to achieve <strong>[X]x</strong> throughput improvement.</li>
      </ul>

      <h2 style="font-size:0.85rem; font-weight:800; text-transform:uppercase; letter-spacing:1px; border-bottom:1.5px solid #111; padding-bottom:2px; margin-top:14px; margin-bottom:6px;">Projects</h2>
      <p style="margin:0;"><strong>[Project Name]</strong> | <em>[Tech Stack]</em> &nbsp;&nbsp; <a href="#" style="float:right; font-size:0.8rem;">github.com/you/project</a></p>
      <ul style="margin:4px 0 8px 0;">
        <li>Open-source library with <strong>X00+ GitHub stars</strong>; simplifies [problem area] for [audience].</li>
        <li>Reduced boilerplate by <strong>60%</strong> through [technical approach].</li>
      </ul>
      <p style="margin:0;"><strong>[Another Project]</strong> | <em>[Tech Stack]</em></p>
      <ul style="margin:4px 0 0 0;">
        <li>Full-stack app handling <strong>[X]k+ requests/day</strong>; deployed on [platform].</li>
      </ul>

      <h2 style="font-size:0.85rem; font-weight:800; text-transform:uppercase; letter-spacing:1px; border-bottom:1.5px solid #111; padding-bottom:2px; margin-top:14px; margin-bottom:6px;">Technical Skills</h2>
      <p style="margin:0;"><strong>Languages:</strong> Python, TypeScript, JavaScript, Java, C++, SQL</p>
      <p style="margin:0;"><strong>Frameworks:</strong> React, Next.js, Node.js, FastAPI, Django, PyTorch</p>
      <p style="margin:0;"><strong>DevOps / Cloud:</strong> AWS, Docker, Kubernetes, GitHub Actions, Terraform</p>
      <p style="margin:0;"><strong>Databases:</strong> PostgreSQL, MongoDB, Redis, Supabase</p>
    `,
  },
  {
    id: "classic",
    name: "Classic Professional",
    tag: "ATS Safe",
    tagColor: "#15803d",
    description:
      "Traditional single-column. Passes 99% of ATS systems. Safe choice for corporate and finance roles.",
    preview: (
      <div className="text-[5px] leading-tight p-2 text-gray-700 select-none">
        <div className="text-center font-bold text-[7px]">[YOUR NAME]</div>
        <div className="text-center text-[4px]">
          📧 email | 📞 phone | 🔗 linkedin
        </div>
        <div className="border-b-2 border-gray-700 my-1" />
        <div className="font-bold text-[5px] uppercase mb-0.5">Summary</div>
        <div className="text-[4px]">
          Results-driven professional with X years...
        </div>
        <div className="border-b border-gray-400 my-1" />
        <div className="font-bold text-[5px] uppercase mb-0.5">Experience</div>
        <div className="font-semibold text-[4.5px]">
          Senior Engineer · Company · 2022–Present
        </div>
        <div className="text-[4px]">
          • Led project · Improved efficiency 40%
        </div>
        <div className="border-b border-gray-400 my-1" />
        <div className="font-bold text-[5px] uppercase mb-0.5">Education</div>
        <div className="text-[4px]">
          B.S. Computer Science · University · 2020
        </div>
      </div>
    ),
    content: `
      <h1 style="text-align:center; margin-bottom:4px;">[Your Full Name]</h1>
      <p style="text-align:center; font-size:0.85rem; color:#555;">
        [City, State] &nbsp;|&nbsp; [Phone] &nbsp;|&nbsp; [Email] &nbsp;|&nbsp; [LinkedIn URL] &nbsp;|&nbsp; [Portfolio URL]
      </p>

      <h2>SUMMARY</h2><hr />
      <p>Results-driven [Job Title] with [Number] years of experience in [Industry/Field]. Proven track record of [Key Achievement 1] and [Key Achievement 2]. Skilled at [Skill 1], [Skill 2], and [Skill 3].</p>

      <h2>EXPERIENCE</h2><hr />
      <h3><strong>[Recent Job Title]</strong></h3>
      <p><em>[Company Name] | [Location] | [Month, Year] – Present</em></p>
      <ul>
        <li>Led [Project/Initiative] resulting in [Quantifiable Result, e.g. 30% efficiency gain].</li>
        <li>Developed and implemented [System/Process] improving throughput by [X]%.</li>
        <li>Collaborated with [Team/Department] to deliver [Goal] on time and under budget.</li>
      </ul>

      <h3><strong>[Previous Job Title]</strong></h3>
      <p><em>[Company Name] | [Location] | [Month, Year] – [Month, Year]</em></p>
      <ul>
        <li>Managed [Responsibility] for [Client/Project], serving [X]+ customers.</li>
        <li>Spearheaded [Campaign/Strategy] that increased revenue by [X]%.</li>
      </ul>

      <h2>EDUCATION</h2><hr />
      <p><strong>[Degree Name] in [Major]</strong> | [University Name], [Location]</p>
      <p><em>Graduated: [Month, Year] &nbsp;|&nbsp; GPA: [X.X/4.0]</em></p>

      <h2>SKILLS &amp; TECHNOLOGIES</h2><hr />
      <ul>
        <li><strong>Languages/Frameworks:</strong> [Skill 1], [Skill 2], [Skill 3]</li>
        <li><strong>Tools &amp; Platforms:</strong> [Tool 1], [Tool 2], [Tool 3]</li>
        <li><strong>Soft Skills:</strong> Leadership, Cross-functional Collaboration, Problem Solving</li>
      </ul>

      <h2>CERTIFICATIONS</h2><hr />
      <ul>
        <li>[Certification Name] — [Issuing Body], [Year]</li>
      </ul>
    `,
  },
  {
    id: "modern",
    name: "Modern Tech",
    tag: "Developer",
    tagColor: "#6d28d9",
    description:
      "Skills-first layout popular in engineering roles. Emphasises tech stack and measurable impact.",
    preview: (
      <div className="text-[5px] leading-tight p-2 text-gray-700 select-none">
        <div className="font-bold text-[7px]">[Your Name]</div>
        <div className="text-[4px] text-blue-600">
          GitHub · LinkedIn · Portfolio
        </div>
        <div className="border-b border-gray-300 my-1" />
        <div className="font-bold text-[5.5px] text-blue-700 mb-0.5">
          TECHNICAL SKILLS
        </div>
        <div className="text-[4px]">
          <b>Frontend:</b> React, Next.js, TS
        </div>
        <div className="text-[4px]">
          <b>Backend:</b> Node, Python, Postgres
        </div>
        <div className="text-[4px]">
          <b>DevOps:</b> AWS, Docker, CI/CD
        </div>
        <div className="border-b border-gray-300 my-1" />
        <div className="font-bold text-[5.5px] text-blue-700 mb-0.5">
          EXPERIENCE
        </div>
        <div className="font-semibold text-[4.5px]">
          Senior SWE · Company · 2022
        </div>
        <div className="text-[4px]">
          • 10k+ concurrent users · Reduced load 40%
        </div>
      </div>
    ),
    content: `
      <h1>[Your Name]</h1>
      <p>[Contact Info] &nbsp;|&nbsp; <a href="#">github.com/you</a> &nbsp;|&nbsp; <a href="#">portfolio.dev</a></p>

      <h2>TECHNICAL SKILLS</h2><hr />
      <p><strong>Frontend:</strong> React, Next.js, TypeScript, Tailwind CSS, Vue.js</p>
      <p><strong>Backend:</strong> Node.js, Python, FastAPI, PostgreSQL, Redis</p>
      <p><strong>Infrastructure:</strong> AWS (EC2, S3, Lambda), Docker, Kubernetes, CI/CD</p>
      <p><strong>Other:</strong> Git, RESTful APIs, GraphQL, Agile/Scrum</p>

      <h2>PROFESSIONAL EXPERIENCE</h2><hr />
      <h3><strong>Senior Software Engineer</strong> — <em>[Company Name]</em></h3>
      <p><em>[Month, Year] – Present · [City, ST / Remote]</em></p>
      <ul>
        <li>Architected a high-performance system serving <strong>10k+ concurrent users</strong> with 99.9% uptime.</li>
        <li>Mentored 3 junior developers and established code review and testing guidelines.</li>
        <li>Reduced median page load time by <strong>40%</strong> via lazy loading and caching strategies.</li>
      </ul>

      <h3><strong>Software Engineer</strong> — <em>[Company Name]</em></h3>
      <p><em>[Month, Year] – [Month, Year] · [City, ST]</em></p>
      <ul>
        <li>Developed <strong>15+ RESTful APIs</strong> consumed by mobile and web clients (React Native + Next.js).</li>
        <li>Integrated Stripe for subscription billing, processing <strong>$2M+/year</strong> in transactions.</li>
        <li>Migrated legacy monolith to microservices, cutting deployment time by <strong>70%</strong>.</li>
      </ul>

      <h2>PROJECTS</h2><hr />
      <p><strong>[Project Name]</strong> &nbsp;|&nbsp; <em>[Technologies]</em> &nbsp;&nbsp; <a href="#">GitHub</a></p>
      <ul>
        <li>Open-source library with <strong>500+ GitHub stars</strong>; simplifies state management for React apps.</li>
      </ul>
      <p><strong>[Another Project]</strong> &nbsp;|&nbsp; <em>[Technologies]</em></p>
      <ul>
        <li>Full-stack SaaS handling <strong>50k+ requests/day</strong>; reduced infrastructure cost by 35%.</li>
      </ul>

      <h2>EDUCATION</h2><hr />
      <p><strong>B.S. Computer Science</strong> — [University Name]</p>
      <p><em>Graduated [Year] &nbsp;|&nbsp; GPA: [X.X] &nbsp;|&nbsp; Dean's List [X] semesters</em></p>
    `,
  },
  {
    id: "two-column",
    name: "Two-Column",
    tag: "Design / Product",
    tagColor: "#b45309",
    description:
      "Left sidebar for skills & contact, right main column for experience. Great for design and product roles.",
    preview: (
      <div className="flex text-[5px] leading-tight h-full select-none">
        <div className="w-[38%] bg-gray-800 text-white p-1.5">
          <div className="font-bold text-[7px] mb-0.5">[Name]</div>
          <div className="text-[3.5px] text-gray-300 mb-1">[Role]</div>
          <div className="border-b border-gray-600 mb-1" />
          <div className="font-bold text-[4.5px] mb-0.5">CONTACT</div>
          <div className="text-[3.5px] text-gray-300">📧 email</div>
          <div className="text-[3.5px] text-gray-300">🔗 linkedin</div>
          <div className="border-b border-gray-600 my-1" />
          <div className="font-bold text-[4.5px] mb-0.5">SKILLS</div>
          <div className="text-[3.5px] text-gray-300">• React / Next.js</div>
          <div className="text-[3.5px] text-gray-300">• Figma / Design</div>
          <div className="text-[3.5px] text-gray-300">• Python / SQL</div>
        </div>
        <div className="flex-1 p-1.5 text-gray-700">
          <div className="font-bold text-[4.5px] uppercase mb-0.5">
            Experience
          </div>
          <div className="border-b border-gray-300 mb-0.5" />
          <div className="font-semibold text-[4px]">Senior PM · Company</div>
          <div className="text-[3.5px]">• Led 0→1 product · $2M ARR</div>
          <div className="font-bold text-[4.5px] uppercase mt-1 mb-0.5">
            Education
          </div>
          <div className="border-b border-gray-300 mb-0.5" />
          <div className="text-[3.5px]">B.S. CS · University · 2020</div>
        </div>
      </div>
    ),
    content: `
      <div style="display:flex; gap:0; min-height:100%;">
        <div style="width:38%; background:#1e293b; color:#f1f5f9; padding:24px 18px; font-size:0.82rem; flex-shrink:0;">
          <h1 style="color:#fff; font-size:1.3rem; font-weight:800; margin:0 0 4px;">[Your Name]</h1>
          <p style="color:#94a3b8; margin:0 0 18px; font-size:0.78rem;">[Target Role / Tagline]</p>

          <h3 style="color:#e2e8f0; font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:1px; border-bottom:1px solid #334155; padding-bottom:4px; margin:0 0 8px;">Contact</h3>
          <p style="color:#cbd5e1; margin:2px 0; font-size:0.75rem;">📧 [you@email.com]</p>
          <p style="color:#cbd5e1; margin:2px 0; font-size:0.75rem;">📞 [555-123-4567]</p>
          <p style="color:#cbd5e1; margin:2px 0; font-size:0.75rem;">🔗 [linkedin.com/in/you]</p>
          <p style="color:#cbd5e1; margin:2px 0 18px; font-size:0.75rem;">🌐 [yourportfolio.dev]</p>

          <h3 style="color:#e2e8f0; font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:1px; border-bottom:1px solid #334155; padding-bottom:4px; margin:0 0 8px;">Technical Skills</h3>
          <p style="color:#cbd5e1; margin:2px 0; font-size:0.75rem;">• React / Next.js / TypeScript</p>
          <p style="color:#cbd5e1; margin:2px 0; font-size:0.75rem;">• Python / FastAPI / Node.js</p>
          <p style="color:#cbd5e1; margin:2px 0; font-size:0.75rem;">• PostgreSQL / Redis / Supabase</p>
          <p style="color:#cbd5e1; margin:2px 0 18px; font-size:0.75rem;">• AWS / Docker / Kubernetes</p>

          <h3 style="color:#e2e8f0; font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:1px; border-bottom:1px solid #334155; padding-bottom:4px; margin:0 0 8px;">Design Tools</h3>
          <p style="color:#cbd5e1; margin:2px 0; font-size:0.75rem;">• Figma / Adobe XD</p>
          <p style="color:#cbd5e1; margin:2px 0 18px; font-size:0.75rem;">• Framer / Webflow</p>

          <h3 style="color:#e2e8f0; font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:1px; border-bottom:1px solid #334155; padding-bottom:4px; margin:0 0 8px;">Certifications</h3>
          <p style="color:#cbd5e1; margin:2px 0; font-size:0.75rem;">[Cert Name] — [Issuer]</p>
        </div>

        <div style="flex:1; padding:24px 22px; font-size:0.85rem;">
          <h2 style="font-size:0.78rem; font-weight:800; text-transform:uppercase; letter-spacing:1px; color:#0f172a; border-bottom:2px solid #0f172a; padding-bottom:3px; margin:0 0 10px;">Professional Experience</h2>

          <p style="margin:0; font-weight:700;">[Senior Job Title]</p>
          <p style="margin:0; font-size:0.8rem; color:#475569;">[Company] &mdash; [Location] &mdash; <em>[Month Year] – Present</em></p>
          <ul style="margin:6px 0 14px; font-size:0.82rem;">
            <li>Led end-to-end product development for [feature], reaching <strong>[X]k+ users</strong> in [timeframe].</li>
            <li>Improved [metric] by <strong>[X]%</strong> through [approach], resulting in $[Y]M ARR.</li>
            <li>Managed cross-functional team of [N] engineers and [M] designers across [N] time zones.</li>
          </ul>

          <p style="margin:0; font-weight:700;">[Previous Job Title]</p>
          <p style="margin:0; font-size:0.8rem; color:#475569;">[Company] &mdash; [Location] &mdash; <em>[Month Year] – [Month Year]</em></p>
          <ul style="margin:6px 0 14px; font-size:0.82rem;">
            <li>Shipped [N] product iterations; reduced churn by <strong>[X]%</strong> after [research/initiative].</li>
            <li>Designed and implemented [system] from scratch in [language/framework].</li>
          </ul>

          <h2 style="font-size:0.78rem; font-weight:800; text-transform:uppercase; letter-spacing:1px; color:#0f172a; border-bottom:2px solid #0f172a; padding-bottom:3px; margin:0 0 10px;">Projects</h2>
          <p style="margin:0; font-weight:700;">[Project Name] &mdash; <a href="#">GitHub</a></p>
          <p style="margin:2px 0 12px; font-size:0.82rem; color:#475569;">React · Node.js · PostgreSQL</p>

          <h2 style="font-size:0.78rem; font-weight:800; text-transform:uppercase; letter-spacing:1px; color:#0f172a; border-bottom:2px solid #0f172a; padding-bottom:3px; margin:0 0 10px;">Education</h2>
          <p style="margin:0; font-weight:700;">[Degree] in [Major]</p>
          <p style="margin:0; font-size:0.8rem; color:#475569;">[University] &mdash; [City, ST] &mdash; <em>Graduated [Year]</em></p>
        </div>
      </div>
    `,
  },
  {
    id: "compact",
    name: "Compact Minimal",
    tag: "Entry-Level",
    tagColor: "#0f766e",
    description:
      "Dense but clean single-page layout. Fits maximum information without clutter. Great for fresh graduates.",
    preview: (
      <div className="text-[5px] leading-snug p-2 text-gray-700 select-none">
        <div className="flex justify-between items-start mb-1">
          <div className="font-bold text-[7px]">[Name]</div>
          <div className="text-[3.5px] text-right text-gray-500">
            email · phone
            <br />
            github · linkedin
          </div>
        </div>
        <div className="border-b-2 border-gray-800 mb-1" />
        <div className="font-bold text-[4.5px] uppercase mb-0.5">Education</div>
        <div className="text-[4px]">University · B.S. CS · 2024 · GPA 3.9</div>
        <div className="font-bold text-[4.5px] uppercase mt-1 mb-0.5">
          Experience
        </div>
        <div className="font-semibold text-[4px]">
          SWE Intern · Company · Summer 2023
        </div>
        <div className="text-[3.5px] ml-1">
          • Feature X · reduced latency 30%
        </div>
        <div className="font-bold text-[4.5px] uppercase mt-1 mb-0.5">
          Projects
        </div>
        <div className="text-[4px] font-semibold">
          ProjectName · React · Node
        </div>
        <div className="text-[3.5px] ml-1">
          • 100+ stars · [brief description]
        </div>
        <div className="font-bold text-[4.5px] uppercase mt-1 mb-0.5">
          Skills
        </div>
        <div className="text-[3.5px]">
          Python · JS · React · SQL · Docker · Git
        </div>
      </div>
    ),
    content: `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:2px;">
        <h1 style="margin:0; font-size:1.5rem; font-weight:800;">[Your Name]</h1>
        <p style="margin:0; text-align:right; font-size:0.75rem; color:#555; line-height:1.6;">
          [email@example.com] &nbsp;|&nbsp; [555-1234]<br />
          <a href="#">github.com/you</a> &nbsp;|&nbsp; <a href="#">linkedin.com/in/you</a>
        </p>
      </div>
      <hr style="border-top:2px solid #111; margin:6px 0 10px;" />

      <h2 style="font-size:0.8rem; font-weight:800; text-transform:uppercase; letter-spacing:0.8px; margin:0 0 4px;">Education</h2>
      <p style="margin:0;"><strong>[University Name]</strong> &nbsp;&mdash;&nbsp; [Degree] in [Major]</p>
      <p style="margin:0; font-size:0.82rem; color:#555;">Graduated [Month Year] &nbsp;|&nbsp; GPA: [X.X/4.0] &nbsp;|&nbsp; [Relevant Coursework or Honors]</p>
      <hr style="border:none; border-top:1px solid #ccc; margin:8px 0;" />

      <h2 style="font-size:0.8rem; font-weight:800; text-transform:uppercase; letter-spacing:0.8px; margin:0 0 4px;">Experience</h2>
      <p style="margin:0; font-weight:700;">[Job Title] &mdash; [Company] <span style="float:right; font-weight:400; font-size:0.8rem; color:#555;">[Month Year] – [Month Year]</span></p>
      <ul style="margin:3px 0 8px; font-size:0.82rem;">
        <li>Built [feature] using [tech], increasing [metric] by <strong>X%</strong> for [X]k users.</li>
        <li>Reduced [latency/cost/bugs] by <strong>X%</strong> by [approach].</li>
      </ul>

      <p style="margin:0; font-weight:700;">[Other Job Title] &mdash; [Company] <span style="float:right; font-weight:400; font-size:0.8rem; color:#555;">[Month Year] – [Month Year]</span></p>
      <ul style="margin:3px 0 8px; font-size:0.82rem;">
        <li>Developed [system] that [achieved outcome] with [X users/requests/volume].</li>
      </ul>
      <hr style="border:none; border-top:1px solid #ccc; margin:8px 0;" />

      <h2 style="font-size:0.8rem; font-weight:800; text-transform:uppercase; letter-spacing:0.8px; margin:0 0 4px;">Projects</h2>
      <p style="margin:0; font-weight:700;">[Project Name] &nbsp;|&nbsp; <em>[Stack]</em> &nbsp;&nbsp; <a href="#" style="font-size:0.78rem;">View →</a></p>
      <ul style="margin:3px 0 8px; font-size:0.82rem;">
        <li>[X]00+ GitHub stars; solves [problem] for [target users].</li>
        <li>Deployed on [platform] serving [X]+ daily active users.</li>
      </ul>
      <hr style="border:none; border-top:1px solid #ccc; margin:8px 0;" />

      <h2 style="font-size:0.8rem; font-weight:800; text-transform:uppercase; letter-spacing:0.8px; margin:0 0 4px;">Skills</h2>
      <p style="margin:0; font-size:0.83rem;"><strong>Languages:</strong> Python, TypeScript, JavaScript, Java, SQL &nbsp;&nbsp; <strong>Frameworks:</strong> React, FastAPI, Node.js, Next.js</p>
      <p style="margin:0; font-size:0.83rem;"><strong>Tools:</strong> Git, Docker, AWS, Supabase, Figma &nbsp;&nbsp; <strong>Concepts:</strong> REST, CI/CD, Agile, OOP, DSA</p>
    `,
  },
  {
    id: "academic",
    name: "Academic / Research",
    tag: "PhD / Research",
    tagColor: "#7c3aed",
    description:
      "For academia, research positions, and PhD applications. Emphasises publications, grants, and academic achievements.",
    preview: (
      <div className="text-[5px] leading-tight p-2 text-gray-700 select-none">
        <div className="text-center font-bold text-[7px]">
          [Full Name], M.S.
        </div>
        <div className="text-center text-[3.5px] text-gray-500">
          [University] · [Department]
        </div>
        <div className="border-b border-gray-400 my-1" />
        <div className="font-bold text-[5px] uppercase mb-0.5">
          Research Interests
        </div>
        <div className="text-[3.5px]">ML · NLP · Distributed Systems</div>
        <div className="font-bold text-[5px] uppercase mt-0.5 mb-0.5">
          Publications
        </div>
        <div className="text-[3.5px]">Author et al. (2024) — NeurIPS</div>
        <div className="text-[3.5px]">Author et al. (2023) — ICML</div>
        <div className="font-bold text-[5px] uppercase mt-0.5 mb-0.5">
          Education
        </div>
        <div className="text-[3.5px]">Ph.D. CS · MIT · 2022–Present</div>
        <div className="text-[3.5px]">B.S. CS · IIT · 2018–2022</div>
      </div>
    ),
    content: `
      <h1 style="text-align:center; margin-bottom:2px;">[Full Name], [Degree Suffix e.g. M.S.]</h1>
      <p style="text-align:center; font-size:0.82rem; color:#555; margin-bottom:14px;">
        [Department] &nbsp;|&nbsp; [University] &nbsp;|&nbsp; [email@university.edu] &nbsp;|&nbsp; <a href="#">scholar.google.com/you</a> &nbsp;|&nbsp; <a href="#">orcid.org/0000-0000</a>
      </p>

      <h2 style="font-size:0.82rem; font-weight:800; text-transform:uppercase; letter-spacing:1px; border-bottom:1.5px solid #333; padding-bottom:3px; margin:0 0 8px;">Research Interests</h2>
      <p>Machine Learning &nbsp;|&nbsp; Natural Language Processing &nbsp;|&nbsp; Distributed Systems &nbsp;|&nbsp; [Your Area]</p>

      <h2 style="font-size:0.82rem; font-weight:800; text-transform:uppercase; letter-spacing:1px; border-bottom:1.5px solid #333; padding-bottom:3px; margin:14px 0 8px;">Education</h2>
      <p style="margin:0;"><strong>Ph.D. in [Field]</strong>, [University] &nbsp;&nbsp; <em style="float:right;">[Year] – Present</em></p>
      <p style="margin:0 0 6px; font-size:0.82rem; color:#555;">Dissertation: "<em>[Working Title of Thesis]</em>" &nbsp;|&nbsp; Advisor: Prof. [Name]</p>
      <p style="margin:0;"><strong>M.S. in [Field]</strong>, [University] &nbsp;&nbsp; <em style="float:right;">[Year] – [Year]</em></p>
      <p style="margin:0 0 6px; font-size:0.82rem; color:#555;">GPA: [X.X/4.0]</p>
      <p style="margin:0;"><strong>B.S. / B.Tech in [Field]</strong>, [University] &nbsp;&nbsp; <em style="float:right;">[Year] – [Year]</em></p>
      <p style="margin:0; font-size:0.82rem; color:#555;">First Class Honors &nbsp;|&nbsp; GPA: [X.X/4.0]</p>

      <h2 style="font-size:0.82rem; font-weight:800; text-transform:uppercase; letter-spacing:1px; border-bottom:1.5px solid #333; padding-bottom:3px; margin:14px 0 8px;">Publications</h2>
      <p style="margin:0;"><strong>[Author(s)].</strong> "[Paper Title]." <em>[Conference/Journal Name]</em>, [Year]. <a href="#">[DOI / arXiv link]</a></p>
      <p style="margin:4px 0;"><strong>[Author(s)].</strong> "[Paper Title]." <em>[Conference/Journal Name]</em>, [Year]. <a href="#">[DOI / arXiv link]</a></p>
      <p style="margin:4px 0; font-size:0.82rem; color:#555;">[Under Review] [Your Name] et al. "[Working Paper Title]." Submitted to [Venue], [Year].</p>

      <h2 style="font-size:0.82rem; font-weight:800; text-transform:uppercase; letter-spacing:1px; border-bottom:1.5px solid #333; padding-bottom:3px; margin:14px 0 8px;">Research Experience</h2>
      <p style="margin:0; font-weight:700;">[Lab Name] — [University]</p>
      <p style="margin:0; font-size:0.82rem; color:#555;"><em>Graduate Research Assistant &nbsp;|&nbsp; [Month Year] – Present</em> &nbsp;|&nbsp; Advisor: Prof. [Name]</p>
      <ul style="margin:4px 0 10px; font-size:0.83rem;">
        <li>Developed [algorithm/model] achieving state-of-the-art on [benchmark], improving F1 by <strong>X points</strong>.</li>
        <li>Collected and annotated dataset of [N] samples; open-sourced under [license].</li>
      </ul>

      <h2 style="font-size:0.82rem; font-weight:800; text-transform:uppercase; letter-spacing:1px; border-bottom:1.5px solid #333; padding-bottom:3px; margin:14px 0 8px;">Awards &amp; Grants</h2>
      <ul style="font-size:0.83rem;">
        <li>[Scholarship/Fellowship Name] — [Amount] — [Year]</li>
        <li>Best Paper Award — [Conference] — [Year]</li>
      </ul>

      <h2 style="font-size:0.82rem; font-weight:800; text-transform:uppercase; letter-spacing:1px; border-bottom:1.5px solid #333; padding-bottom:3px; margin:14px 0 8px;">Teaching &amp; Mentoring</h2>
      <ul style="font-size:0.83rem;">
        <li>Teaching Assistant — [Course Name] — [University] — [Semester, Year]</li>
        <li>Mentored [N] undergraduate researchers on [topic].</li>
      </ul>

      <h2 style="font-size:0.82rem; font-weight:800; text-transform:uppercase; letter-spacing:1px; border-bottom:1.5px solid #333; padding-bottom:3px; margin:14px 0 8px;">Technical Skills</h2>
      <p style="margin:0; font-size:0.83rem;"><strong>Languages:</strong> Python, R, MATLAB, C++, Julia</p>
      <p style="margin:0; font-size:0.83rem;"><strong>ML / DL:</strong> PyTorch, JAX, Hugging Face, scikit-learn, CUDA</p>
      <p style="margin:0; font-size:0.83rem;"><strong>Tools:</strong> LaTeX, Git, HPC clusters (SLURM), Docker, Jupyter</p>
    `,
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ResumeTemplatesPage() {
  const [content, setContent] = useState(ATS_TEMPLATES[0].content);
  const [selectedTemplate, setSelectedTemplate] = useState(ATS_TEMPLATES[0].id);
  const [isClient, setIsClient] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsClient(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const handlePrint = useReactToPrint({
    contentRef: editorRef,
    documentTitle: "Hirenix_Resume",
  });

  const handleTemplateSelect = (templateId: string) => {
    if (templateId === selectedTemplate) return;
    const template = ATS_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      if (
        confirm(
          "Switching templates will replace your current content. Continue?",
        )
      ) {
        setContent(template.content);
        setSelectedTemplate(templateId);
      }
    }
  };

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4 shrink-0"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <LayoutTemplate
              className="w-6 h-6"
              style={{ color: "var(--indigo)" }}
            />
            Resume Builder
          </h1>
          <p
            className="text-sm mt-0.5"
            style={{ color: "var(--text-secondary)" }}
          >
            Pick a template, edit inline, and export a recruiter-ready PDF.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handlePrint()}
            className="flex items-center gap-2 px-4 py-2 btn-primary text-sm rounded-lg"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor */}
        <div className="flex-1 overflow-hidden p-6 print:p-0">
          <div className="h-full" ref={editorRef}>
            {isClient ? (
              <ResumeEditor content={content} onChange={setContent} />
            ) : (
              <div
                className="flex items-center justify-center h-full rounded-lg animate-pulse"
                style={{ background: "var(--bg-elevated)" }}
              >
                <Loader2
                  className="w-8 h-8 animate-spin"
                  style={{ color: "var(--indigo)" }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div
          className="w-80 overflow-y-auto shrink-0 print:hidden"
          style={{
            borderLeft: "1px solid var(--border)",
            background: "var(--bg-elevated)",
          }}
        >
          <div
            className="p-4 pb-2 sticky top-0 z-10"
            style={{
              background: "var(--bg-elevated)",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              Templates
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              {ATS_TEMPLATES.length} ATS-friendly layouts
            </p>
          </div>

          <div className="p-3 space-y-3">
            {ATS_TEMPLATES.map((template) => {
              const isActive = selectedTemplate === template.id;
              return (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template.id)}
                  className="w-full text-left rounded-xl border transition-all duration-200 overflow-hidden group"
                  style={{
                    borderColor: isActive ? "var(--indigo)" : "var(--border)",
                    background: isActive
                      ? "rgba(11,124,118,0.06)"
                      : "var(--bg-surface)",
                    boxShadow: isActive
                      ? "0 0 0 2px rgba(11,124,118,0.25)"
                      : "none",
                  }}
                >
                  {/* Mini preview */}
                  <div
                    className="w-full overflow-hidden transition-all duration-200"
                    style={{
                      height: "110px",
                      background: "#fff",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    {template.preview}
                  </div>

                  {/* Label */}
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <h3
                        className="font-semibold text-sm"
                        style={{
                          color: isActive
                            ? "var(--indigo)"
                            : "var(--text-primary)",
                        }}
                      >
                        {template.name}
                      </h3>
                      {isActive && (
                        <ChevronRight
                          className="w-3.5 h-3.5"
                          style={{ color: "var(--indigo)" }}
                        />
                      )}
                    </div>
                    <span
                      className="inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full mb-1.5"
                      style={{
                        background: `${template.tagColor}18`,
                        color: template.tagColor,
                        border: `1px solid ${template.tagColor}33`,
                      }}
                    >
                      {template.tag}
                    </span>
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {template.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ATS tips */}
          <div
            className="mx-3 mb-4 p-4 rounded-lg border"
            style={{
              background: "rgba(221,107,32,0.08)",
              borderColor: "rgba(221,107,32,0.3)",
            }}
          >
            <h4
              className="text-xs font-semibold mb-2"
              style={{ color: "#8a4219" }}
            >
              ✦ ATS Tips
            </h4>
            <ul
              className="text-xs space-y-1.5 list-disc list-inside"
              style={{ color: "#8a4219" }}
            >
              <li>Use simple single or two-column layouts.</li>
              <li>Avoid tables, text boxes, and images.</li>
              <li>Mirror keywords from the job description.</li>
              <li>Use standard fonts (Arial, Times New Roman, Calibri).</li>
              <li>Export as PDF to lock in formatting.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
