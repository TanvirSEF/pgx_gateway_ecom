"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, Check } from "lucide-react";
import { CURRENCY } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";

interface MobileStickyBarProps {
  productName: string;
  price: number;
  isOutOfStock: boolean;
  onAddToCart: () => void;
}

export function MobileStickyBar({
  productName,
  price,
  isOutOfStock,
  onAddToCart,
}: MobileStickyBarProps) {
  const [show, setShow] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky bar once scrolled 350px down
      if (window.scrollY > 350) {
        setShow(true);
      } else {
        setShow(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = () => {
    onAddToCart();
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 800);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed bottom-14 left-0 right-0 z-30 lg:hidden p-3 bg-background/95 backdrop-blur-xl border-t border-border shadow-lg"
        >
          <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-foreground truncate">
                {productName}
              </h4>
              <p className="text-xs font-black text-primary">
                {CURRENCY}
                {Number(price).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>

            <button
              onClick={handleClick}
              disabled={isOutOfStock}
              className="h-10 px-5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isAdded ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{isOutOfStock ? "Sold Out" : "Add"}</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

