"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { withPublicRoute } from "@/helpers/with-route-guard";
import { useAuth } from "@/providers/AuthProvider";
import { RegisterInput, registerSchema } from "@/schemas/auth.schema";

function RegisterPage() {
  const router = useRouter();
  const { register: signup } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register: formRegister,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const currentPassword = watch("password") || "";
  const isPasswordMinLength = currentPassword.length >= 6;

  const onSubmit = async (data: RegisterInput) => {
    setServerError(null);
    try {
      // Clean payload: fast 3-field sign up (name, email, password)
      const payload: RegisterInput = {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
      };

      await signup(payload);
      router.push("/my-account");
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Registration failed. Please check your details and try again.";
      setServerError(message);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9333ea]/10 text-[#9333ea] text-[11px] font-bold uppercase tracking-wider mb-2.5">
          <Sparkles className="w-3 h-3" />
          Join The Community
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
          Create Account
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
          Fast, effortless registration. Start exploring PGX MarketPlace tools today.
        </p>
      </div>

      {/* Server Error Alert */}
      {serverError && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs sm:text-sm flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{serverError}</p>
            {serverError.toLowerCase().includes("exist") && (
              <p className="mt-1 text-xs">
                Already registered?{" "}
                <Link
                  href="/login"
                  className="font-bold underline hover:text-red-900 dark:hover:text-red-100"
                >
                  Sign in to your account
                </Link>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Registration Form */}
      <form className="space-y-4 sm:space-y-4.5" onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Full Name */}
        <div className="space-y-1.5">
          <Label
            htmlFor="name"
            className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
          >
            Full Name <span className="text-[#9333ea]">*</span>
          </Label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="e.g. John Doe"
              {...formRegister("name")}
              className={`h-11 sm:h-12 pl-10 pr-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-sm focus:bg-white dark:focus:bg-slate-800 focus:border-[#9333ea] focus:ring-4 focus:ring-[#9333ea]/15 transition-all ${
                errors.name ? "border-red-500 focus:border-red-500 focus:ring-red-500/15" : ""
              }`}
            />
          </div>
          {errors.name && (
            <p className="text-xs text-red-500 font-medium flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Email Address */}
        <div className="space-y-1.5">
          <Label
            htmlFor="email"
            className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
          >
            Email Address <span className="text-[#9333ea]">*</span>
          </Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="user@domain.com"
              {...formRegister("email")}
              className={`h-11 sm:h-12 pl-10 pr-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-sm focus:bg-white dark:focus:bg-slate-800 focus:border-[#9333ea] focus:ring-4 focus:ring-[#9333ea]/15 transition-all ${
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
          <Label
            htmlFor="password"
            className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
          >
            Password <span className="text-[#9333ea]">*</span>
          </Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 6 characters"
              {...formRegister("password")}
              className={`h-11 sm:h-12 pl-10 pr-11 rounded-xl bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-sm focus:bg-white dark:focus:bg-slate-800 focus:border-[#9333ea] focus:ring-4 focus:ring-[#9333ea]/15 transition-all ${
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
          {errors.password ? (
            <p className="text-xs text-red-500 font-medium flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {errors.password.message}
            </p>
          ) : currentPassword.length > 0 ? (
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
                `Need ${6 - currentPassword.length} more characters`
              )}
            </p>
          ) : (
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Must be at least 6 characters
            </p>
          )}
        </div>

        {/* Submit CTA Button */}
        <div className="pt-2">
          <Button
            type="submit"
            className="w-full h-11 sm:h-12 bg-[#9333ea] hover:bg-[#7e22ce] active:bg-[#6b21a8] text-white font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all shadow-md shadow-[#9333ea]/25 hover:shadow-lg hover:shadow-[#9333ea]/35 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Join PGX MarketPlace</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>

        {/* Legal micro-copy */}
        <p className="text-[11px] text-center text-slate-400 dark:text-slate-500 leading-tight pt-1">
          By joining, you agree to our{" "}
          <Link href="/terms-of-service" className="underline hover:text-[#9333ea]">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy-policy" className="underline hover:text-[#9333ea]">
            Privacy Policy
          </Link>
          .
        </p>
      </form>

      {/* Switch to Sign In */}
      <div className="mt-6 sm:mt-7 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-5">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-bold text-[#9333ea] hover:text-[#7e22ce] hover:underline uppercase tracking-wider ml-1 inline-flex items-center gap-1"
        >
          Sign in
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

export default withPublicRoute(RegisterPage);
