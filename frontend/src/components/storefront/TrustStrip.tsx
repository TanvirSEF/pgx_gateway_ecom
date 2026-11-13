"use client";

import { CreditCard, Globe, Leaf, Star } from "lucide-react";
import { PgxDigitalLogo } from "./PgxDigitalLogo";

export function TrustStrip() {
  const trustItems = [
    {
      icon: Globe,
      title: "Global Access",
      desc: "Available worldwide",
    },
    {
      icon: CreditCard,
      title: "Multiple Payment Options",
      desc: "Cards, PayPal, Crypto & more",
    },
    {
      icon: Star,
      title: "Trusted by 50,000+",
      desc: "Happy customers",
    },
    {
      icon: Leaf,
      title: "Eco-Friendly",
      desc: "100% digital, zero waste",
    },
  ];

  return (
    <section className="bg-white border-t border-slate-200/80 py-8 select-none">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-6">
          {/* Logo */}
          <div className="shrink-0">
            <PgxDigitalLogo variant="light" />
          </div>

          {/* 4 Trust Pillars */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 flex-1 max-w-4xl">
            {trustItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                    <Icon className="w-4 h-4 text-[#7c3aed]" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-medium leading-tight">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
