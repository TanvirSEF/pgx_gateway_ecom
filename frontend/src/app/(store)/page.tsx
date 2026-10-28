"use client";

import { ProductCard } from "@/components/storefront/product/ProductCard";
import { SectionHeader } from "@/components/storefront/SectionHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetProducts } from "@/lib/api/product";
import { PackageOpen, Sparkles } from "lucide-react";
import {
  HeroSection,
  QuickCategoriesBar,
} from "./components/home/HeroAndFeatures";
import { FlashSaleSection } from "./components/home/FlashSaleSection";
import { ProductCarousel } from "./components/home/ProductCarousel";
import { ValuePropositionStrip } from "./components/home/PremiumBundles";
import { ScrollReveal } from "@/components/motion/ScrollReveal";

export default function HomePage() {
  const { data: apiProducts, isLoading } = useGetProducts({ limit: 50 });

  // Reverse products so the newest items come first
  const reversedProducts = apiProducts?.data ? [...apiProducts.data] : [];

  const dealsToRender = reversedProducts.slice(0, 8);
  const recommendedToRender = reversedProducts.slice(8, 20).length > 0
    ? reversedProducts.slice(8, 20)
    : reversedProducts.slice(0, 8);

  return (
    <div className="bg-background min-h-screen">
      {/* 1. Hero Showcase Slider */}
      <HeroSection />

      {/* 2. Quick Categories Circle Bar */}
      <QuickCategoriesBar />

      {/* 3. Flash Sale & Promo Highlights Strip */}
      <FlashSaleSection />

      {/* 4. Best Deals for You Section */}
      <section className="py-10 sm:py-14 bg-background border-b border-border/60">
        <div className="container mx-auto px-4">
          <SectionHeader
            badge="Top Trending"
            title="Best Deals for You"
            subtitle="Curated commercial machines and athletic gear handpicked for maximum performance."
            viewAllHref="/shop?filter=featured"
            viewAllText="View All Deals"
          />

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div
                  key={idx}
                  className="space-y-3 p-3.5 border border-border/80 rounded-3xl bg-card"
                >
                  <Skeleton className="h-44 w-full rounded-2xl" />
                  <Skeleton className="h-4 w-3/4 rounded-md" />
                  <Skeleton className="h-4 w-1/2 rounded-md" />
                </div>
              ))}
            </div>
          ) : dealsToRender.length > 0 ? (
            <ScrollReveal direction="up" delay={0.1}>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
                {dealsToRender.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </ScrollReveal>
          ) : (
            <div className="py-16 flex flex-col items-center justify-center text-center rounded-3xl border border-dashed border-border bg-muted/20">
              <PackageOpen className="w-12 h-12 text-muted-foreground/60 mb-3" />
              <p className="text-base font-bold text-foreground">
                No products currently listed
              </p>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Check back shortly as new fitness gear and athletic apparel are added daily.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 5. Recommended For You (Embla Smooth Drag & Touch Carousel) */}
      <ProductCarousel
        badge="Popular Picks"
        title="Recommended for You"
        subtitle="Explore athlete-approved selections designed to support your daily fitness goals."
        viewAllHref="/shop"
        products={recommendedToRender}
        isLoading={isLoading}
      />

      {/* 6. Value Proposition Strip */}
      <ValuePropositionStrip />
    </div>
  );
}
