# Developer Guideline: Remove Hardcoded Legacy Domains & Enable Dynamic Environment Configuration

## Objective
The codebase currently contains several hardcoded references to the legacy domain (`playgroundfitnex.com` and `api.playgroundfitnex.com`). This causes issues when switching domains (e.g. to `pgxsports.com` or `pgxsports.shop`) because requests and image asset resolvers fall back to the wrong domain.

This guide outlines all the exact files, issues, and code updates required to make API routing, image resolution, CORS headers, and branding links completely dynamic.

---

## 1. Frontend Updates

### 1.1. `frontend/src/lib/api.ts`
* **Issue:** Hardcoded fallback `https://api.playgroundfitnex.com/api` is used when environment variables are missing or point to `localhost` in production.
* **Resolution:** Remove hardcoded references and fall back to the dynamic browser origin or `/api`.

#### Recommended Update:
```typescript
import axios from "axios";
import { env } from "@/env";
import { getCookie, COOKIE_KEYS } from "./cookie-client";

export const getBaseApiUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || env.NEXT_PUBLIC_API_URL;

  // In the browser
  if (typeof window !== "undefined") {
    // If NEXT_PUBLIC_API_URL is missing or still contains localhost in non-local environments
    if (!window.location.hostname.includes("localhost") && (!envUrl || envUrl.includes("localhost"))) {
      // Fallback to relative API route or window origin
      return `${window.location.origin}/api`;
    }
  }

  // Server-side (SSR / RSC) or local dev
  return envUrl || "http://localhost:4000/api";
};

export const api = axios.create({
  baseURL: getBaseApiUrl(),
  headers: {
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
  },
});

// Attach JWT token from cookies
api.interceptors.request.use((config) => {
  const token = getCookie(COOKIE_KEYS.TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

### 1.2. `frontend/src/lib/utils.ts`
* **Issue:** `resolveImageUrl()` has a hardcoded fallback on line 14:
  ```typescript
  base = "https://api.playgroundfitnex.com";
  ```
* **Resolution:** Dynamically use `NEXT_PUBLIC_IMAGE_BASE_URL` or fallback to the current window host.

#### Recommended Update:
```typescript
export function resolveImageUrl(url?: string | null): string {
  if (!url) return "/placeholder-product.jpg";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  let base = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || "";

  // If running in browser and base is either empty or invalid localhost
  if (
    typeof window !== "undefined" &&
    !window.location.hostname.includes("localhost") &&
    (!base || base.includes("localhost"))
  ) {
    base = window.location.origin;
  }

  if (!base) return url;

  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const normalizedPath = url.startsWith("/") ? url : `/${url}`;
  return `${normalizedBase}${normalizedPath}`;
}
```

---

### 1.3. `frontend/next.config.ts`
* **Issue:** 
  1. `api.playgroundfitnex.com` is hardcoded in `images.remotePatterns`.
  2. `pgxsports.com` and `api.pgxsports.com` are missing from `remotePatterns` (only `pgxsports.shop` was configured). Next.js `<Image />` will throw an error if assets are served from `.com`.
* **Resolution:** Remove `api.playgroundfitnex.com` and include both `.com` and `.shop` domains.

#### Recommended Update:
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "gadgetbd.com", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "traqtwdfhxduijhqsuwg.supabase.co", pathname: "/**" },
      { protocol: "https", hostname: "api.pgxsports.shop", pathname: "/**" },
      { protocol: "https", hostname: "pgxsports.shop", pathname: "/**" },
      { protocol: "https", hostname: "api.pgxsports.com", pathname: "/**" },
      { protocol: "https", hostname: "pgxsports.com", pathname: "/**" },
      { protocol: "http", hostname: "localhost", port: "4000", pathname: "/**" },
    ],
  },
};

export default nextConfig;
```

---

### 1.4. Static Pages & Contact Emails
Update obsolete contact emails and links in the following files:
* **`frontend/src/app/(store)/career/page.tsx`**:
  * Replace `careers@playgroundfitnex.com` with `careers@pgxsports.com`.
* **`frontend/src/app/(store)/corporate-deal/page.tsx`**:
  * Replace `wholesale@playgroundfitnex.com` with `wholesale@pgxsports.com`.
* **`frontend/src/app/(store)/privacy-policy/page.tsx`**:
  * Replace `playgroundfitnex.com` with `pgxsports.com`.
* **`frontend/src/app/(store)/return-refund-policy/page.tsx`**:
  * Replace `support@playgroundfitnex.com` with `support@pgxsports.com`.

---

## 2. Backend Updates

### 2.1. `backend/src/main.ts`
* **Issue:** `defaultOrigins` in the CORS configuration hardcodes:
  ```typescript
  'https://playgroundfitnex.com',
  'https://www.playgroundfitnex.com',
  'https://api.playgroundfitnex.com',
  ```
* **Resolution:** Clean up obsolete domains. Ensure CORS permits active domains while dynamically reading `FRONTEND_URL` from the environment.

#### Recommended Update:
```typescript
  const frontendUrlEnv = configService.get<string>('FRONTEND_URL') || '';
  const configuredOrigins = frontendUrlEnv
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  const defaultOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'https://pgxsports.com',
    'https://www.pgxsports.com',
    'https://api.pgxsports.com',
    'https://pgxsports.shop',
    'https://www.pgxsports.shop',
    'https://api.pgxsports.shop',
    'https://playgroundx.vip',
    'https://www.playgroundx.vip',
  ];

  const allowedOrigins = Array.from(new Set([...defaultOrigins, ...configuredOrigins]));

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });
```

---

## 3. Environment Variables Reference

Ensure deployment configurations (Docploy, Docker Compose, or `.env`) use the correct environment variables:

### Backend `.env`:
```env
FRONTEND_URL=https://pgxsports.com,https://api.pgxsports.com
MAIL_FROM="PGX Sports <info@pgxsports.com>"
```

### Frontend `.env` / Docker Build Args:
```env
NEXT_PUBLIC_API_URL=https://api.pgxsports.com/api
NEXT_PUBLIC_IMAGE_BASE_URL=https://api.pgxsports.com
NEXT_PUBLIC_SITE_URL=https://pgxsports.com
NEXT_PUBLIC_STORE_NAME=PGX Sports
```

---

## 4. Verification Checklist

1. **Verify No Lingering References:**
   ```bash
   git grep -i "playgroundfitnex"
   ```
   *(Only legacy git logs or test specs should remain, if any; runtime code must be completely clean).*

2. **Frontend Build Check:**
   ```bash
   cd frontend
   npm run build
   ```
   *Ensure standard standalone Next.js compilation succeeds with zero TypeScript errors.*

3. **Backend Build Check:**
   ```bash
   cd backend
   npm run build
   ```
   *Ensure NestJS builds successfully.*
