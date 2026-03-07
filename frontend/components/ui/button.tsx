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

type MotionButtonProps = React.ComponentPropsWithoutRef<typeof motion.button>;

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
      "inline-flex items-center justify-center whitespace-nowrap rounded-md font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--indigo)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bg-base)] disabled:pointer-events-none disabled:opacity-50";

    const variants = {
      primary:
        "bg-[linear-gradient(120deg,#dd6b20_0%,#c05621_100%)] text-white border border-[#8d3a12]/35 shadow-[0_14px_30px_rgba(192,86,33,0.34)] hover:shadow-[0_18px_36px_rgba(192,86,33,0.44)]",
      ghost:
        "bg-white/60 text-[color:var(--text-secondary)] border border-[color:var(--border)] hover:bg-[rgba(11,124,118,0.08)] hover:text-[color:var(--text-primary)]",
      outline:
        "border border-[color:var(--border)] bg-transparent text-[color:var(--text-primary)] hover:bg-white/55",
      shine:
        "relative overflow-hidden bg-[linear-gradient(120deg,#0b7c76_0%,#0f766e_100%)] text-white border border-[#0b5f5a]/40 shadow-[0_12px_26px_rgba(11,124,118,0.28)] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2.2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
    };

    const sizes = {
      default: "h-10 px-4 py-2 text-sm",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-12 rounded-lg px-8 text-base",
      icon: "h-10 w-10",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.025 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 20, mass: 0.6 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...(props as MotionButtonProps)}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </motion.button>
    );
  },
);
Button.displayName = "Button";

export { Button };
