"use client";

import { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/storefront/product/ProductCard";
import { SectionHeader } from "@/components/storefront/SectionHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollReveal } from "@/components/motion/ScrollReveal";

interface ProductCarouselProps {
  badge?: string;
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  products: any[];
  isLoading?: boolean;
}

export function ProductCarousel({
  badge,
  title,
  subtitle,
  viewAllHref,
  products,
  isLoading,
}: ProductCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <section className="py-10 sm:py-14 bg-muted/10 border-b border-border/60">
      <div className="container mx-auto px-4">
        {/* Section Header with arrow controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            {badge && (
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-wider mb-2">
                <span>{badge}</span>
              </div>
            )}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground font-serif">
              {title}
            </h2>
            {subtitle && (
              <p className="text-muted-foreground text-sm sm:text-base mt-1.5 max-w-xl font-normal leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={scrollPrev}
              aria-label="Previous products"
              className="w-10 h-10 rounded-full bg-card border border-border/80 hover:border-primary/50 flex items-center justify-center text-foreground hover:text-primary transition-all shadow-2xs active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={scrollNext}
              aria-label="Next products"
              className="w-10 h-10 rounded-full bg-card border border-border/80 hover:border-primary/50 flex items-center justify-center text-foreground hover:text-primary transition-all shadow-2xs active:scale-95 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Carousel Content */}
        {isLoading ? (
          <div className="flex gap-4 sm:gap-6 overflow-hidden">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="flex-[0_0_240px] sm:flex-[0_0_280px] space-y-3 p-3.5 border border-border/80 rounded-3xl bg-card shrink-0"
              >
                <Skeleton className="h-44 w-full rounded-2xl" />
                <Skeleton className="h-4 w-3/4 rounded-md" />
                <Skeleton className="h-4 w-1/2 rounded-md" />
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-hidden -mx-4 px-4" ref={emblaRef}>
            <div className="flex gap-4 sm:gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex-[0_0_220px] sm:flex-[0_0_270px] md:flex-[0_0_290px] min-w-0 shrink-0"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

