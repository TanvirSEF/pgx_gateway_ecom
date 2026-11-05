import axios from "axios";
import { env } from "@/env";
import { getCookie, removeCookie, COOKIE_KEYS } from "./cookie-client";

// Determine API base URL: prioritize env, but ensure reliable production fallback both in browser and SSR
export const getBaseApiUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || env.NEXT_PUBLIC_API_URL;

  // In the browser
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    // Local development: use envUrl or fallback to localhost:4000
    if (hostname.includes("localhost")) {
      return envUrl || "http://localhost:4000/api";
    }
    // Remote/Production environment: if envUrl is set and does not point to localhost, use it
    if (envUrl && !envUrl.includes("localhost")) {
      return envUrl;
    }
    // Dynamic fallback based on current host: e.g. api.domain.com/api
    const hostParts = hostname.split(".");
    if (hostParts.length >= 2) {
      const rootDomain = hostParts.slice(-2).join(".");
      return `${window.location.protocol}//api.${rootDomain}/api`;
    }
    return `${window.location.origin}/api`;
  }

  // Server-side (SSR / RSC)
  if (envUrl && (!process.env.NODE_ENV || process.env.NODE_ENV !== "production" || !envUrl.includes("localhost"))) {
    return envUrl;
  }
  return process.env.NODE_ENV === "production"
    ? "https://api.pgxsports.shop/api"
    : "http://localhost:4000/api";
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

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only log out the user if /auth/me or a critical user endpoint specifically reports an unauthorized session
    const requestUrl = error.config?.url || "";
    if (error.response?.status === 401 && requestUrl.includes("/auth/me")) {
      if (typeof window !== "undefined") {
        removeCookie(COOKIE_KEYS.TOKEN);
        removeCookie(COOKIE_KEYS.USER);
        removeCookie(COOKIE_KEYS.SUPABASE_TOKEN);
      }
    }
    return Promise.reject(error);
  }
);
