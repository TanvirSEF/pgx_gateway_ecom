"use client";

import { useAuth } from "@/providers/AuthProvider";
import { Headphones, ShieldCheck, Truck, Zap } from "lucide-react";
import Link from "next/link";

export function AnnouncementBar() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="bg-[#070512] text-slate-300 text-[11px] sm:text-xs py-2 px-4 sm:px-8 border-b border-white/10 select-none transition-colors">
      <div className="container mx-auto flex items-center justify-between gap-4">
        {/* Left: Value proposition highlights */}
        <div className="flex items-center gap-3 sm:gap-5 overflow-x-auto no-scrollbar py-0.5">
          <div className="flex items-center gap-1.5 shrink-0">
            <Truck className="w-3.5 h-3.5 text-[#a855f7]" />
            <span className="font-medium text-slate-200">Worldwide Shipping</span>
          </div>
          <span className="text-white/20 hidden sm:inline">|</span>
          <div className="flex items-center gap-1.5 shrink-0">
            <Zap className="w-3.5 h-3.5 text-[#a855f7] fill-[#a855f7]" />
            <span className="font-medium text-slate-200">Instant Digital Delivery</span>
          </div>
          <span className="text-white/20 hidden md:inline">|</span>
          <div className="hidden md:flex items-center gap-1.5 shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-[#a855f7]" />
            <span className="font-medium text-slate-200">Secure Checkout</span>
          </div>
          <span className="text-white/20 hidden lg:inline">|</span>
          <div className="hidden lg:flex items-center gap-1.5 shrink-0">
            <Headphones className="w-3.5 h-3.5 text-[#a855f7]" />
            <span className="font-medium text-slate-200">24/7 Support</span>
          </div>
        </div>

        {/* Right: Quick service links */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0 text-slate-400 text-[11px] sm:text-xs">
          <Link href="/contact-us" className="hover:text-white transition-colors">
            Need Help?
          </Link>
          <span className="text-white/20">|</span>
          <Link href="/contact-us" className="hover:text-white transition-colors">
            Support
          </Link>
          <span className="text-white/20 hidden xs:inline">|</span>
          <Link href="/my-account/orders" className="hover:text-white transition-colors hidden xs:inline">
            Track Order
          </Link>
        </div>
      </div>
    </div>
  );
}
