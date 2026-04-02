"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "outline" | "shine" | "glow" | "glass";
  size?: "default" | "sm" | "lg" | "icon";
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "default",
      isLoading,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center whitespace-nowrap rounded-[32px] font-heading tracking-tight font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--indigo)/50 disabled:pointer-events-none disabled:opacity-50";

    const variants = {
      primary:
        "bg-[#7C9ADD] text-white shadow-lg shadow-[#7C9ADD]/20 hover:bg-[#7C9ADD]/90 hover:shadow-xl hover:-translate-y-0.5",
      ghost:
        "bg-transparent text-[#2D3748] hover:bg-[#7C9ADD]/10 hover:text-[#7C9ADD]",
      outline:
        "bg-transparent text-[#2D3748] border border-[#rgba(255,255,255,0.8)] hover:bg-white/50 hover:border-[#7C9ADD]/50 font-bold",
      shine:
        "relative overflow-hidden bg-[#2D3748] text-white shadow-lg before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2.2s_infinite] before:bg-linear-to-r before:from-transparent before:via-white/10 before:to-transparent hover:-translate-y-0.5 font-bold",
      glow: "relative bg-[#98C9A3] text-white shadow-[0_0_20px_rgba(152,201,163,0.4)] hover:shadow-[0_0_30px_rgba(152,201,163,0.6)] hover:-translate-y-0.5 active:scale-95 font-bold",
      glass:
        "bg-white/40 backdrop-blur-md border border-white/60 text-[#2D3748] shadow-sm hover:bg-white/60 hover:shadow-md active:scale-95 font-bold",
    };

    const sizes = {
      default: "h-12 px-6 py-2 text-sm",
      sm: "h-10 px-4 text-xs",
      lg: "h-14 px-8 text-base",
      icon: "h-12 w-12",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button };
