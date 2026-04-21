"use client";

import Link from "next/link";
import { Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

export const LandingNavbar = () => {
  return (
    <nav className="fixed top-6 inset-x-0 w-full z-50 px-6">
      <div className="max-w-7xl mx-auto h-20 rounded-[32px] bg-card/40 backdrop-blur-xl border border-border shadow-glass flex items-center justify-between px-10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-brand-blue flex items-center justify-center shadow-lg shadow-brand-blue/20 transition-transform group-hover:scale-110">
            <Brain className="text-white" size={24} />
          </div>
          <span className="font-display font-black text-2xl text-foreground tracking-tighter transition-colors group-hover:text-brand-blue">
            HIRENIX
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-10">
          {[
            { name: "About", href: "/about" },
            { name: "Features", href: "/#features" },
          ].map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-bold text-muted-foreground hover:text-brand-blue transition-all relative group"
            >
              {item.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-blue transition-all group-hover:w-full" />
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <Link
            href="/auth/login"
            className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            Login
          </Link>
          <Link href="/auth/register">
            <Button className="rounded-2xl bg-brand-blue text-white px-8 h-12 font-bold shadow-lg shadow-brand-blue/20 hover:bg-brand-blue/90 transition-all active:scale-95 border-none">
              Join Now
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};
