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
import { Eye, EyeOff, Brain, Loader2 } from "lucide-react";

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
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-background text-foreground overflow-hidden">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-blue/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand-green/10 blur-[150px] rounded-full animate-pulse-slow" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-brand-purple/5 blur-[100px] rounded-full" />
      </div>

      <div className="w-full max-w-md animate-fade-up relative z-10">
        <Link
          href="/"
          className="flex items-center gap-3 mb-10 group justify-center"
        >
          <div className="w-10 h-10 rounded-2xl bg-brand-blue flex items-center justify-center shadow-lg shadow-brand-blue/20 transition-transform group-hover:scale-110">
            <Brain className="text-white" size={24} />
          </div>
          <span className="font-display font-black text-2xl text-foreground tracking-tighter uppercase italic">
            HIRENIX
          </span>
        </Link>

        <div className="glass-card p-10 md:p-12 rounded-[48px] border-border shadow-premium bg-card/40 backdrop-blur-3xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-display font-bold tracking-tight mb-3 text-foreground">
              Welcome back
            </h1>
            <p className="text-muted-foreground font-medium">
              Access your career analytics dashboard
            </p>
          </div>

          {error && (
            <div className="mb-8 p-4 rounded-2xl text-sm border border-destructive/20 bg-destructive/10 text-destructive font-medium animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}
          {resetMessage && (
            <div className="mb-8 p-4 rounded-2xl text-sm border border-brand-green/20 bg-brand-green/10 text-brand-green font-medium animate-in fade-in slide-in-from-top-2">
              {resetMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="login-email"
                className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1"
              >
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                className="w-full h-14 px-6 rounded-2xl bg-background/50 border border-border focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 transition-all outline-none font-medium"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label
                  htmlFor="login-password"
                  className="text-xs font-black uppercase tracking-widest text-muted-foreground"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={resetLoading}
                  className="text-xs font-bold text-brand-blue hover:text-brand-blue/80 transition-colors disabled:opacity-60"
                >
                  {resetLoading ? "Sending..." : "Forgot password?"}
                </button>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPass ? "text" : "password"}
                  className="w-full h-14 px-6 rounded-2xl bg-background/50 border border-border focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 transition-all outline-none font-medium pr-14"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <Button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full h-16 rounded-2xl bg-brand-blue text-white text-lg font-bold shadow-xl shadow-brand-blue/20 hover:bg-brand-blue/90 transition-all active:scale-95 disabled:opacity-70 mt-4 border-none"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <p className="text-center mt-10 text-muted-foreground font-medium">
            New to Hirenix?{" "}
            <Link
              href="/auth/register"
              className="text-brand-blue font-bold hover:underline underline-offset-4"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
