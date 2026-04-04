"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const LiveDemo = () => {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "analyzing" | "complete">(
    "idle",
  );

  const handleAnalyze = () => {
    if (!url) return;
    setStatus("analyzing");
    setTimeout(() => setStatus("complete"), 3000);
  };

  return (
    <section className="py-32 px-6 bg-obsidian relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-500 text-[10px] font-black uppercase tracking-widest mb-10">
          <Sparkles size={12} className="text-hyper-lime" />
          The Sandbox
        </div>

        <h2 className="text-white font-display font-black text-4xl md:text-6xl tracking-tighter mb-8 italic">
          Zero friction. <br />
          Instant Intelligence.
        </h2>

        <p className="text-slate-400 text-lg mb-16 max-w-xl mx-auto font-medium">
          Paste any LinkedIn or Indeed job URL to see the Hirenix Neural Matcher
          in action. No signup required for the first scan.
        </p>

        <div className="relative group max-w-2xl mx-auto">
          <div className="absolute -inset-1 bg-gradient-to-r from-hyper-lime/20 to-electric-orchid/20 rounded-3xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
          <div className="relative flex items-center p-2 rounded-xl glass-morphism border-white/10 shadow-2xl overflow-hidden">
            <div className="pl-6 pr-4 text-slate-500">
              <Search size={20} />
            </div>
            <input
              type="text"
              aria-label="Job URL to analyze"
              placeholder="https://linkedin.com/jobs/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full h-14 bg-transparent border-none outline-none text-white font-medium placeholder:text-slate-600"
            />
            <Button
              onClick={handleAnalyze}
              disabled={status === "analyzing"}
              className="h-14 px-8 rounded-lg bg-white text-obsidian font-black hover:bg-hyper-lime transition-all border-none"
            >
              {status === "analyzing" ? (
                <Loader2 className="animate-spin" />
              ) : (
                "ANALYZE"
              )}
            </Button>
          </div>
        </div>

        <div className="mt-12">
          <AnimatePresence mode="wait">
            {status === "analyzing" && (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center gap-6"
              >
                <div className="flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ height: [8, 24, 8] }}
                      transition={{
                        repeat: Infinity,
                        duration: 1,
                        delay: i * 0.2,
                      }}
                      className="w-1 bg-hyper-lime rounded-full"
                    />
                  ))}
                </div>
                <p className="text-hyper-lime text-xs font-black uppercase tracking-[0.2em]">
                  Neural processing active...
                </p>
              </motion.div>
            )}

            {status === "complete" && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-3xl text-left flex flex-col md:flex-row items-center gap-10"
              >
                <div className="flex-shrink-0 w-24 h-24 rounded-2xl bg-hyper-lime/10 border border-hyper-lime/20 flex items-center justify-center">
                  <span className="text-4xl font-black text-hyper-lime">
                    89
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-hyper-lime text-[10px] font-black uppercase tracking-widest mb-2">
                    <CheckCircle2 size={12} /> Match Secured
                  </div>
                  <h4 className="text-white text-xl font-display font-black mb-2">
                    Senior Product Designer @ Stripe
                  </h4>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6">
                    Strong career fit. 3 key skill gaps identified: Framer
                    Motion, Stakeholder Management, Design Systems.
                  </p>
                  <Button
                    variant="ghost"
                    className="text-hyper-lime p-0 h-auto font-black italic hover:no-underline flex items-center gap-1 hover:bg-transparent"
                  >
                    VIEW FULL DEEP DIVE <ChevronRight size={16} />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
