"use client";

import { motion, useAnimationFrame } from "framer-motion";
import { useRef, useState } from "react";
import {
  BrainCircuit,
  Mic,
  Sparkles,
  Zap,
  Code2,
  Globe,
  Database,
  Layers,
} from "lucide-react";

/* ─── Orbiting ring particle ─── */
function OrbitDot({
  radius,
  speed,
  size,
  color,
  startAngle = 0,
}: {
  radius: number;
  speed: number;
  size: number;
  color: string;
  startAngle?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const angle = useRef(startAngle);

  useAnimationFrame((_, delta) => {
    angle.current += (delta / 1000) * speed;
    const x = Math.cos(angle.current) * radius;
    const y = Math.sin(angle.current) * radius;
    if (ref.current) {
      ref.current.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    }
  });

  return (
    <div
      ref={ref}
      className="absolute top-1/2 left-1/2 rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        background: color,
        boxShadow: `0 0 ${size * 2}px ${color}`,
      }}
    />
  );
}

/* ─── Floating skill badge ─── */
const skills = [
  { icon: Code2, label: "DSA Rounds" },
  { icon: Globe, label: "System Design" },
  { icon: Database, label: "SQL Quizzes" },
  { icon: Layers, label: "Behavioral" },
  { icon: Zap, label: "Real-time Feedback" },
  { icon: Sparkles, label: "AI Grading" },
];

export default function MockInterviewComingSoon() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="relative min-h-[80vh] flex flex-col items-center justify-center overflow-hidden select-none">
      {/* ── Ambient background blobs ── */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 600,
          height: 600,
          background:
            "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
          top: "10%",
          left: "50%",
          x: "-50%",
          filter: "blur(40px)",
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 400,
          height: 400,
          background:
            "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
          bottom: "5%",
          right: "10%",
          filter: "blur(50px)",
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{
          repeat: Infinity,
          duration: 8,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      {/* ── Central orb with orbiting particles ── */}
      <div
        className="relative flex items-center justify-center mb-12"
        style={{ width: 220, height: 220 }}
      >
        {/* Orbit rings */}
        {[90, 100].map((r, i) => (
          <div
            key={i}
            className="absolute rounded-full border pointer-events-none"
            style={{
              width: r * 2,
              height: r * 2,
              borderColor:
                i === 0 ? "rgba(99,102,241,0.15)" : "rgba(139,92,246,0.1)",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}

        {/* Orbiting dots */}
        <OrbitDot
          radius={90}
          speed={0.6}
          size={8}
          color="rgba(99,102,241,0.9)"
          startAngle={0}
        />
        <OrbitDot
          radius={90}
          speed={0.6}
          size={5}
          color="rgba(139,92,246,0.7)"
          startAngle={Math.PI}
        />
        <OrbitDot
          radius={100}
          speed={-0.4}
          size={6}
          color="rgba(236,72,153,0.8)"
          startAngle={Math.PI / 2}
        />
        <OrbitDot
          radius={100}
          speed={-0.4}
          size={4}
          color="rgba(34,211,238,0.7)"
          startAngle={(3 * Math.PI) / 2}
        />

        {/* Core icon */}
        <motion.div
          className="relative z-10 w-24 h-24 rounded-3xl flex items-center justify-center"
          style={{
            background:
              "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.25))",
            border: "1px solid rgba(99,102,241,0.3)",
            backdropFilter: "blur(12px)",
          }}
          animate={{
            scale: [1, 1.06, 1],
            boxShadow: [
              "0 0 20px rgba(99,102,241,0.2)",
              "0 0 50px rgba(99,102,241,0.5)",
              "0 0 20px rgba(99,102,241,0.2)",
            ],
          }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        >
          <BrainCircuit size={42} style={{ color: "var(--indigo)" }} />
        </motion.div>
      </div>

      {/* ── Headline ── */}
      <div className="text-center mb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center gap-2 mb-3"
        >
          <motion.div
            animate={{ rotate: [0, 15, -10, 15, 0] }}
            transition={{ repeat: Infinity, duration: 3, delay: 1 }}
          >
            <Mic size={18} style={{ color: "var(--violet)" }} />
          </motion.div>
          <span
            className="text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
            style={{
              background: "rgba(139,92,246,0.12)",
              color: "var(--violet)",
              border: "1px solid rgba(139,92,246,0.25)",
            }}
          >
            In Development
          </span>
        </motion.div>

        <motion.h1
          className="font-display font-bold text-4xl md:text-5xl mb-4"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          Mock Interview Engine
          <br />
          <motion.span
            className="gradient-text"
            style={{
              backgroundImage:
                "linear-gradient(90deg, var(--indigo), var(--violet), #ec4899)",
            }}
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
          >
            is coming soon
          </motion.span>
        </motion.h1>

        <motion.p
          className="text-base max-w-md mx-auto"
          style={{ color: "var(--text-secondary)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
        >
          We're training an AI interviewer that reads your resume, adapts to
          your role, and gives real-time structured feedback — just like a real
          panel interview.
        </motion.p>
      </div>

      {/* ── Feature badges ── */}
      <motion.div
        className="flex flex-wrap justify-center gap-3 max-w-xl mt-8"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: { staggerChildren: 0.08, delayChildren: 0.4 },
          },
        }}
      >
        {skills.map(({ icon: Icon, label }, i) => (
          <motion.div
            key={label}
            variants={{
              hidden: { opacity: 0, y: 12 },
              visible: { opacity: 1, y: 0 },
            }}
            whileHover={{ scale: 1.08, y: -3 }}
            onHoverStart={() => setHovered(i)}
            onHoverEnd={() => setHovered(null)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl cursor-default transition-all"
            style={{
              background:
                hovered === i
                  ? "rgba(99,102,241,0.15)"
                  : "rgba(255,255,255,0.04)",
              border: `1px solid ${hovered === i ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.08)"}`,
              backdropFilter: "blur(8px)",
              color: hovered === i ? "var(--indigo)" : "var(--text-secondary)",
              transition: "all 0.2s ease",
            }}
          >
            <Icon size={14} />
            <span className="text-sm font-medium">{label}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Bottom pulse bar ── */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--indigo), var(--violet), transparent)",
        }}
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      />
    </div>
  );
}
