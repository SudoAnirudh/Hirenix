"use client";
import Navbar from "@/components/Navbar";
import ResumeUploader from "@/components/ResumeUploader";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();

  function handleResult(result: unknown) {
    // Redirect to resume analysis dashboard with result
    localStorage.setItem("latest_resume", JSON.stringify(result));
    router.push("/dashboard/resume-analysis");
  }

  return (
    <>
      <Navbar />
      <main
        className="min-h-screen pt-28 pb-16 px-6 max-w-2xl mx-auto"
        style={{ background: "var(--bg-base)" }}
      >
        <div className="text-center mb-10 animate-fade-up">
          <h1 className="font-display font-bold text-4xl mb-3">
            Upload Your Resume
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Get an AI-powered ATS score and actionable feedback in seconds.
          </p>
        </div>
        <ResumeUploader onResult={handleResult} />
        <p
          className="text-xs text-center mt-6"
          style={{ color: "var(--text-muted)" }}
        >
          Supports PDF format · Max 10MB · Your data is encrypted and private
        </p>
      </main>
    </>
  );
}
