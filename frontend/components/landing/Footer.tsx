import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Brain,
  Github,
  Twitter,
  Linkedin,
  ExternalLink,
  Briefcase,
  Mic,
  Milestone,
  X,
  Sparkles,
  CheckCircle2,
  Target,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PRODUCT_DOCS = {
  "Resume Analytics": {
    icon: Brain,
    tagline: "High-Fidelity ATS Evaluation",
    description:
      "Scan your resume against professional industry baselines. Hirenix implements a hybrid evaluation system: 70% structural and grammatical analysis, and 30% semantic embedding checks to see how well your profile resonates with hiring criteria.",
    features: [
      "Hybrid Rule-Based + Semantic scoring",
      "Interactive feedback highlights",
      "Suggestions on formatting, keywords, and action verbs",
      "PDF & DOCX parsing support",
    ],
    color: "#3B82F6",
    href: "/dashboard/resume-analysis",
    ctaText: "Go to Resume Analytics",
  },
  "GitHub Audit": {
    icon: Github,
    tagline: "GitHub Performance Index (GPI)",
    description:
      "Connect your GitHub and benchmark your repository contributions. Hirenix crawls public commit histories, languages, and PR patterns to compute your consistency index, repo depth, and tech diversity score.",
    features: [
      "GPI (GitHub Performance Index)",
      "Commit consistency heatmaps",
      "Repository complexity evaluation",
      "Tech stack diversity map",
    ],
    color: "#8B5CF6",
    href: "/dashboard/github-analysis",
    ctaText: "Run GitHub Audit",
  },
  "Job Matcher": {
    icon: Target,
    tagline: "Semantic Profile Fitting",
    description:
      "Paste any job description and let the Hirenix engine measure skill similarity. The matcher isolates technical gaps, soft-skill requirements, and provides a direct correlation percentage to guide resume editing.",
    features: [
      "Real-time JD parsing",
      "Skills-gap discrepancy list",
      "Matching similarity score (0-100%)",
      "Tailoring suggestions for keywords",
    ],
    color: "#EC4899",
    href: "/dashboard/job-match",
    ctaText: "Go to Job Matcher",
  },
  "Mock Interview": {
    icon: Mic,
    tagline: "Immersive Conversational Studio",
    description:
      "Participate in real-time, adaptive face-to-face mock interview practice. Hirenix dynamically crafts questions one-by-one based on your resume, target role, and past answers, utilizing Groq Whisper for high-accuracy transcribing.",
    features: [
      "Conversational follow-up loops",
      "Groq Whisper audio transcription",
      "Text-to-Speech speaking simulation",
      "Biometric attention/face alignment monitoring",
    ],
    color: "#10B981",
    href: "/dashboard/mock-interview",
    ctaText: "Start Mock Interview",
  },
  Roadmap: {
    icon: Milestone,
    tagline: "Career Evolution Track",
    description:
      "Visualize a step-by-step career milestone plan tailored to your profile. See missing stack requirements and learn where to build projects to unlock intermediate seniority tiers.",
    features: [
      "Custom path node progression",
      "Skills vector milestone checkpoints",
      "Direct links to learning resources",
      "Interactive checkmarks",
    ],
    color: "#F59E0B",
    href: "/dashboard/roadmap",
    ctaText: "View Career Roadmap",
  },
  "Jobs Board": {
    icon: Briefcase,
    tagline: "Aggregated Live Tech Openings",
    description:
      "Discover tech opportunities curated directly from developer tweets, top engineering blogs, and verified job boards. Updated in real-time every 2 hours with AI-extracted skills and stack requirements.",
    features: [
      "Auto-syncs every 2-hour interval",
      "AI-parsed requirements & stack tags",
      "Direct-to-recruiter applications",
      "Public, registration-free search board",
    ],
    color: "#06B6D4",
    href: "/jobs",
    ctaText: "Explore Jobs Board",
  },
};

const ProductAnimation = ({ product }: { product: string }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (product !== "Roadmap") return;
    const id = setInterval(() => {
      setStep((s) => (s + 1) % 4);
    }, 2000);
    return () => clearInterval(id);
  }, [product]);

  // Resume Analytics scanning animation
  if (product === "Resume Analytics") {
    return (
      <div className="w-full bg-slate-950 rounded-2xl p-6 border border-slate-800 h-36 flex flex-col justify-center relative overflow-hidden">
        {/* Pulsing scanner line */}
        <motion.div
          className="absolute inset-x-0 h-0.5 bg-blue-500 shadow-md shadow-blue-500/50 z-20"
          animate={{ top: ["10%", "90%", "10%"] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        />
        <div className="space-y-2 z-10 opacity-70">
          <div className="h-1.5 w-3/4 bg-slate-800 rounded-full" />
          <div className="h-1.5 w-5/6 bg-slate-800 rounded-full" />
          <div className="h-1.5 w-2/3 bg-slate-800 rounded-full" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="bg-slate-900/90 border border-blue-500/30 px-4 py-2.5 rounded-xl flex flex-col items-center shadow-lg">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
              ATS Score
            </span>
            <motion.span
              className="text-lg font-black text-blue-500 font-display mt-0.5"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              87%
            </motion.span>
          </div>
        </div>
      </div>
    );
  }

  // GitHub contribution grid animation
  if (product === "GitHub Audit") {
    return (
      <div className="w-full bg-slate-950 rounded-2xl p-5 border border-slate-800 h-36 flex flex-col justify-center gap-3 relative overflow-hidden">
        <div className="grid grid-cols-8 gap-1.5 max-w-xs mx-auto">
          {[...Array(16)].map((_, i) => {
            const delay = (i % 4) * 0.1;
            return (
              <motion.div
                key={i}
                className="w-5 h-5 rounded-[4px]"
                animate={{
                  backgroundColor:
                    i % 3 === 0
                      ? ["#1e293b", "#a78bfa", "#1e293b"]
                      : i % 3 === 1
                        ? ["#1e293b", "#7c3aed", "#1e293b"]
                        : ["#1e293b", "#4c1d95", "#1e293b"],
                }}
                transition={{ repeat: Infinity, duration: 4, delay }}
              />
            );
          })}
        </div>
        <div className="flex justify-around text-center border-t border-slate-850 pt-2">
          <div>
            <span className="text-[7px] font-black text-slate-500 uppercase block">
              Commits
            </span>
            <span className="text-[10px] font-bold text-white">342</span>
          </div>
          <div>
            <span className="text-[7px] font-black text-slate-500 uppercase block">
              GPI
            </span>
            <span className="text-[10px] font-bold text-white">A+</span>
          </div>
        </div>
      </div>
    );
  }

  // Job Matcher skills bar comparison
  if (product === "Job Matcher") {
    return (
      <div className="w-full bg-slate-950 rounded-2xl p-5 border border-slate-800 h-36 flex flex-col justify-center gap-3">
        <div className="space-y-2">
          {[
            { name: "Python", val: "95%", color: "#ec4899" },
            { name: "React", val: "85%", color: "#db2777" },
            { name: "Docker", val: "20%", color: "#9d174d", gap: true },
          ].map((skill, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between items-center text-[9px] font-bold">
                <span className="text-slate-300">{skill.name}</span>
                <span style={{ color: skill.color }}>
                  {skill.val} {skill.gap && "(Gap)"}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: skill.color }}
                  initial={{ width: 0 }}
                  animate={{ width: skill.val }}
                  transition={{ duration: 1.5, delay: idx * 0.2 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Mock Interview sound waves visualizer
  if (product === "Mock Interview") {
    return (
      <div className="w-full bg-slate-950 rounded-2xl p-5 border border-slate-800 h-36 flex flex-col justify-center items-center gap-3">
        <div className="flex items-end gap-1.5 h-8">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1.5 rounded-full bg-emerald-500"
              animate={{ height: [6, ((i * 7) % 24) + 6, 6] }}
              transition={{ repeat: Infinity, duration: 0.5 + i * 0.05 }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-[8px] font-black text-emerald-400 uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          <span>Whisper Capturing Audio</span>
        </div>
      </div>
    );
  }

  // Roadmap node timeline animation
  if (product === "Roadmap") {
    const nodes = ["Basics", "Frontend", "Backend", "Systems"];
    return (
      <div className="w-full bg-slate-950 rounded-2xl p-5 border border-slate-800 h-36 flex flex-col justify-center">
        <div className="relative flex justify-between items-center w-full px-2">
          {/* Tracking connection line */}
          <div className="absolute inset-x-2 h-0.5 bg-slate-800 top-1/2 -translate-y-1/2 z-0" />
          <motion.div
            className="absolute left-2 h-0.5 bg-amber-500 top-1/2 -translate-y-1/2 z-0"
            animate={{ width: `${step * 30}%` }}
            transition={{ duration: 0.5 }}
          />

          {nodes.map((node, idx) => {
            const isActive = idx <= step;
            return (
              <div
                key={node}
                className="relative z-10 flex flex-col items-center gap-1.5"
              >
                <motion.div
                  className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                    isActive
                      ? "bg-amber-500 border-amber-400 text-slate-950 shadow-lg shadow-amber-500/20"
                      : "bg-slate-900 border-slate-800 text-slate-500"
                  }`}
                  animate={isActive ? { scale: [1, 1.15, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {idx + 1}
                </motion.div>
                <span
                  className={`text-[8px] font-black uppercase tracking-widest ${isActive ? "text-amber-500" : "text-slate-600"}`}
                >
                  {node}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Jobs Board live job-stream animation
  if (product === "Jobs Board") {
    const jobFeed = [
      {
        role: "Backend Engineer",
        company: "Razorpay",
        loc: "Bangalore",
        time: "Just now",
      },
      {
        role: "Frontend Dev",
        company: "Vercel",
        loc: "Remote",
        time: "1h ago",
      },
      { role: "ML Researcher", company: "Nvidia", loc: "Pune", time: "2h ago" },
    ];

    return (
      <div className="w-full bg-slate-950 rounded-2xl p-4 border border-slate-800 h-36 flex flex-col justify-between relative overflow-hidden text-left">
        {/* Syncing indicator */}
        <div className="flex justify-between items-center border-b border-slate-900 pb-2 mb-1">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
              Live Scraper Active
            </span>
          </div>
          <span className="text-[8px] font-bold text-cyan-400 uppercase tracking-wider bg-cyan-950/40 border border-cyan-800/30 px-2 py-0.5 rounded-md">
            Sync: 2h interval
          </span>
        </div>

        {/* Rolling job list */}
        <div className="flex-1 flex flex-col gap-1.5 overflow-hidden">
          {jobFeed.map((job, idx) => (
            <motion.div
              key={idx}
              className="flex justify-between items-center bg-slate-900/40 border border-slate-800/30 px-2.5 py-1 rounded-xl"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.2 }}
            >
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-white leading-none">
                  {job.role}
                </span>
                <span className="text-[7px] text-slate-500 mt-0.5">
                  {job.company} • {job.loc}
                </span>
              </div>
              <span className="text-[7px] font-black text-cyan-400 uppercase tracking-wider">
                {job.time}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

const ProductDocsModal = ({
  product,
  onClose,
}: {
  product: string;
  onClose: () => void;
}) => {
  const [activeTab, setActiveTab] = useState(product);

  const tabs = Object.keys(PRODUCT_DOCS) as Array<keyof typeof PRODUCT_DOCS>;
  const activeData = PRODUCT_DOCS[activeTab as keyof typeof PRODUCT_DOCS];
  const Icon = activeData.icon;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[100] flex items-center justify-center p-4 md:p-6 select-none font-body">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="glass-card w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-[32px] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[500px] text-white relative pointer-events-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer z-50 pointer-events-auto"
          title="Close Modal"
        >
          <X size={18} />
        </button>

        {/* Sidebar Nav */}
        <div className="w-full md:w-72 bg-slate-950/80 border-b md:border-b-0 md:border-r border-slate-800/60 p-6 flex flex-col gap-2 shrink-0">
          <div className="flex items-center gap-2.5 px-3 mb-6">
            <Sparkles size={16} className="text-brand-blue" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Product Overview
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            {tabs.map((tabKey) => {
              const tab = PRODUCT_DOCS[tabKey];
              const TabIcon = tab.icon;
              const isSelected = activeTab === tabKey;
              return (
                <button
                  key={tabKey}
                  onClick={() => setActiveTab(tabKey)}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-left text-xs font-bold transition-all cursor-pointer pointer-events-auto ${
                    isSelected
                      ? "bg-slate-800 text-white shadow-inner border border-slate-700/50"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <TabIcon
                    size={16}
                    style={{ color: isSelected ? tab.color : undefined }}
                  />
                  <span>{tabKey}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Documentation Content Pane */}
        <div className="flex-1 p-8 md:p-10 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-800"
                style={{ border: `1px solid ${activeData.color}25` }}
              >
                <Icon size={20} style={{ color: activeData.color }} />
              </div>
              <div>
                <h3 className="font-display font-bold text-2xl tracking-tight text-white">
                  {activeTab}
                </h3>
                <span
                  className="text-[10px] font-black tracking-widest uppercase opacity-75"
                  style={{ color: activeData.color }}
                >
                  {activeData.tagline}
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              {activeData.description}
            </p>

            <div className="space-y-3">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 block">
                Key Features Included
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeData.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    <CheckCircle2
                      size={14}
                      className="text-slate-500 shrink-0"
                      style={{ color: activeData.color }}
                    />
                    <span className="text-xs text-slate-300 font-bold">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {activeData.href && (
              <div className="pt-4 flex">
                <Link
                  href={activeData.href}
                  onClick={() => onClose()}
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider text-slate-900 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  style={{
                    backgroundColor: activeData.color,
                  }}
                >
                  <span>{activeData.ctaText}</span>
                  <ExternalLink size={14} className="stroke-[2.5]" />
                </Link>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800/60">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              <div className="space-y-1 text-left">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 block">
                  Simulated Workspace Preview
                </span>
                <p className="text-[10px] text-slate-400 font-medium leading-normal">
                  Interaction simulation showcasing how Hirenix handles data
                  vectors in real-time.
                </p>
              </div>
              <ProductAnimation product={activeTab} />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const Footer = () => {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Company",
      links: [
        { name: "About Hirenix", href: "/about" },
        { name: "Blog", href: "#" },
        { name: "Careers", href: "/careers" },
        { name: "Contact", href: "/contact" },
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
        { name: "Jobs Board", href: "#" },
      ],
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
        { name: "Security", href: "/security" },
      ],
    },
  ];

  return (
    <footer className="relative z-10 py-24 px-6 border-t border-border bg-card/40 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-20">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-8 group">
              <div className="w-12 h-12 rounded-2xl bg-brand-blue flex items-center justify-center shadow-lg shadow-brand-blue/20 transition-transform">
                <Brain className="text-white" size={26} />
              </div>
              <span className="font-display font-black text-3xl text-foreground tracking-tighter uppercase italic">
                HIRENIX
              </span>
            </Link>
            <p className="text-muted-foreground text-lg font-medium leading-relaxed max-w-sm mb-10">
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
                  className="w-12 h-12 rounded-2xl bg-background/60 border border-border flex items-center justify-center text-muted-foreground transition-all"
                >
                  <Icon size={22} />
                </Link>
              ))}
            </div>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-foreground font-black uppercase tracking-[0.2em] text-sm mb-8">
                {section.title}
              </h4>
              <ul className="flex flex-col gap-5">
                {section.links.map((link) => {
                  const isProduct = section.title === "Product";
                  return (
                    <li key={link.name}>
                      {isProduct ? (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedProduct(link.name);
                          }}
                          className="text-muted-foreground hover:text-brand-blue transition-colors text-sm font-bold uppercase tracking-widest flex items-center group text-left cursor-pointer pointer-events-auto bg-transparent border-none p-0 outline-none"
                        >
                          {link.name}
                        </button>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-muted-foreground transition-colors text-sm font-bold uppercase tracking-widest flex items-center group"
                        >
                          {link.name}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-12 border-t border-border flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-sm font-bold text-muted-foreground tracking-widest">
            <span>© {currentYear} Hirenix. All rights reserved.</span>
            <span className="hidden md:block text-border">|</span>
            <Link
              href="https://github.com/SudoAnirudh"
              className="flex items-center gap-2 text-muted-foreground transition-colors group"
            >
              Engineered by Anirudh S
              <ExternalLink
                size={12}
                className="opacity-0 transition-opacity"
              />
            </Link>
          </div>

          <div className="flex gap-4 items-center">
            <Link
              href="/terms"
              className="text-xs font-medium text-muted-foreground transition-colors"
            >
              Terms
            </Link>
            <span className="text-border text-xs">•</span>
            <Link
              href="/privacy"
              className="text-xs font-medium text-muted-foreground transition-colors"
            >
              Privacy
            </Link>
            <span className="text-border text-xs">•</span>
            <Link
              href="/security"
              className="text-xs font-medium text-muted-foreground transition-colors"
            >
              Security
            </Link>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {selectedProduct && (
          <ProductDocsModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </AnimatePresence>
    </footer>
  );
};
