"use client";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { uploadResume } from "@/lib/api";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

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

  return (
    <div
      {...getRootProps()}
      id="resume-dropzone"
      className={`glass-card relative overflow-hidden p-10 flex flex-col items-center justify-center gap-5 cursor-pointer transition-all duration-300 group
        ${isDragActive ? "border-indigo-500 bg-indigo-500/10 scale-[1.02]" : "hover:border-indigo-500/30 hover:bg-white/5"}
        ${status === "error" ? "border-red-500/50 bg-red-500/5" : ""}
        ${status === "success" ? "border-emerald-500/50 bg-emerald-500/5" : ""}
      `}
      style={{ minHeight: "240px", borderStyle: "dashed", borderWidth: "2px" }}
    >
      <input {...getInputProps()} id="resume-file-input" />

      {/* Background glow for drag active */}
      {isDragActive && (
        <div className="absolute inset-0 bg-indigo-500/10 blur-xl z-0" />
      )}

      {status === "idle" && (
        <>
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-300 z-10 ${isDragActive ? "scale-110 rotate-3" : "group-hover:scale-110"}`} style={{ background: "rgba(99,102,241,0.12)" }}>
            <Upload size={32} className="text-indigo-400" />
          </div>
          <div className="text-center z-10">
            <p className="font-semibold text-lg mb-1">{isDragActive ? "Drop it like it's hot!" : "Upload your Resume"}</p>
            <p className="text-sm text-gray-400">PDF up to 10MB</p>
          </div>
          <button className="btn-primary text-sm px-6 py-2 mt-2 z-10 pointer-events-none">Select File</button>
        </>
      )}

      {status === "uploading" && (
        <>
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "rgba(99,102,241,0.12)" }}>
              <FileText size={32} className="text-indigo-400 opacity-50 absolute" />
              <Loader2 size={32} className="text-indigo-400 animate-spin absolute" />
            </div>
          </div>
          <div className="text-center z-10">
            <p className="font-semibold text-lg animate-pulse">Analysing Resume...</p>
            <p className="text-sm text-gray-400 mt-1">{fileName}</p>
          </div>
        </>
      )}

      {status === "success" && (
        <>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-emerald-500/20 z-10 animate-fade-up">
            <CheckCircle size={32} className="text-emerald-400" />
          </div>
          <div className="text-center z-10 animate-fade-up">
            <p className="font-semibold text-lg text-emerald-400">Analysis Complete!</p>
            <p className="text-sm text-gray-400 mt-1">{fileName}</p>
          </div>
        </>
      )}

      {status === "error" && (
        <>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-red-500/20 z-10">
            <AlertCircle size={32} className="text-red-400" />
          </div>
          <div className="text-center z-10">
            <p className="font-semibold text-lg text-red-400">Upload Failed</p>
            <p className="text-sm text-red-300/70 mt-1 max-w-xs">{errorMsg}</p>
          </div>
        </>
      )}
    </div>
  );
}
