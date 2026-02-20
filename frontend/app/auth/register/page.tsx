"use client";
import Link from "next/link";
import { useState } from "react";
import { signUp } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Brain } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
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
        <div className="glass-card p-10 max-w-md w-full text-center animate-fade-up">
          <div className="text-5xl mb-4">✉️</div>
          <h2 className="font-display font-bold text-2xl mb-2">
            Check your email
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>
            We sent a verification link to <strong>{form.email}</strong>
          </p>
          <Link href="/auth/login">
            <button className="btn-primary mt-6 w-full">Go to Login</button>
          </Link>
        </div>
      </div>
    );

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative"
      style={{ background: "var(--bg-base)" }}
    >
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-10"
        style={{ background: "var(--violet)" }}
      />
      <div className="glass-card p-8 w-full max-w-md animate-fade-up relative z-10">
        <div className="flex items-center gap-2 justify-center mb-8">
          <Brain size={24} style={{ color: "var(--indigo)" }} />
          <span className="font-display font-bold text-xl gradient-text">
            Hirenix
          </span>
        </div>
        <h1 className="font-display font-bold text-2xl text-center mb-2">
          Create your account
        </h1>
        <p
          className="text-sm text-center mb-8"
          style={{ color: "var(--text-secondary)" }}
        >
          Free forever — no credit card required
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
            <div key={key}>
              <label
                className="text-xs font-medium mb-1 block"
                style={{ color: "var(--text-secondary)" }}
              >
                {label}
              </label>
              <input
                id={id}
                type={type}
                className="input-base"
                placeholder={placeholder}
                value={(form as any)[key]}
                onChange={update(key)}
                required
              />
            </div>
          ))}
          <button
            id="reg-submit"
            type="submit"
            className="btn-primary mt-2"
            disabled={loading}
          >
            {loading ? "Creating account…" : "Create Free Account"}
          </button>
        </form>
        <p
          className="text-sm text-center mt-6"
          style={{ color: "var(--text-secondary)" }}
        >
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-medium"
            style={{ color: "var(--indigo)" }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
