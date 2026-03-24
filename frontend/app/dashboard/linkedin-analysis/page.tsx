"use client";
import { useState } from "react";
import { analyzeLinkedin } from "@/lib/api";
import ScoreCard from "@/components/ScoreCard";
import { Linkedin, Search } from "lucide-react";

interface AnalysisResult {
  lpi_score: number;
  metrics: {
    completeness_score: number;
    experience_score: number;
    education_score: number;
    network_presence_score: number;
  };
  strengths: string[];
  recommendations: string[];
}

export default function LinkedinAnalysisPage() {
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");

  async function handleAnalyze() {
    if (!linkedinUrl.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await analyzeLinkedin(linkedinUrl.trim());
      setResult(data as AnalysisResult);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const metrics = result
    ? [
        { label: "Completeness", value: result.metrics.completeness_score },
        { label: "Experience", value: result.metrics.experience_score },
        { label: "Education", value: result.metrics.education_score },
        {
          label: "Network Presence",
          value: result.metrics.network_presence_score,
        },
      ]
    : [];

  return (
    <div className="animate-fade-up max-w-4xl">
      <h1 className="font-display font-bold text-3xl mb-2">
        LinkedIn Intelligence
      </h1>
      <p className="mb-8" style={{ color: "var(--text-secondary)" }}>
        Analyse any public LinkedIn profile to compute a LinkedIn Performance
        Index (LPI).
      </p>

      <div className="glass-card p-6 mb-8">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Linkedin
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              id="linkedin-url"
              className="input-base pl-9"
              placeholder="LinkedIn Profile URL (e.g. https://linkedin.com/in/username)"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            />
          </div>
          <button
            id="linkedin-analyze-btn"
            className="btn-primary flex items-center gap-2"
            onClick={handleAnalyze}
            disabled={loading}
          >
            <Search size={14} /> {loading ? "Analysing…" : "Analyse"}
          </button>
        </div>
        {error && (
          <p className="text-sm mt-3" style={{ color: "#f87171" }}>
            {error}
          </p>
        )}
        <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>
          ⚠ LinkedIn deep analysis requires a Pro plan.
        </p>
      </div>

      {result && (
        <div className="animate-fade-up space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ScoreCard
              title="LPI Score"
              score={result.lpi_score}
              subtitle="LinkedIn Performance Index"
            />

            {/* Metric bars inside the grid to take remaining space */}
            <div className="glass-card p-6 md:col-span-2">
              <h3 className="font-semibold text-sm mb-4">LPI Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {metrics.map(({ label, value }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: "var(--text-secondary)" }}>
                        {label}
                      </span>
                      <span className="font-medium">{Math.round(value)}%</span>
                    </div>
                    <div
                      className="h-2 rounded-full"
                      style={{ background: "var(--bg-elevated)" }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${value}%`,
                          background:
                            "linear-gradient(90deg, var(--violet), var(--cyan))",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Strengths + Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h3
                className="font-semibold text-sm mb-3"
                style={{ color: "var(--emerald)" }}
              >
                Strengths
              </h3>
              {result.strengths.map((s: string, i: number) => (
                <p
                  key={i}
                  className="text-sm mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  ✓ {s}
                </p>
              ))}
            </div>
            <div className="glass-card p-6">
              <h3
                className="font-semibold text-sm mb-3"
                style={{ color: "var(--indigo)" }}
              >
                Recommendations
              </h3>
              {result.recommendations.map((r: string, i: number) => (
                <p
                  key={i}
                  className="text-sm mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  → {r}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
