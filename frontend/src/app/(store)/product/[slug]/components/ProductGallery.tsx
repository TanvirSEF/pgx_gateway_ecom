"use client";

import Image from "next/image";
import { useMemo, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { resolveImageUrl } from "@/lib/utils";
import type { Product } from "@/types";
import { ZoomIn } from "lucide-react";

interface ProductGalleryProps {
  product: Product;
}

export function ProductGallery({ product }: ProductGalleryProps) {
  const images = useMemo(() => {
    return (product.images || []).map((image) => ({
      id: image.id,
      alt: image.alt || product.name,
      url: resolveImageUrl(image.url),
    }));
  }, [product.images, product.name]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isZooming, setIsZooming] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const activeImage = images[activeIndex];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const { left, top, width, height } =
      imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  return (
    <div className="w-full md:w-1/2 flex flex-col-reverse lg:flex-row gap-4">
      {/* Thumbnails (Vertical on lg+, Horizontal on mobile) */}
      {images.length > 1 && (
        <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto no-scrollbar py-1 lg:py-0 shrink-0">
          {images.map((image, index) => {
            const isActive = activeIndex === index;
            return (
              <button
                key={image.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-card border transition-all duration-200 cursor-pointer p-1.5 shrink-0 ${
                  isActive
                    ? "border-primary ring-2 ring-primary/30 shadow-md"
                    : "border-border/80 hover:border-primary/50 opacity-75 hover:opacity-100"
                }`}
                aria-label={`View photo ${index + 1}`}
              >
                <div className="relative w-full h-full">
                  <Image
                    fill
                    src={image.url}
                    alt={image.alt}
                    className="object-contain"
                    sizes="80px"
                    unoptimized
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Feature Display with Magnifier Zoom */}
      <div
        ref={imageContainerRef}
        onMouseEnter={() => setIsZooming(true)}
        onMouseLeave={() => setIsZooming(false)}
        onMouseMove={handleMouseMove}
        className="relative flex-1 aspect-square rounded-3xl bg-white border border-slate-200/80 overflow-hidden flex items-center justify-center p-6 shadow-sm group select-none cursor-crosshair"
      >
        {/* Subtle Zoom Helper Pill */}
        <div className="absolute top-3 right-3 z-10 hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/80 backdrop-blur-md border border-border/60 text-[11px] font-medium text-muted-foreground shadow-2xs pointer-events-none group-hover:text-primary transition-colors">
          <ZoomIn className="w-3.5 h-3.5" />
          <span>Hover to Zoom</span>
        </div>

        <AnimatePresence mode="wait">
          {activeImage ? (
            <motion.div
              key={activeImage.id || activeIndex}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="relative w-full h-full flex items-center justify-center"
            >
              <div
                className="relative w-full h-full transition-transform duration-150 ease-out"
                style={{
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  transform: isZooming ? "scale(1.85)" : "scale(1)",
                }}
              >
                <Image
                  fill
                  src={activeImage.url}
                  alt={activeImage.alt}
                  className="object-contain p-2"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  priority
                  unoptimized
                />
              </div>
            </motion.div>
          ) : (
            <div className="text-muted-foreground text-sm font-medium">
              No product images available
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
