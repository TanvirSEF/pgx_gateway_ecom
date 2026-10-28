"use client";

import { useGetProducts } from "@/lib/api/product";
import { ProductCard } from "@/components/storefront/product/ProductCard";
import { SectionHeader } from "@/components/storefront/SectionHeader";
import { Skeleton } from "@/components/ui/skeleton";

interface RelatedProductsProps {
  currentProductId: string;
  categorySlug?: string;
}

export function RelatedProducts({
  currentProductId,
  categorySlug,
}: RelatedProductsProps) {
  const { data: apiProducts, isLoading } = useGetProducts({
    limit: 12,
    category: categorySlug,
  });

  const products = (apiProducts?.data || [])
    .filter((p) => p.id !== currentProductId)
    .slice(0, 4);

  if (!isLoading && products.length === 0) return null;

  return (
    <section className="mt-16 sm:mt-24 pt-10 border-t border-border/80">
      <SectionHeader
        badge="Recommendations"
        title="You Might Also Like"
        subtitle="Frequently paired with this item by athletes and fitness professionals."
        viewAllHref="/shop"
        viewAllText="Explore Shop"
      />

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, idx) => (
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
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      )}
    </section>
  );
}

