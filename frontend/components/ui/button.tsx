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
      "inline-flex items-center justify-center whitespace-nowrap rounded-lg font-heading tracking-tight font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.99]";

    const variants = {
      primary: "bg-primary text-primary-foreground shadow-sm hover:opacity-90",
      ghost:
        "bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900",
      outline:
        "bg-transparent text-slate-800 dark:text-slate-200 border border-border hover:bg-slate-50 dark:hover:bg-slate-900",
      shine: "bg-primary text-primary-foreground shadow-sm hover:opacity-90",
      glow: "bg-brand-green text-white shadow-sm hover:opacity-90",
      glass:
        "bg-slate-100 dark:bg-slate-900 border border-border text-slate-800 dark:text-slate-200 shadow-sm hover:bg-slate-200 dark:hover:bg-slate-800",
    };

    const sizes = {
      default: "h-11 px-5 py-2 text-sm",
      sm: "h-9 px-3.5 text-xs",
      lg: "h-13 px-7 text-base",
      icon: "h-11 w-11",
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
