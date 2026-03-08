"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Brain } from "lucide-react";
import { updatePassword } from "@/lib/auth";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await updatePassword(password);
      if (updateError) {
        setError(updateError.message);
        return;
      }
      setSuccess(true);
      setTimeout(() => {
        router.replace("/auth/login");
      }, 1500);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to reset password. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
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
              Reset password
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Enter a new password for your account
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl text-sm border border-red-200 bg-red-50 text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-xl text-sm border border-emerald-200 bg-emerald-50 text-emerald-700">
              Password updated successfully. Redirecting to login...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label
                htmlFor="new-password"
                className="text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                New password
              </label>
              <input
                id="new-password"
                type="password"
                className="input-base"
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="confirm-password"
                className="text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                Confirm new password
              </label>
              <input
                id="confirm-password"
                type="password"
                className="input-base"
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full mt-2 btn-primary py-2.5 rounded-xl text-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>

          <p
            className="text-sm text-center mt-8"
            style={{ color: "var(--text-secondary)" }}
          >
            Back to{" "}
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
