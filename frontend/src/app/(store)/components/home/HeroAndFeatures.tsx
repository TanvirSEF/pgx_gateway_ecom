"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Dumbbell,
  Shirt,
  Laptop,
  Download,
  HeartPulse,
  Plus,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function HeroSection() {
  const categoryHighlights = [
    { title: "Fitness Equipment", icon: Dumbbell, href: "/shop?category=fitness-gym-equipment" },
    { title: "Apparel & Fashion", icon: Shirt, href: "/shop" },
    { title: "Electronics & Tech", icon: Laptop, href: "/shop?category=desk-tech-peripherals" },
    { title: "Digital Products", icon: Download, href: "/shop?category=software-licenses" },
    { title: "Health & Wellness", icon: HeartPulse, href: "/shop" },
    { title: "& Much More", icon: Plus, href: "/shop" },
  ];

  return (
    <section className="relative overflow-hidden bg-[#070410] text-white select-none">
      {/* Background Graphic & Electric Purple Atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#06030c] via-[#100522] to-[#080314] z-0" />
      <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-[#9333ea]/25 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-[450px] h-[450px] bg-[#a855f7]/20 rounded-full blur-[150px] pointer-events-none" />

      {/* Hero Atmosphere Image (High-energy fitness & lifestyle with dark purple overlay) */}
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none">
        <Image
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1920&q=80"
          alt="PGX Marketplace Lifestyle"
          fill
          unoptimized
          priority
          className="object-cover object-center filter contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070410] via-[#070410]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070410] via-transparent to-[#070410]/70" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Bold Slanted Typography & CTA */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-5 text-left">
            {/* Top Accent Pill/Line */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2.5"
            >
              <div className="w-8 h-1 bg-[#a855f7] rounded-full" />
              <span className="text-xs sm:text-sm font-black tracking-[0.2em] text-[#c084fc] uppercase">
                PGX MARKETPLACE
              </span>
            </motion.div>

            {/* Giant Slanted Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-[64px] font-black italic tracking-tight leading-[1.08] uppercase text-white"
            >
              FITNESS. FASHION. <br />
              TECH. DIGITAL.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c084fc] via-[#a855f7] to-[#9333ea] not-italic">
                ALL IN ONE.
              </span>
            </motion.h1>

            {/* Sub-headline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-slate-300 text-sm sm:text-base md:text-lg max-w-xl font-normal leading-relaxed"
            >
              Your all-in-one marketplace for fitness equipment, apparel,
              electronics, digital products and more.
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="pt-3"
            >
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#9333ea] hover:bg-[#7e22ce] text-white font-extrabold text-sm sm:text-base shadow-xl shadow-purple-600/35 hover:shadow-purple-600/50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>

          {/* Right Column: Floating Dark Translucent Category Highlights Card */}
          <div className="lg:col-span-5 xl:col-span-4 flex justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="w-full max-w-sm rounded-2xl bg-black/45 backdrop-blur-xl border border-white/15 p-5 sm:p-6 shadow-2xl relative overflow-hidden"
            >
              {/* Subtle top edge glow */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#a855f7] to-transparent" />

              <div className="space-y-3.5">
                {categoryHighlights.map((cat, idx) => {
                  const Icon = cat.icon;
                  return (
                    <Link
                      key={idx}
                      href={cat.href}
                      className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-purple-500/30 text-slate-200 hover:text-white transition-all group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#c084fc] group-hover:scale-110 transition-transform">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs sm:text-sm font-semibold tracking-wide">
                        {cat.title}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 ml-auto text-slate-500 group-hover:text-[#c084fc] group-hover:translate-x-1 transition-all" />
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
