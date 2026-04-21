"use client";
import React, { useEffect, useState, useRef } from "react";
import { getProgress, getAISummary } from "@/lib/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import ReactMarkdown from "react-markdown";
import { Sparkles, Loader2, Copy, FileText, Check, Rocket } from "lucide-react";
import { toast } from "sonner";
import { useReactToPrint } from "react-to-print";

interface TrendPoint {
  score: number;
}
interface ProgressData {
  resume_evolution_score: number;
  ats_trend: TrendPoint[];
  interview_trend: TrendPoint[];
  linkedin_trend: TrendPoint[];
}
interface RadarPoint {
  subject: string;
  value: number;
  fullMark: number;
}

// ─── Readiness Radar Chart ────────────────────────────────────────────────────
const ReadinessRadar = ({ data }: { data: RadarPoint[] }) => (
  <div className="glass-card p-6 flex flex-col h-full animate-fade-in shadow-xl shadow-indigo-500/10">
    <h3 className="font-display font-bold text-xs uppercase tracking-[0.2em] text-zinc-500 mb-6 flex items-center gap-2">
      <Rocket className="w-4 h-4 text-indigo-400" />
      Readiness Radar
    </h3>
    <div className="flex-1 min-h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.05)" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "var(--text-muted)", fontSize: 10, fontWeight: 700 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          <Radar
            name="Skills"
            dataKey="value"
            stroke="var(--indigo)"
            fill="var(--indigo)"
            fillOpacity={0.5}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

// ─── PDF Template Component ──────────────────────────────────────────────────
const PDFTemplate = React.forwardRef<
  HTMLDivElement,
  { summary: string; date: string }
>(({ summary, date }, ref) => {
  return (
    <div
      ref={ref}
      className="p-12 bg-white text-zinc-900 relative min-h-screen"
    >
      {/* Watermark */}
      <div
        className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden"
        style={{ zIndex: 0 }}
      >
        <div
          className="text-zinc-100 font-display font-black text-[150px] -rotate-45 select-none opacity-50"
          style={{ letterSpacing: "0.1em" }}
        >
          HIRENIX
        </div>
      </div>

      {/* Header */}
      <div className="relative z-10 border-b-2 border-zinc-900 pb-6 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-display font-black tracking-tighter">
            HIRENIX
          </h1>
          <p className="text-sm font-bold uppercase tracking-widest text-zinc-500">
            AI Career Intelligence Report
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-mono text-zinc-400">DATE: {date}</p>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 prose prose-zinc max-w-none">
        <ReactMarkdown
          components={{
            h1: ({ ...props }) => (
              <h1
                className="text-2xl font-bold mb-4 mt-8 border-l-4 border-zinc-900 pl-4"
                {...props}
              />
            ),
            h2: ({ ...props }) => (
              <h2
                className="text-xl font-bold mb-3 mt-6 text-zinc-800"
                {...props}
              />
            ),
            h3: ({ ...props }) => (
              <h3 className="text-lg font-bold mb-2 mt-4" {...props} />
            ),
            p: ({ ...props }) => (
              <p className="mb-4 text-zinc-700 leading-relaxed" {...props} />
            ),
            ul: ({ ...props }) => (
              <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />
            ),
            strong: ({ ...props }) => (
              <strong className="font-bold text-zinc-900" {...props} />
            ),
          }}
        >
          {summary}
        </ReactMarkdown>
      </div>

      {/* Footer */}
      <div className="absolute bottom-12 left-12 right-12 border-t border-zinc-200 pt-4 flex justify-between items-center text-[10px] text-zinc-400 font-mono uppercase tracking-widest z-10">
        <div>Proprietary AI Analysis • Hirenix SaaS</div>
        <div>Page 1 of 1</div>
      </div>
    </div>
  );
});

PDFTemplate.displayName = "PDFTemplate";

export default function ProgressTrackerPage() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Hirenix_Analysis_${new Date().toISOString().split("T")[0]}`,
  });

  useEffect(() => {
    getProgress()
      .then((res) => setData(res as ProgressData))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleGenerateSummary = async () => {
    setGenerating(true);
    try {
      const res = await getAISummary();
      setSummary(res.summary);
      toast.success("AI Summary generated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate summary.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard!");
  };

  const evolutionScore = data?.resume_evolution_score ?? 0;
  const scoreColor =
    evolutionScore >= 75
      ? "var(--emerald)"
      : evolutionScore >= 50
        ? "var(--indigo)"
        : "var(--pink)";

  // Derived Radar Data
  const radarData = [
    {
      subject: "Technical",
      value: data?.ats_trend?.at(-1)?.score || 50,
      fullMark: 100,
    },
    {
      subject: "Soft Skills",
      value: data?.interview_trend?.at(-1)?.score || 40,
      fullMark: 100,
    },
    { subject: "Velocity", value: evolutionScore, fullMark: 100 },
    {
      subject: "Reach",
      value: data?.linkedin_trend?.at(-1)?.score || 50,
      fullMark: 100,
    },
    { subject: "Consistency", value: 80, fullMark: 100 }, // Mock consistency
  ];

  return (
    <div className="animate-fade-up w-full pb-20">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h1 className="font-display font-bold text-3xl mb-2">
            Progress Tracker
          </h1>
          <p className="mb-4" style={{ color: "var(--text-secondary)" }}>
            Track your career improvement over time via the Resume Evolution
            Score.
          </p>
        </div>
        <button
          onClick={handleGenerateSummary}
          disabled={generating || loading}
          className="glass-button flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-medium transition-all active:scale-95 disabled:opacity-50"
          style={{
            background: "var(--indigo)",
            color: "white",
            border: "none",
          }}
        >
          {generating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {generating ? "Synthesizing..." : "Generate AI Summary"}
        </button>
      </div>

      {loading && (
        <div
          className="glass-card p-10 text-center"
          style={{ color: "var(--text-secondary)" }}
        >
          Loading your progress…
        </div>
      )}

      {data && (
        <div className="space-y-6">
          {/* AI Summary Section */}
          {summary && (
            <div className="glass-card p-8 border-indigo/20 relative animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2 text-indigo-400 font-display font-bold text-xl">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  AI Performance Insights
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-lg transition-colors text-zinc-400"
                    title="Copy to clipboard"
                  >
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={handlePrint}
                    className="p-2 rounded-lg transition-colors text-zinc-400"
                    title="Download Report (PDF)"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div
                className="prose prose-invert max-w-none text-sm leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                <ReactMarkdown
                  components={{
                    h1: ({ ...props }) => (
                      <h1
                        className="text-white font-display font-bold text-lg mb-2 mt-4"
                        {...props}
                      />
                    ),
                    h2: ({ ...props }) => (
                      <h2
                        className="text-white font-display font-bold text-md mb-2 mt-4"
                        {...props}
                      />
                    ),
                    h3: ({ ...props }) => (
                      <h3
                        className="text-white font-bold text-sm mb-1 mt-3"
                        {...props}
                      />
                    ),
                    p: ({ ...props }) => <p className="mb-3" {...props} />,
                    ul: ({ ...props }) => (
                      <ul
                        className="list-disc pl-5 mb-3 space-y-1"
                        {...props}
                      />
                    ),
                    li: ({ ...props }) => <li {...props} />,
                    strong: ({ ...props }) => (
                      <strong className="text-indigo-300" {...props} />
                    ),
                  }}
                >
                  {summary}
                </ReactMarkdown>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Evolution Score Card */}
            <div className="glass-card p-8 flex flex-col items-center justify-center text-center md:col-span-1 shadow-xl shadow-indigo-500/5">
              <div
                className="text-7xl font-display font-black tracking-tighter mb-2"
                style={{ color: scoreColor }}
              >
                {data ? `${evolutionScore}` : "—"}
              </div>
              <div className="font-display font-bold text-lg mb-1 uppercase tracking-wider">
                Readiness Index
              </div>
              <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-[0.2em]">
                Verified Analysis
              </p>
            </div>

            {/* Radar Analysis */}
            <div className="md:col-span-2">
              <ReadinessRadar data={radarData} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ATS Trend */}
            {data.ats_trend?.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="font-semibold text-sm mb-4">ATS Score Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={data.ats_trend.map((p: TrendPoint, i: number) => ({
                      name: `#${i + 1}`,
                      score: p.score,
                    }))}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.05)"
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border)",
                        borderRadius: "10px",
                        fontSize: "12px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="var(--indigo)"
                      strokeWidth={2}
                      dot={{ fill: "var(--indigo)", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Interview Trend */}
            {data.interview_trend?.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="font-semibold text-sm mb-4">
                  Interview Score Trend
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={data.interview_trend.map(
                      (p: TrendPoint, i: number) => ({
                        name: `#${i + 1}`,
                        score: p.score,
                      }),
                    )}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.05)"
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border)",
                        borderRadius: "10px",
                        fontSize: "12px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="var(--violet)"
                      strokeWidth={2}
                      dot={{ fill: "var(--violet)", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* LinkedIn Trend */}
            {data.linkedin_trend?.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="font-semibold text-sm mb-4">
                  LinkedIn Brand Trend
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={data.linkedin_trend.map(
                      (p: TrendPoint, i: number) => ({
                        name: `#${i + 1}`,
                        score: p.score,
                      }),
                    )}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.05)"
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border)",
                        borderRadius: "10px",
                        fontSize: "12px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#0A66C2"
                      strokeWidth={2}
                      dot={{ fill: "#0A66C2", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {data.ats_trend?.length === 0 &&
            data.interview_trend?.length === 0 &&
            data.linkedin_trend?.length === 0 && (
              <div
                className="glass-card p-10 text-center"
                style={{ color: "var(--text-secondary)" }}
              >
                No history yet. Upload a resume and complete an interview to see
                your trends.
              </div>
            )}
        </div>
      )}

      {/* Hidden PDF Template for Export */}
      <div style={{ display: "none" }}>
        {summary && (
          <PDFTemplate
            ref={printRef}
            summary={summary}
            date={new Date().toLocaleDateString()}
          />
        )}
      </div>
    </div>
  );
}
