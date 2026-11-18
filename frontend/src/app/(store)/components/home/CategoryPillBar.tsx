"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutGrid,
  Watch,
  Keyboard,
  Headphones,
  HardDrive,
  Camera,
  Bot,
  Laptop,
  Code2,
  Megaphone,
  GraduationCap,
  Dumbbell,
} from "lucide-react";

export interface CategoryPillItem {
  id: string;
  name: string;
  slug: string;
  icon: any;
}

export const DIGITAL_CATEGORY_PILLS: CategoryPillItem[] = [
  { id: "all", name: "All Products", slug: "", icon: LayoutGrid },
  { id: "fitness", name: "Fitness & Gym Gear", slug: "fitness-gym-equipment", icon: Dumbbell },
  { id: "gadgets", name: "Smart Gadgets", slug: "smart-gadgets-wearables", icon: Watch },
  { id: "peripherals", name: "Desk Tech & Keyboards", slug: "desk-tech-peripherals", icon: Keyboard },
  { id: "audio", name: "Audio & Streaming", slug: "audio-streaming-gear", icon: Headphones },
  { id: "storage", name: "Fast Storage & Power", slug: "power-storage-accessories", icon: HardDrive },
  { id: "cameras", name: "Cameras & Drones", slug: "cameras-drones-creator", icon: Camera },
  { id: "ai", name: "AI Tools & Bots", slug: "ai-tools-automation", icon: Bot },
  { id: "software", name: "Software & Licenses", slug: "software-licenses", icon: Laptop },
  { id: "templates", name: "Website Templates", slug: "website-templates", icon: Code2 },
  { id: "marketing", name: "Digital Marketing", slug: "digital-marketing", icon: Megaphone },
  { id: "courses", name: "Courses & E-books", slug: "online-courses-ebooks", icon: GraduationCap },
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
  const [selected, setSelected] = useState(activeSlug);

  const handleSelect = (slug: string) => {
    setSelected(slug);
    if (onSelectCategory) {
      onSelectCategory(slug);
    } else {
      router.push(slug ? `/shop?category=${slug}` : "/shop");
    }
  };

  return (
    <section className="bg-white border-y border-slate-200/80 shadow-2xs py-4 sm:py-5 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Horizontal Scroll Container */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1">
          {DIGITAL_CATEGORY_PILLS.map((item) => {
            const Icon = item.icon;
            const isActive = selected === item.slug;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.slug)}
                type="button"
                className={`flex flex-col items-center justify-center gap-1.5 px-4 sm:px-5 py-3 rounded-2xl shrink-0 transition-all cursor-pointer border select-none group min-w-[105px] sm:min-w-[120px] ${
                  isActive
                    ? "bg-[#ede9fe] text-[#7c3aed] border-[#c4b5fd] shadow-xs font-bold ring-2 ring-[#7c3aed]/20"
                    : "bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border-slate-200/90 font-medium hover:border-slate-300"
                }`}
              >
                <div
                  className={`p-2 rounded-xl transition-colors ${
                    isActive
                      ? "bg-[#7c3aed]/15 text-[#7c3aed]"
                      : "text-slate-500 group-hover:text-slate-800"
                  }`}
                >
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-[11px] sm:text-xs text-center leading-tight line-clamp-2 max-w-[100px]">
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
