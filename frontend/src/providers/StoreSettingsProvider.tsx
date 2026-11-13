"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import { useGetPublicSettings } from "@/lib/api/settings";
import type { Setting } from "@/types";

interface StoreSettingsContextValue {
  settings: Setting[];
  isLoading: boolean;
  getSetting: (key: string, fallback?: string) => string;
  storeName: string;
  storeDescription: string;
  storeLogo: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  whatsappNumber: string;
  facebookUrl: string;
  instagramUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBadge: string;
}

const StoreSettingsContext = createContext<
  StoreSettingsContextValue | undefined
>(undefined);

export function StoreSettingsProvider({ children }: { children: ReactNode }) {
  const { data, isLoading } = useGetPublicSettings();

  const value = useMemo<StoreSettingsContextValue>(() => {
    const settings = data || [];
    const map = new Map(settings.map((item) => [item.key, item.value]));

    const getSetting = (key: string, fallback = "") => map.get(key) || fallback;

    return {
      settings,
      isLoading,
      getSetting,
      storeName: getSetting("store_name", "PGX DIGITAL"),
      storeDescription: getSetting(
        "store_description",
        "Discover premium software, AI tools, website templates, marketing resources, and more — all in one place.",
      ),
      storeLogo: getSetting("store_logo", "/logo.png"),
      storeEmail: getSetting("store_email", "support@pgxdigital.com"),
      storePhone: getSetting("store_phone", "+1 (800) 555-0199"),
      storeAddress: getSetting("store_address", "Global Digital Hub"),
      whatsappNumber: getSetting("whatsapp_number", "+1 (800) 555-0199"),
      facebookUrl: getSetting("facebook_url", "https://facebook.com"),
      instagramUrl: getSetting("instagram_url", "https://instagram.com"),
      heroTitle: getSetting("hero_title", "Digital Products for a Smarter World."),
      heroSubtitle: getSetting(
        "hero_subtitle",
        "Discover premium software, AI tools, website templates, marketing resources, and more — all in one place.",
      ),
      heroBadge: getSetting("hero_badge", "SMARTER TOOLS. BETTER RESULTS."),
    };
  }, [data, isLoading]);

  return (
    <StoreSettingsContext.Provider value={value}>
      {children}
    </StoreSettingsContext.Provider>
  );
}

export function useStoreSettings() {
  const context = useContext(StoreSettingsContext);
  if (!context) {
    throw new Error(
      "useStoreSettings must be used within StoreSettingsProvider",
    );
  }

  return context;
}
