# PGXSports Shared-Wallet Stripe Integration — Client Deployment Guide

**Date:** 2026-10-29 · **Audience:** the PGXSports development team (you control the PGXSports
frontend and backend repositories) · **Companion files:**
`PGXSports_Stripe_Wallet_Integration_Final_2026-10-29.zip` (the source delivered alongside this
guide), the `PGX_Shared_Wallet_Visual_Explainer.pdf` and `PGX_Shared_Wallet_MongoDB_Technical
Documentation` you already have from the architecture phase.

This guide explains what changed, why, and exactly what you need to configure and test before this
goes live. **No secret values are included anywhere in this guide or the ZIP** — every credential
below is a name only; the actual values must be exchanged with the PGX Casino team through your own
secure channel (password manager, vault, etc.), never through chat, email, or a committed file.

---

## 1. What this integration does, in one paragraph

A PGX Casino player clicks "Add Funds," is handed a short-lived signed token, lands on a new page on
**your** PGXSports frontend (`/wallet-bridge`), which redeems that token with **your** PGXSports
backend and starts a Stripe Checkout session. The player pays on Stripe's own page, Stripe calls your
backend's webhook, your backend verifies it and credits the shared wallet via PGX Casino's Central
Wallet Service. The player is returned to PGX Casino, which checks a status endpoint (also on your
backend) to confirm the specific payment was credited before showing success.

---

## 2. Which frontend files changed (PGXSports frontend)

All new - nothing existing was modified:

| File | Purpose |
|---|---|
| `src/app/wallet-bridge/page.tsx` | **New page.** Receives `?token=...`, calls `POST /wallet-bridge/redeem` once, redirects to Stripe Checkout only if the returned URL's host is `checkout.stripe.com`. |
| `src/lib/api/wallet-bridge/index.ts` | TanStack Query mutation hook for the redeem call, using your existing `src/lib/api.ts` axios instance (no new HTTP client). |
| `src/types/wallet-bridge.ts` | Request/response TypeScript types for the above. |
| `src/types/index.ts` | One new export line for the file above. |

No existing page, component, or service was touched. Your existing "Universal Wallet Top-Up" UI
(`WalletPill.tsx`, `/my-account/wallet`) is untouched and continues to work exactly as before.

## 3. Which backend files changed (PGXSports backend)

**New files** (in `src/modules/casino-topup/`):

| File | Purpose |
|---|---|
| `casino-topup-status.types.ts` | The 5 payment/credit states (see §12). |
| `casino-topup-status.service.ts` | Looks up one top-up by id, enforces it belongs to the requesting player, maps its stored status fields to one of the 5 states. |
| `casino-topup-status.guard.ts` | Verifies the shared-secret header on the status endpoint. |
| `casino-topup-status.controller.ts` | `GET /casino-topup/status/:topupId` - the endpoint itself. |
| `casino-topup-status.service.spec.ts`, `casino-topup-status.guard.spec.ts` | Automated tests for the two files above (14 tests, all passing - see §15). |

**One modified file**: `casino-topup.module.ts` - registers the new controller and service. Nothing
else in this file changed; the existing webhook, checkout-session, and recovery logic are untouched.

**No database schema change** - the status endpoint reads two fields (`paymentStatus`,
`walletCreditStatus`) that already exist on your `wallet_topups` collection from the earlier phase of
this integration.

---

## 4. How to integrate this into your own repositories

1. Copy `frontend/src/app/wallet-bridge/`, `frontend/src/lib/api/wallet-bridge/`, and
   `frontend/src/types/wallet-bridge.ts` into your frontend repo at the same paths. Add the one export
   line from `frontend/src/types/index.ts` (diff it against your current file - it is a single
   addition).
2. Copy the 6 new files under `backend/src/modules/casino-topup/` listed above into your backend repo
   at the same path. Apply the one-line addition to `casino-topup.module.ts` (diff it against your
   current file).
3. If your copy of this integration has diverged from the ZIP's starting point, treat the ZIP's
   `casino-topup`, `wallet-topup`, `wallet-bridge`, `global-user-link`, and `wallet-service-client`
   module folders as the reference implementation - diff rather than overwrite if you have made your
   own local changes since the earlier delivery.

---

## 5. Required packages

No new dependency was added to either `package.json`. The backend already has `stripe`, `@nestjs/*`,
and `mongoose`/MongoDB driver from the earlier phase of this integration; the frontend already has
`@tanstack/react-query` and `axios`. Run your normal install (`npm ci`) after pulling these files in -
nothing new to add to either lockfile.

---

## 6. Required Prisma migrations

The Postgres side (global user linking) was already migrated in an earlier phase:
`prisma/migrations/20260923100342_final` and `prisma/migrations/20261029000000_phase2_global_user_link`
(creates `global_user_links` and `handoff_nonces`). **Neither has been applied to any live database
by us** - no live `DATABASE_URL` is reachable from our environment. If your database does not yet have
these tables, run:
```
npx prisma migrate deploy
```
against your target database before deploying this code. This integration's new piece (the status
endpoint) requires **no new migration** - it only reads existing Postgres/Mongo data.

---

## 7. Required MongoDB configuration

No change to the MongoDB schema. Confirm your existing `wallet_topups` collection (created in the
earlier phase) has these unique indexes already in place (idempotency protection):
- `idempotencyKey` (unique)
- `stripeEventId`/equivalent event-id field (unique) - prevents double-crediting on a duplicate
  webhook delivery.

If you are standing this up fresh, the backend's own startup code creates these indexes
idempotently (`createIndex(..., { unique: true })` - safe to run repeatedly, including on an
already-indexed collection).

---

## 8. Required Stripe test-mode configuration

**Updated 2026-11-02:** this integration now uses the **same** Stripe secret key and webhook signing
secret as your existing e-commerce account (`STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET`) - there is no
separate `CASINO_TOPUP_STRIPE_*` pair any more. This was originally built as a **deliberately
separate** credential pair specifically because an e-commerce-approved Stripe account should not
conceal casino/gambling wallet funding; merging them back onto one account was an explicit client
decision after confirming both pairs already held the identical value, not a default - see
`casino-topup-stripe.config.ts`'s header comment.

A **second, dedicated webhook endpoint is still required** regardless of the account merge: Stripe
issues a unique signing secret per registered endpoint, and the casino top-up flow is served by its
own route, **`POST /api/webhook/casino-stripe`** (not `/casino-topup/webhook` - that path doesn't
exist in the code; use the route above). Configure that endpoint in the Stripe dashboard, subscribed
to at least `checkout.session.completed`, `checkout.session.async_payment_failed`, and
`checkout.session.expired`, pointed at your deployed backend URL + that path. Without this second
endpoint, casino top-up payments will never reach the casino-topup webhook handler even though the
account/key is shared. Use Stripe's test card `4242 4242 4242 4242` for a successful test-mode payment.

🔴 **Before any REAL money flows**: running casino-wallet funding through an e-commerce-approved
Stripe account is the trade-off the client explicitly accepted on 2026-11-02, not a resolved
compliance question - revisit before going live with real money, per the architecture doc's own
launch checklist ("Confirm the intended business and funds use are permitted").

---

## 9. Required Casino ↔ PGXSports service credentials

These are shared secrets - **the exact same value** must be configured on both sides. **Share these
values with the PGX Casino team through your own secure channel, never in chat/email/a file.**

| Variable (on your side) | Direction | Must match PGX Casino's... |
|---|---|---|
| `CASINO_HANDOFF_SECRET` | Casino → PGXSports | the same name, on their side (signs the one-time handoff token) |
| `WALLET_SERVICE_API_KEY` | PGXSports → Casino | the same name, on their side (authenticates your backend's calls to their `/internal/wallet/*`) |
| `CASINO_TOPUP_STATUS_API_KEY` | Casino → PGXSports | the same name, on their side (authenticates their backend's calls to your new status endpoint) |

Each of these three is a **separate, dedicated secret** - do not reuse one for another, and do not
reuse any of them for `JWT_SECRET` or any other existing credential. If one leaks, rotating it does
not affect the other two.

---

## 10. Required handoff and return URLs

| Variable (on your side) | What it is |
|---|---|
| `FRONTEND_URL` | Your PGXSports frontend's public base URL - already configured from the earlier phase. |
| `CASINO_HANDOFF_RETURN_URL_ALLOWLIST` | Comma-separated allowlist of `returnUrl` values a handoff token is permitted to carry - already configured from the earlier phase. |

**On the Casino side** (for your awareness - you do not configure this, but it must point at the page
in §2): `PGXSPORTS_WALLET_BRIDGE_URL` must be set to `https://<your-domain>/wallet-bridge` once this
is deployed. Tell the PGX Casino team your deployed URL before they enable this flow on their end.

---

## 11. How to build and deploy both applications

Standard build for both - nothing special was introduced by this change:

**Backend:**
```
npm ci
npx prisma generate
npx prisma migrate deploy   # only if §6's migrations are not yet applied
npm run build                # or your existing build/deploy pipeline
```

**Frontend:**
```
npm ci
npm run build
```
Confirm `/wallet-bridge` appears in the build's route output (it is a static/dynamic App Router page,
no special config needed).

Deploy both through your normal process. **We have not deployed anything** - this delivery is source
only.

---

## 12. How to test the Stripe Checkout flow

1. On PGX Casino (staging), trigger "Add Funds" via their PGXSports-based Stripe option - this
   produces a URL like `https://<your-domain>/wallet-bridge?token=<signed-jwt>`.
2. Confirm the bridge page briefly shows "Verifying your payment link..." then redirects to a real
   `https://checkout.stripe.com/...` URL.
3. Complete payment with Stripe's test card `4242 4242 4242 4242`.
4. Confirm you land back on PGX Casino's return URL with `?status=success&topup=casino-topup:<uuid>`
   in the query string.
5. Negative cases worth checking manually: reload the bridge page with the SAME token a second time
   (should show "this payment link has already been used," never start a second Checkout session);
   let a token sit unused past its expiry (~60-180 seconds) and then open it (should show "this
   payment link has expired").

## 13. How to verify webhook settlement and wallet credit

The 5 states your new status endpoint reports (`GET /casino-topup/status/:topupId`), derived from the
`paymentStatus` and `walletCreditStatus` fields already stored on the `wallet_topups` document:

| State | Meaning |
|---|---|
| `PENDING_PAYMENT` | Checkout started, Stripe has not confirmed success or failure yet. |
| `PAYMENT_FAILED` | Stripe reported the payment failed, expired, or was cancelled. No credit was issued. |
| `PAYMENT_SUCCEEDED_CREDIT_PENDING` | Stripe confirmed payment; the Central Wallet Service credit is still in flight. |
| `PAYMENT_SUCCEEDED_CREDIT_COMPLETED` | Payment confirmed AND the wallet credit succeeded - this is the only state the Casino frontend treats as "done." |
| `CREDIT_REQUIRES_ATTENTION` | Payment succeeded but the wallet credit itself failed - your existing recovery service retries this automatically; it is surfaced as its own state rather than lumped in with "pending" so it is visible to support/ops. |

To verify end-to-end: after a successful test payment, call (or have the PGX Casino side call)
`GET /casino-topup/status/<the topupId from the return URL>` with the `x-casino-status-key` header,
and confirm it reaches `PAYMENT_SUCCEEDED_CREDIT_COMPLETED` within a few seconds of the webhook firing.
Your backend logs (webhook service) will show the exact webhook event id and ledger id for cross-
reference.

## 14. How to roll back safely

This feature is **additive and fails closed**:
- **Frontend:** removing `src/app/wallet-bridge/` (or simply not deploying it) returns the site to
  its exact prior state - nothing else references this route.
- **Backend:** removing the `CasinoTopupStatusController`/`Service` registration from
  `casino-topup.module.ts` (reverting that one line) removes only the new status endpoint; the
  existing webhook/checkout/recovery logic (built in an earlier phase) is independent of it and
  continues to work either way.
- **Rollback note (updated 2026-11-02):** since the account merge, `STRIPE_SECRET_KEY`/
  `STRIPE_WEBHOOK_SECRET` are now shared with the storefront's own checkout - unsetting them to
  disable casino top-ups would also disable the storefront. The isolated "unset two vars" rollback
  from before the merge no longer applies. To disable only the casino top-up feature now, remove the
  `CasinoTopupModule`'s registration (or its controller routes) instead - see the `casino-topup.module.ts`
  rollback note above for the status endpoint; the same approach applies to the webhook/checkout
  controllers.
- No database rows are deleted or mutated by a rollback - `wallet_topups` documents and
  `global_user_links`/`handoff_nonces` rows from before the rollback remain exactly as they were.

---

## 15. Test results (run by us, before this delivery)

| Check | Result |
|---|---|
| Backend `npx jest` (full suite, serial) | **92/92 passing** |
| Backend `npx tsc --noEmit` | **clean** |
| Backend `npx prisma validate` | **valid** |
| Frontend `npx tsc --noEmit` | **clean** |
| Frontend `npm run lint` | **zero findings** in anything this delivery changed (pre-existing, unrelated lint issues exist elsewhere in the repo - unchanged by us) |
| Frontend `next build` | **succeeded** - `/wallet-bridge` present in the route manifest |
| Frontend automated tests | **none exist in this repo** - `package.json` has no test script; this is a pre-existing gap, not something this delivery introduced |

A note on a flake you may see if you also run the backend's full suite with default (parallel)
workers: an occasional run may report a handful of unrelated failures with a `mongo.stop()`/teardown
error. We confirmed this is a `mongodb-memory-server`/parallel-Jest-worker resource contention issue,
not a code defect - it disappears under `npx jest --runInBand` (serial), which passed 92/92 twice in a
row for us. Worth isolating your test infrastructure's per-worker database if it bothers your CI.

---

## 16. What we have NOT done (by design, per our own task restrictions)

- Not deployed anything, anywhere.
- Not pushed or merged into any of your repositories or branches - this is a source delivery for your
  team to pull in on your own schedule.
- Not modified any PGX Casino repository.
- Not touched any production or staging database.
- Not activated real Stripe credentials or moved real money.
- Not removed or altered your existing "Universal Wallet Top-Up" UI, e-commerce Stripe integration, or
  any other existing feature.

Questions about this delivery should go back through the PGX Casino team contact who provided it.
