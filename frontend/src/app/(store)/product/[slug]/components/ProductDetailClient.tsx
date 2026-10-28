"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cart.store";
import { resolveImageUrl } from "@/lib/utils";
import { toast } from "sonner";
import type { Product } from "@/types";
import { ProductGallery } from "./ProductGallery";
import { ProductInfo } from "./ProductInfo";
import { ProductTabs } from "./ProductTabs";
import { RelatedProducts } from "./RelatedProducts";
import { MobileStickyBar } from "./MobileStickyBar";

export function ProductDetailClient({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(
    product.variants?.length ? product.variants[0].id : null
  );

  const activePrice = selectedVariant
    ? product.variants?.find((v) => v.id === selectedVariant)?.price ||
      product.price
    : product.price;

  const activeStock = selectedVariant
    ? product.variants?.find((v: any) => v.id === selectedVariant)?.stock || 0
    : product.stock || 0;

  const isOutOfStock = activeStock <= 0;

  const handleAdd = () => {
    if (product.variants && product.variants.length > 0 && !selectedVariant) {
      toast.error("Please select a variant option first.");
      return;
    }

    const imageUrl = resolveImageUrl(product.images?.[0]?.url);

    const selectedVariantData = selectedVariant
      ? product.variants?.find((v: any) => v.id === selectedVariant)
      : null;

    addItem({
      productId: product.id,
      name: product.name,
      price: activePrice,
      quantity,
      stock: selectedVariantData ? selectedVariantData.stock : product.stock,
      variantId: selectedVariant || undefined,
      image: imageUrl as string,
    });
    toast.success(`${product.name} added to your cart!`);
  };

  return (
    <div className="flex flex-col">
      {/* Top Section: High-Definition Gallery & Product Info */}
      <div className="flex flex-col md:flex-row gap-8 lg:gap-14 items-start">
        <ProductGallery product={product} />

        <ProductInfo
          product={product}
          activePrice={activePrice}
          selectedVariant={selectedVariant}
          setSelectedVariant={setSelectedVariant}
          quantity={quantity}
          setQuantity={setQuantity}
          handleAdd={handleAdd}
        />
      </div>

      {/* Tabbed Specifications, Overview, Warranty & Reviews */}
      <ProductTabs
        description={product.description}
        sku={product.sku}
        weight={product.weight}
        categoryName={product.category?.name}
      />

      {/* Recommendations / You Might Also Like */}
      <RelatedProducts
        currentProductId={product.id}
        categorySlug={product.category?.slug}
      />

      {/* Mobile Sticky Action Bar */}
      <MobileStickyBar
        productName={product.name}
        price={activePrice}
        isOutOfStock={isOutOfStock}
        onAddToCart={handleAdd}
      />
    </div>
  );
}
