"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Compass, ShoppingBag, Heart, User } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { useAuth } from "@/providers/AuthProvider";

export function MobileBottomNav() {
  const pathname = usePathname();
  const cartItems = useCartStore((s) => s.items);
  const openCart = useCartStore((s) => s.openCart);
  const { isAuthenticated } = useAuth();

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      label: "Explore",
      href: "/shop",
      icon: Compass,
      isActive: pathname.startsWith("/shop") || pathname.startsWith("/category"),
    },
    {
      label: "Cart",
      isAction: true,
      onClick: () => openCart(),
      icon: ShoppingBag,
      badge: totalItems > 0 ? totalItems : null,
      isActive: false,
    },
    {
      label: "Wishlist",
      href: "/shop?filter=featured",
      icon: Heart,
      isActive: false,
    },
    {
      label: "Account",
      href: isAuthenticated ? "/my-account" : "/login",
      icon: User,
      isActive: pathname.startsWith("/my-account") || pathname === "/login",
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-background/90 backdrop-blur-xl border-t border-border/80 px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isCurrent = item.isActive;

          if (item.isAction) {
            return (
              <button
                key={idx}
                onClick={item.onClick}
                className="relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all text-muted-foreground hover:text-foreground active:scale-95"
                aria-label="Open shopping cart"
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.badge !== null && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1.5 -right-2 bg-primary text-primary-foreground text-[10px] font-black h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center shadow-xs"
                    >
                      {item.badge}
                    </motion.span>
                  )}
                </div>
                <span className="text-[10px] font-medium tracking-tight mt-1">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={idx}
              href={item.href!}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all ${
                isCurrent
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground active:scale-95"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isCurrent ? "stroke-[2.5]" : ""}`} />
                {isCurrent && (
                  <motion.div
                    layoutId="mobileNavPill"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-1">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

