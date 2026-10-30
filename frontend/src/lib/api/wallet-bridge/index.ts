"use client";

// Implements: Phase 4 - PGXSports wallet-bridge page
import { useMutation } from "@tanstack/react-query";

import { api as instance } from "@/lib/api";
import type { ApiResponse, RedeemWalletHandoffPayload, RedeemWalletHandoffResponse } from "@/types";

/** Redeems a PGX Casino payment handoff token (one-time use). The token
 * carries its own signed identity/amount - this call needs no PGXSports
 * session/cookie. */
export const useRedeemWalletHandoff = () => {
  return useMutation({
    mutationFn: async (payload: RedeemWalletHandoffPayload) => {
      const response = await instance.post<ApiResponse<RedeemWalletHandoffResponse>>(
        "/wallet-bridge/redeem",
        payload
      );
      return response.data.data;
    }
  });
};
