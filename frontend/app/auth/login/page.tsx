"use client";
import Link from "next/link";
import { useState } from "react";
import { signIn } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Brain, FileText, Github, Briefcase } from "lucide-react";

const features = [
  { icon: FileText, label: "Resume ATS Scoring" },
  { icon: Github, label: "GitHub Intelligence" },
  { icon: Briefcase, label: "Job Match Analysis" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error: err } = await signIn(email, password);
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-base)" }}>
      {/* ── Left panel (branding) ── */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 w-[46%] relative overflow-hidden"
        style={{
          background: "var(--bg-surface)",
          borderRight: "1px solid var(--border)",
        }}
      >
        <div className="absolute inset-0 dot-grid opacity-25" />
        <div
          className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl"
          style={{ background: "rgba(99,102,241,0.12)" }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <Brain size={22} style={{ color: "var(--indigo)" }} />
            <span className="font-display font-bold text-xl gradient-text">
              Hirenix
            </span>
          </div>
        </div>

        <div className="relative z-10">
          <h2 className="font-display font-bold text-4xl mb-4 leading-tight">
            Your career,
            <br />
            <span className="gradient-text">supercharged</span>
          </h2>
          <p
            className="text-sm mb-8"
            style={{ color: "var(--text-secondary)" }}
          >
            Everything you need to land your next role — all in one platform.
          </p>
          <div className="flex flex-col gap-3">
            {features.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "rgba(99,102,241,0.12)" }}
                >
                  <Icon size={15} style={{ color: "var(--indigo)" }} />
                </div>
                {label}
              </div>
            ))}
          </div>
        </div>

        <p
          className="relative z-10 text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          © 2026 Hirenix
        </p>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md animate-fade-up">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 justify-center mb-10">
            <Brain size={22} style={{ color: "var(--indigo)" }} />
            <span className="font-display font-bold text-xl gradient-text">
              Hirenix
            </span>
          </div>

          <h1 className="font-display font-bold text-3xl mb-2">Welcome back</h1>
          <p
            className="text-sm mb-8"
            style={{ color: "var(--text-secondary)" }}
          >
            Sign in to your account to continue.
          </p>

          {error && (
            <div
              className="mb-5 p-3.5 rounded-lg text-sm"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.25)",
                color: "#f87171",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label
                className="text-xs font-medium mb-1.5 block"
                style={{ color: "var(--text-secondary)" }}
              >
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                className="input-base"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  className="text-xs font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs"
                  style={{ color: "var(--indigo)" }}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPass ? "text" : "password"}
                  className="input-base pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              id="login-submit"
              type="submit"
              className="btn-primary mt-1 py-3"
              disabled={loading}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div
              className="h-px flex-1"
              style={{ background: "var(--border)" }}
            />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              or
            </span>
            <div
              className="h-px flex-1"
              style={{ background: "var(--border)" }}
            />
          </div>

          <p
            className="text-sm text-center"
            style={{ color: "var(--text-secondary)" }}
          >
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className="font-semibold"
              style={{ color: "var(--indigo)" }}
            >
              Create one free →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
