"use client";
import Link from "next/link";
import {
  Brain,
  Github,
  Twitter,
  Linkedin,
  Heart,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Company",
      links: [
        { name: "About Hirenix", href: "/about" },
        { name: "Blog", href: "#" },
        { name: "Careers", href: "#" },
        { name: "Contact", href: "#" },
      ],
    },
    {
      title: "Product",
      links: [
        { name: "Resume Analytics", href: "#" },
        { name: "GitHub Audit", href: "#" },
        { name: "Job Matcher", href: "#" },
        { name: "Mock Interview", href: "#" },
        { name: "Roadmap", href: "#" },
      ],
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", href: "#" },
        { name: "Terms of Service", href: "#" },
        { name: "Security", href: "#" },
      ],
    },
  ];

  return (
    <footer className="relative z-10 py-24 px-6 border-t border-[#E2E8F0] bg-white/40 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-20">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-8 group">
              <div className="w-12 h-12 rounded-2xl bg-[#7C9ADD] flex items-center justify-center shadow-lg shadow-[#7C9ADD]/20 transition-transform group-hover:scale-110">
                <Brain className="text-white" size={26} />
              </div>
              <span className="font-display font-black text-3xl text-[#2D3748] tracking-tighter uppercase italic">
                HIRENIX
              </span>
            </Link>
            <p className="text-[#718096] text-lg font-medium leading-relaxed max-w-sm mb-10">
              The high-fidelity AI studio for the modern engineer&apos;s career
              trajectory. Engineering your path to elite roles.
            </p>
            <div className="flex gap-4">
              {[
                {
                  Icon: Github,
                  href: "https://github.com/SudoAnirudh/Hirenix",
                },
                { Icon: Twitter, href: "#" },
                { Icon: Linkedin, href: "#" },
              ].map(({ Icon, href }, i) => (
                <Link
                  key={i}
                  href={href}
                  className="w-12 h-12 rounded-2xl bg-white/60 border border-white/80 flex items-center justify-center text-[#718096] hover:text-[#7C9ADD] hover:border-[#7C9ADD]/30 hover:shadow-lg transition-all"
                >
                  <Icon size={22} />
                </Link>
              ))}
            </div>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-[#2D3748] font-black uppercase tracking-[0.2em] text-sm mb-8">
                {section.title}
              </h4>
              <ul className="flex flex-col gap-5">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-[#718096] hover:text-[#7C9ADD] transition-colors text-sm font-bold uppercase tracking-widest flex items-center group"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-12 border-t border-[#E2E8F0] flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-sm font-bold text-[#A0AEC0] uppercase tracking-[0.2em]">
            <span>© {currentYear} HIRENIX STUDIO.</span>
            <span className="hidden md:block text-[#E2E8F0]">|</span>
            <Link
              href="https://github.com/SudoAnirudh"
              className="flex items-center gap-2 text-[#7C9ADD] hover:text-[#2D3748] transition-colors group"
            >
              Built with{" "}
              <Heart
                size={14}
                className="fill-current text-red-400 group-hover:scale-125 transition-transform"
              />{" "}
              by Anirudh S
              <ExternalLink
                size={12}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </Link>
          </div>

          <div className="flex gap-3">
            {["Next.js 16", "Supabase", "FastAPI"].map((tech) => (
              <span
                key={tech}
                className="text-[10px] font-black uppercase tracking-widest px-5 py-2 rounded-full bg-white/60 text-[#718096] border border-white/80 backdrop-blur-sm shadow-sm"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
