"use client";
import { useCallback, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { uploadResume } from "@/lib/api";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";

interface Props {
  onResult: (result: unknown) => void;
}

type Status = "idle" | "uploading" | "success" | "error";
const MAX_FILE_BYTES = 10 * 1024 * 1024;

export default function ResumeUploader({ onResult }: Props) {
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
        const result = await uploadResume(file);
        setStatus("success");
        onResult(result);
      } catch (e: unknown) {
        setErrorMsg((e as Error).message ?? "Upload failed");
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

  const activeBorderColor = "#7C9ADD";
  const borderColorDefault = "rgba(124, 154, 221, 0.3)";
  const errorBorderColor = "#F28C8C"; // Soft red
  const successBorderColor = "#98C9A3"; // Soft emerald

  return (
    <div
      {...getRootProps()}
      id="resume-dropzone"
      className={`glass-card p-12 flex flex-col items-center justify-center gap-6 cursor-pointer transition-all border-dashed rounded-[32px] bg-white/40 border-white/60 shadow-glass backdrop-blur-xl group ${
        isDragActive
          ? "bg-[#7C9ADD]/5 border-[#7C9ADD] scale-[0.99] shadow-inner"
          : "hover:bg-white/60 hover:border-[#7C9ADD]/40 hover:shadow-xl hover:-translate-y-1"
      }`}
      style={{
        borderColor: isDragActive
          ? activeBorderColor
          : status === "success"
            ? successBorderColor
            : status === "error"
              ? errorBorderColor
              : borderColorDefault,
        minHeight: "280px",
      }}
    >
      <input {...getInputProps()} id="resume-file-input" />

      {status === "idle" && (
        <>
          <div className="w-20 h-20 flex items-center justify-center rounded-3xl bg-[#7C9ADD]/10 text-[#7C9ADD] transition-transform group-hover:scale-110">
            <Upload size={32} strokeWidth={1.5} />
          </div>
          <div className="text-center space-y-3">
            <p className="font-display font-bold text-2xl text-[#2D3748] tracking-tight">
              {isDragActive ? "Drop it here!" : "Upload your resume"}
            </p>
            <p className="text-sm font-medium text-[#718096]">
              or{" "}
              <span className="text-[#7C9ADD] font-bold cursor-pointer hover:underline">
                browse files
              </span>{" "}
              <span className="mx-2 opacity-30">|</span> PDF{" "}
              <span className="mx-2 opacity-30">|</span> Max 10MB
            </p>
          </div>
        </>
      )}

      {status === "uploading" && (
        <>
          <div className="w-20 h-20 flex items-center justify-center rounded-3xl bg-[#7C9ADD]/10 text-[#7C9ADD] animate-pulse">
            <FileText size={32} strokeWidth={1.5} />
          </div>
          <div className="text-center space-y-3">
            <p className="font-display font-bold text-2xl text-[#2D3748] tracking-tight">
              Analyzing <span className="text-[#7C9ADD]">{fileName}</span>
            </p>
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm font-medium text-[#718096]">
                Extracting text · Computing ATS score…
              </p>
              <div className="w-64 h-2 bg-white/50 rounded-full overflow-hidden border border-white/40">
                <div className="h-full bg-[#7C9ADD] animate-[loading_2s_ease-in-out_infinite]" />
              </div>
            </div>
          </div>
        </>
      )}

      {status === "success" && (
        <>
          <div className="w-20 h-20 flex items-center justify-center rounded-3xl bg-[#98C9A3]/10 text-[#98C9A3]">
            <CheckCircle size={36} strokeWidth={1.5} />
          </div>
          <div className="text-center space-y-3">
            <p className="font-display font-bold text-2xl text-[#98C9A3] tracking-tight">
              Analysis complete!
            </p>
            <p className="text-sm font-medium text-[#718096]">
              {fileName} · Results ready
            </p>
          </div>
        </>
      )}

      {status === "error" && (
        <>
          <div className="w-20 h-20 flex items-center justify-center rounded-3xl bg-[#F28C8C]/10 text-[#F28C8C]">
            <AlertCircle size={36} strokeWidth={1.5} />
          </div>
          <div className="text-center space-y-3">
            <p className="font-display font-bold text-2xl text-[#F28C8C] tracking-tight">
              Upload failed
            </p>
            <p className="text-sm font-medium text-[#718096]">{errorMsg}</p>
          </div>
        </>
      )}
    </div>
  );
}
