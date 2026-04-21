"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-slate-200/50 dark:bg-slate-800/50",
        className,
      )}
      {...props}
    >
      <motion.div
        className="absolute inset-0 z-10 bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent"
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: 1.5,
        }}
      />
    </div>
  );
}

export { Skeleton };
