"use client";

import { useState } from "react";
import {
  Minus,
  Plus,
  ShoppingBag,
  ShieldCheck,
  Truck,
  Star,
  Heart,
  RefreshCw,
  Share2,
  Check,
} from "lucide-react";
import { CURRENCY } from "@/lib/constants";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface ProductInfoProps {
  product: any;
  activePrice: number;
  selectedVariant: string | null;
  setSelectedVariant: (id: string) => void;
  quantity: number;
  setQuantity: (qty: number) => void;
  handleAdd: () => void;
}

export function ProductInfo({
  product,
  activePrice,
  selectedVariant,
  setSelectedVariant,
  quantity,
  setQuantity,
  handleAdd,
}: ProductInfoProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  const activeStock = selectedVariant
    ? product.variants?.find((v: any) => v.id === selectedVariant)?.stock || 0
    : product.stock || 0;

  const isOutOfStock = activeStock <= 0;

  const hasDiscount =
    product.comparePrice && Number(product.comparePrice) > Number(activePrice);
  const discountPercent = hasDiscount
    ? Math.round(
        ((Number(product.comparePrice) - Number(activePrice)) /
          Number(product.comparePrice)) *
          100
      )
    : null;

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast[isWishlisted ? "info" : "success"](
      isWishlisted ? "Removed from wishlist" : "Saved to your wishlist!"
    );
  };

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Product link copied to clipboard!");
    }
  };

  return (
    <div className="w-full md:w-1/2 flex flex-col pt-2 md:pt-4">
      {/* Category / Collection Tag & Share */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          {product.category?.name || "Premium Athletic System"}
        </span>

        <button
          onClick={handleShare}
          aria-label="Share product"
          className="w-8 h-8 rounded-full border border-border/80 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Title */}
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground font-serif leading-[1.2] mb-3">
        {product.name}
      </h1>

      {/* Star Ratings & Social Proof */}
      <div className="flex items-center gap-3 mb-5 text-xs text-muted-foreground">
        <div className="flex items-center gap-1 text-amber-500">
          <Star className="w-4 h-4 fill-amber-400 stroke-none" />
          <span className="font-bold text-foreground text-sm">4.9</span>
        </div>
        <span className="text-border">|</span>
        <span className="hover:underline cursor-pointer">128 Customer Reviews</span>
        <span className="text-border">|</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
          <Check className="w-3.5 h-3.5 stroke-[2.5]" /> In Stock &amp; Ready to Ship
        </span>
      </div>

      {/* Pricing Header */}
      <div className="p-4 rounded-2xl bg-muted/20 border border-border/60 mb-6 flex flex-wrap items-baseline gap-3">
        <span className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          {CURRENCY}
          {Number(activePrice).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>

        {hasDiscount && (
          <span className="text-base text-muted-foreground line-through font-medium">
            {CURRENCY}
            {Number(product.comparePrice).toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </span>
        )}

        {discountPercent && (
          <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wide">
            Save {discountPercent}%
          </span>
        )}

        <p className="w-full text-[11px] text-muted-foreground mt-1">
          Price includes standard courier freight &amp; 2-year warranty.
        </p>
      </div>

      {/* Short Description */}
      {product.shortDesc && (
        <div
          className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-6 font-normal prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: product.shortDesc }}
        />
      )}

      {/* Variant Selection */}
      {product.variants && product.variants.length > 0 && (
        <div className="mb-6 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold uppercase tracking-wider text-foreground">
              Select Configuration / Option
            </span>
            <span className="text-muted-foreground">
              {product.variants.length} variations available
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {product.variants.map((v: any) => {
              const isSelected = selectedVariant === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariant(v.id)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-semibold tracking-wide transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-card border-border/80 hover:border-primary/50 text-foreground"
                  }`}
                >
                  {v.name}
                </button>
              );
            })}
          </div>

          {isOutOfStock && selectedVariant && (
            <p className="text-rose-500 text-xs mt-1.5 font-medium">
              This variation is currently out of stock.
            </p>
          )}
        </div>
      )}

      {/* Quantity & Add to Cart Controls */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-8">
        {/* Quantity Stepper */}
        <div className="flex items-center border border-border/80 rounded-2xl overflow-hidden h-12 bg-card shadow-2xs">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-11 h-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center font-bold text-foreground text-sm">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-11 h-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Primary Add to Cart Button */}
        <button
          onClick={handleAdd}
          disabled={
            (product.variants &&
              product.variants.length > 0 &&
              !selectedVariant) ||
            isOutOfStock
          }
          className="flex-1 h-12 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-98 cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
        </button>

        {/* Wishlist Button */}
        <button
          onClick={toggleWishlist}
          aria-label="Save to Wishlist"
          className="w-12 h-12 rounded-2xl border border-border/80 bg-card hover:bg-muted/70 flex items-center justify-center text-muted-foreground hover:text-rose-500 transition-colors shadow-2xs active:scale-95 cursor-pointer"
        >
          <Heart
            className={`w-5 h-5 ${
              isWishlisted ? "fill-rose-500 text-rose-500" : ""
            }`}
          />
        </button>
      </div>

      {/* Trust & Guarantees Strip */}
      <div className="grid grid-cols-2 gap-3 pt-6 border-t border-border/80">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/20 border border-border/50">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <h5 className="font-bold text-xs text-foreground">Fast Delivery</h5>
            <p className="text-[10px] text-muted-foreground">Tracked 3-5 days</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/20 border border-border/50">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h5 className="font-bold text-xs text-foreground">2-Year Warranty</h5>
            <p className="text-[10px] text-muted-foreground">Commercial grade</p>
          </div>
        </div>
      </div>
    </div>
  );
}
