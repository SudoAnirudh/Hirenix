"use client";
import Link from "next/link";
import { useState } from "react";
import { signUp } from "@/lib/auth";
import { Brain } from "lucide-react";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const update = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

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
      <div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-neutral-950">
        <div className="w-full max-w-md animate-fade-up text-center">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-10 rounded-3xl shadow-sm">
            <div className="text-5xl mb-6">✉️</div>
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white mb-3">
              Check your email
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8">
              We sent a verification link to <br />
              <strong className="text-neutral-900 dark:text-white mt-1 inline-block">
                {form.email}
              </strong>
            </p>
            <Link href="/auth/login" className="block w-full">
              <button className="w-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 py-2.5 rounded-xl text-sm font-medium transition-colors">
                Go to Login
              </button>
            </Link>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-neutral-950">
      <div className="w-full max-w-md animate-fade-up">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-8 md:p-10 rounded-3xl shadow-sm">
          <div className="flex justify-center mb-8">
            <div className="h-12 w-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-900 dark:text-white">
              <Brain size={24} />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white mb-2">
              Create your account
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Free forever — no credit card required
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl text-sm bg-red-50 text-red-600 border border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30">
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
                  className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  {label}
                </label>
                <input
                  id={id}
                  type={type}
                  className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white focus:border-transparent transition-all placeholder:text-neutral-400"
                  placeholder={placeholder}
                  value={form[key as keyof typeof form]}
                  onChange={update(key)}
                  required
                />
              </div>
            ))}
            <button
              id="reg-submit"
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Create Free Account"}
            </button>
          </form>

          <p className="text-sm text-center text-neutral-500 dark:text-neutral-400 mt-8">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-neutral-900 dark:text-white hover:underline underline-offset-4"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
