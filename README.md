# KSE Sentinel — Next.js UI

Institutional, light-themed UI for the KSE Sentinel corporate multi-tenant engine, built with Next.js 14 (App Router), TypeScript, and Tailwind CSS.

## Pages included

| Route | Description |
|---|---|
| `/` | Marketing landing page — hero, risk governance, backtest-vs-live, statistical rigor, access tiers |
| `/login` | Sign in — invalid-credentials and lockout/backoff error states |
| `/register` | Request access — new tenant/user signup, mirrors `POST /api/v1/auth/register` |
| `/dashboard` | Overview — stat cards, live step chart, recent signals, open positions |
| `/dashboard/signals` | Live signal ledger — mirrors `GET /sentinel/live-signals` (+ summary) |
| `/dashboard/trade-log` | Open positions / closed trades tabs — mirrors `GET /sentinel/trade-log/*` |
| `/dashboard/kill-switch` | Status, activate/deactivate with typed reason, activation history — mirrors `GET/POST /kill-switch/*` |

The three dashboard pages share a sidebar shell (`app/(dashboard)/layout.tsx`) and a `KillSwitchProvider` context, so activating the kill switch on `/dashboard/kill-switch` immediately shows a tenant-wide red banner on every other dashboard page.

## Design system

- **Colors:** navy `#1E2761`, gold `#B8860B`, slate `#5B6B85`, on a light paper background (`#FBFAF7`) — defined in `tailwind.config.ts`.
- **Type:** Source Serif 4 (headings), IBM Plex Sans (body), IBM Plex Mono (tabular/numeric data) — loaded via `next/font/google` in `app/layout.tsx`.
- **Shape:** rounded corners throughout — pill buttons, `rounded-2xl`/`rounded-xl2` cards and panels.
- All data on the dashboard pages is mocked in `lib/mock-data.ts` — swap in real API calls to the endpoints listed above.

## Getting started

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

> Note: `next/font/google` fetches font files at build time, so the first `npm run build` or `npm run dev` needs internet access to `fonts.googleapis.com` / `fonts.gstatic.com`.

## Wiring to the real API

Swap the arrays in `lib/mock-data.ts` for `fetch()` calls to your FastAPI backend (e.g. `NEXT_PUBLIC_API_BASE_URL`), and replace the local `KillSwitchProvider` state with real calls to:

- `GET /api/v1/kill-switch/status`
- `POST /api/v1/kill-switch/activate`
- `POST /api/v1/kill-switch/deactivate`
- `GET /api/v1/kill-switch/history`

The login and register forms already have a `handleSubmit` you can point at `POST /api/v1/auth/login` and `POST /api/v1/auth/register` respectively.
