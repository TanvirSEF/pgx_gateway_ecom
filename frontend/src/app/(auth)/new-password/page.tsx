"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResetPassword } from "@/lib/api/auth";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";

function NewPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const resetPasswordMutation = useResetPassword();

  const passwordsMatch =
    confirmPassword.length > 0 && newPassword === confirmPassword;
  const passwordsMismatch =
    confirmPassword.length > 0 && newPassword !== confirmPassword;
  const isPasswordMinLength = newPassword.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!token) {
      toast.error("Invalid or missing token");
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync({ token, newPassword });
      toast.success("Password reset successfully! Please login.");
      router.push("/login");
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { message?: string } } })
          .response?.data?.message === "string"
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : "Invalid or expired token";

      toast.error(message);
    }
  };

  if (!token) {
    return (
      <div className="space-y-5 text-center">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
            Invalid Link
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            The password reset link is invalid or missing a token. Please request
            a new one.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/forgot-password"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#00a3ff] hover:underline"
          >
            Request new reset link
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
      <div className="text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00a3ff]/10 text-[#00a3ff] text-[11px] font-bold uppercase tracking-wider mb-2.5">
          <ShieldCheck className="w-3 h-3" />
          Secure Reset
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
          Set New Password
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
          Secure your athlete account with a new password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          {/* New Password */}
          <div className="space-y-1.5">
            <Label
              htmlFor="new-password"
              className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              New Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <Input
                id="new-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-11 sm:h-12 pl-10 pr-11 rounded-xl bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-sm focus:bg-white dark:focus:bg-slate-800 focus:border-[#00a3ff] focus:ring-4 focus:ring-[#00a3ff]/15 transition-all"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-hidden"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {newPassword.length > 0 && (
              <p
                className={`text-[11px] font-medium flex items-center gap-1 mt-1 transition-colors ${
                  isPasswordMinLength
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-amber-600 dark:text-amber-400"
                }`}
              >
                {isPasswordMinLength ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Password meets minimum length
                  </>
                ) : (
                  `Need ${6 - newPassword.length} more characters`
                )}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <Label
              htmlFor="confirm-password"
              className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Confirm New Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <Input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`h-11 sm:h-12 pl-10 pr-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-sm focus:bg-white dark:focus:bg-slate-800 focus:border-[#00a3ff] focus:ring-4 focus:ring-[#00a3ff]/15 transition-all ${
                  passwordsMismatch
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/15"
                    : passwordsMatch
                    ? "border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/15"
                    : ""
                }`}
                required
                minLength={6}
              />
            </div>
            {passwordsMismatch && (
              <p className="text-xs text-red-500 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                Passwords do not match
              </p>
            )}
            {passwordsMatch && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Passwords match
              </p>
            )}
          </div>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            disabled={resetPasswordMutation.isPending}
            className="w-full h-11 sm:h-12 bg-[#00a3ff] hover:bg-[#0091e6] active:bg-[#0082cf] text-white font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all shadow-md shadow-[#00a3ff]/25 hover:shadow-lg hover:shadow-[#00a3ff]/35 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
          >
            {resetPasswordMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Resetting...</span>
              </>
            ) : (
              <>
                <span>Update Password</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}

export default function NewPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-[#00a3ff]" />
        </div>
      }
    >
      <NewPasswordContent />
    </Suspense>
  );
}
