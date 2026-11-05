import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function resolveImageUrl(url?: string | null): string {
  if (!url) return "/placeholder-product.jpg";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  let base = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || "";
  if (
    typeof window !== "undefined" &&
    !window.location.hostname.includes("localhost") &&
    (!base || base.includes("localhost"))
  ) {
    const hostname = window.location.hostname;
    const hostParts = hostname.split(".");
    if (hostParts.length >= 2) {
      const rootDomain = hostParts.slice(-2).join(".");
      base = `${window.location.protocol}//api.${rootDomain}`;
    } else {
      base = window.location.origin;
    }
  }

  if (!base) {
    base = process.env.NODE_ENV === "production" ? "https://api.pgxsports.com" : "http://localhost:4000";
  }

  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const normalizedPath = url.startsWith("/") ? url : `/${url}`;
  return `${normalizedBase}${normalizedPath}`;
}
