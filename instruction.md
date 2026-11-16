---
applyTo: "**"
---

## Copilot Rules for this project

## General

- Remove unnecessary imports and console.log statements before commits.
- Commit messages must follow the Conventional Commits format (feat:, fix:, refactor:, etc.).
- ESLint and Prettier rules must be fully enforced.
- Prettier settings: singleQuote: false, trailingComma: none, printWidth: 100, import ordering and separation enabled.

## TypeScript

- The any type must not be used.
- All type definitions must be located under src/types.
- Type files must be written in kebab-case (e.g., user.ts, site-config.ts).
- Type names use PascalCase without a Type suffix (e.g., User, SiteConfig). Prefer const user: User = over const user: UserType =.
- Use interface for object shapes, and type for unions or advanced type compositions.

## Environment Variables

- Environment variables must be managed with @t3-oss/env-nextjs.
- The src/env.ts file must be the single source of truth across the project.
- Environment variables must be validated with Zod and used with the NEXT*PUBLIC* prefix.

## Functions & Hooks

- Custom hooks must always start with use (e.g., useUsers).
- Custom hook files must live under src/hooks and be named in kebab-case (e.g., use-users.ts).
- Hook function names must be written in camelCase.
- Functions must have a single responsibility, kept simple and focused.

## State Management

- Use React Context providers for global state management.
- Provider files must live under src/providers and use PascalCase (e.g., CounterProvider.tsx).
- Provider hooks must be named in the useX form (e.g., useCounter).

## Data Fetching

- HTTP requests must be made with Axios.
- Axios calls must be made through the get, post, put, del helpers in src/lib/api.ts.
- Use TanStack Query hooks (useQuery, useMutation) for data operations across the project.
- Handle errors with try/catch and user feedback mechanisms such as toasts.

## Components & Structure

- All file and folder names must be kebab-case (e.g., locale-switcher, query-client.ts).
- Component files (widgets, layouts) must be PascalCase (e.g., UserList.tsx).
- UI components must be kebab-case (e.g., button.tsx).
- In components/widgets, folder names must be kebab-case and component files inside must be PascalCase.
- Prop and variable names must be intent-driven (e.g., onSubmit, isLoading, variant).
- Shadcn/UI components under components/ui must be kept as-is; do not modify them.
- Reusable components must be placed under src/components; domain-specific components must be under src/component subfolders (e.g., src/app/user/component/UserList.tsx).

## Naming Conventions

- Folders and base files must be named in kebab-case.
- Components (widgets, layouts, pages) must be named in PascalCase.
- UI components must be named in kebab-case.
- Helper and util files must be named in kebab-case (e.g., format-currency.ts).
- Hook files must be kebab-case and start with use- (e.g., use-users.ts).
- Hook function names must be camelCase and start with use (e.g., useUsers).
- Data files live under src/data and use kebab-case (e.g., user.ts, stack.ts).
- Icon components must be PascalCase and end with Icon (e.g., ReactIcon).
- Type and interface names must be PascalCase without a Type suffix (e.g., User, SiteConfig).
- Type files live under src/types and use kebab-case (e.g., user.ts, site-config.ts).
- Constants must be written in SNAKE_CASE (e.g., DEFAULT_LOCALE).

## Utilities, Helpers & Constants

- Reusable functions must be kept under src/utils.
- Domain-specific or computation-focused functions must be under src/helpers.
- Constants must be defined under src/constants and must not be kept inside components.
- Static or mock data must be placed under src/data; variable names may end with Data (e.g., stackData).

## Styling & Design

- Tailwind CSS must be used exclusively.
- Inline styles are forbidden.
- Prefer soft and pastel tones in the design.
- Layout, spacing, and alignment must be handled with Tailwind utility classes.

## Accessibility (a11y)

- All components must comply with accessibility standards.
- Use appropriate aria attributes where necessary.
- Wrap meaningful images with semantic <figure> elements for proper context and captions.

## Icons

- All icons must be sourced from the lucide-react library.
- Do not mix different icon libraries.

## Project Defaults

- Use Next.js App Router APIs for cookie operations.
- On the server, use cookies() (next/headers), middleware, or NextResponse.cookies.set inside route handlers; on the client side, use the cookie helper functions from src/lib/cookie-client.ts.
- Use src/lib/date.ts helpers for date formatting; use Intl for number and currency formatting when needed.
- Use @sindresorhus/slugify for slug generation.
- General-purpose helper hooks may be used from usehooks-ts (e.g., useLocalStorage, useMediaQuery, useDebounceValue).

## Precedence

- In case of any rule conflicts, repository-specific rules take precedence over global rules.

---

# PGX Gateway Commercial & Integration Protocol Instructions

## 1. Arxopay Partner Fee Policy & Go-Live Pop-Up Protocol
- **No Client-Direct Setup or Maintenance Fees**: For all sub-merchants under the Arxopay partner umbrella (`resellerId === 'ARXO' || resellerId === 'arxopay' || refId.startsWith('ARXO-')`), clients are never charged setup fees or recurring monthly maintenance fees directly. Any client-facing fee modals or payment steps are strictly suppressed.
- **Wholesale Go-Live Setup Fee ($499 via Crypto Only)**:
  - When the Arxopay partner desk requests "Go Live" for an approved sub-merchant, a pop-up modal appears directly to Arxopay.
  - Arxopay pays the wholesale setup fee of **$499.00 USD** to PGX Gateway on behalf of the merchant.
  - Payment options are strictly **Crypto Only** (USDT TRC-20, USDT ERC-20, BTC, USDC). Stripe and credit card payment options are strictly forbidden for partner wholesale fees.
  - The partner submits the payment transaction hash (TxID), which is recorded in `merchant.arxopayWholesale.setupFee` for underwriter verification.
- **Wholesale Recurring Monthly Maintenance ($499 via Crypto Only)**:
  - From the exact timestamp a merchant goes live, a 30-day recurring maintenance cycle is initiated.
  - When 30 days elapse, a pop-up and alert banner appear to Arxopay: *"This merchant is due to pay monthly fees to PGX Gateway. Amount: $499.00 USD (Crypto options only)."*
  - Arxopay submits the $499 payment via Crypto with the TxID, resetting the 30-day timer for the next cycle.

## 2. 24-Hour Integration Sandbox Guardrails & Auto-Expiry
- **Strict Pre-Activation Lock**:
  - A newly registered or unapproved merchant cannot access trial integration credentials, API endpoints, SDK snippets, or their Merchant Reference ID if Admin / Underwriting has not manually turned on the 24-hour trial period.
  - The API & Integration workspace remains locked with an explicit *"Integration Workspace Locked — Awaiting Underwriter Review"* banner.
  - Any checkout session initiated via `POST /api/v1/checkout/session` for a merchant without an active trial will return `403 TRIAL_NOT_ACTIVATED`.
- **24-Hour Auto-Expiry**:
  - Once turned on by Admin, the trial runs for exactly 24 hours.
  - If 24 hours elapse without the merchant or partner completing permanent live conversion, trial status is set to `expired`.
  - Integration workspace credentials and checkout session creation are immediately disabled with `403 TRIAL_EXPIRED`.

## 3. Pre-Offer Privacy & Zero Commercial Leaks
- Before an underwriter officially reviews a merchant's business documents and dispatches a customized commercial offer (`!offer.isAvailable || !offer.rate`):
  - All commercial metric cards (`Interchange / Rate`, `Volume Ceiling`, `Settlement Cadence`, `Rolling Reserve`, `Setup Fee`, `Monthly Fee`) must display `—` (dash) with subtitles stating `"Pending review"`.
  - Footers must state `"Underwriting review"`.
  - No default percentages, presets, or rates may be leaked or printed on the merchant's screen before the offer is officially sent.

## 4. Arxopay Reseller Ledger
- Arxopay partner administrators have a dedicated transaction ledger (`TransactionsTab` in the admin portal and `GET /api/v1/reseller/arxo/overview`) tracking:
  - All sub-merchants in their portfolio.
  - Gross processing volume per merchant.
  - Hardwired platform fee (9%).
  - Reseller profit spread margin (`+${txn.resellerProfitAmount}`).
  - Total merchant net pool and individual transaction history.
