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

  const borderColor = isDragActive
    ? "var(--indigo)"
    : status === "success"
      ? "var(--emerald)"
      : status === "error"
        ? "#ef4444"
        : "var(--border)";

  return (
    <div
      {...getRootProps()}
      id="resume-dropzone"
      className={`glass-card p-10 flex flex-col items-center justify-center gap-6 cursor-pointer transition-all border-dashed rounded-none ${isDragActive ? "bg-(--indigo)/5 border-(--indigo) translate-y-[-2px] translate-x-[-2px] shadow-[8px_8px_0px_var(--indigo)]" : ""}`}
      style={{
        borderColor: isDragActive ? "var(--indigo)" : borderColor,
        minHeight: "240px",
      }}
    >
      <input {...getInputProps()} id="resume-file-input" />

      {status === "idle" && (
        <>
          <div className="w-16 h-16 flex items-center justify-center border-2 border-(--indigo) bg-(--indigo)/10 text-(--indigo) shadow-[4px_4px_0px_var(--indigo)]">
            <Upload size={28} strokeWidth={2.5} />
          </div>
          <div className="text-center">
            <p className="font-display font-black text-lg uppercase tracking-tight mb-1">
              {isDragActive ? "Drop it here!" : "Upload your resume"}
            </p>
            <p className="text-xs font-mono font-bold uppercase tracking-widest text-(--text-secondary)">
              or <span className="text-(--indigo) underline">browse files</span>{" "}
              · PDF · Max 10MB
            </p>
          </div>
        </>
      )}

      {status === "uploading" && (
        <>
          <div className="w-16 h-16 flex items-center justify-center border-2 border-(--indigo) bg-(--indigo)/10 text-(--indigo) shadow-[4px_4px_0px_var(--indigo)] animate-pulse">
            <FileText size={28} strokeWidth={2.5} />
          </div>
          <div className="text-center">
            <p className="font-display font-black text-lg uppercase tracking-tight mb-1">
              Analysing <span className="text-(--indigo)">{fileName}</span>
            </p>
            <p className="text-xs font-mono font-bold uppercase tracking-widest text-(--text-secondary)">
              Extracting text · Computing ATS score…
            </p>
          </div>
        </>
      )}

      {status === "success" && (
        <>
          <div className="w-16 h-16 flex items-center justify-center border-2 border-(--emerald) bg-(--emerald)/10 text-(--emerald) shadow-[4px_4px_0px_var(--emerald)]">
            <CheckCircle size={32} strokeWidth={2.5} />
          </div>
          <div className="text-center">
            <p className="font-display font-black text-lg uppercase tracking-tight mb-1 text-(--emerald)">
              Analysis complete!
            </p>
            <p className="text-xs font-mono font-bold uppercase tracking-widest text-(--text-secondary)">
              {fileName} · Results ready
            </p>
          </div>
        </>
      )}

      {status === "error" && (
        <>
          <div className="w-16 h-16 flex items-center justify-center border-2 border-red-500 bg-red-500/10 text-red-500 shadow-[4px_4px_0px_#ef4444]">
            <AlertCircle size={32} strokeWidth={2.5} />
          </div>
          <div className="text-center">
            <p className="font-display font-black text-lg uppercase tracking-tight mb-1 text-red-500">
              Upload failed
            </p>
            <p className="text-xs font-mono font-bold uppercase tracking-widest text-(--text-secondary)">
              {errorMsg}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
