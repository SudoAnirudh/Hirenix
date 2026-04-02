"use client";

import * as React from "react";
import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "success"
    | "warning"
    | "destructive"
    | "info"
    | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-[#2D3748] text-white",
    success: "bg-[#98C9A3]/10 text-[#558B6E] border border-[#98C9A3]/20",
    warning: "bg-[#FAD390]/10 text-[#B87333] border border-[#FAD390]/20",
    destructive: "bg-[#EA8685]/10 text-[#B33939] border border-[#EA8685]/20",
    info: "bg-[#7C9ADD]/10 text-[#4A69BD] border border-[#7C9ADD]/20",
    outline: "border border-[#2D3748]/20 text-[#2D3748]",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-3 py-0.5 text-xs font-bold transition-colors uppercase tracking-wider",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
