"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain } from "lucide-react";

const links = [
  { href: "/", label: "Home" },
  { href: "/upload", label: "Upload Resume" },
  { href: "/pricing", label: "Pricing" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div
        className="max-w-7xl mx-auto h-20 px-8 rounded-[24px] border border-(--border) flex items-center justify-between shadow-glass transition-all duration-500"
        style={{
          background: "var(--bg-glass)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#7C9ADD]/10 flex items-center justify-center transition-transform">
            <Brain size={22} className="text-[#7C9ADD]" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-[#2D3748]">
            Hirenix
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-10">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm font-semibold transition-colors #7C9ADD] ${
                pathname === href ? "text-[#7C9ADD]" : "text-[#4A5568]"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="hidden sm:block">
            <button className="text-sm font-bold text-[#4A5568] #7C9ADD] transition-colors px-4">
              Dashboard
            </button>
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-2.5 rounded-xl bg-[#7C9ADD] text-white text-sm font-bold shadow-lg shadow-[#7C9ADD]/20 #7C9ADD]/90 transition-all"
          >
            Start Studio
          </Link>
        </div>
      </div>
    </nav>
  );
}
