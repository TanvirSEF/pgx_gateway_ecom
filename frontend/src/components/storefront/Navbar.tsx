"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/providers/AuthProvider";
import { useCartStore } from "@/store/cart.store";
import {
  ChevronDown,
  Heart,
  LogOut,
  Menu,
  ShoppingCart,
  Tag,
  User,
  X,
  Dumbbell,
  Shirt,
  Laptop,
  Sparkles,
  Home,
  HeartPulse,
  Layers,
  Code2,
  Bot,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { HeaderSearch } from "./HeaderSearch";
import { PgxDigitalLogo } from "./PgxDigitalLogo";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const cartItems = useCartStore((s) => s.items);
  const openCart = useCartStore((s) => s.openCart);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const router = useRouter();
  const pathname = usePathname();

  const digitalCategories = [
    { title: "Software & Licenses", href: "/shop?category=software-licenses", icon: Laptop },
    { title: "AI Tools & Automation", href: "/shop?category=ai-tools-automation", icon: Bot },
    { title: "Website Templates", href: "/shop?category=website-templates", icon: Code2 },
    { title: "Courses & E-books", href: "/shop?category=online-courses-ebooks", icon: GraduationCap },
    { title: "Creative Assets", href: "/shop?category=digital-marketing", icon: Layers },
  ];

  const allCategories = [
    { title: "Fitness Equipment", href: "/shop?category=fitness-gym-equipment", icon: Dumbbell },
    { title: "Apparel & Fashion", href: "/shop", icon: Shirt },
    { title: "Electronics & Tech", href: "/shop?category=desk-tech-peripherals", icon: Laptop },
    { title: "Digital Products", href: "/shop?category=software-licenses", icon: Layers },
    { title: "Health & Wellness", href: "/shop", icon: HeartPulse },
    { title: "Home & Living", href: "/shop", icon: Home },
  ];

  return (
    <header className="sticky top-0 z-40 select-none transition-colors shadow-sm">
      {/* 1. Main Header: Pitch Obsidian Theme */}
      <div className="bg-[#0b0918] text-white border-b border-white/10">
        <div className="container mx-auto px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4 lg:gap-8">
          {/* Brand Logo */}
          <div className="shrink-0">
            <PgxDigitalLogo variant="dark" />
          </div>

          {/* Center Search Bar */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-auto">
            <HeaderSearch />
          </div>

          {/* Right Action Items: Account, Wishlist, Cart */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            {/* User Account / Sign In */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="p-1.5 rounded-lg text-slate-200 hover:text-white transition-colors outline-none cursor-pointer flex items-center gap-2 text-xs font-semibold">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-[#c084fc]" />
                  </div>
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-[10px] text-slate-400 font-normal">Account</span>
                    <span className="truncate max-w-[100px] leading-tight">{user?.name}</span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-[#110b38] border border-white/15 text-white min-w-[200px] shadow-2xl rounded-xl p-1.5 z-50 animate-in fade-in-80"
                >
                  <div className="px-3 py-2 text-xs border-b border-white/10">
                    <p className="font-bold text-white truncate">{user?.name}</p>
                    <p className="text-slate-400 text-[11px] truncate">{user?.email}</p>
                  </div>
                  <DropdownMenuItem
                    onClick={() => router.push("/my-account")}
                    className="cursor-pointer text-xs hover:bg-white/10 rounded-lg py-2 mt-1"
                  >
                    My Account
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/my-account/orders")}
                    className="cursor-pointer text-xs hover:bg-white/10 rounded-lg py-2"
                  >
                    My Orders &amp; Downloads
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem
                      onClick={() => router.push("/admin")}
                      className="cursor-pointer text-xs text-[#c084fc] font-semibold hover:bg-white/10 rounded-lg py-2"
                    >
                      Admin Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-white/10 my-1" />
                  <DropdownMenuItem
                    onClick={logout}
                    className="cursor-pointer text-xs text-red-400 hover:bg-red-500/10 rounded-lg py-2 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 text-xs font-semibold text-slate-200 hover:text-white transition-colors"
              >
                <User className="w-4 h-4 text-slate-300" />
                <span className="hidden sm:inline">Sign In / Register</span>
              </Link>
            )}

            {/* Wishlist Link */}
            <Link
              href="/wishlist"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-200 hover:text-white transition-colors"
            >
              <Heart className="w-4 h-4 text-slate-300 hover:text-red-400 transition-colors" />
              <span>Wishlist</span>
            </Link>

            {/* Cart Pill with Purple Badge */}
            <button
              onClick={openCart}
              className="flex items-center gap-2.5 text-xs font-bold text-white hover:opacity-90 active:scale-95 transition-all cursor-pointer"
              aria-label="Open Cart"
            >
              <div className="relative flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-white" />
                <span className="absolute -top-2 -right-2 bg-[#9333ea] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {totalItems}
                </span>
              </div>
              <span className="hidden xs:inline">Cart</span>
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 md:hidden"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Input Row */}
        <div className="md:hidden px-4 pb-3">
          <HeaderSearch />
        </div>
      </div>

      {/* 2. Sub-Navigation Category Bar: Crisp White Background (Exact Mockup Match) */}
      <div className="hidden lg:block bg-white border-b border-slate-200/90 text-slate-800 shadow-xs">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-7">
            {/* "Shop by Category" Purple Pill Button */}
            <DropdownMenu>
              <DropdownMenuTrigger className="bg-[#9333ea] hover:bg-[#7e22ce] text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer outline-none shadow-sm my-1.5">
                <Menu className="w-4 h-4" />
                <span>Shop by Category</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-80" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white border border-slate-200 min-w-[240px] shadow-xl rounded-xl p-2 z-50 animate-in fade-in-80">
                {allCategories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <DropdownMenuItem
                      key={cat.title}
                      onClick={() => router.push(cat.href)}
                      className="cursor-pointer text-xs font-semibold text-slate-700 hover:text-[#9333ea] hover:bg-purple-50 rounded-lg py-2.5 px-3 flex items-center gap-3 transition-colors"
                    >
                      <Icon className="w-4 h-4 text-[#9333ea]" />
                      <span>{cat.title}</span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Horizontal Category Nav Links */}
            <nav className="flex items-center gap-6 text-xs sm:text-sm font-semibold text-slate-700">
              <Link
                href="/shop?category=fitness-gym-equipment"
                className="hover:text-[#9333ea] transition-colors py-3"
              >
                Fitness &amp; Gym
              </Link>
              <Link
                href="/shop"
                className="hover:text-[#9333ea] transition-colors py-3"
              >
                Apparel &amp; Fashion
              </Link>
              <Link
                href="/shop?category=desk-tech-peripherals"
                className="hover:text-[#9333ea] transition-colors py-3"
              >
                Electronics &amp; Tech
              </Link>

              {/* Digital Products Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="hover:text-[#9333ea] transition-colors flex items-center gap-1 py-3 cursor-pointer outline-none">
                  <span>Digital Products</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white border border-slate-200 min-w-[210px] shadow-xl rounded-xl p-1.5 z-50 animate-in fade-in-80">
                  {digitalCategories.map((sub) => (
                    <DropdownMenuItem
                      key={sub.title}
                      onClick={() => router.push(sub.href)}
                      className="cursor-pointer text-xs font-medium text-slate-700 hover:text-[#9333ea] hover:bg-purple-50 rounded-lg py-2 px-3 transition-colors flex items-center gap-2.5"
                    >
                      {sub.icon && <sub.icon className="w-3.5 h-3.5 text-[#9333ea]" />}
                      <span>{sub.title}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Link
                href="/shop"
                className="hover:text-[#9333ea] transition-colors py-3"
              >
                Home &amp; Living
              </Link>
              <Link
                href="/shop"
                className="hover:text-[#9333ea] transition-colors py-3"
              >
                Health &amp; Wellness
              </Link>
            </nav>
          </div>

          {/* Far Right Deals Accent Link */}
          <Link
            href="/shop?filter=deals"
            className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-[#9333ea] hover:text-[#7e22ce] transition-colors py-3 uppercase tracking-wide group"
          >
            <Tag className="w-4 h-4 fill-[#9333ea] group-hover:scale-110 transition-transform" />
            <span>Deals</span>
          </Link>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0e0a22] text-white border-b border-white/10 px-4 py-4 space-y-3">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Categories
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {allCategories.map((cat) => (
              <Link
                key={cat.title}
                href={cat.href}
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 font-medium"
              >
                {cat.title}
              </Link>
            ))}
          </div>
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
            <Link
              href="/shop?filter=deals"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#c084fc] font-bold flex items-center gap-1"
            >
              <Tag className="w-3.5 h-3.5" /> Special Deals
            </Link>
            <Link
              href="/contact-us"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-400"
            >
              Support
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
