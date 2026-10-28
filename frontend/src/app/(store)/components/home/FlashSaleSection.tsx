"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Flame, Clock, Sparkles, Tag, ShieldCheck } from "lucide-react";
import { ScrollReveal } from "@/components/motion/ScrollReveal";

export function FlashSaleSection() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 8,
    minutes: 42,
    seconds: 19,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (n: number) => n.toString().padStart(2, "0");

  return (
    <section className="py-8 sm:py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* 1. Flash Sale Banner Card */}
          <ScrollReveal direction="up" delay={0.05} className="md:col-span-1">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500/15 via-primary/10 to-primary/20 border border-primary/25 p-6 flex flex-col justify-between h-full min-h-[220px] shadow-sm">
              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500 text-white text-[11px] font-bold uppercase tracking-wider mb-3 shadow-xs">
                  <Flame className="w-3.5 h-3.5 fill-white stroke-none" />
                  <span>Flash Sale</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground font-serif">
                  Up To 50% Off
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Limited time deals on professional fitness equipment.
                </p>

                {/* Real-time countdown timer */}
                <div className="flex items-center gap-2 my-4">
                  <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-card border border-border shadow-2xs">
                    <span className="text-base font-black text-foreground">
                      {formatNumber(timeLeft.hours)}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-muted-foreground">
                      Hrs
                    </span>
                  </div>
                  <span className="font-bold text-muted-foreground">:</span>
                  <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-card border border-border shadow-2xs">
                    <span className="text-base font-black text-foreground">
                      {formatNumber(timeLeft.minutes)}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-muted-foreground">
                      Min
                    </span>
                  </div>
                  <span className="font-bold text-muted-foreground">:</span>
                  <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-card border border-border shadow-2xs">
                    <span className="text-base font-black text-rose-500">
                      {formatNumber(timeLeft.seconds)}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-muted-foreground">
                      Sec
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href="/shop?category=deals"
                className="relative z-10 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary hover:text-primary/80 transition-colors group mt-2"
              >
                <span>Shop Deals Now</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </ScrollReveal>

          {/* 2. Free Worldwide Shipping Banner */}
          <ScrollReveal direction="up" delay={0.15} className="md:col-span-1">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 p-6 flex flex-col justify-between h-full min-h-[220px] shadow-sm">
              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold uppercase tracking-wider mb-3 shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Free Delivery</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground font-serif">
                  Express Shipping
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xs">
                  On all commercial gear and apparel orders over €50 across Europe &amp; Global.
                </p>
              </div>

              <Link
                href="/shop"
                className="relative z-10 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 hover:opacity-80 transition-opacity group mt-4"
              >
                <span>Explore Free Shipping Items</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </ScrollReveal>

          {/* 3. New Arrivals Banner */}
          <ScrollReveal direction="up" delay={0.25} className="md:col-span-1">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-500/15 via-primary/10 to-transparent border border-primary/20 p-6 flex flex-col justify-between h-full min-h-[220px] shadow-sm">
              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-primary-foreground text-[11px] font-bold uppercase tracking-wider mb-3 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>New Drop</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground font-serif">
                  2026 Collection
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xs">
                  Discover next-generation ergonomic gym gear &amp; athletic wear.
                </p>
              </div>

              <Link
                href="/shop?sort=newest"
                className="relative z-10 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary hover:text-primary/80 transition-colors group mt-4"
              >
                <span>Check Out New Arrivals</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

