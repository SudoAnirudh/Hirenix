"use client";
import Link from "next/link";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { Footer } from "@/components/landing/Footer";
import { motion } from "framer-motion";
import {
  Mail,
  Github,
  MessageCircle,
  Linkedin,
  ExternalLink,
} from "lucide-react";

export default function ContactPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  };

  const contactMethods = [
    {
      icon: Mail,
      label: "Email",
      value: "contactsudoanirudh@gmail.com",
      href: "mailto:contactsudoanirudh@gmail.com.",
      color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    },
    {
      icon: Github,
      label: "GitHub",
      value: "@SudoAnirudh",
      href: "https://github.com/SudoAnirudh",
      color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: "+91 95391 02851",
      href: "https://wa.me/919539102851?text=Hello%20Anirudh%2C%20I%20would%20like%20to%20connect%20with%20you%20regarding%20Hirenix!",
      color: "bg-green-500/10 text-green-500 border-green-500/20",
    },
    {
      icon: Linkedin,
      label: "LinkedIn",
      value: "Anirudh S",
      href: "https://linkedin.com/in/sudoanirudh",
      color: "bg-brand-blue/10 text-brand-blue border-brand-blue/20",
    },
  ];

  return (
    <main className="min-h-screen relative bg-background overflow-hidden selection:bg-brand-blue/30 selection:text-brand-blue">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-blue/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand-green/10 blur-[150px] rounded-full animate-pulse-slow" />
      </div>

      <LandingNavbar />

      <section className="relative z-10 pt-48 pb-32 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="initial"
            animate="animate"
            variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
            className="text-center mb-20"
          >
            <motion.h1
              variants={fadeInUp}
              className="font-display font-bold text-5xl md:text-7xl mb-8 tracking-tighter leading-[0.9] text-foreground"
            >
              Get in{""}
              <span className="text-transparent bg-clip-text bg-linear-to-br from-brand-blue to-brand-green">
                Touch
              </span>
              .
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium"
            >
              Have a question, feedback, or want to collaborate? I'd love to
              hear from you. Reach out through any of the channels below.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-5 gap-8">
            {/* Developer Profile Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="md:col-span-2 glass-card p-10 rounded-[40px] border border-border bg-card/60 shadow-glass relative overflow-hidden flex flex-col items-center text-center group"
            >
              <div className="w-32 h-32 rounded-full border-4 border-background shadow-2xl overflow-hidden mb-6 relative bg-brand-blue/10">
                <img
                  src="https://api.dicebear.com/7.x/micah/svg?seed=Oliver&backgroundColor=transparent"
                  alt="Anirudh S"
                  className="w-full h-full object-cover transition-transform duration-500 p-2"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      "https://ui-avatars.com/api/?name=Anirudh+S&background=random&size=200";
                  }}
                />
              </div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                Anirudh S
              </h2>
              <p className="text-brand-blue font-bold tracking-widest uppercase text-xs mb-6">
                Creator & Lead Developer
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                Building AI-powered tools to democratize career acceleration.
                Passionate about Next.js, FastAPI, and Open Source.
              </p>
              <Link
                href="https://github.com/SudoAnirudh"
                target="_blank"
                className="w-full py-4 rounded-2xl bg-foreground text-background font-bold tracking-widest uppercase text-xs flex items-center justify-center gap-2 transition-transform"
              >
                <Github size={16} />
                Follow on GitHub
              </Link>
            </motion.div>

            {/* Contact Methods */}
            <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {contactMethods.map((method, idx) => (
                <motion.a
                  key={idx}
                  href={method.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + idx * 0.1 }}
                  className={`p-6 rounded-[32px] border bg-card/40 backdrop-blur-md shadow-sm transition-transform duration-300 flex flex-col justify-between group h-48`}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${method.color}`}
                  >
                    <method.icon size={24} />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm font-bold uppercase tracking-wider mb-1">
                      {method.label}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-foreground font-medium text-lg truncate pr-4">
                        {method.value}
                      </p>
                      <ExternalLink
                        size={18}
                        className="text-muted-foreground opacity-0 transition-opacity -translate-x-4"
                      />
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
