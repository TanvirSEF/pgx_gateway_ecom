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
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl flex items-center">
      <div className="relative w-full">
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search for software, templates, courses and more..."
          className="w-full pl-4 pr-12 py-2.5 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/25 outline-none transition-all text-xs sm:text-sm font-normal shadow-inner"
        />
        <button
          type="submit"
          className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-md bg-[#7c3aed] hover:bg-[#6d28d9] text-white flex items-center justify-center transition-colors shadow-sm cursor-pointer"
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
        <div className="relative w-full max-w-2xl flex items-center">
          <div className="w-full h-10 rounded-lg bg-white/10 animate-pulse" />
        </div>
      }
    >
      <HeaderSearchForm />
    </Suspense>
  );
}
