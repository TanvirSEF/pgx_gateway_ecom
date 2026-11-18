"use client";

import Link from "next/link";

interface PgxDigitalLogoProps {
  className?: string;
  variant?: "dark" | "light";
  href?: string;
}

export function PgxDigitalLogo({
  className = "",
  variant = "dark",
  href = "/",
}: PgxDigitalLogoProps) {
  const isDarkBg = variant === "dark";

  return (
    <Link href={href} className={`inline-flex flex-col group select-none ${className}`}>
      <div className="flex items-center tracking-tight leading-none">
        <span
          className={`font-black text-xl sm:text-2xl tracking-tighter ${
            isDarkBg ? "text-white" : "text-slate-900"
          }`}
        >
          PGX
        </span>
        <span className="font-extrabold text-xl sm:text-2xl text-[#8b5cf6] ml-1.5 tracking-tight">
          MARKETPLACE
        </span>
      </div>
      <span
        className={`text-[8.5px] sm:text-[9.5px] font-bold tracking-[0.18em] uppercase mt-1 ${
          isDarkBg ? "text-slate-300/85" : "text-slate-500"
        }`}
      >
        SMARTER TOOLS. BETTER RESULTS.
      </span>
    </Link>
  );
}
