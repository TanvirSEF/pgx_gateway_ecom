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
    limit: 60,
    category: selectedCategory || undefined,
  });

  const products = apiProducts?.data || [];

  // Pick top high-ticket and mid-range products to showcase
  const displayProducts = products.slice(0, 10);

  return (
    <div className="bg-[#fafafa] min-h-screen">
      {/* 1. Hero Showcase: FITNESS. FASHION. TECH. DIGITAL. ALL IN ONE. */}
      <HeroSection />

      {/* 2. Trust Badges & Value Proposition Strip (5-Column Clean Badges) */}
      <ValuePropGrid />

      {/* 3. Shop by Category 8-Tile Modern Grid */}
      <CategoryPillBar
        activeSlug={selectedCategory}
        onSelectCategory={(slug) => setSelectedCategory(slug)}
      />

      {/* 4. Featured Products Section (Exact Mockup Match with Purple Accent Marker) */}
      <section className="py-12 sm:py-16 bg-white border-b border-slate-200/80">
        <div className="container mx-auto px-4">
          {/* Section Header with Signature Purple Accent Bar */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2.5">
              <div className="w-1.5 h-6 sm:h-7 bg-[#9333ea] rounded-full" />
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Featured Products
              </h2>
            </div>
            <Link
              href={selectedCategory ? `/shop?category=${selectedCategory}` : "/shop"}
              className="text-xs sm:text-sm font-bold text-[#9333ea] hover:text-[#7e22ce] flex items-center gap-1.5 transition-colors group cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Products Grid (5-Column E-Commerce Layout) */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4.5">
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
                Explore our full catalog or select &apos;All Categories&apos; to view all marketplace products.
              </p>
              <button
                type="button"
                onClick={() => setSelectedCategory("")}
                className="mt-4 px-4 py-2 bg-[#9333ea] text-white rounded-lg text-xs font-bold hover:bg-[#7e22ce] transition-colors cursor-pointer"
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 5. Trust & Reassurance Footer Strip */}
      <TrustStrip />
    </div>
  );
}
