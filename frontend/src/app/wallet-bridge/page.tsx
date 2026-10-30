"use client";

// Implements: Phase 4 - PGXSports wallet-bridge page. Receives the PGX
// Casino handoff (?token=...) and starts Stripe Checkout.
//
// Deliberately outside every route group ((account)/(auth)/(store)) and
// NOT behind any auth guard: the visitor has no PGXSports session yet -
// identity/amount come from the signed handoff token itself, verified
// server-side by POST /wallet-bridge/redeem. This page never reads or
// trusts a user id/amount from the URL or local state; it only forwards
// the opaque token and acts on the server's verified response.
//
// "use client" + Suspense-wrapped content, matching this repo's own
// precedent for a useSearchParams page - see
// src/app/(account)/my-account/wallet/page.tsx.
import React, { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { Loader2, ShieldAlert } from "lucide-react";

import { useRedeemWalletHandoff } from "@/lib/api/wallet-bridge";
import type { RedeemWalletHandoffErrorBody } from "@/types";

/** The browser must never be sent anywhere except Stripe's own Checkout
 * host - the one piece of this response that is a URL, so it is the one
 * piece worth re-verifying client-side even though the server already
 * only ever constructs it from Stripe's own session object. */
function isStripeCheckoutUrl(url: string): boolean {
  try {
    return new URL(url).hostname === "checkout.stripe.com";
  } catch {
    return false;
  }
}

const ERROR_MESSAGES: Record<NonNullable<RedeemWalletHandoffErrorBody["code"]>, string> = {
  MISSING_TOKEN: "This payment link is missing its token.",
  EXPIRED: "This payment link has expired. Please go back to PGX Casino and start a new deposit.",
  TAMPERED: "This payment link is invalid.",
  REPLAYED: "This payment link has already been used. Please go back to PGX Casino and start a new deposit.",
  INVALID_CLAIMS: "This payment link is invalid.",
  INVALID_AMOUNT: "The deposit amount on this payment link is invalid.",
  UNSUPPORTED_CURRENCY: "The currency on this payment link is not supported.",
  RETURN_URL_NOT_ALLOWLISTED: "This payment link is invalid.",
  NOT_CONFIGURED: "Payments are temporarily unavailable. Please try again shortly."
};

const GENERIC_ERROR = "Something went wrong starting your payment. Please go back to PGX Casino and try again.";

type BridgeState = "redeeming" | "redirecting" | "error";

function WalletBridgeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [state, setState] = useState<BridgeState>("redeeming");
  const [errorMessage, setErrorMessage] = useState<string>(GENERIC_ERROR);
  // Guards against React Strict Mode's double-invoke AND against this
  // effect re-firing for any other reason - the token is one-time-use, so
  // a second POST from this same page load must never happen client-side
  // (the server also independently refuses it - REPLAYED - but the
  // browser should not even try).
  const hasInitiatedRef = useRef(false);
  const redeemHandoff = useRedeemWalletHandoff();

  useEffect(() => {
    if (hasInitiatedRef.current) return;

    if (!token) {
      setErrorMessage(ERROR_MESSAGES.MISSING_TOKEN);
      setState("error");
      return;
    }

    hasInitiatedRef.current = true;

    redeemHandoff.mutate(
      { token },
      {
        onSuccess: (data) => {
          if (data.checkoutUrl && isStripeCheckoutUrl(data.checkoutUrl)) {
            setState("redirecting");
            window.location.href = data.checkoutUrl;
            return;
          }
          setErrorMessage(data.checkoutError || GENERIC_ERROR);
          setState("error");
        },
        onError: (error) => {
          if (axios.isAxiosError<RedeemWalletHandoffErrorBody>(error)) {
            const code = error.response?.data?.code;
            setErrorMessage((code && ERROR_MESSAGES[code]) || error.response?.data?.message || GENERIC_ERROR);
          } else {
            setErrorMessage(GENERIC_ERROR);
          }
          setState("error");
        }
      }
    );
    // Intentionally run once per mount only - token is read once above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state === "error") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
        <ShieldAlert className="h-10 w-10 text-amber-500" />
        <p className="max-w-md text-sm text-muted-foreground">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">
        {state === "redirecting" ? "Redirecting you to Stripe..." : "Verifying your payment link..."}
      </p>
    </div>
  );
}

export default function WalletBridgePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      }
    >
      <WalletBridgeContent />
    </Suspense>
  );
}
