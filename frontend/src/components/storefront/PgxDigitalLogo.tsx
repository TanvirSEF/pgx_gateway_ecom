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
    <Link href={href} className={`inline-flex items-center gap-2 group select-none ${className}`}>
      {/* SVG Iconic Emblem with Purple Orbital Ring */}
      <div className="relative flex items-center justify-center">
        {/* Ambient Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/30 to-fuchsia-600/30 rounded-full blur-md opacity-75 group-hover:opacity-100 transition-opacity pointer-events-none" />

        <svg
          viewBox="0 0 160 52"
          className="h-9 sm:h-11 w-auto"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Orbital Neon Purple Swoosh Loop */}
          <path
            d="M 12,38 C 4,34 3,20 18,12 C 34,4 55,2 75,5 C 50,8 30,14 20,24 C 12,32 14,42 28,45 C 44,48 70,45 105,38 C 120,35 142,28 152,22 C 145,26 125,34 102,40 C 65,50 30,50 15,44 Z"
            fill="url(#pgx-purple-gradient)"
          />
          <defs>
            <linearGradient id="pgx-purple-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="50%" stopColor="#9333ea" />
              <stop offset="100%" stopColor="#7e22ce" />
            </linearGradient>
          </defs>

          {/* Bold Slanted "PGX" */}
          <text
            x="36"
            y="29"
            fill={isDarkBg ? "#FFFFFF" : "#0F172A"}
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="900"
            fontStyle="italic"
            fontSize="30"
            letterSpacing="-0.04em"
          >
            PGX
          </text>

          {/* Subtitle "MARKETPLACE" */}
          <text
            x="38"
            y="43"
            fill="#a855f7"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="800"
            fontSize="10.5"
            letterSpacing="0.22em"
          >
            MARKETPLACE
          </text>
        </svg>
      </div>
    </Link>
  );
}
