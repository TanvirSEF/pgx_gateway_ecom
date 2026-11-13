"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, PackageOpen } from "lucide-react";
import { ProductCard } from "@/components/storefront/product/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetProducts } from "@/lib/api/product";
import { HeroSection } from "./components/home/HeroAndFeatures";
import { CategoryPillBar } from "./components/home/CategoryPillBar";
import { ValuePropGrid } from "./components/home/ValuePropGrid";
import { TrustStrip } from "@/components/storefront/TrustStrip";
import { ScrollReveal } from "@/components/motion/ScrollReveal";

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const { data: apiProducts, isLoading } = useGetProducts({
    limit: 50,
    category: selectedCategory || undefined,
  });

  const products = apiProducts?.data || [];

  // Featured products showing top digital solutions and smart gadgets
  const featuredDigitalSlugs = [
    "ai-business-chatbot-pro",
    "e-commerce-website-kit",
    "marketing-template-bundle",
    "influencer-partnership-crm-system",
    "digital-marketing-masterclass",
    "pgx-ultra-titanium-smartwatch",
    "pgx-cyberdeck-mechanical-keyboard",
    "pgx-studioone-usb-microphone",
    "pgx-turbodrive-2tb-nvme-ssd",
    "pgx-falcon-4k-gps-drone",
  ];

  const featuredProducts = products
    .filter((p: any) => featuredDigitalSlugs.includes(p.slug))
    .sort(
      (a: any, b: any) =>
        featuredDigitalSlugs.indexOf(a.slug) - featuredDigitalSlugs.indexOf(b.slug)
    );

  const displayProducts =
    featuredProducts.length > 0
      ? [...featuredProducts, ...products.filter((p: any) => !featuredDigitalSlugs.includes(p.slug))].slice(0, 10)
      : products.slice(0, 10);

  return (
    <div className="bg-background min-h-screen">
      {/* 1. Hero Showcase with 3D Floating Category Badges & Laptop Mockup */}
      <HeroSection />

      {/* 2. Horizontal Digital Categories Pill Selector Bar */}
      <CategoryPillBar
        activeSlug={selectedCategory}
        onSelectCategory={(slug) => setSelectedCategory(slug)}
      />

      {/* 3. Featured Products Section (Matching Mockup 5-Card Grid) */}
      <section className="py-12 sm:py-16 bg-[#f8fafc] border-b border-slate-200/80">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Featured Products
            </h2>
            <Link
              href={selectedCategory ? `/shop?category=${selectedCategory}` : "/shop"}
              className="text-xs sm:text-sm font-bold text-[#7c3aed] hover:text-[#6d28d9] flex items-center gap-1.5 transition-colors group"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div
                  key={idx}
                  className="space-y-3 p-3.5 border border-slate-200 rounded-2xl bg-white"
                >
                  <Skeleton className="h-44 w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4 rounded-md" />
                  <Skeleton className="h-3 w-1/2 rounded-md" />
                  <Skeleton className="h-4 w-1/3 rounded-md" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
              ))}
            </div>
          ) : displayProducts.length > 0 ? (
            <ScrollReveal direction="up" delay={0.1}>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
                {displayProducts.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </ScrollReveal>
          ) : (
            <div className="py-16 flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-slate-300 bg-white">
              <PackageOpen className="w-12 h-12 text-slate-400 mb-3" />
              <p className="text-base font-bold text-slate-900">
                No products found in this category
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Explore our full catalog or select &apos;All Categories&apos; to view all digital assets.
              </p>
              <button
                type="button"
                onClick={() => setSelectedCategory("")}
                className="mt-4 px-4 py-2 bg-[#7c3aed] text-white rounded-lg text-xs font-bold hover:bg-[#6d28d9] transition-colors cursor-pointer"
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 4. Value Proposition 4-Card Grid */}
      <ValuePropGrid />

      {/* 5. Trust & Reassurance Footer Strip */}
      <TrustStrip />
    </div>
  );
}
