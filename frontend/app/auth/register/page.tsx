"use client";
import Link from "next/link";
import { useState } from "react";
import { signUp } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Brain, CheckCircle, Eye, EyeOff } from "lucide-react";

const perks = [
  "3 free resume analyses per month",
  "Basic ATS score + section feedback",
  "2 job description matches",
  "5 mock interview questions",
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const update = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError("");
    const { error: err } = await signUp(form.email, form.password, form.name);
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    setSuccess(true);
  }

  if (success)
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--bg-base)" }}
      >
        <div className="glass-card p-12 max-w-md w-full text-center animate-fade-up">
          <div className="text-5xl mb-5">✉️</div>
          <h2 className="font-display font-bold text-2xl mb-2">
            Check your inbox
          </h2>
          <p
            className="text-sm mb-6"
            style={{ color: "var(--text-secondary)" }}
          >
            We sent a verification link to{" "}
            <strong style={{ color: "var(--text-primary)" }}>
              {form.email}
            </strong>
          </p>
          <Link href="/auth/login">
            <button className="btn-primary w-full">Go to Login</button>
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-base)" }}>
      {/* Left panel */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 w-[46%] relative overflow-hidden"
        style={{
          background: "var(--bg-surface)",
          borderRight: "1px solid var(--border)",
        }}
      >
        <div className="absolute inset-0 dot-grid opacity-25" />
        <div
          className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl"
          style={{ background: "rgba(139,92,246,0.10)" }}
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
          <div className="badge badge-indigo mb-6">🎉 Free Forever Plan</div>
          <h2 className="font-display font-bold text-4xl mb-4 leading-tight">
            Start your journey
            <br />
            <span className="gradient-text">for free</span>
          </h2>
          <p
            className="text-sm mb-6"
            style={{ color: "var(--text-secondary)" }}
          >
            No credit card. No commitment. Upgrade whenever you're ready.
          </p>
          <div className="flex flex-col gap-3">
            {perks.map((p) => (
              <div
                key={p}
                className="flex items-center gap-2.5 text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                <CheckCircle
                  size={14}
                  style={{ color: "var(--emerald)", flexShrink: 0 }}
                />{" "}
                {p}
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

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md animate-fade-up">
          <div className="flex lg:hidden items-center gap-2 justify-center mb-10">
            <Brain size={22} style={{ color: "var(--indigo)" }} />
            <span className="font-display font-bold text-xl gradient-text">
              Hirenix
            </span>
          </div>

          <h1 className="font-display font-bold text-3xl mb-2">
            Create your account
          </h1>
          <p
            className="text-sm mb-8"
            style={{ color: "var(--text-secondary)" }}
          >
            Free forever — no credit card needed.
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
                Full Name
              </label>
              <input
                id="reg-name"
                type="text"
                className="input-base"
                placeholder="Jane Doe"
                value={form.name}
                onChange={update("name")}
                required
              />
            </div>
            <div>
              <label
                className="text-xs font-medium mb-1.5 block"
                style={{ color: "var(--text-secondary)" }}
              >
                Email address
              </label>
              <input
                id="reg-email"
                type="email"
                className="input-base"
                placeholder="you@example.com"
                value={form.email}
                onChange={update("email")}
                required
              />
            </div>
            <div>
              <label
                className="text-xs font-medium mb-1.5 block"
                style={{ color: "var(--text-secondary)" }}
              >
                Password{" "}
                <span style={{ color: "var(--text-muted)" }}>
                  (min. 8 chars)
                </span>
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPass ? "text" : "password"}
                  className="input-base pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={update("password")}
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
              id="reg-submit"
              type="submit"
              className="btn-primary mt-1 py-3"
              disabled={loading}
            >
              {loading ? "Creating account…" : "Create Free Account"}
            </button>
          </form>

          <p
            className="text-xs text-center mt-4"
            style={{ color: "var(--text-muted)" }}
          >
            By signing up you agree to our Terms of Service and Privacy Policy.
          </p>

          <div className="flex items-center gap-3 my-6">
            <div
              className="h-px flex-1"
              style={{ background: "var(--border)" }}
            />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              already have an account?
            </span>
            <div
              className="h-px flex-1"
              style={{ background: "var(--border)" }}
            />
          </div>
          <Link href="/auth/login">
            <button className="btn-ghost w-full">Sign In →</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
