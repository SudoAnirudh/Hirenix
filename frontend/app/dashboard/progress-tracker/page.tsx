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
} from "recharts";
import ReactMarkdown from "react-markdown";
import { Sparkles, Loader2, Copy, FileText, Check } from "lucide-react";
import { toast } from "sonner";
import { useReactToPrint } from "react-to-print";

interface TrendPoint {
  score: number;
}
interface ProgressData {
  resume_evolution_score: number;
  ats_trend: TrendPoint[];
  interview_trend: TrendPoint[];
}

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

  return (
    <div className="animate-fade-up max-w-4xl pb-20">
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
          className="glass-button flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-medium transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
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
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors text-zinc-400 hover:text-white"
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
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors text-zinc-400 hover:text-white"
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

          {/* Evolution Score */}
          <div className="glass-card p-8 flex flex-col items-center text-center">
            <div
              className="text-6xl font-display font-bold mb-2"
              style={{ color: scoreColor }}
            >
              {data ? `${evolutionScore}` : "—"}
            </div>
            <div className="font-semibold text-lg mb-1">
              Resume Evolution Score
            </div>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Weighted composite: 40% ATS · 40% Interview · 20% GPI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ATS Trend */}
            {data.ats_trend?.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="font-semibold text-sm mb-4">ATS Score Trend</h3>
                <ResponsiveContainer width="100%" height={200}>
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
                <ResponsiveContainer width="100%" height={200}>
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
          </div>

          {data.ats_trend?.length === 0 &&
            data.interview_trend?.length === 0 && (
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
