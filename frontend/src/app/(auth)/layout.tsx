import Link from "next/link";
import { ArrowLeft, ShieldCheck, Zap } from "lucide-react";
import { PgxDigitalLogo } from "@/components/storefront/PgxDigitalLogo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50/50 to-slate-100/80 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col justify-between py-6 sm:py-10 px-4 sm:px-6 lg:px-8 text-foreground relative selection:bg-[#9333ea]/20 selection:text-[#9333ea]">
      {/* Ambient background glow accents */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-72 sm:h-96 bg-gradient-to-br from-[#9333ea]/10 via-purple-500/5 to-transparent blur-3xl opacity-70 -z-10"
        aria-hidden="true"
      />

      {/* Top Header Bar */}
      <header className="w-full max-w-md sm:max-w-xl mx-auto flex items-center justify-between pt-2 pb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-[#9333ea]/50 hover:text-[#9333ea] transition-all group backdrop-blur-xs"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Store</span>
        </Link>

        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          <Zap className="w-3.5 h-3.5 text-[#9333ea] fill-[#9333ea]" />
          PGX MarketPlace
        </span>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center items-center py-2 sm:py-6">
        <div className="w-full max-w-md sm:max-w-lg">
          {/* Brand Logo */}
          <div className="text-center mb-6 flex justify-center">
            <PgxDigitalLogo variant="light" />
          </div>

          {/* Form Card */}
          <div className="bg-white dark:bg-slate-900/95 p-6 sm:p-10 rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/40 backdrop-blur-md transition-all">
            {children}
          </div>
        </div>
      </main>

      {/* Reassuring Security / Trust Footer */}
      <footer className="w-full max-w-md sm:max-w-xl mx-auto pt-6 pb-2 text-center">
        <div className="inline-flex items-center justify-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>256-bit SSL Secure Checkout &amp; Account Protection</span>
        </div>
      </footer>
    </div>
  );
}
