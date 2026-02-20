"use client";
import Link from "next/link";
import { useState } from "react";
import { signIn } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Brain } from "lucide-react";

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
    <div
      className="min-h-screen flex items-center justify-center px-4 relative"
      style={{ background: "var(--bg-base)" }}
    >
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-10"
        style={{ background: "var(--indigo)" }}
      />
      <div className="glass-card p-8 w-full max-w-md animate-fade-up relative z-10">
        <div className="flex items-center gap-2 justify-center mb-8">
          <Brain size={24} style={{ color: "var(--indigo)" }} />
          <span className="font-display font-bold text-xl gradient-text">
            Hirenix
          </span>
        </div>
        <h1 className="font-display font-bold text-2xl text-center mb-2">
          Welcome back
        </h1>
        <p
          className="text-sm text-center mb-8"
          style={{ color: "var(--text-secondary)" }}
        >
          Sign in to your account
        </p>

        {error && (
          <div
            className="mb-4 p-3 rounded-lg text-sm"
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#f87171",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              className="text-xs font-medium mb-1 block"
              style={{ color: "var(--text-secondary)" }}
            >
              Email
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
            <label
              className="text-xs font-medium mb-1 block"
              style={{ color: "var(--text-secondary)" }}
            >
              Password
            </label>
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
            className="btn-primary mt-2"
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p
          className="text-sm text-center mt-6"
          style={{ color: "var(--text-secondary)" }}
        >
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/register"
            className="font-medium"
            style={{ color: "var(--indigo)" }}
          >
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}
