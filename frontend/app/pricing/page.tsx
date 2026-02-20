"use client";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { Check, Zap, Star } from "lucide-react";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    period: "forever",
    icon: "🌱",
    accent: "var(--text-secondary)",
    border: "var(--border)",
    features: [
      "3 resume uploads / month",
      "Basic ATS scoring",
      "Section detection",
      "2 job descriptions / month",
      "5 mock interview questions",
    ],
    cta: "Get Started",
    href: "/auth/register",
    highlight: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "₹499",
    period: "/ month",
    icon: "⚡",
    accent: "var(--indigo)",
    border: "var(--indigo)",
    features: [
      "Unlimited resume uploads",
      "Advanced ATS + semantic scoring",
      "GitHub deep analysis (GPI)",
      "Unlimited job matching",
      "Unlimited mock interviews",
      "Progress tracker + trends",
      "Priority feedback",
    ],
    cta: "Upgrade to Pro",
    href: "/auth/register?plan=pro",
    highlight: true,
  },
  {
    id: "elite",
    name: "Elite",
    price: "₹999",
    period: "/ month",
    icon: "🚀",
    accent: "var(--violet)",
    border: "var(--violet)",
    features: [
      "Everything in Pro",
      "LinkedIn profile analysis",
      "Custom job role skill matrix",
      "AI career roadmap",
      "1-on-1 AI coach",
      "API access",
      "Resume evolution reports",
    ],
    cta: "Go Elite",
    href: "/auth/register?plan=elite",
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 pb-20 px-6" style={{ background: "var(--bg-base)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14 animate-fade-up">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium mb-4" style={{ background: "rgba(99,102,241,0.12)", color: "var(--indigo)" }}>
              <Zap size={12} /> Flexible Pricing
            </div>
            <h1 className="font-display font-bold text-5xl mb-4">Simple, Transparent Pricing</h1>
            <p style={{ color: "var(--text-secondary)" }}>Start free. Upgrade as you grow. Cancel anytime.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map(({ id, name, price, period, icon, accent, border, features, cta, href, highlight }) => (
              <div key={id} className="glass-card flex flex-col p-7 relative"
                style={{ border: `1px solid ${highlight ? border : "var(--border)"}`, boxShadow: highlight ? `0 0 40px -8px ${accent}` : undefined }}>
                {highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: accent, color: "#fff" }}>
                    <Star size={10} fill="white" /> Most Popular
                  </div>
                )}

                <div className="mb-4">
                  <div className="text-3xl mb-3">{icon}</div>
                  <div className="font-display font-bold text-xl" style={{ color: accent }}>{name}</div>
                  <div className="flex items-end gap-1 mt-2">
                    <span className="font-display font-bold text-4xl">{price}</span>
                    <span className="text-sm mb-1.5" style={{ color: "var(--text-secondary)" }}>{period}</span>
                  </div>
                </div>

                <ul className="flex flex-col gap-2.5 flex-1 mb-6">
                  {features.map(f => (
                    <li key={f} className="flex gap-2.5 items-start text-sm" style={{ color: "var(--text-secondary)" }}>
                      <Check size={14} className="flex-shrink-0 mt-0.5" style={{ color: accent }} /> {f}
                    </li>
                  ))}
                </ul>

                <Link href={href}>
                  <button className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-all ${highlight ? "btn-primary" : "btn-ghost"}`}>
                    {cta}
                  </button>
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-xs mt-8" style={{ color: "var(--text-muted)" }}>
            Payments powered by Razorpay · INR pricing · 7-day refund policy
          </p>
        </div>
      </main>
    </>
  );
}
