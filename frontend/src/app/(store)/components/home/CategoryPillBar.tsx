"use client";

import { ArrowRight, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export interface CategoryTile {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
}

export const MARKETPLACE_CATEGORIES: CategoryTile[] = [
  {
    id: "fitness",
    name: "Fitness & Gym Equipment",
    slug: "fitness-gym-equipment",
    imageUrl: "https://cdn.shopify.com/s/files/1/0939/5657/1425/files/Feierdun_Women_Adjustable_Dumbbell_Set_of_2.png?v=1762148947",
  },
  {
    id: "apparel",
    name: "Apparel & Fashion",
    slug: "",
    imageUrl: "https://cdn.shopify.com/s/files/1/2350/9323/files/55_7de10f34-43da-47f1-8e75-b28d753b033f.png?v=1789718435",
  },
  {
    id: "tech",
    name: "Electronics & Tech",
    slug: "desk-tech-peripherals",
    imageUrl: "https://ts1.mm.bing.net/th?id=OIP.MjTzgonW4pizlmaU2v_cVQHaHa&w=800&h=800&c=7&rs=1&p=0",
  },
  {
    id: "digital",
    name: "Digital Products",
    slug: "software-licenses",
    imageUrl: "https://ts1.mm.bing.net/th?id=OIP.gdKxuXffzlVwHvusrmRLygHaEK&w=800&h=800&c=7&rs=1&p=0",
  },
  {
    id: "home",
    name: "Home & Living",
    slug: "",
    imageUrl: "https://ts3.mm.bing.net/th?id=OIP.G8_58WCR__KqUI4aCxXXNgHaE8&w=800&h=800&c=7&rs=1&p=0",
  },
  {
    id: "wellness",
    name: "Health & Wellness",
    slug: "",
    imageUrl: "https://cdn.shopify.com/s/files/1/0939/5657/1425/files/FED_Fitness_KW1_Hot_and_Cold_Knee_Wrap_Main.webp?v=1793944374",
  },
  {
    id: "gaming",
    name: "Gaming & Entertainment",
    slug: "audio-streaming-gear",
    imageUrl: "https://ts3.mm.bing.net/th?id=OIP.b_kSbTnGLHW-MCKhz9C8YAHaHa&w=800&h=800&c=7&rs=1&p=0",
  },
  {
    id: "gadgets",
    name: "Smart Gadgets",
    slug: "smart-gadgets-wearables",
    imageUrl: "https://ts3.mm.bing.net/th?id=OIP.l6KgNaqEn5RKI7j3ZVYf0AHaHa&w=800&h=800&c=7&rs=1&p=0",
  },
];

interface CategoryPillBarProps {
  activeSlug?: string;
  onSelectCategory?: (slug: string) => void;
}

export function CategoryPillBar({
  activeSlug = "",
  onSelectCategory,
}: CategoryPillBarProps) {
  const router = useRouter();

  const handleCategoryClick = (slug: string) => {
    if (onSelectCategory) {
      onSelectCategory(slug);
    } else {
      router.push(slug ? `/shop?category=${slug}` : "/shop");
    }
  };

  return (
    <section className="bg-white py-10 sm:py-12 border-b border-slate-200/80 select-none">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-7">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Shop by Category
          </h2>
          <Link
            href="/shop"
            className="text-xs sm:text-sm font-bold text-[#9333ea] hover:text-[#7e22ce] flex items-center gap-1.5 transition-colors group cursor-pointer"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Categories Grid (Exact 8-Card Modern Tile Grid) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {MARKETPLACE_CATEGORIES.map((item) => {
            const isActive = activeSlug === item.slug && item.slug !== "";

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleCategoryClick(item.slug)}
                className={`flex flex-col justify-between bg-[#f8fafc] border hover:border-[#9333ea]/50 rounded-2xl p-3 sm:p-3.5 transition-all duration-300 text-left group hover:shadow-lg cursor-pointer ${
                  isActive
                    ? "border-[#9333ea] ring-2 ring-[#9333ea]/20 bg-purple-50/40"
                    : "border-slate-200/90"
                }`}
              >
                {/* Product Image Thumbnail */}
                <div className="relative w-full aspect-square rounded-xl bg-white border border-slate-100 flex items-center justify-center p-2 mb-3 overflow-hidden shadow-2xs">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    unoptimized
                    className="object-contain p-1.5 group-hover:scale-108 transition-transform duration-300"
                  />
                </div>

                {/* Footer: Category Name & Small Arrow */}
                <div className="flex items-center justify-between gap-1 w-full mt-auto">
                  <h3 className="font-bold text-slate-900 group-hover:text-[#9333ea] transition-colors text-xs leading-snug line-clamp-2">
                    {item.name}
                  </h3>
                  <div className="w-5 h-5 rounded-full bg-slate-200/70 group-hover:bg-[#9333ea] group-hover:text-white text-slate-600 flex items-center justify-center shrink-0 transition-colors">
                    <ChevronRight className="w-3 h-3 stroke-[2.5]" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
