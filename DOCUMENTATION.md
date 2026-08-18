# KSE Sentinel — Frontend Documentation

Next.js 14 (App Router) + TypeScript dashboard for KSE Sentinel, talking to the live backend at
`https://kse-sentinel-backend-docker.onrender.com` through server-side route handlers — the API key
and tenant scoping never reach the browser.

---

## 1. Quick start

```bash
npm install
cp .env.example .env.local   # fill in the real values
npm run dev
```

### Environment variables (`.env.local`, never committed)

| Variable | Value |
|---|---|
| `BACKEND_BASE_URL` | `https://kse-sentinel-backend-docker.onrender.com/api/v1` |
| `API_KEY` | the shared team API key |

---

## 2. Theming — light & dark

Every color in the app is a CSS variable (`app/global.css`, `:root` for light / `.dark` for dark),
bound into Tailwind via `tailwind.config.ts`. Palette adapted from the ksedash design:

| Token | Light | Dark |
|---|---|---|
| `navy` (buttons/accents) | `#1A2B4C` | `#3D5AB0` (brightened so white text stays legible) |
| `gold` (accent) | `#A37B2C` | `#FACC15` |
| `bg` / `panel` / `tint` | paper white | near-black `#09090B` "B/W" theme |
| `ink` (headings/body text) | `#111827` | `#F4F4F5` |
| `slate` (secondary text) | `#4B5563` | `#A1A1AA` |

A toggle button (`components/theme-toggle.tsx`) sits in the landing header and every dashboard
topbar. Preference persists to `localStorage`; an inline script in `app/layout.tsx` applies it
before paint to avoid a flash.

**One naming gotcha worth knowing:** `navy` is used for solid button fills (`bg-navy text-white`)
and therefore stays a mid-tone blue in both themes. `ink` is the one that flips toward white in
dark mode, used for headings/body text. They used to be the same token (`text-navy` for headings)
which broke in dark mode — don't merge them back.

## 3. Timeframe (1H / 1D)

Nearly every backend endpoint takes a `timeframe` query param. `context/timeframe-context.tsx`
holds the selected value app-wide (persisted to `localStorage`), with a toggle
(`components/timeframe-toggle.tsx`) in the topbar. Pages that call timeframe-aware endpoints read
`useTimeframe()` and include it in their `apiGet` calls — see `app/(dashboard)/dashboard/page.tsx`
for the pattern.

## 4. Tenant ID — how it's scoped

Almost every protected endpoint requires an `X-Tenant-ID` header. This is **not** passed manually
per page — it's centralized:

1. `app/api/login/route.ts` calls the backend, then tries a short list of candidate field names
   (`tenant_id`, `tenantId`, nested under `user`/`tenant`) to find the tenant id in the response,
   and stores it in an `httpOnly` cookie (`lib/tenant.ts`, `TENANT_COOKIE`).
2. `lib/api-server.ts`'s `backendFetch()` reads that cookie on every server-side call and attaches
   `X-Tenant-ID` automatically, unless the caller explicitly overrides it.

**The exact field name for tenant id in the login response wasn't confirmed against a live
response** (the Swagger export only showed a generic `"string"` example). If sign-in succeeds but
every subsequent tenant-scoped call 422s, start here — log the raw login response and adjust the
candidate list in `lib/tenant.ts`.

The refresh-token cookie forwarding (`app/api/login/route.ts`, `app/api/refresh/route.ts`) is
similarly best-effort and unverified end-to-end for the same reason — check the browser's
network tab after a real login if silent session refresh doesn't seem to be working.

## 5. Pages

| Route | What it's for |
|---|---|
| `/` | Marketing landing page |
| `/login`, `/register` | Auth |
| `/dashboard` | Overview — positions, recent signals, kill switch status |
| `/dashboard/signals` | Live signal ledger |
| `/dashboard/trade-log` | Open positions / closed trades |
| `/dashboard/kill-switch` | Status, activate/deactivate with a typed reason, history |
| `/dashboard/daily-report` | Plain-language daily summary + risk flags |
| `/dashboard/analytics` | Screener — mean-reversion z-score, liquidity percentile, relative strength across the whole watchlist |
| `/dashboard/fundamentals` | Ticker lookup: real fundamentals + corporate DCF-style analysis + a sentiment-scoring scratchpad |
| `/dashboard/sizing` | Every sizing tier, real validated backing, select-a-tier action |
| `/dashboard/ops` | System health (heartbeat, scan health, forward-paper progress, strategy breakdown, lot-size verification) + an incident log |

## 6. API route handlers

Every backend endpoint has a matching `/api/...` route handler in this project — 35 in total,
covering auth, live signals, trade log, kill switch, daily report, corporate analysis, market
data + sync, paper trading orders, portfolio scan, tearsheets, manual observations, sizing tiers,
fundamentals + filing ingestion, the five analytics endpoints, all six ops/health endpoints, and
the incident log. Browser code never calls the backend directly — always through these.

### On response shapes

The exact field names for several endpoint groups weren't confirmed against the live schema (the
Swagger export only showed generic `"string"` examples for many of them — not the real Pydantic
response models). Two different strategies are used depending on how much was actually knowable:

- **Live signals, trade log, kill switch, daily report, screener, sizing tiers** — the docs
  described these clearly enough in prose to normalize with confidence. `lib/normalize.ts` picks
  from a short list of likely candidate field names (snake_case first, FastAPI convention) and
  falls back to `null` → rendered as `—`.
- **Fundamentals, corporate analysis, sentiment, and all six ops/health endpoints** — genuinely
  unknown shape. These render through `components/dashboard/kv-block.tsx`, a generic
  label/value renderer that formats whatever JSON comes back (snake_case → Title Case labels,
  numbers formatted, nested objects/arrays handled recursively) rather than guessing field names
  and silently dropping real data. **Once a shape is confirmed, it's worth promoting that
  endpoint to a hand-built view** the way Live Signals already has, for a more polished look.

## 7. Design system

- **Type:** Source Serif 4 (headings), IBM Plex Sans (body), IBM Plex Mono (tabular/numeric data).
- **Shape:** rounded corners throughout — pill buttons, `rounded-2xl` cards.
- **Charts:** step-plotted, not smoothed (`components/step-chart.tsx`) — a line never implies more
  precision than the underlying signal has.
- Every async page has three states: loading (spinner + plain description), error (friendly card
  + "Try again"), empty (explains *why* it's empty). See `components/dashboard/async-state.tsx`.

## 8. Ground rules

1. Decision-support only — never imply the system places trades autonomously.
2. Don't reach into the backend's database directly; missing fields are backend feedback.
3. The API key is a shared team credential — keep `.env.local` gitignored.
4. If an endpoint's real response shape turns out to differ from what's assumed here, that's a
   one-line fix in `lib/normalize.ts`, not a page rewrite — the pages only ever read from the
   stable types in `lib/types.ts`.
