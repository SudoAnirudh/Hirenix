"use client";
import Link from "next/link";
import { useState } from "react";
import { signUp } from "@/lib/auth";
import { Brain, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const update = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({
      ...p,
      [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { error: err } = await signUp(form.email, form.password, form.name);
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
      setSuccess(true);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please check Vercel environment variables.";
      setError(errorMessage);
      setLoading(false);
    }
  }

  if (success)
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4 bg-background text-foreground overflow-hidden">
        {/* Background Orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-blue/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand-green/10 blur-[150px] rounded-full animate-pulse-slow" />
        </div>

        <div className="w-full max-w-md animate-fade-up relative z-10 text-center">
          <div className="glass-card p-12 rounded-[48px] border-border shadow-premium bg-card/40 backdrop-blur-3xl">
            <div className="w-20 h-20 bg-brand-green/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <span className="text-4xl">✉️</span>
            </div>
            <h2 className="text-3xl font-display font-bold tracking-tight mb-4 text-foreground">
              Check your email
            </h2>
            <p className="text-muted-foreground font-medium mb-10 leading-relaxed">
              We sent a verification link to <br />
              <strong className="text-foreground mt-2 inline-block font-bold">
                {form.email}
              </strong>
            </p>
            <Link href="/auth/login" className="block w-full">
              <Button className="w-full h-16 rounded-2xl bg-brand-blue text-card-foreground text-lg font-bold shadow-xl shadow-brand-blue/20 transition-all border-none">
                Go to Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );

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
          <div className="w-10 h-10 rounded-2xl bg-brand-blue flex items-center justify-center shadow-lg shadow-brand-blue/20 transition-transform">
            <Brain className="text-card-foreground" size={24} />
          </div>
          <span className="font-display font-black text-2xl text-foreground tracking-tighter uppercase italic">
            HIRENIX
          </span>
        </Link>

        <div className="glass-card p-10 md:p-12 rounded-[48px] border-border shadow-premium bg-card/40 backdrop-blur-3xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-display font-bold tracking-tight mb-3 text-foreground">
              Create your account
            </h1>
            <p className="text-muted-foreground font-medium">
              Free forever, no credit card required
            </p>
          </div>

          {error && (
            <div className="mb-8 p-4 rounded-2xl text-sm border border-destructive/20 bg-destructive/10 text-destructive font-medium animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {[
              {
                key: "name",
                label: "Full Name",
                type: "text",
                id: "reg-name",
                placeholder: "Jane Doe",
              },
              {
                key: "email",
                label: "Email Address",
                type: "email",
                id: "reg-email",
                placeholder: "you@example.com",
              },
              {
                key: "password",
                label: "Password",
                type: "password",
                id: "reg-password",
                placeholder: "Min. 8 characters",
              },
            ].map(({ key, label, type, id, placeholder }) => (
              <div key={key} className="space-y-2">
                <label
                  htmlFor={id}
                  className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1"
                >
                  {label}
                </label>
                <input
                  id={id}
                  type={type}
                  className="w-full h-14 px-6 rounded-2xl bg-background/50 border border-border focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 transition-all outline-none font-medium"
                  placeholder={placeholder}
                  value={form[key as keyof typeof form] as string}
                  onChange={update(key)}
                  required
                />
              </div>
            ))}

            <Button
              id="reg-submit"
              type="submit"
              disabled={loading}
              className="w-full h-16 rounded-2xl bg-brand-blue text-card-foreground text-lg font-bold shadow-xl shadow-brand-blue/20 transition-all active:scale-95 disabled:opacity-70 mt-4 border-none"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Free Account"
              )}
            </Button>
          </form>

          <p className="text-center mt-10 text-muted-foreground font-medium">
            Already have an account?{""}
            <Link
              href="/auth/login"
              className="text-brand-blue font-bold underline-offset-4"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
