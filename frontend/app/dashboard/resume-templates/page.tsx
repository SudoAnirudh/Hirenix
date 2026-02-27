"use client";

import { useState, useRef, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import { ResumeEditor } from "@/components/ResumeEditor";
import { Download, Loader2, Sparkles, LayoutTemplate } from "lucide-react";

const ATS_TEMPLATES = [
  {
    id: "classic",
    name: "Classic Professional",
    description: "A clean, traditional layout that passes 99% of ATS systems.",
    content: `
      <h1 style="text-align: center;">[Your Full Name]</h1>
      <p style="text-align: center;">City, State Zip | Phone | Email | LinkedIn URL | Portfolio URL</p>
      
      <h2>SUMMARY</h2>
      <hr />
      <p>Results-driven professional with [Number] years of experience in [Industry/Field]. Proven track record of [Key Achievement 1] and [Key Achievement 2]. Skilled at [Skill 1], [Skill 2], and [Skill 3]. Seeking to leverage expertise to contribute to [Company/Goal].</p>

      <h2>EXPERIENCE</h2>
      <hr />
      <h3><strong>[Recent Job Title]</strong></h3>
      <p><em>[Company Name] | [Location] | [Month, Year] – Present</em></p>
      <ul>
        <li>Led [Project/Initiative] resulting in [Quantifiable Result].</li>
        <li>Developed and implemented [System/Process] improving efficiency by [X]%.</li>
        <li>Collaborated with [Team/Department] to achieve [Goal].</li>
      </ul>

      <h3><strong>[Previous Job Title]</strong></h3>
      <p><em>[Company Name] | [Location] | [Month, Year] – [Month, Year]</em></p>
      <ul>
        <li>Managed [Responsibility] for [Client/Project].</li>
        <li>Spearheaded [Campaign/Strategy] that increased revenue by [X]%.</li>
      </ul>

      <h2>EDUCATION</h2>
      <hr />
      <p><strong>[Degree Name] in [Major]</strong> | [University Name], [Location]</p>
      <p><em>Graduated: [Month, Year]</em></p>

      <h2>SKILLS &amp; TECHNOLOGIES</h2>
      <hr />
      <ul>
        <li><strong>Languages/Frameworks:</strong> [Skill 1], [Skill 2], [Skill 3]</li>
        <li><strong>Tools:</strong> [Tool 1], [Tool 2], [Tool 3]</li>
        <li><strong>Soft Skills:</strong> Leadership, Communication, Problem Solving</li>
      </ul>
    `,
  },
  {
    id: "modern",
    name: "Modern Tech",
    description:
      "Slightly more modern flare, prioritizing skills and impact. ATS friendly.",
    content: `
      <h1>[Your Name]</h1>
      <p>[Contact Info] | [Links]</p>
      
      <h2>TECHNICAL SKILLS</h2>
      <hr />
      <p><strong>Frontend:</strong> React, Next.js, TypeScript, Tailwind CSS</p>
      <p><strong>Backend:</strong> Node.js, Python, PostgreSQL</p>
      <p><strong>Infrastructure:</strong> AWS, Docker, CI/CD</p>

      <h2>PROFESSIONAL EXPERIENCE</h2>
      <hr />
      <h3><strong>Senior Software Engineer</strong> - <em>[Company Name]</em></h3>
      <p><em>[Dates]</em></p>
      <ul>
        <li>Architected and built a high-performance system serving 10k+ concurrent users.</li>
        <li>Mentored 3 junior developers and established code review guidelines.</li>
        <li>Reduced load times by 40% through rigorous performance profiling.</li>
      </ul>

      <h3><strong>Software Engineer</strong> - <em>[Company Name]</em></h3>
      <p><em>[Dates]</em></p>
      <ul>
        <li>Developed 15+ RESTful APIs used by mobile and web clients.</li>
        <li>Integrated Stripe for seamless payment processing.</li>
      </ul>

      <h2>PROJECTS</h2>
      <hr />
      <p><strong>[Project Name]</strong> | <em>[Technologies Used]</em></p>
      <ul>
        <li>Open-source library with 500+ GitHub stars.</li>
        <li>Simplifies state management for React applications.</li>
      </ul>
      
      <h2>EDUCATION</h2>
      <hr />
      <p><strong>B.S. Computer Science</strong> - [University Name] (Graduated [Year])</p>
    `,
  },
];

export default function ResumeTemplatesPage() {
  const [content, setContent] = useState(ATS_TEMPLATES[0].content);
  const [selectedTemplate, setSelectedTemplate] = useState(ATS_TEMPLATES[0].id);
  const [isClient, setIsClient] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // Avoid hydration mismatch by rendering editor only on client
  useEffect(() => {
    const timer = setTimeout(() => setIsClient(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const handlePrint = useReactToPrint({
    contentRef: editorRef,
    documentTitle: "ATS_Resume",
  });

  const handleTemplateSelect = (templateId: string) => {
    const template = ATS_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      if (
        confirm(
          "Changing templates will overwrite your current progress. Are you sure?",
        )
      ) {
        setContent(template.content);
        setSelectedTemplate(templateId);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0a0a0a]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <LayoutTemplate className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Resume Builder
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Build ATS-friendly resumes that actually get parsed by recruiters.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handlePrint()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Editor Area */}
        <div className="flex-1 overflow-hidden p-6 print:p-0">
          <div className="h-full" ref={editorRef}>
            {isClient ? (
              <ResumeEditor content={content} onChange={setContent} />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-neutral-900 rounded-lg animate-pulse">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Templates */}
        <div className="w-80 border-l border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-neutral-900/30 overflow-y-auto shrink-0 print:hidden p-6">
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Templates
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Select a starting layout. Warning: changing templates overrides
              your content.
            </p>
          </div>

          <div className="space-y-4">
            {ATS_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                  selectedTemplate === template.id
                    ? "border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm"
                    : "border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:border-gray-300 dark:hover:border-gray-700"
                }`}
              >
                <div className="flex items-start justify-between">
                  <h3
                    className={`font-medium ${
                      selectedTemplate === template.id
                        ? "text-blue-900 dark:text-blue-100"
                        : "text-gray-900 dark:text-gray-100"
                    }`}
                  >
                    {template.name}
                  </h3>
                  {selectedTemplate === template.id && (
                    <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-500 mt-1.5" />
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                  {template.description}
                </p>
              </button>
            ))}
          </div>

          <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-900/50">
            <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 flex items-center gap-2 mb-2">
              ATS Tips
            </h4>
            <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-2 list-disc list-inside">
              <li>Avoid complex tables and columns.</li>
              <li>Use standard fonts (Arial, Times New Roman).</li>
              <li>Export as PDF to preserve formatting.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
