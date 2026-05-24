"use client";

import { useState } from "react";
import Link from "next/link";
import { Brain, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export const LandingNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <nav className="fixed top-6 inset-x-0 w-full z-50 px-6">
      <div className="max-w-7xl mx-auto h-20 rounded-[32px] bg-card/40 backdrop-blur-xl border border-border shadow-glass flex items-center justify-between px-10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-brand-blue flex items-center justify-center shadow-lg shadow-brand-blue/20 transition-transform">
            <Brain className="text-white" size={24} />
          </div>
          <span className="font-display font-black text-2xl text-foreground tracking-tighter transition-colors group-">
            HIRENIX
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-10">
          {[
            { name: "About", href: "/about" },
            { name: "Features", href: "/#features" },
            { name: "Blogs", href: "/blogs" },
            { name: "Jobs", href: "/jobs" },
          ].map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-bold text-muted-foreground transition-all relative group pointer-events-auto cursor-pointer"
            >
              {item.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-blue transition-all group-hover:w-full" />
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <Link
            href="/auth/login"
            className="hidden lg:inline text-sm font-bold text-muted-foreground transition-colors hover:text-brand-blue"
          >
            Login
          </Link>
          <Link href="/auth/register" className="hidden lg:inline">
            <Button className="rounded-2xl bg-brand-blue text-white px-8 h-12 font-bold shadow-lg shadow-brand-blue/20 transition-all active:scale-95 border-none">
              Join Now
            </Button>
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-muted-foreground hover:text-foreground transition-colors pointer-events-auto cursor-pointer"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="absolute top-28 inset-x-6 lg:hidden rounded-[32px] bg-card/95 border border-border shadow-2xl p-8 flex flex-col gap-6 backdrop-blur-2xl pointer-events-auto z-[100] animate-fade-up">
          {[
            { name: "About", href: "/about" },
            { name: "Features", href: "/#features" },
            { name: "Blogs", href: "/blogs" },
            { name: "Jobs", href: "/jobs" },
          ].map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="text-base font-bold text-muted-foreground hover:text-brand-blue transition-colors uppercase tracking-widest pl-2"
            >
              {item.name}
            </Link>
          ))}
          <hr className="border-border my-2" />
          <div className="flex flex-col gap-4">
            <Link
              href="/auth/login"
              onClick={() => setIsOpen(false)}
              className="text-base font-bold text-muted-foreground hover:text-brand-blue transition-colors text-center py-3.5 border border-border rounded-2xl bg-background/50"
            >
              Login
            </Link>
            <Link href="/auth/register" onClick={() => setIsOpen(false)}>
              <Button className="w-full rounded-2xl bg-brand-blue text-white py-4 h-14 font-bold shadow-lg shadow-brand-blue/20 border-none">
                Join Now
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};
