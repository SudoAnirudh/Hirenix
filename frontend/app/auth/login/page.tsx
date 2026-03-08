"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getSession,
  onAuthStateChange,
  sendPasswordResetEmail,
  signIn,
} from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Brain } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function hydrateSession() {
      const session = await getSession();
      if (!mounted) return;

      if (session) {
        router.replace("/dashboard");
        router.refresh();
        return;
      }

      setCheckingSession(false);
    }

    hydrateSession();

    const subscription = onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        router.replace("/dashboard");
        router.refresh();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { error: err } = await signIn(email.trim(), password);
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
      router.replace("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during login.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    setError("");
    setResetMessage("");
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setError("Enter your email first, then click Forgot password.");
      return;
    }

    setResetLoading(true);
    try {
      const { error: resetError } =
        await sendPasswordResetEmail(normalizedEmail);
      if (resetError) {
        setError(resetError.message);
        return;
      }
      setResetMessage(
        "Password reset link sent. Check your inbox and spam folder.",
      );
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to send password reset email.";
      setError(errorMessage);
    } finally {
      setResetLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Checking session...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-up">
        <div className="glass-card p-8 md:p-10 rounded-3xl">
          <div className="flex justify-center mb-8">
            <div
              className="h-12 w-12 rounded-xl flex items-center justify-center"
              style={{
                background: "rgba(11, 124, 118, 0.12)",
                color: "var(--indigo)",
              }}
            >
              <Brain size={24} />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold tracking-tight mb-2">
              Welcome back
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Enter your credentials to access your account
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl text-sm border border-red-200 bg-red-50 text-red-700">
              {error}
            </div>
          )}
          {resetMessage && (
            <div className="mb-6 p-4 rounded-xl text-sm border border-emerald-200 bg-emerald-50 text-emerald-700">
              {resetMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
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

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="text-sm font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={resetLoading}
                  className="text-xs font-medium hover:underline underline-offset-4 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ color: "var(--indigo)" }}
                >
                  {resetLoading ? "Sending..." : "Forgot password?"}
                </button>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPass ? "text" : "password"}
                  className="input-base pr-11"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "var(--text-muted)" }}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full mt-2 btn-primary py-2.5 rounded-xl text-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p
            className="text-sm text-center mt-8"
            style={{ color: "var(--text-secondary)" }}
          >
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className="font-medium hover:underline underline-offset-4"
              style={{ color: "var(--indigo)" }}
            >
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
