"use client";

import {
  ArrowRight,
  ChevronDown,
  ShieldCheck,
  CreditCard,
  Truck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { ScrollReveal } from "@/components/motion/ScrollReveal";

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function XIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
      <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
    </svg>
  );
}

function LinkedinIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("Welcome to PGX VIP Club! Check your inbox soon.");
    setEmail("");
  };

  return (
    <footer className="bg-muted/30 text-muted-foreground border-t border-border/80 text-xs">
      {/* Newsletter VIP Banner Strip */}
      <div className="border-b border-border/60 bg-gradient-to-r from-primary/5 via-primary/10 to-transparent py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 max-w-5xl mx-auto">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-[11px] uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Join PGX Club</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground font-serif">
                Get Exclusive Drops & 15% Off Your First Order
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm mt-1">
                Be the first to know about new arrivals, private sales, and fitness guides.
              </p>
            </div>

            <form
              onSubmit={handleSubscribe}
              className="flex items-center w-full max-w-md bg-card p-1.5 rounded-2xl border border-border/80 shadow-sm focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-3 py-2 text-xs sm:text-sm bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-wider transition-all duration-200 active:scale-95 cursor-pointer shrink-0"
              >
                Join Now
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Links */}
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="col-span-2 lg:col-span-4 space-y-4">
            <Link href="/" className="inline-block group">
              <img
                src="/logo.png"
                alt="PGX Logo"
                className="h-10 sm:h-12 w-auto object-contain transition-opacity group-hover:opacity-90"
              />
            </Link>
            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed max-w-sm">
              Engineered for athletic distinction. Premium fitness machines, strength packages, and everyday athletic wear designed to elevate your personal peak.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2 pt-2">
              {[
                { icon: InstagramIcon, href: "https://instagram.com", label: "Instagram" },
                { icon: FacebookIcon, href: "https://facebook.com", label: "Facebook" },
                { icon: XIcon, href: "https://x.com", label: "X" },
                { icon: LinkedinIcon, href: "https://linkedin.com", label: "LinkedIn" },
              ].map((s, idx) => {
                const Icon = s.icon;
                return (
                  <a
                    key={idx}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.label}
                    className="w-9 h-9 rounded-xl bg-card border border-border/70 hover:border-primary/50 text-muted-foreground hover:text-primary flex items-center justify-center transition-all shadow-2xs hover:-translate-y-0.5"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Shop Column */}
          <div className="col-span-1 lg:col-span-2 space-y-3">
            <h4 className="font-bold text-foreground uppercase tracking-wider text-xs font-serif">
              Shop Categories
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/shop?category=strength-equipment" className="hover:text-primary transition-colors">
                  Strength &amp; Racks
                </Link>
              </li>
              <li>
                <Link href="/shop?category=cardio-equipment" className="hover:text-primary transition-colors">
                  Cardio Machines
                </Link>
              </li>
              <li>
                <Link href="/shop?category=home-gym" className="hover:text-primary transition-colors">
                  Home Gym Bundles
                </Link>
              </li>
              <li>
                <Link href="/shop?category=apparel" className="hover:text-primary transition-colors">
                  Athletic Apparel
                </Link>
              </li>
              <li>
                <Link href="/shop?category=accessories" className="hover:text-primary transition-colors">
                  Gear &amp; Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="col-span-1 lg:col-span-3 space-y-3">
            <h4 className="font-bold text-foreground uppercase tracking-wider text-xs font-serif">
              Customer Support
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/orders/track" className="hover:text-primary transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="hover:text-primary transition-colors">
                  Shipping &amp; Delivery Policy
                </Link>
              </li>
              <li>
                <Link href="/return-refund-policy" className="hover:text-primary transition-colors">
                  Returns &amp; 30-Day Guarantee
                </Link>
              </li>
              <li>
                <Link href="/contact-us" className="hover:text-primary transition-colors">
                  Help Center &amp; Live Chat
                </Link>
              </li>
              <li>
                <Link href="/corporate-deal" className="hover:text-primary transition-colors">
                  Corporate &amp; Commercial Deals
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="col-span-2 sm:col-span-1 lg:col-span-3 space-y-3">
            <h4 className="font-bold text-foreground uppercase tracking-wider text-xs font-serif">
              Company &amp; Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/about-us" className="hover:text-primary transition-colors">
                  Our Brand Heritage
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-primary transition-colors">
                  Fitness Insights &amp; Journal
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Sub-footer & Payment Trust */}
      <div className="border-t border-border/80 bg-muted/60 py-6">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-muted-foreground">
          <div>
            © 2026 PGX Sporting Systems. All rights reserved. Built for athletic excellence.
          </div>

          <div className="flex items-center gap-3">
            <span className="font-semibold text-foreground/70">Secure Payment:</span>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded bg-background border border-border text-[10px] font-bold text-foreground">
                VISA
              </span>
              <span className="px-2 py-0.5 rounded bg-background border border-border text-[10px] font-bold text-foreground">
                Mastercard
              </span>
              <span className="px-2 py-0.5 rounded bg-background border border-border text-[10px] font-bold text-foreground">
                Apple Pay
              </span>
              <span className="px-2 py-0.5 rounded bg-background border border-border text-[10px] font-bold text-foreground">
                Google Pay
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
