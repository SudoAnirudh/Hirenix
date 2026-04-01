"use client";
import Link from "next/link";
import { useState } from "react";
import { signUp } from "@/lib/auth";
import { Brain, Loader2 } from "lucide-react";

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
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-up text-center">
          <div className="glass-card p-10 rounded-3xl">
            <div className="text-5xl mb-6">✉️</div>
            <h2 className="text-2xl font-semibold tracking-tight mb-3">
              Check your email
            </h2>
            <p
              className="text-sm mb-8"
              style={{ color: "var(--text-secondary)" }}
            >
              We sent a verification link to <br />
              <strong
                style={{ color: "var(--text-primary)" }}
                className="mt-1 inline-block"
              >
                {form.email}
              </strong>
            </p>
            <Link href="/auth/login" className="block w-full">
              <button className="w-full btn-primary py-2.5 rounded-xl text-sm font-medium">
                Go to Login
              </button>
            </Link>
          </div>
        </div>
      </div>
    );

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
              Create your account
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Free forever, no credit card required
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl text-sm border border-red-200 bg-red-50 text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
                label: "Email",
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
              <div key={key} className="space-y-1.5">
                <label
                  htmlFor={id}
                  className="text-sm font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {label}
                </label>
                <input
                  id={id}
                  type={type}
                  className="input-base"
                  placeholder={placeholder}
                  value={form[key as keyof typeof form] as string}
                  onChange={update(key)}
                  required
                />
              </div>
            ))}

            <button
              id="reg-submit"
              type="submit"
              disabled={loading}
              className="w-full mt-2 btn-primary py-2.5 rounded-xl text-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C9ADD] focus-visible:ring-offset-2"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Free Account"
              )}
            </button>
          </form>

          <p
            className="text-sm text-center mt-8"
            style={{ color: "var(--text-secondary)" }}
          >
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-medium hover:underline underline-offset-4"
              style={{ color: "var(--indigo)" }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
