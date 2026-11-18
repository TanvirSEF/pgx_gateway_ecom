"use client";

import {
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Sparkles,
  Bot,
  Laptop,
  Code2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { PgxDigitalLogo } from "./PgxDigitalLogo";

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
    toast.success("Welcome to PGX MarketPlace Insider! Check your inbox for exclusive creator drops.");
    setEmail("");
  };

  return (
    <footer className="bg-[#080420] text-slate-300 border-t border-white/10 text-xs">
      {/* Newsletter VIP Banner Strip */}
      <div className="border-b border-white/10 bg-gradient-to-r from-[#7c3aed]/15 via-[#6d28d9]/10 to-transparent py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 max-w-5xl mx-auto">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7c3aed]/20 text-[#a78bfa] font-bold text-[11px] uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Join PGX MarketPlace</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Get Exclusive Releases &amp; $20 Off Your First Order
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Be the first to access new AI software, code kits, and premium course drops.
              </p>
            </div>

            <form
              onSubmit={handleSubscribe}
              className="flex items-center w-full max-w-md bg-[#120b38] p-1.5 rounded-2xl border border-white/15 shadow-sm focus-within:border-[#7c3aed] focus-within:ring-2 focus-within:ring-[#7c3aed]/20 transition-all"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-3 py-2 text-xs sm:text-sm bg-transparent text-white placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 active:scale-95 cursor-pointer shrink-0"
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
            <PgxDigitalLogo variant="dark" />
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              Discover premium software, AI tools, website templates, marketing resources, and more — all in one place. Instant digital downloads and lifetime updates.
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
                    className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:border-[#7c3aed] text-slate-400 hover:text-white flex items-center justify-center transition-all shadow-2xs hover:-translate-y-0.5"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Digital Categories */}
          <div className="col-span-1 lg:col-span-3 space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">
              Digital Categories
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/shop?category=software-licenses" className="hover:text-white transition-colors">
                  Software &amp; Licenses
                </Link>
              </li>
              <li>
                <Link href="/shop?category=website-templates" className="hover:text-white transition-colors">
                  Website Templates
                </Link>
              </li>
              <li>
                <Link href="/shop?category=ai-tools-automation" className="hover:text-white transition-colors">
                  AI Tools &amp; Automation
                </Link>
              </li>
              <li>
                <Link href="/shop?category=digital-marketing" className="hover:text-white transition-colors">
                  Digital Marketing
                </Link>
              </li>
              <li>
                <Link href="/shop?category=online-courses-ebooks" className="hover:text-white transition-colors">
                  Online Courses &amp; E-books
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div className="col-span-1 lg:col-span-2 space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">
              Support &amp; Help
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/my-account/orders" className="hover:text-white transition-colors">
                  My Downloads &amp; Keys
                </Link>
              </li>
              <li>
                <Link href="/contact-us" className="hover:text-white transition-colors">
                  Help Center &amp; Support
                </Link>
              </li>
              <li>
                <Link href="/return-refund-policy" className="hover:text-white transition-colors">
                  Refund &amp; License Terms
                </Link>
              </li>
              <li>
                <Link href="/about-us" className="hover:text-white transition-colors">
                  About PGX MarketPlace
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-2 sm:col-span-1 lg:col-span-3 space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">
              Legal &amp; Security
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/privacy-policy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/corporate-deal" className="hover:text-white transition-colors">
                  Enterprise &amp; Agency Licensing
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Sub-footer & Payment Trust */}
      <div className="border-t border-white/10 bg-[#060318] py-6">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>
            © 2026 PGX MarketPlace. All rights reserved. Smarter Tools. Better Results.
          </div>

          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-300">Accepted Payments:</span>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-bold text-slate-200">
                Cards
              </span>
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-bold text-slate-200">
                Stripe
              </span>
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-bold text-slate-200">
                PayPal
              </span>
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-bold text-slate-200">
                Crypto
              </span>
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-bold text-slate-200">
                PGX Wallet
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
