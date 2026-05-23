"use client";
import { Brain, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface LoadingScreenProps {
  message?: string;
  submessage?: string;
}

const QUOTES = [
  // Motivational
  "The future belongs to those who prepare for it today. – Malcolm X",
  "Success is where preparation and opportunity meet. – Bobby Unser",
  "Believe you can and you're halfway there. – Theodore Roosevelt",
  "Hard work beats talent when talent doesn't work hard. – Tim Notke",
  "I find that the harder I work, the more luck I seem to have. – Thomas Jefferson",

  // Sarcastic & AI
  "Please hold while we pretend your resume is fully optimized...",
  "Calculating the probability of you saying 'synergy' in the interview...",
  "Scanning your LinkedIn for exaggerated job titles...",
  "Analyzing if 'proficient in Excel' means you just know how to use sum().",
  "Consulting the AI Oracle about your 10-year plan. It says 'survival'.",
  "Preparing to judge your GitHub commit history. We won't tell anyone.",
  "Replacing your buzzwords with slightly more expensive buzzwords...",
  "Loading... because fast things don't look complicated enough.",
  "Checking if your 'attention to detail' applies to the typo on page 2.",
  "Training our AI to write polite rejection emails. Just in case.",
];

export default function LoadingScreen({
  message = "Checking Session",
  submessage = "Secure Authentication",
}: LoadingScreenProps) {
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    // Start with a random quote
    setQuoteIndex(Math.floor(Math.random() * QUOTES.length));

    // Change quote every 4 seconds
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

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

      <div className="flex flex-col items-center gap-10 relative z-10 w-full max-w-lg">
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

        <div className="flex flex-col items-center gap-4 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-display font-bold tracking-tight text-foreground"
          >
            {message}
          </motion.h2>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-3 px-6 py-2.5 rounded-full bg-secondary/50 border border-border backdrop-blur-md mb-6"
          >
            <Loader2 className="h-4 w-4 animate-spin text-brand-blue" />
            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              {submessage}
            </span>
          </motion.div>

          {/* Motivational Quote Section */}
          <div className="h-16 w-full flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={quoteIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="text-sm text-muted-foreground italic max-w-md px-4"
              >
                &quot;{QUOTES[quoteIndex]}&quot;
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
