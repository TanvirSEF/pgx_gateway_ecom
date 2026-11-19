"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForgotPassword } from "@/lib/api/auth";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, KeyRound, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const forgotPasswordMutation = useForgotPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await forgotPasswordMutation.mutateAsync({ email: email.trim().toLowerCase() });
      setIsSubmitted(true);
      toast.success("Reset link sent if account exists");
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(apiError.response?.data?.message || "Something went wrong");
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6 text-center"
      >
        <div className="w-16 h-16 bg-[#9333ea]/10 text-[#9333ea] rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-xs border border-[#9333ea]/20">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
            Check your email
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
            We&apos;ve sent a password reset link to{" "}
            <span className="font-semibold text-slate-900 dark:text-white">{email}</span>. Please
            check your inbox and follow the instructions.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/login"
            className="text-xs font-bold uppercase tracking-wider text-[#9333ea] hover:underline inline-flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to sign in
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9333ea]/10 text-[#9333ea] text-[11px] font-bold uppercase tracking-wider mb-2.5">
          <KeyRound className="w-3 h-3" />
          Account Recovery
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
          Forgot Password
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
          Enter your email and we&apos;ll send you password reset instructions.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label
            htmlFor="forgot-email"
            className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
          >
            Email address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              id="forgot-email"
              type="email"
              autoComplete="email"
              placeholder="user@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 sm:h-12 pl-10 pr-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-sm focus:bg-white dark:focus:bg-slate-800 focus:border-[#9333ea] focus:ring-4 focus:ring-[#9333ea]/15 transition-all"
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={forgotPasswordMutation.isPending}
          className="w-full h-11 sm:h-12 bg-[#9333ea] hover:bg-[#7e22ce] active:bg-[#0082cf] text-white font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all shadow-md shadow-[#9333ea]/25 hover:shadow-lg hover:shadow-[#9333ea]/35 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer mt-2"
        >
          {forgotPasswordMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Sending link...</span>
            </>
          ) : (
            <span>Send Reset Link</span>
          )}
        </Button>

        <div className="text-center pt-3 border-t border-slate-100 dark:border-slate-800">
          <Link
            href="/login"
            className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 font-bold inline-flex items-center gap-1.5 transition-colors text-xs uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to sign in
          </Link>
        </div>
      </form>
    </motion.div>
  );
}
