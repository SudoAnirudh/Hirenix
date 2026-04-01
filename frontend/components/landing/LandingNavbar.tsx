"use client";

import Link from "next/link";
import { Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

export const LandingNavbar = () => {
  return (
    <nav className="fixed top-6 inset-x-0 w-full z-50 px-6">
      <div className="max-w-7xl mx-auto h-20 rounded-[32px] bg-white/40 backdrop-blur-xl border border-white/60 shadow-glass flex items-center justify-between px-10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-[#7C9ADD] flex items-center justify-center shadow-lg shadow-[#7C9ADD]/20 transition-transform group-hover:scale-110">
            <Brain className="text-white" size={24} />
          </div>
          <span className="font-display font-black text-2xl text-[#2D3748] tracking-tighter transition-colors group-hover:text-[#7C9ADD]">
            HIRENIX
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-10">
          {[
            { name: "About", href: "/about" },
            { name: "Features", href: "/#features" },
            { name: "Pricing", href: "/pricing" },
          ].map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-bold text-[#718096] hover:text-[#7C9ADD] transition-all relative group"
            >
              {item.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#7C9ADD] transition-all group-hover:w-full" />
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <Link
            href="/auth/login"
            className="text-sm font-bold text-[#718096] hover:text-[#2D3748] transition-colors"
          >
            Login
          </Link>
          <Link href="/auth/register">
            <Button className="rounded-2xl bg-[#7C9ADD] text-white px-8 h-12 font-bold shadow-lg shadow-[#7C9ADD]/20 hover:bg-[#7C9ADD]/90 transition-all active:scale-95 border-none">
              Join Now
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};
