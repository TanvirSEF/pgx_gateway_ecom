"use client";

import { use } from "react";
import Link from "next/link";
import { ChevronRight, Loader2, PackageX, Sparkles, Home } from "lucide-react";
import { ProductDetailClient } from "./components/ProductDetailClient";
import { useGetProduct } from "@/lib/api/product";

interface Props {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: Props) {
  const { slug } = use(params);
  const { data: product, isLoading, error } = useGetProduct(slug);

  if (isLoading) {
    return (
      <div className="bg-background min-h-[70vh] flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <p className="text-foreground font-semibold text-sm tracking-wide">
          Loading Product Details...
        </p>
        <p className="text-muted-foreground text-xs mt-1">
          Preparing high-definition gallery and specifications
        </p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-background min-h-[60vh] flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-16 h-16 rounded-3xl bg-muted/50 border border-border flex items-center justify-center mb-4 text-muted-foreground">
          <PackageX className="w-8 h-8 stroke-[1.5]" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif mb-2">
          Product Not Available
        </h1>
        <p className="text-muted-foreground text-sm max-w-md mb-6 leading-relaxed">
          The digital product or asset you are looking for may have moved or is currently unavailable.
        </p>
        <Link
          href="/shop"
          className="h-11 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-all shadow-sm active:scale-95"
        >
          Return to Shop Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Editorial Breadcrumb */}
      <div className="border-b border-border/60 bg-muted/15">
        <div className="container mx-auto px-4 py-3 flex items-center text-xs text-muted-foreground overflow-x-auto no-scrollbar">
          <Link
            href="/"
            className="hover:text-primary transition-colors flex items-center gap-1 shrink-0"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <ChevronRight className="h-3.5 w-3.5 mx-2 text-muted-foreground/40 shrink-0" />
          <Link
            href="/shop"
            className="hover:text-primary transition-colors shrink-0"
          >
            Shop
          </Link>
          {product.category && (
            <>
              <ChevronRight className="h-3.5 w-3.5 mx-2 text-muted-foreground/40 shrink-0" />
              <Link
                href={`/shop?category=${product.category.slug}`}
                className="hover:text-primary transition-colors shrink-0"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="h-3.5 w-3.5 mx-2 text-muted-foreground/40 shrink-0" />
          <span className="text-foreground font-semibold truncate max-w-[200px] sm:max-w-md">
            {product.name}
          </span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 sm:py-12">
        <ProductDetailClient product={product} />
      </div>
    </div>
  );
}
