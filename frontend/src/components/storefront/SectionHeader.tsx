"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/motion/ScrollReveal";

interface SectionHeaderProps {
  badge?: string;
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  viewAllText?: string;
  className?: string;
}

export function SectionHeader({
  badge,
  title,
  subtitle,
  viewAllHref,
  viewAllText = "View All",
  className = "",
}: SectionHeaderProps) {
  return (
    <ScrollReveal direction="up" className={`mb-8 sm:mb-10 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          {badge && (
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-wider mb-2">
              <span>{badge}</span>
            </div>
          )}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground font-serif">
            {title}
          </h2>
          {subtitle && (
            <p className="text-muted-foreground text-sm sm:text-base mt-1.5 max-w-xl font-normal leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary hover:text-primary/80 transition-colors shrink-0 py-1"
          >
            <span className="tracking-wide uppercase text-[11px] sm:text-xs">
              {viewAllText}
            </span>
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        )}
      </div>
    </ScrollReveal>
  );
}

