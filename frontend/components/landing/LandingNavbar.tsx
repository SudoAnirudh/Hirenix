"use client";

import Link from "next/link";
import { Brain, Command } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export const LandingNavbar = () => {
  return (
    <nav className="fixed top-6 inset-x-0 w-full z-50 px-6">
      <div className="max-w-7xl mx-auto h-20 rounded-3xl bg-obsidian/60 backdrop-blur-2xl border border-white/10 shadow-2xl flex items-center justify-between px-10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-hyper-lime flex items-center justify-center shadow-[0_0_20px_rgba(212,255,0,0.4)] transition-transform group-hover:scale-110">
            <Brain size={24} className="text-obsidian" />
          </div>
          <span className="font-display font-black text-2xl text-white tracking-tighter uppercase italic">
            HIRENIX
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-8">
          {["Features", "Engine", "Pricing", "Demo"].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-xs font-black text-slate-400 hover:text-white transition-colors uppercase tracking-[0.2em]"
            >
              {item}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <Link
            href="/auth/login"
            className="text-xs font-black text-slate-400 hover:text-white transition-colors uppercase tracking-[0.2em]"
          >
            Login
          </Link>
          <Link href="/auth/register">
            <Button className="rounded-xl bg-hyper-lime text-obsidian px-8 h-12 font-black shadow-[0_0_20px_rgba(212,255,0,0.2)] hover:scale-105 hover:bg-hyper-lime transition-all active:scale-95 border-none">
              START STUDIO
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};
