import { AnnouncementBar } from "@/components/storefront/AnnouncementBar";
import { CartDrawer } from "@/components/storefront/CartDrawer";
import { Footer } from "@/components/storefront/Footer";
import { MobileBottomNav } from "@/components/storefront/MobileBottomNav";
import { Navbar } from "@/components/storefront/Navbar";
import { StorefrontSettingsGate } from "@/components/storefront/StorefrontSettingsGate";
import { WhatsAppButton } from "@/components/storefront/WhatsAppButton";
import { StoreSettingsProvider } from "@/providers/StoreSettingsProvider";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StoreSettingsProvider>
      <StorefrontSettingsGate>
        <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
          <AnnouncementBar />
          <Navbar />
          <main className="flex-1 pb-16 lg:pb-0">{children}</main>
          <Footer />
          <CartDrawer />
          <MobileBottomNav />
          <WhatsAppButton />
        </div>
      </StorefrontSettingsGate>
    </StoreSettingsProvider>
  );
}
