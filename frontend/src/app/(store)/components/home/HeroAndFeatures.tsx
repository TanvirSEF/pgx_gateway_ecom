"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  Code2,
  Cpu,
  Download,
  GraduationCap,
  Layers,
  Lock,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function HeroSection() {
  const floatingBadges = [
    {
      title: "AI Tools",
      icon: Cpu,
      gradient: "from-blue-500/80 to-purple-600/80",
      border: "border-blue-400/40",
      position: "top-4 left-2 sm:top-6 sm:left-4 lg:-left-6",
      delay: 0,
    },
    {
      title: "Templates",
      icon: Code2,
      gradient: "from-purple-500/80 to-indigo-600/80",
      border: "border-purple-400/40",
      position: "top-32 left-0 sm:top-36 sm:left-2 lg:-left-12",
      delay: 0.8,
    },
    {
      title: "Software",
      icon: Terminal,
      gradient: "from-emerald-500/80 to-teal-600/80",
      border: "border-emerald-400/40",
      position: "bottom-8 left-4 sm:bottom-12 sm:left-10 lg:-left-8",
      delay: 1.4,
    },
    {
      title: "Software",
      icon: Layers,
      gradient: "from-cyan-500/80 to-blue-600/80",
      border: "border-cyan-400/40",
      position: "top-8 right-2 sm:top-10 sm:right-6 lg:-right-6",
      delay: 0.4,
    },
    {
      title: "Courses",
      icon: GraduationCap,
      gradient: "from-purple-600/80 to-fuchsia-600/80",
      border: "border-purple-400/40",
      position: "top-36 right-0 sm:top-40 sm:right-4 lg:-right-12",
      delay: 1.1,
    },
    {
      title: "Digital Assets",
      icon: Download,
      gradient: "from-pink-500/80 to-rose-600/80",
      border: "border-pink-400/40",
      position: "bottom-12 right-2 sm:bottom-14 sm:right-6 lg:-right-6",
      delay: 1.7,
    },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#0c0728] via-[#09051e] to-[#080420] text-white pt-10 pb-16 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-28 select-none">
      {/* Background Cyber Glowing Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#7c3aed]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-[#06b6d4]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-10 left-1/3 w-80 h-80 bg-[#a855f7]/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Hero Typography & CTAs */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-black tracking-tight leading-[1.12] text-white"
            >
              Digital Products for a <br className="hidden sm:inline" />
              <span className="text-white">Smarter World.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-slate-300 text-sm sm:text-base lg:text-lg max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed"
            >
              Discover premium software, AI tools, website templates, marketing resources,
              and more — all in one place.
            </motion.p>

            {/* Feature Pills: Instant Download, Secure Payments, Lifetime Access */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 pt-2 text-xs sm:text-sm font-semibold text-slate-200"
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#7c3aed]/30 text-[#a78bfa] flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                </span>
                <span>Instant Download</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </span>
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <RefreshCw className="w-3.5 h-3.5" />
                </span>
                <span>Lifetime Access</span>
              </div>
            </motion.div>

            {/* Action CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-3"
            >
              <Link
                href="/shop"
                className="px-6 sm:px-8 py-3.5 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-[#7c3aed]/30 hover:shadow-[#7c3aed]/50 flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/shop"
                className="px-6 sm:px-8 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs sm:text-sm border border-white/20 hover:border-white/40 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Explore Categories</span>
              </Link>
            </motion.div>
          </div>

          {/* Right Column: High-Tech Laptop Mockup + 3D Floating Category Badges */}
          <div className="lg:col-span-6 relative flex items-center justify-center min-h-[380px] sm:min-h-[460px] lg:min-h-[500px]">
            {/* Center Laptop Frame Mockup */}
            <div className="relative z-10 w-full max-w-[360px] sm:max-w-[460px] lg:max-w-[500px] aspect-[16/10] bg-[#120e2e] rounded-2xl border-4 border-slate-700/60 shadow-2xl p-2.5 sm:p-3 overflow-hidden">
              {/* Laptop Screen Header */}
              <div className="h-4 sm:h-5 bg-slate-900 rounded-t-lg flex items-center px-2 gap-1.5 border-b border-white/10">
                <div className="w-2 h-2 rounded-full bg-red-500/80" />
                <div className="w-2 h-2 rounded-full bg-yellow-500/80" />
                <div className="w-2 h-2 rounded-full bg-green-500/80" />
                <div className="ml-auto text-[9px] text-slate-400 font-mono">pgxdigital.app</div>
              </div>

              {/* Laptop Screen Content (SaaS Dashboard matching mockup) */}
              <div className="bg-[#0f0b29] h-[calc(100%-16px)] sm:h-[calc(100%-20px)] rounded-b-lg p-3 sm:p-4 text-white flex flex-col justify-between overflow-hidden relative">
                {/* Dashboard Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-[#7c3aed] flex items-center justify-center font-bold text-[10px]">
                      PGX
                    </div>
                    <span className="text-xs font-bold text-slate-200">Dashboard</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span className="text-emerald-400 font-bold">$12,450</span>
                    <span className="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">
                      +28.4%
                    </span>
                  </div>
                </div>

                {/* Dashboard Center Hero Block */}
                <div className="my-auto space-y-1.5 py-2">
                  <h3 className="text-lg sm:text-2xl font-black text-white leading-tight">
                    Build <br />
                    <span className="text-[#a78bfa]">Create</span> <br />
                    <span className="text-cyan-400">Grow</span>
                  </h3>
                  <p className="text-[10px] sm:text-xs text-slate-400 max-w-[180px]">
                    Everything you need to succeed online.
                  </p>
                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#7c3aed] text-white text-[10px] sm:text-xs font-bold rounded-lg shadow-sm">
                      Get Started <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>

                {/* Dashboard Chart Preview Bars */}
                <div className="flex items-end gap-1.5 h-10 pt-1 border-t border-white/10">
                  <div className="w-1/6 bg-[#7c3aed]/40 h-4 rounded-xs" />
                  <div className="w-1/6 bg-[#7c3aed]/60 h-6 rounded-xs" />
                  <div className="w-1/6 bg-[#7c3aed]/80 h-9 rounded-xs" />
                  <div className="w-1/6 bg-[#06b6d4]/60 h-7 rounded-xs" />
                  <div className="w-1/6 bg-[#06b6d4]/80 h-10 rounded-xs" />
                  <div className="w-1/6 bg-emerald-400 h-8 rounded-xs" />
                </div>
              </div>

              {/* Laptop Hinge / Stand Base */}
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-48 sm:w-64 h-2 bg-slate-600 rounded-b-xl shadow-lg border-t border-slate-500" />
            </div>

            {/* 3D Floating Glassmorphism Category Cards (Framer Motion Animated) */}
            {floatingBadges.map((badge, idx) => {
              const Icon = badge.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: [0, -8, 0],
                  }}
                  transition={{
                    opacity: { duration: 0.5, delay: badge.delay * 0.3 },
                    y: {
                      duration: 3.5 + idx * 0.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                  }}
                  className={`absolute z-20 ${badge.position} cursor-pointer hidden xs:flex items-center gap-2 p-2 sm:p-2.5 rounded-2xl bg-gradient-to-br ${badge.gradient} backdrop-blur-xl border ${badge.border} shadow-xl hover:scale-105 transition-transform select-none`}
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0 shadow-inner">
                    <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold text-white tracking-wide pr-1">
                    {badge.title}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
