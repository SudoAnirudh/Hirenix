"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "outline" | "shine";
  size?: "default" | "sm" | "lg" | "icon";
  isLoading?: boolean;
}

type MotionButtonProps = Omit<
  React.ComponentPropsWithoutRef<typeof motion.button>,
  "whileHover" | "whileTap"
>;

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
      "inline-flex items-center justify-center whitespace-nowrap rounded-none font-display uppercase tracking-widest font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-accent)] disabled:pointer-events-none disabled:opacity-50 border-2";

    const variants = {
      primary:
        "bg-[var(--border-accent)] text-black border-[var(--border-accent)] shadow-[4px_4px_0px_#000] hover:bg-black hover:text-[var(--border-accent)] hover:shadow-[6px_6px_0px_var(--indigo)] hover:-translate-y-1 hover:-translate-x-1 active:translate-y-0 active:translate-x-0 active:shadow-none",
      ghost:
        "bg-transparent text-[var(--text-primary)] border-[var(--border)] shadow-[4px_4px_0px_var(--border)] hover:bg-[rgba(57,255,20,0.1)] hover:border-[var(--emerald)] hover:text-[var(--emerald)] hover:shadow-[6px_6px_0px_var(--emerald)] hover:-translate-y-1 hover:-translate-x-1 active:translate-y-0 active:translate-x-0 active:shadow-none",
      outline:
        "bg-transparent text-[var(--text-primary)] border-[var(--border)] hover:bg-white/10 shadow-[4px_4px_0px_var(--border)] hover:-translate-y-1 hover:-translate-x-1 active:translate-y-0 active:translate-x-0 active:shadow-none",
      shine:
        "relative overflow-hidden bg-[#050505] text-[var(--indigo)] border-[var(--indigo)] shadow-[4px_4px_0px_var(--indigo)] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2.2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-[var(--indigo)]/20 before:to-transparent hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_var(--border-accent)] hover:border-[var(--border-accent)] hover:text-[var(--border-accent)] active:translate-y-0 active:translate-x-0 active:shadow-[0px_0px_0px]",
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
