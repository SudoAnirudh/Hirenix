"use client";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { AlertTriangle, Info, ShieldAlert, X } from "lucide-react";

/* ─── Types ─── */
type ToastSeverity = "danger" | "warning" | "info";

interface Toast {
  id: number;
  message: string;
  severity: ToastSeverity;
}

interface ToastContextValue {
  showToast: (message: string, severity?: ToastSeverity) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

/* ─── Severity styling ─── */
function getSeverityStyle(severity: ToastSeverity) {
  switch (severity) {
    case "danger":
      return {
        bg: "rgba(239,68,68,0.95)",
        border: "rgba(239,68,68,0.6)",
        icon: <ShieldAlert size={16} style={{ color: "#fff" }} />,
      };
    case "warning":
      return {
        bg: "rgba(234,179,8,0.95)",
        border: "rgba(234,179,8,0.6)",
        icon: <AlertTriangle size={16} style={{ color: "#1a1a1a" }} />,
      };
    case "info":
      return {
        bg: "rgba(11,124,118,0.95)",
        border: "rgba(11,124,118,0.6)",
        icon: <Info size={16} style={{ color: "#fff" }} />,
      };
  }
}

function getTextColor(severity: ToastSeverity) {
  return severity === "warning" ? "#1a1a1a" : "#fff";
}

/* ─── Provider ─── */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const showToast = useCallback(
    (message: string, severity: ToastSeverity = "warning") => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev.slice(-4), { id, message, severity }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    [],
  );

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast container */}
      <div
        style={{
          position: "fixed",
          top: 16,
          right: 16,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          pointerEvents: "none",
          maxWidth: 380,
        }}
      >
        {toasts.map((toast) => {
          const style = getSeverityStyle(toast.severity);
          const textColor = getTextColor(toast.severity);
          return (
            <div
              key={toast.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                borderRadius: "var(--radius-sm)",
                background: style.bg,
                border: `1px solid ${style.border}`,
                color: textColor,
                fontSize: 13,
                fontWeight: 600,
                backdropFilter: "blur(12px)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                animation: "toast-slide-in 0.3s ease both",
                pointerEvents: "auto",
              }}
            >
              {style.icon}
              <span style={{ flex: 1 }}>{toast.message}</span>
              <button
                onClick={() => dismiss(toast.id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 2,
                  display: "flex",
                  color: textColor,
                  opacity: 0.7,
                }}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
