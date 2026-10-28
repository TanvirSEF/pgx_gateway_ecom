"use client";

import { CURRENCY } from "@/lib/constants";
import { cn, resolveImageUrl } from "@/lib/utils";
import { useCartStore } from "@/store/cart.store";
import { Heart, Plus, ShoppingBag, Star, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: any;
  viewMode?: "grid" | "list";
  className?: string;
}

export function ProductCard({
  product,
  viewMode = "grid",
  className,
}: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [isAdding, setIsAdding] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const isList = viewMode === "list";

  const rawImg = product.images?.[0]?.url || "/placeholder-product.jpg";
  const imageUrl = resolveImageUrl(rawImg);

  // Discount calculation
  const hasDiscount =
    product.comparePrice && Number(product.comparePrice) > Number(product.price);
  const discountPercent = hasDiscount
    ? Math.round(
        ((Number(product.comparePrice) - Number(product.price)) /
          Number(product.comparePrice)) *
          100
      )
    : null;

  // Clean description without HTML tags
  const cleanDescription = (product.shortDesc || product.weight || "")
    .replace(/<[^>]*>?/gm, "")
    .trim();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAdding(true);
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      stock: product.stock,
      image: imageUrl,
    });
    toast.success(`${product.name} added to cart!`);
    setTimeout(() => setIsAdding(false), 900);
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    toast[isWishlisted ? "info" : "success"](
      isWishlisted ? "Removed from wishlist" : "Saved to your wishlist!"
    );
  };

  if (isList) {
    return (
      <div
        className={cn(
          "group relative bg-card rounded-2xl border border-border/80 overflow-hidden hover:shadow-lg hover:border-primary/40 transition-all duration-300 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-4",
          className
        )}
      >
        {/* Product Image */}
        <div className="relative w-full sm:w-44 h-44 shrink-0 rounded-xl overflow-hidden bg-muted/30 flex items-center justify-center p-3">
          {discountPercent ? (
            <span className="absolute top-2.5 left-2.5 text-[10px] font-black px-2 py-0.5 rounded-full bg-red-500 text-white z-10 shadow-xs">
              -{discountPercent}%
            </span>
          ) : product.isFeatured ? (
            <span className="absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground z-10 shadow-xs">
              Featured
            </span>
          ) : null}

          <Link
            href={`/product/${product.slug}`}
            className="block w-full h-full relative"
          >
            <Image
              fill
              unoptimized
              src={imageUrl}
              alt={product.name}
              className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
            />
          </Link>
        </div>

        {/* Info */}
        <div className="flex flex-col flex-1 justify-between gap-3 w-full py-1">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-amber-500 mb-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 stroke-none" />
              <span className="font-semibold text-foreground text-[11px]">
                4.9
              </span>
              <span className="text-muted-foreground text-[11px]">(98)</span>
            </div>

            <h3 className="font-bold text-base sm:text-lg text-foreground hover:text-primary transition-colors line-clamp-1 mb-1">
              <Link href={`/product/${product.slug}`}>{product.name}</Link>
            </h3>

            {cleanDescription && (
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {cleanDescription}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/40">
            <div className="flex items-baseline gap-2">
              <span className="font-extrabold text-foreground text-lg sm:text-xl tracking-tight">
                {CURRENCY}
                {Number(product.price).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              {hasDiscount && (
                <span className="text-xs text-muted-foreground line-through font-medium">
                  {CURRENCY}
                  {Number(product.comparePrice).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              aria-label="Add to cart"
              className={cn(
                "h-10 px-4 rounded-xl flex items-center gap-2 border border-primary/20 bg-primary/10 hover:bg-primary hover:text-primary-foreground text-primary font-semibold text-xs tracking-wide transition-all active:scale-95 cursor-pointer",
                isAdding && "bg-primary text-primary-foreground"
              )}
            >
              {isAdding ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Quick Add</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid view matching Pinterest references (NovaShop & ShopMore)
  return (
    <div
      className={cn(
        "group relative bg-card rounded-2xl sm:rounded-3xl border border-border/70 p-3 sm:p-3.5 flex flex-col justify-between hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300",
        className
      )}
    >
      <div>
        {/* Product Media Box */}
        <div className="relative w-full aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-muted/20 flex items-center justify-center p-3 mb-3">
          {/* Discount / Status Badges */}
          <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
            {discountPercent ? (
              <span className="text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded-full bg-rose-500 text-white shadow-xs tracking-wide">
                -{discountPercent}%
              </span>
            ) : product.isFeatured ? (
              <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground shadow-xs">
                Featured
              </span>
            ) : product.isHot ? (
              <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-xs">
                Hot
              </span>
            ) : null}
          </div>

          {/* Wishlist Heart Button */}
          <button
            onClick={toggleWishlist}
            aria-label="Add to wishlist"
            className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/80 dark:bg-black/40 backdrop-blur-md flex items-center justify-center text-muted-foreground hover:text-rose-500 hover:bg-white dark:hover:bg-black transition-all cursor-pointer shadow-xs active:scale-90"
          >
            <Heart
              className={cn(
                "w-4 h-4 transition-colors",
                isWishlisted && "fill-rose-500 text-rose-500"
              )}
            />
          </button>

          {/* Product Image Link */}
          <Link
            href={`/product/${product.slug}`}
            className="block w-full h-full relative"
          >
            <Image
              fill
              unoptimized
              src={imageUrl}
              alt={product.name}
              className="object-contain p-2 group-hover:scale-108 transition-transform duration-500 ease-out"
            />
          </Link>
        </div>

        {/* Rating Row */}
        <div className="flex items-center gap-1 text-[11px] text-amber-500 mb-1 px-1">
          <Star className="w-3 h-3 fill-amber-400 stroke-none" />
          <span className="font-bold text-foreground text-[11px]">4.9</span>
          <span className="text-muted-foreground text-[10px]">(124)</span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-xs sm:text-sm text-foreground leading-snug line-clamp-1 group-hover:text-primary transition-colors px-1 mb-1">
          <Link href={`/product/${product.slug}`}>{product.name}</Link>
        </h3>

        {/* Category or short info */}
        <p className="text-[11px] text-muted-foreground line-clamp-1 px-1 mb-2">
          {product.category?.name || "Premium Athletic Gear"}
        </p>
      </div>

      {/* Price & Add to Cart row */}
      <div className="pt-2 px-1 border-t border-border/40 flex items-center justify-between gap-2 mt-auto">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1.5">
            <span className="font-extrabold text-foreground text-sm sm:text-base tracking-tight">
              {CURRENCY}
              {Number(product.price).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          {hasDiscount && (
            <span className="text-[10px] text-muted-foreground line-through font-medium leading-none">
              {CURRENCY}
              {Number(product.comparePrice).toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </span>
          )}
        </div>

        {/* Action Button: Quick Add */}
        <button
          onClick={handleAddToCart}
          aria-label="Add to cart"
          className={cn(
            "w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all duration-200 active:scale-90 cursor-pointer shrink-0",
            isAdding && "bg-emerald-500 text-white"
          )}
        >
          {isAdding ? (
            <Check className="w-4 h-4 stroke-[3]" />
          ) : (
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
          )}
        </button>
      </div>
    </div>
  );
}
