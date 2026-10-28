"use client";

import { motion } from "framer-motion";
import { Sparkles, Truck, ShieldCheck, Flame, ArrowRight } from "lucide-react";
import Link from "next/link";

const ANNOUNCEMENTS = [
  {
    icon: Truck,
    text: "Free Express Worldwide Shipping on Orders Over €50",
    badge: "Limited Offer",
    href: "/shop",
  },
  {
    icon: Flame,
    text: "Mid-Season Lifestyle Sale: Up to 50% Off Select Gear",
    badge: "Sale",
    href: "/shop?category=deals",
  },
  {
    icon: ShieldCheck,
    text: "2-Year Comprehensive Commercial Warranty On All Equipment",
    badge: "Guaranteed",
    href: "/about-us",
  },
  {
    icon: Sparkles,
    text: "New Athletic Collections Just Dropped — Elevate Your Everyday",
    badge: "New In",
    href: "/shop?category=apparel",
  },
];

export function AnnouncementBar() {
  return (
    <div className="relative overflow-hidden bg-foreground text-background py-2 text-[11px] sm:text-xs font-medium border-b border-white/10 select-none">
      {/* Infinite smooth ticker for high-end boutique e-commerce feel */}
      <div className="flex w-max animate-marquee space-x-10 sm:space-x-16 hover:[animation-play-state:paused]">
        {[...ANNOUNCEMENTS, ...ANNOUNCEMENTS].map((item, idx) => {
          const Icon = item.icon;
          return (
            <Link
              key={idx}
              href={item.href}
              className="inline-flex items-center gap-2 group transition-opacity hover:opacity-80 shrink-0"
            >
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary/20 text-primary">
                <Icon className="w-2.5 h-2.5 text-purple-300" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-white/10 text-white/90">
                {item.badge}
              </span>
              <span className="text-white/90 tracking-wide">{item.text}</span>
              <ArrowRight className="w-3 h-3 text-white/40 group-hover:translate-x-0.5 group-hover:text-white transition-all" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

