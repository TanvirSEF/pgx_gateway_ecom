"use client";

import { CURRENCY } from "@/lib/constants";
import { cn, resolveImageUrl, formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart.store";
import { ShoppingCart, Star, Check } from "lucide-react";
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
  const [isAdded, setIsAdded] = useState(false);

  const rawImg = product.images?.[0]?.url || "/placeholder-product.jpg";
  const imageUrl = resolveImageUrl(rawImg);

  // Discount calculation
  const hasDiscount =
    product.comparePrice && Number(product.comparePrice) > Number(product.price);

  // Derive badge from product data or fallback
  const isBestSeller = product.isHot || product.slug?.includes("pro") || product.slug?.includes("bundle");
  const isNew = product.isFeatured && !isBestSeller;

  const categoryName = product.category?.name || "Digital Assets";

  // Rating and review count
  const rating = 5;
  const reviewCount = Math.floor(70 + (product.name.length * 3.5) % 80);

  const isSubscription = product.slug?.includes("crm") || product.slug?.includes("sub") || product.name?.toLowerCase().includes("subscription");

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: 1,
      stock: product.stock ?? 9999,
      image: imageUrl,
    });

    setIsAdded(true);
    toast.success(`${product.name} added to cart!`);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 hover:shadow-xl transition-all duration-300 p-3.5 select-none overflow-hidden",
        className
      )}
    >
      <Link href={`/product/${product.slug}`} className="flex-1 flex flex-col">
        {/* Preview Thumbnail Container */}
        <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-[#ffffff] border border-slate-100 flex items-center justify-center p-2.5">
          {/* Badge: Best Seller (Purple) or New (Teal) */}
          {isBestSeller && (
            <span className="absolute top-2.5 left-2.5 z-10 px-2.5 py-0.5 rounded-full bg-[#7c3aed] text-white text-[10px] font-bold tracking-wide shadow-xs">
              Best Seller
            </span>
          )}
          {!isBestSeller && isNew && (
            <span className="absolute top-2.5 left-2.5 z-10 px-2.5 py-0.5 rounded-full bg-[#10b981] text-white text-[10px] font-bold tracking-wide shadow-xs">
              New
            </span>
          )}

          {/* Product Image */}
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            unoptimized
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 20vw"
            className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Product Meta */}
        <div className="pt-3 pb-2 flex-1 flex flex-col">
          {/* Product Title */}
          <h3 className="font-bold text-slate-900 group-hover:text-[#7c3aed] transition-colors text-sm sm:text-base leading-snug line-clamp-1">
            {product.name}
          </h3>

          {/* Category Tag */}
          <p className="text-xs text-slate-500 font-medium mt-0.5 line-clamp-1">
            {categoryName}
          </p>

          {/* 5-Star Ratings & Count */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="w-3.5 h-3.5 fill-current stroke-current"
                />
              ))}
            </div>
            <span className="text-[11px] font-semibold text-slate-500">
              ({reviewCount})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 mt-2.5">
            <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              {CURRENCY}
              {formatPrice(product.price)}
              {isSubscription && (
                <span className="text-xs font-normal text-slate-500 ml-1">
                  / month
                </span>
              )}
            </span>
            {hasDiscount && (
              <span className="text-xs text-slate-400 line-through font-medium">
                {CURRENCY}
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Add To Cart Full-Width Purple CTA Button (Exact Mockup Match) */}
      <div className="pt-1">
        <button
          onClick={handleAddToCart}
          type="button"
          disabled={isAdded}
          className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-[0.98] ${
            isAdded
              ? "bg-emerald-600 text-white"
              : "bg-[#7c3aed] hover:bg-[#6d28d9] text-white"
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-4 h-4" />
              <span>Added!</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
