"use client";
import { useCallback, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { analyzeLinkedin, LinkedInAnalysis } from "@/lib/api";
import { FileText, CheckCircle, AlertCircle, Linkedin } from "lucide-react";

interface Props {
  onResult: (result: LinkedInAnalysis) => void;
}

type Status = "idle" | "uploading" | "success" | "error";
const MAX_FILE_BYTES = 10 * 1024 * 1024;

export default function LinkedinUploader({ onResult }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [fileName, setFileName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const onDrop = useCallback(
    async (accepted: File[]) => {
      if (!accepted.length) return;
      const file = accepted[0];
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        setErrorMsg("Only PDF files allowed.");
        setStatus("error");
        return;
      }
      if (file.size > MAX_FILE_BYTES) {
        setErrorMsg("File too large. Max size is 10MB.");
        setStatus("error");
        return;
      }

      setFileName(file.name);
      setStatus("uploading");
      setErrorMsg("");

      try {
        const result = await analyzeLinkedin(file);
        setStatus("success");
        onResult(result);
      } catch (e: unknown) {
        setErrorMsg((e as Error).message ?? "Analysis failed");
        setStatus("error");
      }
    },
    [onResult],
  );

  const onDropRejected = useCallback((rejections: FileRejection[]) => {
    const first = rejections[0];
    if (!first) return;
    const code = first.errors[0]?.code;
    if (code === "file-too-large") {
      setErrorMsg("File too large. Max size is 10MB.");
    } else if (code === "file-invalid-type") {
      setErrorMsg("Only PDF files allowed.");
    } else {
      setErrorMsg("Invalid file. Please upload a single PDF under 10MB.");
    }
    setStatus("error");
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    maxSize: MAX_FILE_BYTES,
  });

  const activeBorderColor = "#0A66C2"; // LinkedIn Blue
  const borderColorDefault = "rgba(10, 102, 194, 0.2)";
  const errorBorderColor = "#EF4444";
  const successBorderColor = "#10B981";

  return (
    <div
      {...getRootProps()}
      className={`glass-card p-12 flex flex-col items-center justify-center gap-6 cursor-pointer transition-all border-dashed border-2 rounded-[40px] bg-white/50 border-white/60 shadow-premium backdrop-blur-xl group ${
        isDragActive
          ? "bg-[#0A66C2]/5 border-[#0A66C2] scale-[0.99] shadow-inner"
          : " #0A66C2]/40"
      }`}
      style={{
        borderColor: isDragActive
          ? activeBorderColor
          : status === "success"
            ? successBorderColor
            : status === "error"
              ? errorBorderColor
              : borderColorDefault,
        minHeight: "320px",
      }}
    >
      <input {...getInputProps()} />

      {status === "idle" && (
        <>
          <div className="w-24 h-24 flex items-center justify-center rounded-[32px] bg-[#0A66C2]/10 text-[#0A66C2] transition-transform shadow-sm border border-white/50">
            <Linkedin size={40} strokeWidth={1.5} />
          </div>
          <div className="text-center space-y-4">
            <p className="font-display font-bold text-3xl text-[#2D3748] tracking-tight">
              {isDragActive ? "Drop your profile!" : "Analyze LinkedIn Profile"}
            </p>
            <p className="max-w-md text-sm font-medium text-[#718096] leading-relaxed">
              Export your LinkedIn profile to PDF and drop it here. We&apos;ll
              analyze your headline, about, and experience.
            </p>
            <div className="flex items-center justify-center gap-4 pt-2">
              <span className="text-[#0A66C2] font-bold cursor-pointer text-sm">
                Browse PDF
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Max 10MB
              </span>
            </div>
          </div>
        </>
      )}

      {status === "uploading" && (
        <>
          <div className="w-24 h-24 flex items-center justify-center rounded-[32px] bg-[#0A66C2]/10 text-[#0A66C2] animate-pulse">
            <FileText size={40} strokeWidth={1.5} />
          </div>
          <div className="text-center space-y-4">
            <p className="font-display font-bold text-3xl text-[#2D3748] tracking-tight">
              Analyzing Intelligence...
            </p>
            <div className="flex flex-col items-center gap-6">
              <p className="text-sm font-medium text-[#718096]">
                Scanning sections · Applying industry benchmarks
              </p>
              <div className="w-72 h-2.5 bg-white/50 rounded-full overflow-hidden border border-white/40 shadow-inner">
                <div className="h-full bg-linear-to-r from-[#0A66C2] to-[#00A0DC] animate-[loading_2s_ease-in-out_infinite]" />
              </div>
            </div>
          </div>
        </>
      )}

      {status === "success" && (
        <>
          <div className="w-24 h-24 flex items-center justify-center rounded-[32px] bg-[#10B981]/10 text-[#10B981] shadow-sm border border-white/50">
            <CheckCircle size={44} strokeWidth={1.5} />
          </div>
          <div className="text-center space-y-4">
            <p className="font-display font-bold text-3xl text-[#10B981] tracking-tight">
              Optimization Complete!
            </p>
            <p className="text-sm font-medium text-[#718096] bg-emerald-50 px-4 py-2 rounded-full inline-block">
              {fileName} · Scored & Analyzed
            </p>
          </div>
        </>
      )}

      {status === "error" && (
        <>
          <div className="w-24 h-24 flex items-center justify-center rounded-[32px] bg-[#EF4444]/10 text-[#EF4444] shadow-sm border border-white/50">
            <AlertCircle size={44} strokeWidth={1.5} />
          </div>
          <div className="text-center space-y-4">
            <p className="font-display font-bold text-3xl text-[#EF4444] tracking-tight">
              Analysis Failed
            </p>
            <p className="text-sm font-medium text-[#718096] bg-red-50 px-4 py-2 rounded-full inline-block">
              {errorMsg}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
