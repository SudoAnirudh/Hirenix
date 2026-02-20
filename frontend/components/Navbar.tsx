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
    <nav
      className="fixed top-0 w-full z-50 border-b"
      style={{
        borderColor: "var(--border)",
        background: "rgba(10,10,15,0.85)",
        backdropFilter: "blur(16px)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Brain size={22} style={{ color: "var(--indigo)" }} />
          <span className="font-display font-bold text-lg gradient-text">
            Hirenix
          </span>
        </Link>
        <div className="flex items-center gap-6">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium transition-colors"
              style={{
                color:
                  pathname === href ? "var(--indigo)" : "var(--text-secondary)",
              }}
            >
              {label}
            </Link>
          ))}
          <Link href="/dashboard">
            <button className="btn-ghost text-sm">Dashboard</button>
          </Link>
          <Link href="/auth/login">
            <button className="btn-primary text-sm">Sign In</button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
