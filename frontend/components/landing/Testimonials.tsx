"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Quote,
  Star,
  Github,
  Twitter,
  Linkedin,
  Terminal,
  Brain,
} from "lucide-react";

const testimonials = [
  {
    name: "Alex Rivera",
    role: "L6 SWE @ Google",
    content:
      "The GitHub Performance Index gave me the leverage to negotiate a 20% higher base. It's objective proof of impact.",
    metric: "2.5x Callback Rate",
  },
  {
    name: "Sarah Chen",
    role: "Product Lead @ Stripe",
    content:
      "The ATS scorer is brutally honest. It helped me fix invisible formatting issues that were killing my applications.",
    metric: "Landed Stripe Offer",
  },
  {
    name: "James Wilson",
    role: "Fullstack Eng @ Vercel",
    content:
      "Mock interviews with Hirenix felt like the real thing. The feedback loop on my technical explanations was game-changing.",
    metric: "0 to Offer in 14 Days",
  },
];

const logos = [
  "Google",
  "Stripe",
  "Vercel",
  "Meta",
  "Tesla",
  "Airbnb",
  "Netflix",
  "Uber",
];

export const Testimonials = () => {
  return (
    <section className="py-32 px-6 bg-obsidian relative">
      <div className="max-w-7xl mx-auto">
        {/* Logo Wall */}
        <div className="text-center mb-32">
          <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.4em] mb-12">
            Trusted by builders at
          </p>
          <div className="flex flex-wrap justify-center gap-x-20 gap-y-10 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
            {logos.map((logo) => (
              <span
                key={logo}
                className="text-white font-display font-black text-2xl tracking-tighter"
              >
                {logo}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="p-10 rounded-2xl bg-white/5 border border-white/10 flex flex-col relative group shadow-2xl"
            >
              <Link href="/" className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Brain size={20} className="text-hyper-lime" />
                </div>
                <p className="text-white font-display font-black tracking-tight text-lg">
                  Hirenix
                </p>
              </Link>

              <Quote
                className="absolute top-8 right-8 text-hyper-lime/10 group-hover:text-hyper-lime/20 transition-colors"
                size={40}
              />

              <div className="flex gap-2 mb-6">
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

              <p className="text-lg text-white font-medium mb-10 italic leading-relaxed">
                "{t.content}"
              </p>

              <div className="mt-auto pt-8 border-t border-white/10">
                <p className="text-white font-display font-black tracking-tight">
                  {t.name}
                </p>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                    {t.role}
                  </p>
                  <span className="text-hyper-lime text-[10px] font-black uppercase tracking-widest bg-hyper-lime/10 px-2 py-0.5 rounded">
                    {t.metric}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
