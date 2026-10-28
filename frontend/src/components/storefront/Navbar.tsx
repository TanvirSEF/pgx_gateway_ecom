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
  LogOut,
  Menu,
  ShoppingBag,
  User,
  X,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HeaderSearch } from "./HeaderSearch";
import { WalletPill } from "./WalletPill";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const cartItems = useCartStore((s) => s.items);
  const openCart = useCartStore((s) => s.openCart);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const router = useRouter();
  const pathname = usePathname();

  const navLinks = [
    {
      title: "All Products",
      href: "/shop",
    },
    {
      title: "Equipment",
      href: "/shop?category=strength-equipment",
      badge: "Popular",
      children: [
        { title: "All Equipment", href: "/shop?category=strength-equipment" },
        { title: "Commercial Treadmills", href: "/shop?category=cardio-equipment" },
        { title: "Smart Exercise Bikes", href: "/shop?category=cardio-equipment" },
        { title: "Power Racks & Cages", href: "/shop?category=strength-equipment" },
        { title: "Adjustable Dumbbells", href: "/shop?category=strength-equipment" },
      ],
    },
    {
      title: "Apparel",
      href: "/shop?category=apparel",
      children: [
        { title: "Men's Performance", href: "/shop?category=apparel" },
        { title: "Women's Activewear", href: "/shop?category=apparel" },
        { title: "Training Footwear", href: "/shop?category=apparel" },
      ],
    },
    {
      title: "Accessories",
      href: "/shop?category=accessories",
      children: [
        { title: "Resistance Bands", href: "/shop?category=accessories" },
        { title: "Yoga & Floor Mats", href: "/shop?category=accessories" },
        { title: "Hydration & Shakers", href: "/shop?category=accessories" },
      ],
    },
    {
      title: "Bundles",
      href: "/shop?category=bundles",
      badge: "Save 20%",
    },
    {
      title: "About Us",
      href: "/about-us",
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-xl border-b border-border/80 text-foreground transition-all duration-300">
      <div className="container mx-auto px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link
          href="/"
          className="inline-flex items-center shrink-0 group transition-transform active:scale-95"
        >
          <img
            src="/logo.png"
            alt="PGX Logo"
            className="h-8 sm:h-10 w-auto object-contain transition-opacity group-hover:opacity-90"
          />
        </Link>

        {/* Center Desktop Navigation */}
        <nav className="hidden xl:flex items-center gap-1 text-[13px] font-medium tracking-wide">
          {navLinks.map((link) => {
            const isCurrent =
              pathname === link.href ||
              (link.children &&
                link.children.some((c) => pathname.startsWith(c.href)));

            return link.children ? (
              <DropdownMenu key={link.title}>
                <DropdownMenuTrigger className="px-3.5 py-2 rounded-xl text-foreground/80 hover:text-foreground hover:bg-muted/70 transition-all flex items-center gap-1.5 outline-none font-medium cursor-pointer">
                  <span>{link.title}</span>
                  {link.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-primary/10 text-primary">
                      {link.badge}
                    </span>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground transition-transform duration-200" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-popover/95 backdrop-blur-xl border border-border/80 text-popover-foreground min-w-[210px] shadow-xl rounded-2xl p-1.5 animate-in fade-in-80 zoom-in-95">
                  {link.children.map((sub) => (
                    <DropdownMenuItem
                      key={sub.title}
                      onClick={() => router.push(sub.href)}
                      className="cursor-pointer text-xs font-medium text-foreground/90 hover:text-primary hover:bg-primary/5 rounded-xl py-2 px-3 transition-colors"
                    >
                      {sub.title}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                key={link.title}
                href={link.href}
                className={`relative px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isCurrent
                    ? "text-primary bg-primary/5 font-semibold"
                    : "text-foreground/80 hover:text-foreground hover:bg-muted/70"
                }`}
              >
                <span>{link.title}</span>
                {link.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-primary/10 text-primary">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Search Bar (Desktop & Tablet) */}
        <div className="hidden md:flex flex-1 max-w-xs lg:max-w-sm xl:max-w-md mx-2">
          <HeaderSearch />
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Universal Wallet Pill */}
          <WalletPill />

          {/* User Account Dropdown */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="p-2 sm:p-2.5 rounded-xl text-foreground/80 hover:text-foreground hover:bg-muted/70 transition-all outline-none cursor-pointer">
                <User className="w-5 h-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-popover/95 backdrop-blur-xl border border-border/80 text-popover-foreground min-w-[220px] shadow-xl rounded-2xl p-2 animate-in fade-in-80"
              >
                <div className="px-3 py-2.5 text-xs border-b border-border/60">
                  <p className="font-bold text-foreground truncate">
                    {user?.name}
                  </p>
                  <p className="text-muted-foreground truncate">{user?.email}</p>
                </div>
                <DropdownMenuItem
                  onClick={() => router.push("/my-account")}
                  className="cursor-pointer text-xs hover:bg-muted/80 rounded-xl py-2 mt-1"
                >
                  My Account
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/my-account/wallet")}
                  className="cursor-pointer text-xs hover:bg-primary/5 text-primary font-semibold rounded-xl py-2"
                >
                  Wallet &amp; Top-Up
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/my-account/orders")}
                  className="cursor-pointer text-xs hover:bg-muted/80 rounded-xl py-2"
                >
                  Order History
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem
                    onClick={() => router.push("/admin")}
                    className="cursor-pointer text-xs text-primary font-semibold hover:bg-primary/10 rounded-xl py-2"
                  >
                    Admin Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-border/60 my-1" />
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-xs text-destructive hover:bg-destructive/10 rounded-xl py-2 flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" /> Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/login"
              className="p-2 sm:p-2.5 rounded-xl text-foreground/80 hover:text-foreground hover:bg-muted/70 transition-all"
              title="Sign In"
            >
              <User className="w-5 h-5" />
            </Link>
          )}

          {/* Cart Icon & Dynamic Spring Badge */}
          <button
            onClick={openCart}
            className="relative p-2 sm:p-2.5 rounded-xl text-foreground/80 hover:text-foreground hover:bg-muted/70 transition-all flex items-center justify-center cursor-pointer active:scale-95"
            aria-label="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-black h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center shadow-sm"
              >
                {totalItems}
              </motion.span>
            )}
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-xl text-foreground/80 hover:text-foreground hover:bg-muted/70 transition-all cursor-pointer"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Search Input Row */}
      <div className="md:hidden px-4 pb-3">
        <HeaderSearch />
      </div>

      {/* Mobile Animated Dropdown Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="xl:hidden border-t border-border/80 bg-background/95 backdrop-blur-xl px-4 py-4 space-y-2 overflow-hidden"
          >
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <div key={link.title}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-muted/70 text-foreground/90 font-medium text-sm transition-colors"
                  >
                    <span>{link.title}</span>
                    {link.badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {link.badge}
                      </span>
                    )}
                  </Link>

                  {link.children && (
                    <div className="pl-4 pr-2 py-1 space-y-1 border-l-2 border-primary/20 ml-3 my-1">
                      {link.children.map((sub) => (
                        <Link
                          key={sub.title}
                          href={sub.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block py-1.5 px-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                        >
                          {sub.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground px-2">
              <Link
                href="/orders/track"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-primary"
              >
                Track Order
              </Link>
              <Link
                href="/contact-us"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-primary"
              >
                Customer Support
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
