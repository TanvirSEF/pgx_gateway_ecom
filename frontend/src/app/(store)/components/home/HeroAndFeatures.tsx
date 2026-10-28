"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Bike,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Flame,
  Footprints,
  Heart,
  Package,
  ShieldCheck,
  Shirt,
  Sparkles,
  Truck,
  Zap,
} from "lucide-react";
import { useGetCategories } from "@/lib/api/category";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollReveal } from "@/components/motion/ScrollReveal";

const HERO_SLIDES = [
  {
    badge: "New 2026 Collection",
    titleStart: "Elevate Your Everyday",
    titleHighlight: "Style & Peak Fitness",
    description:
      "Precision-engineered commercial strength gear, smart cardio systems, and athletic performance wear crafted for champions.",
    primaryCta: { text: "Shop Collection", href: "/shop" },
    secondaryCta: { text: "Explore Deals", href: "/shop?category=deals" },
    mainImage: "/hero-gym-model.jpg",
    floatingCards: [
      {
        title: "Motorized Treadmill X18",
        price: "€1,899.00",
        image: "/hero-card-treadmill.jpg",
        className: "top-6 -left-6 sm:left-2 lg:-left-6",
        href: "/product/healthengine-commercial-motorized-treadmill-motion-x18",
      },
      {
        title: "Smart Exercise Bike",
        price: "€1,299.00",
        image: "/hero-card-bike.jpg",
        className: "top-4 -right-4 sm:right-4 lg:-right-4",
        href: "/product/pgx-smart-exercise-bike",
      },
      {
        title: "Adjustable Dumbbells Pro",
        price: "€599.00",
        image: "/hero-card-dumbbells.jpg",
        className: "bottom-16 -left-4 sm:left-4 lg:-left-2",
        href: "/product/pgx-adjustable-dumbbells",
      },
    ],
  },
  {
    badge: "Strength Heavyweight Series",
    titleStart: "Build Your Ultimate",
    titleHighlight: "Commercial Home Gym",
    description:
      "Heavy-duty power cages, Olympic bar systems, and high-density rubber bumper plates engineered for uncompromising durability.",
    primaryCta: { text: "View Strength Gear", href: "/shop?category=strength-equipment" },
    secondaryCta: { text: "Gym Bundles", href: "/shop?category=bundles" },
    mainImage: "/hero-card-powerrack.jpg",
    floatingCards: [
      {
        title: "Pro Power Rack Cage",
        price: "€1,599.00",
        image: "/hero-card-powerrack.jpg",
        className: "top-8 -left-4 sm:left-2",
        href: "/product/pgx-power-rack-package",
      },
      {
        title: "Bumper Plate Set 120kg",
        price: "€449.00",
        image: "/hero-card-dumbbells.jpg",
        className: "bottom-12 -right-4 sm:right-4",
        href: "/shop?category=strength-equipment",
      },
    ],
  },
];

export function HeroSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 30 }, [
    Autoplay({ delay: 6500, stopOnInteraction: false }),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-muted/20 to-background border-b border-border/80">
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="container mx-auto px-4 py-8 sm:py-12 lg:py-16">
        {/* Embla Viewport */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {HERO_SLIDES.map((slide, slideIdx) => (
              <div
                key={slideIdx}
                className="flex-[0_0_100%] min-w-0 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
              >
                {/* Left Column: Typography & CTAs */}
                <div className="lg:col-span-6 xl:col-span-6 flex flex-col justify-center text-center lg:text-left space-y-6">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{slide.badge}</span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.12] font-serif">
                      {slide.titleStart} <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-600 to-indigo-600">
                        {slide.titleHighlight}
                      </span>
                    </h1>

                    <p className="mt-4 text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
                      {slide.description}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
                    <Link
                      href={slide.primaryCta.href}
                      className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 active:scale-95 cursor-pointer"
                    >
                      <span>{slide.primaryCta.text}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <Link
                      href={slide.secondaryCta.href}
                      className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-card hover:bg-muted/70 text-foreground border border-border/80 font-bold text-xs sm:text-sm tracking-wide transition-all hover:border-primary/40 active:scale-95 cursor-pointer shadow-2xs"
                    >
                      <span>{slide.secondaryCta.text}</span>
                    </Link>
                  </div>

                  {/* Customer social proof avatar row */}
                  <div className="flex items-center justify-center lg:justify-start gap-3 pt-3">
                    <div className="flex -space-x-2.5 overflow-hidden">
                      <img
                        className="inline-block h-8 w-8 rounded-full ring-2 ring-background object-cover"
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"
                        alt="Customer avatar"
                      />
                      <img
                        className="inline-block h-8 w-8 rounded-full ring-2 ring-background object-cover"
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces"
                        alt="Customer avatar"
                      />
                      <img
                        className="inline-block h-8 w-8 rounded-full ring-2 ring-background object-cover"
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces"
                        alt="Customer avatar"
                      />
                      <img
                        className="inline-block h-8 w-8 rounded-full ring-2 ring-background object-cover"
                        src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces"
                        alt="Customer avatar"
                      />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-semibold text-foreground">
                        50,000+ Athletes &amp; Gyms
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Rated 4.9/5 from 12,000+ verified reviews
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column: Hero Visual Showcase with Floating Cards */}
                <div className="lg:col-span-6 xl:col-span-6 relative flex justify-center items-center min-h-[360px] sm:min-h-[460px] md:min-h-[520px]">
                  {/* Backdrop Glow */}
                  <div className="absolute inset-0 max-w-[460px] max-h-[460px] m-auto rounded-full bg-gradient-to-tr from-primary/20 via-purple-400/20 to-transparent blur-3xl pointer-events-none" />

                  {/* Hero Showcase Center Frame */}
                  <div className="relative z-10 w-full max-w-[340px] sm:max-w-[420px] md:max-w-[460px] aspect-square rounded-3xl overflow-hidden shadow-2xl border border-white/60 dark:border-white/10 bg-card">
                    <Image
                      src={slide.mainImage}
                      alt="PGX Athletic & Fitness Gear"
                      fill
                      priority={slideIdx === 0}
                      className="object-cover object-center filter contrast-[1.02]"
                    />
                  </div>

                  {/* Floating Product Cards (Desktop & Tablet) */}
                  {slide.floatingCards.map((card, cardIdx) => (
                    <motion.div
                      key={cardIdx}
                      animate={{ y: [0, -6, 0] }}
                      transition={{
                        duration: 3 + cardIdx * 0.8,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className={`absolute z-20 ${card.className} hidden sm:flex`}
                    >
                      <Link
                        href={card.href}
                        className="flex items-center gap-3 p-2.5 sm:p-3 bg-card/95 backdrop-blur-xl rounded-2xl border border-border/80 shadow-xl hover:shadow-2xl hover:border-primary/50 transition-all duration-300 group"
                      >
                        <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-muted/40 border border-border/60 shrink-0">
                          <Image
                            src={card.image}
                            alt={card.title}
                            fill
                            className="object-cover group-hover:scale-108 transition-transform"
                          />
                        </div>
                        <div className="pr-1 text-left">
                          <h4 className="text-[11px] sm:text-xs font-bold text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-1">
                            {card.title}
                          </h4>
                          <p className="text-[11px] font-bold text-primary mt-0.5">
                            {card.price}
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Pagination Dots & Arrow Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-border/60 mt-8">
          <div className="flex items-center gap-2">
            {HERO_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => emblaApi && emblaApi.scrollTo(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  selectedIndex === idx
                    ? "w-8 bg-primary"
                    : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={scrollPrev}
              aria-label="Previous slide"
              className="w-9 h-9 rounded-full bg-card border border-border/80 hover:border-primary/50 flex items-center justify-center text-foreground hover:text-primary transition-all shadow-2xs active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={scrollNext}
              aria-label="Next slide"
              className="w-9 h-9 rounded-full bg-card border border-border/80 hover:border-primary/50 flex items-center justify-center text-foreground hover:text-primary transition-all shadow-2xs active:scale-95 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// Icon mapper for categories
function getCategoryIcon(slug: string) {
  const s = slug.toLowerCase();
  if (s.includes("treadmill") || s.includes("running")) return Footprints;
  if (s.includes("cardio") || s.includes("health")) return Activity;
  if (s.includes("strength") || s.includes("dumbbell")) return Dumbbell;
  if (s.includes("bike") || s.includes("cycling")) return Bike;
  if (s.includes("gym") || s.includes("power")) return Zap;
  if (s.includes("apparel") || s.includes("wear") || s.includes("clothing")) return Shirt;
  if (s.includes("bag")) return Briefcase;
  if (s.includes("deal") || s.includes("hot") || s.includes("sale")) return Flame;
  return Package;
}

// Pastel category gradients matching Pinterest references (ShopMore & NovaShop)
const CATEGORY_COLORS = [
  "from-pink-500/20 to-rose-500/10 text-pink-600 dark:text-pink-400",
  "from-blue-500/20 to-cyan-500/10 text-blue-600 dark:text-blue-400",
  "from-amber-500/20 to-yellow-500/10 text-amber-600 dark:text-amber-400",
  "from-emerald-500/20 to-teal-500/10 text-emerald-600 dark:text-emerald-400",
  "from-purple-500/20 to-violet-500/10 text-purple-600 dark:text-purple-400",
  "from-indigo-500/20 to-sky-500/10 text-indigo-600 dark:text-indigo-400",
  "from-orange-500/20 to-amber-500/10 text-orange-600 dark:text-orange-400",
  "from-rose-500/20 to-purple-500/10 text-rose-600 dark:text-rose-400",
];

export function QuickCategoriesBar() {
  const { data: categories, isLoading } = useGetCategories();
  const categoriesToRender = (categories || []).filter((cat) => cat.isActive !== false);

  return (
    <section className="bg-background py-8 sm:py-10 border-b border-border/60">
      <div className="container mx-auto px-4">
        {isLoading ? (
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2">
            {Array.from({ length: 7 }).map((_, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center shrink-0 min-w-[85px] p-2 space-y-2"
              >
                <Skeleton className="w-16 h-16 rounded-full" />
                <Skeleton className="w-14 h-3 rounded" />
              </div>
            ))}
          </div>
        ) : categoriesToRender.length > 0 ? (
          <div className="flex items-center justify-start sm:justify-center gap-4 sm:gap-8 overflow-x-auto no-scrollbar py-2 snap-x snap-mandatory">
            {categoriesToRender.map((cat, idx) => {
              const Icon = getCategoryIcon(cat.slug);
              const colorClass = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];

              return (
                <Link
                  key={cat.id || cat.slug}
                  href={`/shop?category=${cat.slug}`}
                  className="group flex flex-col items-center shrink-0 min-w-[76px] sm:min-w-[90px] text-center snap-center transition-transform hover:-translate-y-1"
                >
                  <div
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br ${colorClass} border border-black/5 dark:border-white/10 flex items-center justify-center shadow-xs group-hover:scale-108 group-hover:shadow-md transition-all duration-300`}
                  >
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.8]" />
                  </div>
                  <span className="mt-2 text-xs font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}
