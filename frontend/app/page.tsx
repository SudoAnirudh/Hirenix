"use client";
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
  CheckCircle,
  Star,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Resume Scoring",
    desc: "Hybrid ATS scoring using rule-based analysis + semantic embeddings for 0–100 precision.",
    color: "var(--indigo)",
    bg: "rgba(99,102,241,0.12)",
  },
  {
    icon: Github,
    title: "GitHub Intelligence",
    desc: "Compute your GitHub Performance Index: consistency, depth, diversity, and production readiness.",
    color: "var(--violet)",
    bg: "rgba(139,92,246,0.12)",
  },
  {
    icon: Briefcase,
    title: "Job Matching",
    desc: "Cosine similarity + skill gap analysis to score your fit against any job description.",
    color: "var(--cyan)",
    bg: "rgba(6,182,212,0.12)",
  },
  {
    icon: Mic,
    title: "Mock Interviews",
    desc: "AI-tailored questions with 4-dimension feedback: clarity, technical depth, and communication.",
    color: "var(--pink)",
    bg: "rgba(236,72,153,0.12)",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracker",
    desc: "Visualise your Resume Evolution Score trend over every session and submission.",
    color: "var(--emerald)",
    bg: "rgba(16,185,129,0.12)",
  },
  {
    icon: Zap,
    title: "Instant Feedback",
    desc: "Prioritised, actionable suggestions delivered in seconds — not generic tips.",
    color: "var(--indigo)",
    bg: "rgba(99,102,241,0.12)",
  },
];

const stats = [
  { value: "94%", label: "ATS Pass Rate Improvement" },
  { value: "3×", label: "Faster Interview Prep" },
  { value: "10K+", label: "Resumes Analyzed" },
  { value: "500+", label: "Roles Covered" },
];

const steps = [
  {
    num: "01",
    title: "Upload Your Resume",
    desc: "Drop a PDF and our AI extracts, parses, and scores every section in seconds.",
  },
  {
    num: "02",
    title: "Connect GitHub",
    desc: "Enter your GitHub username and get a full performance index in under a minute.",
  },
  {
    num: "03",
    title: "Match a Job Description",
    desc: "Paste any JD and get a semantic match score with a prioritised skill gap report.",
  },
  {
    num: "04",
    title: "Practise Mock Interviews",
    desc: "Answer AI-generated questions tailored to your role and get structured feedback.",
  },
];

const testimonials = [
  {
    name: "Priya S.",
    role: "Frontend Engineer",
    text: "Went from a 48 ATS score to 91 in two weeks. The skill gap list was incredibly precise.",
    stars: 5,
  },
  {
    name: "Arjun M.",
    role: "ML Engineer",
    text: "The GitHub Intelligence module flagged weak areas I'd completely ignored. Game changer.",
    stars: 5,
  },
  {
    name: "Sara K.",
    role: "Data Analyst",
    text: "Mock interviews felt real. The 4-dimension feedback helped me nail my actual interviews.",
    stars: 5,
  },
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
          <span className="font-display font-bold text-xl gradient-text flex items-center gap-2">
            <Brain size={20} style={{ color: "var(--indigo)" }} /> Hirenix
          </span>
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
              className="text-sm font-medium transition-colors"
              style={{ color: "var(--text-secondary)" }}
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium transition-colors"
              style={{ color: "var(--text-secondary)" }}
            >
              How it Works
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium transition-colors"
              style={{ color: "var(--text-secondary)" }}
            >
              Pricing
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <button className="btn-ghost text-sm">Sign In</button>
            </Link>
            <Link href="/auth/register">
              <button className="btn-primary text-sm">Get Started →</button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-40 pb-28 px-6 text-center relative overflow-hidden">
        {/* Animated dot grid */}
        <div className="dot-grid absolute inset-0 opacity-30" />
        {/* Glow orbs */}
        <div
          className="absolute top-28 left-1/4 w-[32rem] h-[32rem] rounded-full blur-3xl"
          style={{ background: "rgba(99,102,241,0.12)" }}
        />
        <div
          className="absolute top-40 right-1/4 w-80 h-80 rounded-full blur-3xl"
          style={{ background: "rgba(139,92,246,0.10)" }}
        />
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[40rem] h-40 rounded-full blur-3xl"
          style={{ background: "rgba(6,182,212,0.07)" }}
        />

        <div className="relative z-10 max-w-4xl mx-auto animate-fade-up">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-7 text-xs font-semibold"
            style={{
              background: "rgba(99,102,241,0.12)",
              border: "1px solid rgba(99,102,241,0.28)",
              color: "var(--indigo)",
            }}
          >
            <Zap size={11} fill="currentColor" /> AI-Powered Career Analytics
            Platform
          </div>

          <h1
            className="font-display font-bold leading-[1.08] mb-7"
            style={{ fontSize: "clamp(2.8rem, 7vw, 5rem)" }}
          >
            Land Your Dream Job
            <br />
            <span className="gradient-text">With AI Precision</span>
          </h1>

          <p
            className="text-lg mb-10 mx-auto"
            style={{
              color: "var(--text-secondary)",
              maxWidth: "560px",
              lineHeight: 1.7,
            }}
          >
            ATS scoring · GitHub intelligence · job matching · AI mock
            interviews.
            <br />
            One platform. Real results.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
            <Link href="/upload">
              <button className="btn-primary animate-pulse-glow flex items-center gap-2 px-9 py-3.5 text-base">
                Analyse My Resume <ArrowRight size={16} />
              </button>
            </Link>
            <Link href="/pricing">
              <button className="btn-ghost px-9 py-3.5 text-base">
                View Pricing
              </button>
            </Link>
          </div>

          {/* Social proof strip */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <div className="flex -space-x-2">
              {["#6366f1", "#8b5cf6", "#06b6d4", "#ec4899"].map((c, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold"
                  style={{
                    background: c,
                    borderColor: "var(--bg-base)",
                    zIndex: 4 - i,
                  }}
                >
                  {["P", "A", "S", "R"][i]}
                </div>
              ))}
            </div>
            <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
              <span
                className="font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                2,400+
              </span>{" "}
              users improved their resume score this week
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section
        className="py-10 px-6 border-y"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center py-4">
              <div className="font-display font-bold text-4xl gradient-text">
                {s.value}
              </div>
              <div
                className="text-sm mt-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium mb-4"
              style={{
                background: "rgba(99,102,241,0.1)",
                color: "var(--indigo)",
              }}
            >
              Five Powerful Modules
            </div>
            <h2 className="font-display font-bold text-4xl md:text-5xl mb-4">
              Everything you need to{" "}
              <span className="gradient-text">succeed</span>
            </h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Each module is production-grade and powered by state-of-the-art
              AI.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc, color, bg }) => (
              <div
                key={title}
                className="glass-card p-7 flex flex-col gap-4 group"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ background: bg }}
                >
                  <Icon size={20} style={{ color }} />
                </div>
                <div>
                  <h3 className="font-semibold text-base mb-2">{title}</h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {desc}
                  </p>
                </div>
                <div
                  className="mt-auto pt-3 border-t"
                  style={{ borderColor: "var(--border)" }}
                >
                  <span className="text-xs font-medium" style={{ color }}>
                    Learn more →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it Works ── */}
      <section
        id="how-it-works"
        className="py-24 px-6"
        style={{ background: "var(--bg-surface)" }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium mb-4"
              style={{
                background: "rgba(99,102,241,0.1)",
                color: "var(--indigo)",
              }}
            >
              Simple Process
            </div>
            <h2 className="font-display font-bold text-4xl md:text-5xl mb-4">
              Up and running in <span className="gradient-text">4 steps</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {steps.map(({ num, title, desc }) => (
              <div key={num} className="glass-card p-7 flex gap-5">
                <div
                  className="font-display font-bold text-3xl shrink-0"
                  style={{ color: "rgba(99,102,241,0.3)" }}
                >
                  {num}
                </div>
                <div>
                  <h3 className="font-semibold text-base mb-2">{title}</h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium mb-4"
              style={{
                background: "rgba(16,185,129,0.1)",
                color: "var(--emerald)",
              }}
            >
              Real Results
            </div>
            <h2 className="font-display font-bold text-4xl mb-4">
              Loved by job seekers
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map(({ name, role, text, stars }) => (
              <div key={name} className="glass-card p-7 flex flex-col gap-4">
                <div className="flex gap-0.5">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill="var(--indigo)"
                      style={{ color: "var(--indigo)" }}
                    />
                  ))}
                </div>
                <p
                  className="text-sm leading-relaxed flex-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  "{text}"
                </p>
                <div>
                  <div className="font-semibold text-sm">{name}</div>
                  <div
                    className="text-xs mt-0.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        className="py-24 px-6 relative overflow-hidden"
        style={{ background: "var(--bg-surface)" }}
      >
        <div className="absolute inset-0 dot-grid opacity-20" />
        <div
          className="relative z-10 max-w-2xl mx-auto glass-card p-14 text-center"
          style={{
            border: "1px solid rgba(99,102,241,0.3)",
            boxShadow: "0 0 80px -20px rgba(99,102,241,0.3)",
          }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: "rgba(99,102,241,0.15)" }}
          >
            <Shield size={28} style={{ color: "var(--indigo)" }} />
          </div>
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">
            Start free. Land the job.
          </h2>
          <p className="mb-4" style={{ color: "var(--text-secondary)" }}>
            No credit card required. Analyse your first 3 resumes for free.
          </p>
          <div
            className="flex flex-col sm:flex-row gap-2 justify-center text-sm mb-8"
            style={{ color: "var(--text-muted)" }}
          >
            {[
              "Free forever plan",
              "No credit card needed",
              "Cancel anytime",
            ].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle size={13} style={{ color: "var(--emerald)" }} />
                {t}
              </span>
            ))}
          </div>
          <Link href="/auth/register">
            <button className="btn-primary px-12 py-3.5 text-base">
              Create Free Account
            </button>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="py-10 px-6 border-t"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-display font-bold gradient-text flex items-center gap-2">
            <Brain size={16} style={{ color: "var(--indigo)" }} /> Hirenix
          </span>
          <div
            className="flex gap-6 text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            <Link
              href="/pricing"
              className="hover:text-white transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/auth/login"
              className="hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="hover:text-white transition-colors"
            >
              Register
            </Link>
          </div>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            © 2026 Hirenix · Built with Next.js, FastAPI & Supabase
          </p>
        </div>
      </footer>
    </main>
  );
}
