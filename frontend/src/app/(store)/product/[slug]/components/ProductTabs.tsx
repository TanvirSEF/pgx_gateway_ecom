"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, ShieldCheck, Zap, Star, Check, Code2 } from "lucide-react";

interface ProductTabsProps {
  description?: string;
  sku?: string;
  weight?: string;
  categoryName?: string;
}

export function ProductTabs({
  description,
  sku,
  categoryName,
}: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<"desc" | "specs" | "delivery" | "reviews">("desc");

  const tabs = [
    { id: "desc", label: "Overview", icon: FileText },
    { id: "specs", label: "Specifications", icon: Code2 },
    { id: "delivery", label: "License & Delivery", icon: Zap },
    { id: "reviews", label: "Reviews (Verified)", icon: Star },
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
                  Production-ready digital asset built with clean architecture, comprehensive documentation, and lifetime access.
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
                  <div className="grid grid-cols-3 p-3.5 sm:p-4">
                    <span className="font-semibold text-foreground">Product Code / SKU</span>
                    <span className="col-span-2 text-muted-foreground font-mono">{sku}</span>
                  </div>
                )}
                <div className="grid grid-cols-3 p-3.5 sm:p-4">
                  <span className="font-semibold text-foreground">Category</span>
                  <span className="col-span-2 text-muted-foreground">{categoryName || "Digital Tools & Assets"}</span>
                </div>
                <div className="grid grid-cols-3 p-3.5 sm:p-4">
                  <span className="font-semibold text-foreground">Delivery Format</span>
                  <span className="col-span-2 text-muted-foreground">Instant Digital Download (ZIP, Git Repository &amp; License Key)</span>
                </div>
                <div className="grid grid-cols-3 p-3.5 sm:p-4">
                  <span className="font-semibold text-foreground">License Scope</span>
                  <span className="col-span-2 text-muted-foreground">Commercial &amp; Personal Rights with Lifetime Access</span>
                </div>
                <div className="grid grid-cols-3 p-3.5 sm:p-4">
                  <span className="font-semibold text-foreground">Documentation</span>
                  <span className="col-span-2 text-muted-foreground">Step-by-step setup guides, source code, and API reference included</span>
                </div>
                <div className="grid grid-cols-3 p-3.5 sm:p-4">
                  <span className="font-semibold text-foreground">System Compatibility</span>
                  <span className="col-span-2 text-muted-foreground">Universal Cross-Platform (macOS, Windows, Linux, Cloud)</span>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "delivery" && (
            <motion.div
              key="delivery"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="p-5 rounded-2xl bg-muted/20 border border-border/70 space-y-2">
                <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" /> Instant Automated Delivery
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Zero waiting. Your product files, license keys, and private repository invitations are provisioned immediately upon successful checkout and displayed directly on your confirmation screen. A permanent copy is also delivered to your email.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-muted/20 border border-border/70 space-y-2">
                <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" /> Lifetime Updates &amp; Support
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Every PGX MarketPlace product comes with lifetime access and all future version upgrades included at zero extra cost. Our technical engineering team is available 24/7 to assist with onboarding and integration.
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
                  author: "Marcus Vance",
                  role: "CTO & SaaS Founder",
                  rating: 5,
                  title: "Saved our engineering team weeks of boilerplate setup",
                  comment:
                    "Outstanding digital asset. Clean architecture, robust type safety, and battle-tested code. Saved our startup at least 4 weeks of development. Truly commercial quality.",
                  date: "2 days ago",
                },
                {
                  author: "Elena Rostova",
                  role: "Lead Product Designer",
                  rating: 5,
                  title: "Impeccable quality and production fidelity",
                  comment:
                    "The component structure, design system tokens, and UX fidelity are leagues ahead of standard templates. Easily adapted for three client client launches already.",
                  date: "1 week ago",
                },
                {
                  author: "David Chen",
                  role: "Principal Cloud Architect",
                  rating: 5,
                  title: "Flawless execution and zero technical debt",
                  comment:
                    "Rock-solid configurations and clean documentation. Deployed seamlessly to production without a single hiccup. Highly recommended!",
                  date: "2 weeks ago",
                },
              ].map((rev, idx) => (
                <div
                  key={idx}
                  className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs sm:text-sm text-foreground block">
                        {rev.author}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{rev.role}</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground font-mono">{rev.date}</span>
                  </div>

                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 stroke-none" />
                    ))}
                  </div>

                  <h5 className="font-bold text-xs sm:text-sm text-foreground pt-1">{rev.title}</h5>
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
