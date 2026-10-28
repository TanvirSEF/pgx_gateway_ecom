import { Toaster } from "@/components/ui/sonner";
import { CustomCursor } from "@/components/effects/CustomCursor";
import { AuthProvider } from "@/providers/AuthProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { WalletProvider } from "@/providers/WalletProvider";
import type { Metadata } from "next";
import { Outfit, Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PGX — Lifestyle, Fitness, Gear, Everyday",
  description:
    "Premium fitness equipment, apparel and everyday essentials for a healthier, happier you.",
  keywords: [
    "fitness equipment",
    "gym gear",
    "dumbbells",
    "treadmill",
    "exercise bike",
    "athletic apparel",
    "PGX",
    "power rack",
  ],
  icons: {
    icon: [
      { url: "/logo.png" },
      { url: "/icon.png" },
    ],
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "PGX — Lifestyle, Fitness, Gear, Everyday",
    description: "Premium fitness equipment, apparel and everyday essentials.",
    images: [{ url: "/logo.png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${playfair.variable} ${plusJakarta.variable} font-sans antialiased text-foreground bg-background selection:bg-primary/20 selection:text-primary min-h-screen`}
      >
        <NuqsAdapter>
          <CustomCursor />
          <QueryProvider>
            <AuthProvider>
              <WalletProvider>
                {children}
                <Toaster position="top-right" />
              </WalletProvider>
            </AuthProvider>
          </QueryProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
