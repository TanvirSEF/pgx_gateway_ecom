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
import { CURRENCY } from "@/lib/constants";
import {
  ChevronDown,
  LogOut,
  Menu,
  ShoppingCart,
  User,
  X,
  Sparkles,
  Bot,
  Laptop,
  Code2,
  GraduationCap,
  Layers,
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HeaderSearch } from "./HeaderSearch";
import { PgxDigitalLogo } from "./PgxDigitalLogo";

interface NavDropdownItem {
  title: string;
  href: string;
  icon?: any;
}

interface NavLinkItem {
  title: string;
  href: string;
  hasDropdown?: boolean;
  items?: NavDropdownItem[];
}

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const cartItems = useCartStore((s) => s.items);
  const openCart = useCartStore((s) => s.openCart);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const router = useRouter();
  const pathname = usePathname();

  const digitalCategories: NavDropdownItem[] = [
    { title: "Software & Licenses", href: "/shop?category=software-licenses", icon: Laptop },
    { title: "Website Templates", href: "/shop?category=website-templates", icon: Code2 },
    { title: "AI Tools & Automation", href: "/shop?category=ai-tools-automation", icon: Bot },
    { title: "Digital Marketing", href: "/shop?category=digital-marketing", icon: Sparkles },
    { title: "Online Courses & E-books", href: "/shop?category=online-courses-ebooks", icon: GraduationCap },
    { title: "Creative Assets", href: "/shop?category=creative-assets", icon: Layers },
  ];

  const navLinks: NavLinkItem[] = [
    { title: "Home", href: "/" },
    {
      title: "Shop",
      href: "/shop",
      hasDropdown: true,
      items: [
        { title: "All Digital Products", href: "/shop" },
        { title: "Featured Software", href: "/shop?filter=featured" },
        { title: "Best Selling Templates", href: "/shop?sort=best-sellers" },
        { title: "New Releases", href: "/shop?sort=newest" },
      ],
    },
    {
      title: "Categories",
      href: "/shop",
      hasDropdown: true,
      items: digitalCategories,
    },
    { title: "Best Sellers", href: "/shop?filter=best-sellers" },
    { title: "New Arrivals", href: "/shop?sort=newest" },
    { title: "Blog", href: "/blog" },
    { title: "Support", href: "/contact-us" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0c0728] border-b border-white/10 text-white select-none transition-colors">
      {/* 1. Main Header Row: Logo, Search, Cart */}
      <div className="container mx-auto px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4 lg:gap-8">
        {/* Brand Logo */}
        <div className="shrink-0">
          <PgxDigitalLogo variant="dark" />
        </div>

        {/* Center Search Bar (Desktop & Tablet) */}
        <div className="hidden sm:flex flex-1 max-w-2xl mx-auto">
          <HeaderSearch />
        </div>

        {/* Right Action Icons & Cart */}
        <div className="flex items-center gap-3 shrink-0">
          {/* User Account Quick Dropdown */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors outline-none cursor-pointer hidden md:flex items-center gap-1.5 text-xs font-medium">
                <User className="w-4 h-4 text-[#8b5cf6]" />
                <span className="truncate max-w-[100px]">{user?.name}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-[#110b38] border border-white/15 text-white min-w-[200px] shadow-2xl rounded-xl p-1.5 animate-in fade-in-80"
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
                  My Purchases &amp; Licenses
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem
                    onClick={() => router.push("/admin")}
                    className="cursor-pointer text-xs text-[#8b5cf6] font-semibold hover:bg-white/10 rounded-lg py-2"
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
          ) : null}

          {/* Cart Pill Display: Cart Icon + Badge + Live Total (Exact Mockup Match) */}
          <button
            onClick={openCart}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 active:scale-95 transition-all cursor-pointer shadow-sm"
            aria-label="Open Shopping Cart"
          >
            <div className="relative flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-white" />
              {totalItems > 0 ? (
                <span className="absolute -top-2.5 -right-2.5 bg-[#7c3aed] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {totalItems}
                </span>
              ) : (
                <span className="absolute -top-2.5 -right-2.5 bg-white/20 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  0
                </span>
              )}
            </div>
            <span className="font-bold text-xs sm:text-sm text-white tracking-tight">
              {CURRENCY}
              {cartSubtotal.toFixed(2)}
            </span>
          </button>

          {/* Mobile Menu Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 lg:hidden"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Search Input Row */}
      <div className="sm:hidden px-4 pb-3">
        <HeaderSearch />
      </div>

      {/* 2. Sub-Navigation Bar (Desktop Row) */}
      <div className="hidden lg:block border-t border-white/10 bg-[#09051e]">
        <div className="container mx-auto px-4 flex items-center gap-8">
          {navLinks.map((link) => {
            const isCurrent =
              link.href === "/"
                ? pathname === "/"
                : pathname === link.href || pathname.startsWith(link.href + "/");

            if (link.hasDropdown && link.items) {
              return (
                <DropdownMenu key={link.title}>
                  <DropdownMenuTrigger className="py-2.5 text-xs font-semibold tracking-wide text-slate-300 hover:text-white transition-colors flex items-center gap-1 cursor-pointer outline-none">
                    <span>{link.title}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-[#110b38] border border-white/15 text-white min-w-[210px] shadow-2xl rounded-xl p-1.5 animate-in fade-in-80">
                    {link.items.map((sub) => (
                      <DropdownMenuItem
                        key={sub.title}
                        onClick={() => router.push(sub.href)}
                        className="cursor-pointer text-xs font-medium text-slate-200 hover:text-white hover:bg-white/10 rounded-lg py-2 px-3 transition-colors flex items-center gap-2"
                      >
                        {sub.icon && <sub.icon className="w-3.5 h-3.5 text-[#8b5cf6]" />}
                        <span>{sub.title}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }

            return (
              <Link
                key={link.title}
                href={link.href}
                className={`relative py-2.5 text-xs font-semibold tracking-wide transition-colors ${
                  isCurrent ? "text-white" : "text-slate-300 hover:text-white"
                }`}
              >
                <span>{link.title}</span>
                {isCurrent && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#8b5cf6] rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* 3. Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-white/10 bg-[#09051e] px-4 py-4 space-y-3"
          >
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.title}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/5 transition-colors"
                >
                  {link.title}
                </Link>
              ))}
            </div>

            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3">
                Digital Categories
              </p>
              {digitalCategories.map((cat) => (
                <Link
                  key={cat.title}
                  href={cat.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-white/5"
                >
                  <cat.icon className="w-3.5 h-3.5 text-[#8b5cf6]" />
                  <span>{cat.title}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
