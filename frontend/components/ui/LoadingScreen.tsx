"use client";
import { Brain, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface LoadingScreenProps {
  message?: string;
  submessage?: string;
}

export default function LoadingScreen({
  message = "Checking Session",
  submessage = "Secure Authentication",
}: LoadingScreenProps) {
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 bg-background text-foreground overflow-hidden">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-blue blur-[120px] rounded-full"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand-green blur-[150px] rounded-full"
        />
      </div>

      <div className="flex flex-col items-center gap-10 relative z-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
          className="relative"
        >
          <motion.div
            animate={{
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-24 h-24 rounded-[32px] bg-brand-blue flex items-center justify-center shadow-2xl shadow-brand-blue/30 relative z-10"
          >
            <Brain className="text-white" size={48} />
          </motion.div>

          {/* Animated Rings */}
          <motion.div
            animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            className="absolute inset-0 rounded-[32px] border-2 border-brand-blue"
          />
          <motion.div
            animate={{ scale: [1, 1.8], opacity: [0.2, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut",
              delay: 0.5,
            }}
            className="absolute inset-0 rounded-[32px] border-2 border-brand-blue"
          />
        </motion.div>

        <div className="flex flex-col items-center gap-4">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-display font-bold tracking-tight text-foreground text-center"
          >
            {message}
          </motion.h2>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-3 px-6 py-2.5 rounded-full bg-secondary/50 border border-border backdrop-blur-md"
          >
            <Loader2 className="h-4 w-4 animate-spin text-brand-blue" />
            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              {submessage}
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
