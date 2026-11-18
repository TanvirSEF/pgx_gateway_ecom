"use client";

import {
  Download,
  Headphones,
  RotateCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";

export function ValuePropGrid() {
  const valueProps = [
    {
      icon: Truck,
      title: "Worldwide Shipping",
      desc: "To Your Door",
    },
    {
      icon: Download,
      title: "Instant Digital Delivery",
      desc: "Access Downloads Immediately",
    },
    {
      icon: ShieldCheck,
      title: "Secure Payments",
      desc: "Shop with Confidence",
    },
    {
      icon: RotateCcw,
      title: "Easy Returns",
      desc: "Hassle-Free",
    },
    {
      icon: Headphones,
      title: "Dedicated Support",
      desc: "Here to Help 24/7",
    },
  ];

  return (
    <section className="bg-white border-b border-slate-200/80 py-6 sm:py-7 select-none">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-4 items-center justify-between divide-y sm:divide-y-0 lg:divide-x divide-slate-100">
          {valueProps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-3.5 px-2 sm:px-4 py-2 first:pl-0 last:pr-0"
              >
                <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center shrink-0 border border-purple-100/80 text-[#9333ea]">
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 leading-snug tracking-tight">
                    {item.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
