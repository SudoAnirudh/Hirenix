"use client";

import Link from "next/link";
import { Brain, Github, Twitter, Linkedin, Terminal } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="py-20 px-6 bg-obsidian border-t border-white/5 relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-hyper-lime/20 to-transparent" />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Brain size={22} className="text-hyper-lime" />
              </div>
              <span className="font-display font-black text-2xl text-white tracking-tighter uppercase italic">
                HIRENIX
              </span>
            </Link>
            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xs">
              The high-fidelity command center for the modern engineer's career
              trajectory. Built with AI, for developers.
            </p>
          </div>

          <div>
            <h4 className="text-white font-black uppercase tracking-[0.2em] text-xs mb-8">
              Ecosystem
            </h4>
            <ul className="flex flex-col gap-4">
              <li>
                <Link
                  href="#"
                  className="text-slate-500 hover:text-hyper-lime transition-colors text-sm font-bold uppercase tracking-widest"
                >
                  Resume Scoring
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-slate-500 hover:text-hyper-lime transition-colors text-sm font-bold uppercase tracking-widest"
                >
                  GitHub Analytics
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-slate-500 hover:text-hyper-lime transition-colors text-sm font-bold uppercase tracking-widest"
                >
                  Job Matching
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-slate-500 hover:text-hyper-lime transition-colors text-sm font-bold uppercase tracking-widest"
                >
                  Roadmap
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black uppercase tracking-[0.2em] text-xs mb-8">
              Platform
            </h4>
            <ul className="flex flex-col gap-4">
              <li>
                <Link
                  href="#"
                  className="text-slate-500 hover:text-hyper-lime transition-colors text-sm font-bold uppercase tracking-widest"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-slate-500 hover:text-hyper-lime transition-colors text-sm font-bold uppercase tracking-widest"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-slate-500 hover:text-hyper-lime transition-colors text-sm font-bold uppercase tracking-widest"
                >
                  Status
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-slate-500 hover:text-hyper-lime transition-colors text-sm font-bold uppercase tracking-widest"
                >
                  Changelog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black uppercase tracking-[0.2em] text-xs mb-8">
              Studio
            </h4>
            <div className="flex gap-4 mb-8">
              {[Github, Twitter, Linkedin, Terminal].map((Icon, i) => (
                <Link
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-hyper-lime hover:border-hyper-lime/20 transition-all"
                >
                  <Icon size={18} />
                </Link>
              ))}
            </div>
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">
              © {new Date().getFullYear()} HIRENIX STUDIO. <br />
              All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
