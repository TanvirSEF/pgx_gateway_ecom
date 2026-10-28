"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, ShieldCheck, Truck, Star, Check } from "lucide-react";

interface ProductTabsProps {
  description?: string;
  sku?: string;
  weight?: string;
  categoryName?: string;
}

export function ProductTabs({
  description,
  sku,
  weight,
  categoryName,
}: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<"desc" | "specs" | "shipping" | "reviews">("desc");

  const tabs = [
    { id: "desc", label: "Overview", icon: FileText },
    { id: "specs", label: "Specifications", icon: Check },
    { id: "shipping", label: "Shipping & Warranty", icon: Truck },
    { id: "reviews", label: "Reviews (128)", icon: Star },
  ];

  return (
    <div className="mt-12 sm:mt-16 pt-8 border-t border-border/80">
      {/* Tab Buttons */}
      <div className="flex items-center gap-2 border-b border-border/80 pb-px overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative px-4 sm:px-6 py-3 text-xs sm:text-sm font-bold tracking-wide transition-colors flex items-center gap-2 cursor-pointer shrink-0 ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeProductTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content Panels */}
      <div className="py-8">
        <AnimatePresence mode="wait">
          {activeTab === "desc" && (
            <motion.div
              key="desc"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground leading-relaxed text-sm sm:text-base"
            >
              {description ? (
                <div dangerouslySetInnerHTML={{ __html: description }} />
              ) : (
                <p>
                  Engineered with commercial-grade materials, this equipment delivers the highest standard of durability, ergonomic alignment, and performance for your training regimen.
                </p>
              )}
            </motion.div>
          )}

          {activeTab === "specs" && (
            <motion.div
              key="specs"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="max-w-2xl"
            >
              <div className="rounded-2xl border border-border/80 divide-y divide-border/60 overflow-hidden text-xs sm:text-sm bg-card">
                {sku && (
                  <div className="grid grid-cols-3 p-3 sm:p-4">
                    <span className="font-semibold text-foreground">Product Code / SKU</span>
                    <span className="col-span-2 text-muted-foreground font-mono">{sku}</span>
                  </div>
                )}
                <div className="grid grid-cols-3 p-3 sm:p-4">
                  <span className="font-semibold text-foreground">Classification</span>
                  <span className="col-span-2 text-muted-foreground">{categoryName || "Commercial Grade Fitness"}</span>
                </div>
                {weight && (
                  <div className="grid grid-cols-3 p-3 sm:p-4">
                    <span className="font-semibold text-foreground">Unit Weight</span>
                    <span className="col-span-2 text-muted-foreground">{weight}</span>
                  </div>
                )}
                <div className="grid grid-cols-3 p-3 sm:p-4">
                  <span className="font-semibold text-foreground">Build Quality</span>
                  <span className="col-span-2 text-muted-foreground">High-gauge structural alloy steel &amp; electrostatic coat</span>
                </div>
                <div className="grid grid-cols-3 p-3 sm:p-4">
                  <span className="font-semibold text-foreground">Safety Standard</span>
                  <span className="col-span-2 text-muted-foreground">ISO 20957 Certified / Commercial Gym Safe</span>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "shipping" && (
            <motion.div
              key="shipping"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="p-5 rounded-2xl bg-muted/20 border border-border/70 space-y-2">
                <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <Truck className="w-4 h-4 text-primary" /> Delivery &amp; Freight
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Heavy equipment ships via specialized freight carriers with liftgate service included. Standard parcel items dispatch within 24 hours. Full tracking is sent automatically via SMS and email.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-muted/20 border border-border/70 space-y-2">
                <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" /> 2-Year Full Coverage
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Every PGX product is protected by our manufacturer warranty covering mechanical frames, electronic sensors, and moving parts. Dedicated technical support available 24/7.
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === "reviews" && (
            <motion.div
              key="reviews"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 max-w-3xl"
            >
              {[
                {
                  author: "Alexander K.",
                  rating: 5,
                  title: "Exceptional build quality & finish",
                  comment:
                    "This is legitimately gym quality. Solid steel, seamless welds, smooth operation. Shipping was smooth and packaging was indestructible.",
                  date: "October 14, 2026",
                },
                {
                  author: "Sophia M.",
                  rating: 5,
                  title: "Transformed my daily routine",
                  comment:
                    "Best investment in my health this year. Looks ultra-modern in my apartment and performs flawlessly.",
                  date: "September 28, 2026",
                },
              ].map((rev, idx) => (
                <div
                  key={idx}
                  className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm text-foreground">
                      {rev.author}
                    </span>
                    <span className="text-[11px] text-muted-foreground">{rev.date}</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 stroke-none" />
                    ))}
                  </div>
                  <h5 className="font-bold text-xs sm:text-sm text-foreground">{rev.title}</h5>
                  <p className="text-xs text-muted-foreground leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

