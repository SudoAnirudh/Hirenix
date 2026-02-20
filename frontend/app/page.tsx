import Link from "next/link";
import {
  ArrowRight,
  Brain,
  Github,
  Briefcase,
  Mic,
  TrendingUp,
  Zap,
  Shield,
  BarChart3,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Resume Scoring",
    desc: "Hybrid ATS scoring combining rule-based analysis and semantic embeddings.",
  },
  {
    icon: Github,
    title: "GitHub Intelligence",
    desc: "Compute your GitHub Performance Index across consistency, depth, and diversity.",
  },
  {
    icon: Briefcase,
    title: "Job Matching",
    desc: "Match your profile against any job description with semantic similarity + skill gap analysis.",
  },
  {
    icon: Mic,
    title: "Mock Interviews",
    desc: "AI-generated questions tailored to your role with structured answer feedback.",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracker",
    desc: "Track your Resume Evolution Score and improvement trends over time.",
  },
  {
    icon: Zap,
    title: "Instant Feedback",
    desc: "Get actionable, prioritised suggestions in seconds — not hours.",
  },
];

const stats = [
  { value: "94%", label: "ATS Pass Rate Improvement" },
  { value: "3×", label: "Faster Interview Prep" },
  { value: "10K+", label: "Resumes Analyzed" },
  { value: "500+", label: "Roles Covered" },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      {/* ── Navbar ── */}
      <nav
        className="fixed top-0 w-full z-50 border-b"
        style={{
          borderColor: "var(--border)",
          background: "rgba(10,10,15,0.85)",
          backdropFilter: "blur(16px)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-display font-bold text-xl gradient-text">
            Hirenix
          </span>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <button className="btn-ghost">Sign In</button>
            </Link>
            <Link href="/auth/register">
              <button className="btn-primary">Get Started</button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-36 pb-24 px-6 text-center relative overflow-hidden">
        {/* Background glow orbs */}
        <div
          className="absolute top-24 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-15"
          style={{ background: "var(--indigo)" }}
        />
        <div
          className="absolute top-32 right-1/4 w-72 h-72 rounded-full blur-3xl opacity-12"
          style={{ background: "var(--violet)" }}
        />

        <div className="relative z-10 max-w-4xl mx-auto animate-fade-up">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs font-medium"
            style={{
              background: "rgba(99,102,241,0.12)",
              border: "1px solid rgba(99,102,241,0.25)",
              color: "var(--indigo)",
            }}
          >
            <Zap size={12} /> AI-Powered Career Analytics Platform
          </div>
          <h1 className="font-display font-bold text-5xl md:text-7xl mb-6 leading-tight">
            Land Your Dream Job
            <br />
            <span className="gradient-text">With AI Precision</span>
          </h1>
          <p
            className="text-xl mb-10"
            style={{
              color: "var(--text-secondary)",
              maxWidth: "600px",
              margin: "0 auto 2.5rem",
            }}
          >
            ATS scoring, GitHub intelligence, job matching, and AI mock
            interviews — everything you need in one platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/upload">
              <button className="btn-primary animate-pulse-glow flex items-center gap-2 px-8 py-3 text-base">
                Analyse My Resume <ArrowRight size={16} />
              </button>
            </Link>
            <Link href="/pricing">
              <button className="btn-ghost px-8 py-3 text-base">
                View Pricing
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="glass-card p-6 text-center">
              <div className="font-display font-bold text-3xl gradient-text">
                {s.value}
              </div>
              <div
                className="text-sm mt-1"
                style={{ color: "var(--text-secondary)" }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display font-bold text-4xl mb-4">
              Everything You Need to{" "}
              <span className="gradient-text">Succeed</span>
            </h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Five powerful modules working together to accelerate your career.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glass-card p-6 flex flex-col gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(99,102,241,0.15)" }}
                >
                  <Icon size={20} style={{ color: "var(--indigo)" }} />
                </div>
                <h3 className="font-semibold text-base">{title}</h3>
                <p
                  className="text-sm"
                  style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}
                >
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto glass-card p-12 text-center relative overflow-hidden">
          <div
            className="absolute inset-0 rounded-2xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(99,102,241,0.05), rgba(139,92,246,0.05))",
            }}
          />
          <div className="relative z-10">
            <Shield
              size={40}
              style={{ color: "var(--indigo)", margin: "0 auto 1.5rem" }}
            />
            <h2 className="font-display font-bold text-3xl mb-4">
              Start Free, Scale as You Grow
            </h2>
            <p className="mb-8" style={{ color: "var(--text-secondary)" }}>
              No credit card required. Analyse your first 3 resumes for free.
            </p>
            <Link href="/auth/register">
              <button className="btn-primary px-10 py-3 text-base">
                Create Free Account
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="py-8 px-6 border-t text-center"
        style={{ borderColor: "var(--border)" }}
      >
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          © 2026 Hirenix. Built with Next.js, FastAPI & Supabase.
        </p>
      </footer>
    </main>
  );
}
