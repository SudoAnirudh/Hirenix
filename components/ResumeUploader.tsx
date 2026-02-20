"use client";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { uploadResume } from "@/lib/api";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";

interface Props {
  onResult: (result: any) => void;
}

type Status = "idle" | "uploading" | "success" | "error";

export default function ResumeUploader({ onResult }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [fileName, setFileName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const onDrop = useCallback(async (accepted: File[]) => {
    if (!accepted.length) return;
    const file = accepted[0];
    if (!file.name.endsWith(".pdf")) { setErrorMsg("Only PDF files allowed."); setStatus("error"); return; }

    setFileName(file.name);
    setStatus("uploading");
    setErrorMsg("");

    try {
      const result = await uploadResume(file);
      setStatus("success");
      onResult(result);
    } catch (e: any) {
      setErrorMsg(e.message ?? "Upload failed");
      setStatus("error");
    }
  }, [onResult]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { "application/pdf": [".pdf"] }, maxFiles: 1,
  });

  const borderColor = isDragActive ? "var(--indigo)" : status === "success" ? "var(--emerald)" : status === "error" ? "#ef4444" : "var(--border)";
  const bg = isDragActive ? "rgba(99,102,241,0.08)" : "var(--bg-glass)";

  return (
    <div
      {...getRootProps()}
      id="resume-dropzone"
      className="glass-card p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all"
      style={{ border: `2px dashed ${borderColor}`, background: bg, minHeight: "200px" }}
    >
      <input {...getInputProps()} id="resume-file-input" />

      {status === "idle" && (
        <>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(99,102,241,0.12)" }}>
            <Upload size={26} style={{ color: "var(--indigo)" }} />
          </div>
          <div className="text-center">
            <p className="font-semibold">{isDragActive ? "Drop your resume here" : "Drag & drop your resume"}</p>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>or <span style={{ color: "var(--indigo)" }}>browse files</span> · PDF only · Max 10MB</p>
          </div>
        </>
      )}

      {status === "uploading" && (
        <>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center animate-pulse" style={{ background: "rgba(99,102,241,0.12)" }}>
            <FileText size={26} style={{ color: "var(--indigo)" }} />
          </div>
          <div className="text-center">
            <p className="font-semibold">Analysing <span style={{ color: "var(--indigo)" }}>{fileName}</span></p>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Extracting text · Computing ATS score…</p>
          </div>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircle size={40} style={{ color: "var(--emerald)" }} />
          <div className="text-center">
            <p className="font-semibold" style={{ color: "var(--emerald)" }}>Analysis complete!</p>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{fileName} · Results shown below</p>
          </div>
        </>
      )}

      {status === "error" && (
        <>
          <AlertCircle size={40} style={{ color: "#ef4444" }} />
          <div className="text-center">
            <p className="font-semibold" style={{ color: "#ef4444" }}>Upload failed</p>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{errorMsg}</p>
          </div>
        </>
      )}
    </div>
  );
}
