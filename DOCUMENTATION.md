# KSE Sentinel — Frontend Documentation

This is the client-facing dashboard for **KSE Sentinel**, built with Next.js 14 (App Router) and TypeScript. It talks to the live backend at `https://kse-sentinel-backend-docker.onrender.com` through server-side route handlers, so the API key never reaches the browser.

---

## 1. Quick start

```bash
npm install
cp .env.example .env.local   # fill in the real values, see below
npm run dev
```

Open `http://localhost:3000`.

### Environment variables (`.env.local`, never committed)

| Variable | Value |
|---|---|
| `BACKEND_BASE_URL` | `https://kse-sentinel-backend-docker.onrender.com/api/v1` |
| `API_KEY` | the shared team API key (get this from Ertiza Abbas via a private channel) |

No `NEXT_PUBLIC_` prefix on either — that would ship them to the browser. `config/env.ts` validates both are present at startup with `zod` and fails fast if either is missing.

---

## 2. Pages

| Route | What it's for |
|---|---|
| `/` | Marketing landing page |
| `/login` | Sign in |
| `/register` | Request access (new tenant) |
| `/dashboard` | Overview — open positions, recent signals, kill switch status, at a glance |
| `/dashboard/signals` | Full live signal ledger, with win-rate and average-return summary |
| `/dashboard/trade-log` | Open positions / closed trades, in tabs |
| `/dashboard/kill-switch` | Status, activate/deactivate with a required typed reason, and full history |
| `/dashboard/daily-report` | A one-paragraph, plain-language summary of the trading day plus any risk flags |

All five dashboard pages sit behind `app/(dashboard)/layout.tsx`, which renders the sidebar, the topbar, and a tenant-wide red banner that appears automatically whenever the kill switch is active — you don't have to wire that up per page.

---

## 3. How data flows

```
Browser component ("use client")
   │  fetch("/api/live-signals")            ← same-origin, no secret needed
   ▼
Next.js Route Handler  (app/api/live-signals/route.ts)
   │  backendFetch("/sentinel/live-signals") ← adds X-API-Key server-side
   ▼
KSE Sentinel backend  (kse-sentinel-backend-docker.onrender.com)
```

**Nothing in `components/` or `app/(dashboard)/**` ever calls the backend directly.** Every dashboard page calls one of our own `/api/...` routes via the small helper in `lib/api-client.ts` (`apiGet`, `apiPost`), and every route handler calls the real backend via `lib/api-server.ts` (`backendFetch`), which is the only place the API key is read. This mirrors the pattern from the API handoff package.

### Route handlers included

| Our route | Backend endpoint |
|---|---|
| `GET /api/live-signals` | `GET /sentinel/live-signals` |
| `GET /api/live-signals/summary` | `GET /sentinel/live-signals/summary` |
| `GET /api/trade-log/open` | `GET /sentinel/trade-log/open` |
| `GET /api/trade-log/closed` | `GET /sentinel/trade-log/closed` |
| `GET /api/trade-log/summary` | `GET /sentinel/trade-log/summary` |
| `GET /api/kill-switch/status` | `GET /kill-switch/status` |
| `POST /api/kill-switch/activate` | `POST /kill-switch/activate` |
| `POST /api/kill-switch/deactivate` | `POST /kill-switch/deactivate` |
| `GET /api/kill-switch/history` | `GET /kill-switch/history` |
| `GET /api/daily-report` | `GET /sentinel/daily-report` |
| `POST /api/login` | `POST /auth/login` |
| `POST /api/register` | `POST /auth/register` |
| `GET /api/health-check` | `GET /sentinel/health` |

Adding a new one (e.g. fundamentals) is the same three-line pattern every time — copy `app/api/daily-report/route.ts` and change the path.

---

## 4. About the response shapes — read this before changing types

The exact field names each endpoint returns (snake_case vs. camelCase, wrapped in `{ items: [...] }` vs. a bare array, etc.) weren't confirmed field-by-field against the live schema at the time this was built — only the endpoint list and top-level shape names were available. Rather than guess and risk a page crashing on a field that doesn't exist, every response is passed through a **normalization layer** in `lib/normalize.ts`:

- `extractArray(payload)` pulls the array out whether the backend returns a bare array or wraps it in `items` / `data` / `results` / a named key.
- `normalizeSignal`, `normalizeOpenPosition`, `normalizeClosedTrade`, `normalizeKillSwitchStatus`, `normalizeKillSwitchEvent`, and `normalizeDailyReport` each read a short list of *candidate* key names per field (e.g. `entry_price`, `entryPrice`, `entry`) and fall back to `null` if none match.
- Every page renders `null` as `—` instead of crashing, and shows a friendly empty state if a list comes back empty.

**Once the real field names are confirmed** (open `/docs`, expand a response schema, or ask the backend owner), tighten `lib/normalize.ts`: trim each `pick(...)` call down to the one real key name. The page components don't need to change — they only read from `lib/types.ts`, which stays stable.

---

## 5. Design system

- **Colors:** navy `#1E2761`, gold `#B8860B`, slate `#5B6B85`, on a light paper background — defined in `tailwind.config.ts`.
- **Type:** Source Serif 4 (headings), IBM Plex Sans (body), IBM Plex Mono (tabular/numeric data), loaded via `next/font/google` in `app/layout.tsx`.
- **Shape:** rounded corners throughout — pill buttons, `rounded-2xl` cards and panels.
- **Charts:** step-plotted, not smoothed (`components/step-chart.tsx`, `components/mini-chart.tsx`) — a deliberate choice so a line never implies more precision than the underlying signal has.

---

## 6. Built for people who don't live in this dashboard every day

A few concrete choices, since not everyone using this will be a full-time trader:

- **Every number has a label and a plain-language subtitle**, not just a metric name — e.g. "Kill switch: OFF — Trading active tenant-wide," not just "OFF."
- **Every async page has three states, always**: a loading spinner with a plain description, a friendly error card with a "Try again" button (never a blank white screen or a raw error), and an empty state that explains *why* it's empty and what will make it fill up.
- **Color is never the only signal.** Wins/losses/directions are always paired with text (`WIN`, `LONG`, `+2.4%`), not just green or red, so the dashboard still makes sense to someone who is colorblind or just skimming.
- **The kill switch requires typing a reason (8+ characters) and a second confirmation step** before it does anything — there's no accidental one-click way to halt trading for the whole desk.
- **The sidebar uses full words, not icon-only navigation** — "Live Signals," not a chart icon alone — so a new team member doesn't have to guess what anything means.

---

## 7. Ground rules (carried over from the API handoff package)

1. This is a **decision-support tool**, not an autonomous trading system — UI copy should never imply otherwise.
2. Don't reach into the backend's database directly; if an endpoint is missing a field you need, that's feedback for the backend owner, not something to work around client-side.
3. The API key is shared across the team — treat `.env.local` like a production credential, and make sure it's `.gitignore`d (it already is).
4. If an endpoint returns an unexpected shape, that's useful signal — update the relevant `normalize*` function and consider flagging it upstream.

---

## 8. Where things live

```
app/
  page.tsx                        landing page
  login/page.tsx, register/page.tsx
  api/                            route handlers (server-side, hold the API key)
  (dashboard)/layout.tsx          sidebar + topbar + kill-switch banner shell
  (dashboard)/dashboard/          overview, signals, trade-log, kill-switch, daily-report
components/
  dashboard/                      sidebar, topbar, stat-card, async-state (loading/error/empty)
  step-chart.tsx, mini-chart.tsx  chart primitives
context/
  kill-switch-context.tsx         shared, API-backed kill switch state
lib/
  api-server.ts                   server-only backend fetch helper (adds X-API-Key)
  api-client.ts                   browser-safe fetch helper for our own /api routes
  route-helpers.ts                shared error handling for route handlers
  normalize.ts                    adapts raw API responses into stable display types
  types.ts                        the stable shapes every page renders from
config/
  env.ts                          validates BACKEND_BASE_URL / API_KEY at startup
```
