"use client";

import { useAuth } from "@/providers/AuthProvider";
import { ChevronDown, Globe, LogIn, User, UserPlus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function AnnouncementBar() {
  const { user, isAuthenticated } = useAuth();
  const [currency, setCurrency] = useState("USD");
  const [language, setLanguage] = useState("English");

  return (
    <div className="bg-[#080420] text-slate-300 text-[11px] sm:text-xs py-2 px-4 sm:px-8 border-b border-white/5 select-none transition-colors">
      <div className="container mx-auto flex items-center justify-between gap-3">
        {/* Left: Global access tagline */}
        <div className="flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-[#8b5cf6] shrink-0" />
          <span className="font-medium tracking-wide text-slate-200">
            Global Digital Products. Instant Access.
          </span>
        </div>

        {/* Right: Currency, Language & Auth Links */}
        <div className="flex items-center gap-4 sm:gap-6 shrink-0">
          {/* Currency Switcher */}
          <div className="relative group cursor-pointer hidden xs:flex items-center gap-1 hover:text-white transition-colors">
            <span className="font-semibold text-slate-200">{currency}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-white transition-colors" />
            <div className="absolute top-full right-0 mt-1 hidden group-hover:block bg-[#110b38] border border-white/10 rounded-lg shadow-xl p-1 z-50 min-w-[70px]">
              {["USD", "EUR", "GBP"].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurrency(c)}
                  className={`w-full text-left px-2 py-1 rounded text-[11px] transition-colors ${
                    currency === c ? "text-[#8b5cf6] font-bold bg-white/5" : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Language Selector */}
          <div className="relative group cursor-pointer hidden md:flex items-center gap-1 hover:text-white transition-colors">
            <span className="font-medium text-slate-300">{language}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-white transition-colors" />
            <div className="absolute top-full right-0 mt-1 hidden group-hover:block bg-[#110b38] border border-white/10 rounded-lg shadow-xl p-1 z-50 min-w-[90px]">
              {["English", "Español", "Deutsch"].map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLanguage(l)}
                  className={`w-full text-left px-2 py-1 rounded text-[11px] transition-colors ${
                    language === l ? "text-[#8b5cf6] font-bold bg-white/5" : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="h-3 w-px bg-white/15 hidden xs:block" />

          {/* Auth Links */}
          {isAuthenticated ? (
            <Link
              href="/my-account"
              className="flex items-center gap-1.5 hover:text-white font-medium transition-colors"
            >
              <User className="w-3.5 h-3.5 text-[#8b5cf6]" />
              <span className="truncate max-w-[120px]">{user?.name || "My Account"}</span>
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="flex items-center gap-1 hover:text-white font-medium transition-colors"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-400" />
                <span>Login</span>
              </Link>
              <span className="text-white/20">|</span>
              <Link
                href="/register"
                className="flex items-center gap-1 hover:text-[#8b5cf6] font-semibold transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5 text-[#8b5cf6]" />
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
