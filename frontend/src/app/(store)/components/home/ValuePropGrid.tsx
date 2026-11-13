"use client";

import {
  ArrowRight,
  Headphones,
  Infinity as InfinityIcon,
  Rocket,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

export function ValuePropGrid() {
  const cards = [
    {
      title: "Get Started Faster",
      desc: "Instant downloads, no waiting.",
      linkText: "Browse Now",
      href: "/shop",
      icon: Rocket,
      bg: "bg-gradient-to-br from-[#7e22ce] to-[#6b21a8]",
    },
    {
      title: "100% Secure",
      desc: "Your payments and data are always protected.",
      linkText: "Learn More",
      href: "/about-us",
      icon: ShieldCheck,
      bg: "bg-gradient-to-br from-[#0891b2] to-[#0e7490]",
    },
    {
      title: "Lifetime Access",
      desc: "Buy once, use forever.",
      linkText: "View Details",
      href: "/shop?sort=best-sellers",
      icon: InfinityIcon,
      bg: "bg-gradient-to-br from-[#1d4ed8] to-[#1e3a8a]",
    },
    {
      title: "24/7 Support",
      desc: "We're here to help, anytime, anywhere.",
      linkText: "Contact Us",
      href: "/contact-us",
      icon: Headphones,
      bg: "bg-gradient-to-br from-[#6b21a8] to-[#581c87]",
    },
  ];

  return (
    <section className="py-10 sm:py-14 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className={`${card.bg} rounded-2xl p-5 sm:p-6 text-white flex flex-col justify-between shadow-lg hover:shadow-xl transition-all duration-300 group select-none`}
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-4 shadow-inner">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold tracking-tight text-white mb-1">
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/85 leading-relaxed font-normal">
                    {card.desc}
                  </p>
                </div>

                <div className="pt-6">
                  <Link
                    href={card.href}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:underline uppercase tracking-wider group-hover:translate-x-1 transition-transform"
                  >
                    <span>{card.linkText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
