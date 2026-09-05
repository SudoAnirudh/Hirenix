"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getSession,
  sendPasswordResetEmail,
  signIn,
  signInAnonymously,
} from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Brain, Loader2, Lock, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import LoadingScreen from "@/components/ui/LoadingScreen";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [showGuestNameInput, setShowGuestNameInput] = useState(false);
  const [guestName, setGuestName] = useState("");
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

    return () => {
      mounted = false;
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

  async function handleGuestSignIn(name?: string) {
    setGuestLoading(true);
    setError("");
    try {
      const { error: err } = await signInAnonymously(name);
      if (err) {
        setError(err.message);
        setGuestLoading(false);
        return;
      }
      router.replace("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during guest sign in.";
      setError(errorMessage);
      setGuestLoading(false);
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
      <LoadingScreen
        message="Verifying Auth Session"
        submessage="Connecting to Hirenix Gateway"
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background text-foreground">
      <div className="w-full max-w-md space-y-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 justify-center group"
        >
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-extrabold shadow-xs">
            <Brain size={20} />
          </div>
          <span className="font-heading font-bold text-xl tracking-tight text-foreground group-hover:text-primary transition-colors">
            Hirenix Workstation
          </span>
        </Link>

        <div className="p-8 rounded-xl border border-border bg-card shadow-xs space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-xl font-bold font-heading text-foreground">
              Sign In to your Account
            </h1>
            <p className="text-xs text-muted-foreground">
              Enter your credentials to access career intelligence tools
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/40 text-xs text-red-700 dark:text-red-300">
              {error}
            </div>
          )}
          {resetMessage && (
            <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 text-xs text-emerald-700 dark:text-emerald-300">
              {resetMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label
                htmlFor="login-email"
                className="font-semibold text-foreground"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  id="login-email"
                  type="email"
                  className="w-full pl-9 pr-3 py-2.5 bg-muted/40 border border-border rounded-lg text-xs font-mono text-foreground focus:outline-none focus:border-primary"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="font-semibold text-foreground"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={resetLoading}
                  className="text-[11px] font-semibold text-primary hover:underline"
                >
                  {resetLoading ? "Sending..." : "Forgot password?"}
                </button>
              </div>
              <div className="relative">
                <Lock
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  id="login-password"
                  type={showPass ? "text" : "password"}
                  className="w-full pl-9 pr-10 py-2.5 bg-muted/40 border border-border rounded-lg text-xs font-mono text-foreground focus:outline-none focus:border-primary"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <Button
              id="login-submit"
              type="submit"
              disabled={loading}
              variant="primary"
              className="w-full py-2.5 text-xs font-bold"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink mx-3 text-[10px] font-mono font-bold text-muted-foreground uppercase">
              OR
            </span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          {!showGuestNameInput ? (
            <Button
              id="login-guest"
              type="button"
              variant="outline"
              onClick={() => setShowGuestNameInput(true)}
              disabled={loading || guestLoading}
              className="w-full py-2.5 text-xs font-semibold"
            >
              Continue as Guest Demo
            </Button>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Guest Name (Optional)"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full px-3 py-2 bg-muted/40 border border-border rounded-lg text-xs font-mono focus:outline-none focus:border-primary"
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowGuestNameInput(false)}
                  className="w-1/3"
                >
                  Cancel
                </Button>
                <Button
                  id="login-guest-confirm"
                  type="button"
                  size="sm"
                  onClick={() => handleGuestSignIn(guestName)}
                  isLoading={guestLoading}
                  disabled={guestLoading}
                  className="flex-1"
                >
                  Confirm Guest Login
                </Button>
              </div>
            </div>
          )}

          <p className="text-center text-xs text-muted-foreground pt-2">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className="text-primary font-bold hover:underline"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
