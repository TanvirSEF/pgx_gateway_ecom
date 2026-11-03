"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
  LogIn,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { withPublicRoute } from "@/helpers/with-route-guard";
import { useAuth } from "@/providers/AuthProvider";
import { LoginInput, loginSchema } from "@/schemas/auth.schema";

function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const redirectUrl = searchParams.get("redirect") || "/";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setErrorMessage(null);
    try {
      await login({
        email: data.email.trim().toLowerCase(),
        password: data.password,
      });
      router.push(redirectUrl);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Invalid email or password. Please try again."
      );
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00a3ff]/10 text-[#00a3ff] text-[11px] font-bold uppercase tracking-wider mb-2.5">
          <LogIn className="w-3 h-3" />
          Welcome Back
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
          Sign In
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
          Access your PGX fitness profile, orders & exclusive athlete perks.
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs sm:text-sm flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="font-semibold">{errorMessage}</p>
        </div>
      )}

      {/* Form */}
      <form className="space-y-4 sm:space-y-4.5" onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Email Address */}
        <div className="space-y-1.5">
          <Label
            htmlFor="email"
            className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
          >
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="athlete@domain.com"
              {...register("email")}
              className={`h-11 sm:h-12 pl-10 pr-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-sm focus:bg-white dark:focus:bg-slate-800 focus:border-[#00a3ff] focus:ring-4 focus:ring-[#00a3ff]/15 transition-all ${
                errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500/15" : ""
              }`}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-500 font-medium flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="password"
              className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-[#00a3ff] hover:text-[#0091e6] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              {...register("password")}
              className={`h-11 sm:h-12 pl-10 pr-11 rounded-xl bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-sm focus:bg-white dark:focus:bg-slate-800 focus:border-[#00a3ff] focus:ring-4 focus:ring-[#00a3ff]/15 transition-all ${
                errors.password ? "border-red-500 focus:border-red-500 focus:ring-red-500/15" : ""
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-hidden"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500 font-medium flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit CTA Button */}
        <div className="pt-2">
          <Button
            type="submit"
            className="w-full h-11 sm:h-12 bg-[#00a3ff] hover:bg-[#0091e6] active:bg-[#0082cf] text-white font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all shadow-md shadow-[#00a3ff]/25 hover:shadow-lg hover:shadow-[#00a3ff]/35 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign in to PGX</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Switch to Sign Up */}
      <div className="mt-6 sm:mt-7 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-5">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-bold text-[#00a3ff] hover:text-[#0091e6] hover:underline uppercase tracking-wider ml-1 inline-flex items-center gap-1"
        >
          Sign up
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

export default withPublicRoute(LoginPage);
