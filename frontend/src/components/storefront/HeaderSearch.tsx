"use client";

import { useShopParams } from "@/hooks/use-shop-params";
import { Search } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useDebounceValue } from "usehooks-ts";

function HeaderSearchForm() {
  const router = useRouter();
  const pathname = usePathname();
  const isShopPage = pathname === "/shop";

  const [{ search }, setParams] = useShopParams();
  const [localSearch, setLocalSearch] = useState(search);
  const [debouncedSearch] = useDebounceValue(localSearch, 500);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  useEffect(() => {
    if (isShopPage) {
      setParams({ search: debouncedSearch, page: 1 });
    }
  }, [debouncedSearch, isShopPage, setParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isShopPage) {
      router.push(`/shop?search=${encodeURIComponent(localSearch)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-3xl flex items-center">
      <div className="relative w-full flex items-center">
        {/* Left Search Icon */}
        <div className="absolute left-4 pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>

        {/* Input */}
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search for products, brands, or digital downloads..."
          className="w-full pl-11 pr-14 py-2.5 sm:py-3 rounded-full bg-white text-slate-900 placeholder:text-slate-400 border border-transparent focus:border-[#9333ea] focus:ring-2 focus:ring-[#9333ea]/30 outline-none transition-all text-xs sm:text-sm font-medium shadow-sm"
        />

        {/* Right Purple Search Button */}
        <button
          type="submit"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#9333ea] hover:bg-[#7e22ce] active:scale-95 text-white flex items-center justify-center transition-all shadow-md cursor-pointer"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}

export function HeaderSearch() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-11 bg-white/10 rounded-full animate-pulse max-w-3xl" />
      }
    >
      <HeaderSearchForm />
    </Suspense>
  );
}
