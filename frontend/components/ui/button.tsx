"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
      primary: "bg-brand-blue text-white shadow-sm active:scale-[0.98]",
      ghost: "bg-transparent text-slate-700 dark:text-slate-300 dark:",
      outline:
        "bg-transparent text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 dark: active:scale-[0.98]",
      shine:
        "relative overflow-hidden bg-brand-blue text-white shadow-sm active:scale-[0.98]",
      glow: "bg-brand-green text-white shadow-sm active:scale-[0.98]",
      glass:
        "bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/60 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-sm dark: active:scale-[0.98]",
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
