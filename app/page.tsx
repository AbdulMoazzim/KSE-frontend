import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/button";
import { Watermark } from "@/components/watermark";
import { StepChart } from "@/components/step-chart";
import { MiniChart } from "@/components/mini-chart";

const riskCards = [
  {
    title: "Fail-safe kill switch",
    desc: "A deliberately unmissable, hard-to-misclick control that requires a typed reason to activate or release — with a full audit history behind every event.",
    tag: "ADMIN-GATED · FAIL SAFE",
    icon: (
      <svg width={22} height={22} viewBox="0 0 34 34" fill="none">
        <circle cx="17" cy="17" r="13" stroke="#C0564F" strokeWidth={2.4} />
        <path d="M17 9v9" stroke="#C0564F" strokeWidth={2.4} strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Correlation-based gating",
    desc: 'Positions are blocked pre-entry when correlation to existing holdings crosses a threshold — the reason is logged and shown, e.g. "blocked: correlation ≥ 0.70 with open OGDC."',
    tag: "PRE-TRADE ENFORCEMENT",
    icon: (
      <svg width={22} height={22} viewBox="0 0 34 34" fill="none">
        <circle cx="12" cy="17" r="7" stroke="#1E2761" strokeWidth={2.2} />
        <circle cx="22" cy="17" r="7" stroke="#B8860B" strokeWidth={2.2} />
      </svg>
    ),
  },
  {
    title: "Concentration limits",
    desc: "Portfolio-level exposure caps enforced by the sizing engine, tiered conservative through growth, each with its own risk-per-trade percentage on record.",
    tag: "TIER-AWARE SIZING",
    icon: (
      <svg width={22} height={22} viewBox="0 0 34 34" fill="none">
        <rect x="5" y="18" width="5" height="10" rx="1.5" fill="#5B6B85" />
        <rect x="14.5" y="10" width="5" height="18" rx="1.5" fill="#1E2761" />
        <rect x="24" y="14" width="5" height="14" rx="1.5" fill="#B8860B" />
      </svg>
    ),
  },
];

const roles = [
  {
    name: "Trader",
    tone: "border-t-navy",
    title: "Views the desk",
    items: ["Live signals & positions", "Full trade history", "Kill switch status & history"],
  },
  {
    name: "Admin",
    tone: "border-t-gold",
    title: "Runs the tenant",
    items: [
      "Everything a trader can see",
      "Trigger / release the kill switch",
      "Create & revoke share links",
      "Manage tenant configuration",
    ],
  },
  {
    name: "Super admin",
    tone: "border-t-slate",
    title: "Platform-wide",
    items: ["Acts across all tenants", "Provisioned internally only", "Not a self-service signup"],
  },
];

export default function LandingPage() {
  return (
    <main>
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-line bg-[#FBFAF7]/85 px-10 py-4 backdrop-blur-md">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex">
          <a href="#governance" className="text-[13.5px] font-medium text-slate hover:text-navy">
            Risk Governance
          </a>
          <a href="#rigor" className="text-[13.5px] font-medium text-slate hover:text-navy">
            Statistical Rigor
          </a>
          <a href="#access" className="text-[13.5px] font-medium text-slate hover:text-navy">
            Access Tiers
          </a>
          <Link href="/login" className="text-[13.5px] font-medium text-slate hover:text-navy">
            Sign in
          </Link>
          <Button variant="gold" href="/register">
            Request access
          </Button>
        </nav>
      </header>

      {/* Hero */}
      <section
        id="top"
        className="relative overflow-hidden bg-gradient-to-b from-tint to-bg px-6 pb-14 pt-16 md:px-10 md:pt-24"
      >
        <Watermark />
        <div className="relative mx-auto grid max-w-[1180px] gap-14 md:grid-cols-[1.05fr_1fr] md:items-center">
          <div>
            <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-tint-gold px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-gold">
              Decision-support engine · PSX
            </span>
            <h1 className="mb-5 font-serif text-[38px] font-semibold leading-[1.16] tracking-tight text-navy md:text-[44px]">
              Every signal traces back to a rule. <em className="not-italic text-gold">Never a black box.</em>
            </h1>
            <p className="mb-8 max-w-[480px] text-[16.5px] leading-relaxed text-slate">
              KSE Sentinel runs two deterministic, rule-based strategy engines — intraday and investment horizon —
              across the Pakistan Stock Exchange, with correlation gating, a fail-safe kill switch, and a live
              forward-paper program that never gets confused with a backtest.
            </p>
            <div className="mb-7 flex flex-wrap gap-3.5">
              <Button variant="gold" href="/login">
                Sign in to your desk
              </Button>
              <Button variant="ghost" href="#governance">
                See how risk is governed
              </Button>
            </div>
            <p className="font-mono text-[11.5px] text-[#8A93B0]">
              JWT-authenticated · multi-tenant isolated · RBAC-scoped by role
            </p>
          </div>
          <StepChart />
        </div>
      </section>

      {/* Strip */}
      <div className="bg-tint px-6 md:px-10">
        <div className="mx-auto grid max-w-[1180px] gap-5 py-9 md:grid-cols-4">
          {[
            "Confluence-scored signals with full regime context — never a bare number.",
            "Correlation gating and concentration limits enforced pre-trade, not reported after the fact.",
            "Monte Carlo, walk-forward, and Deflated Sharpe validation, caveats intact.",
            "A currently-running live forward-paper program, visually distinct from backtests.",
          ].map((text, i) => (
            <div key={i} className="rounded-2xl border border-line bg-panel p-5">
              <div className="mb-2 font-mono text-[12px] font-medium tracking-wide text-gold">
                0{i + 1}
              </div>
              <div className="text-[13.5px] leading-relaxed text-slate">{text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk governance */}
      <section id="governance" className="px-6 py-20 md:px-10">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-12 max-w-[620px]">
            <span className="mb-3.5 block font-mono text-[11px] uppercase tracking-[0.18em] text-gold">
              Risk governance
            </span>
            <h2 className="mb-3.5 font-serif text-[29px] font-semibold leading-tight text-navy">
              Controls that are visible, not just functional.
            </h2>
            <p className="text-[15.5px] leading-relaxed text-slate">
              An institutional risk officer should see, at a glance, that these exist and are active — not have to
              dig for them.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {riskCards.map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-line bg-panel p-7 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-tint">
                  {card.icon}
                </div>
                <h3 className="mb-2.5 text-[17px] font-semibold text-navy">{card.title}</h3>
                <p className="mb-4 text-[14px] leading-relaxed text-slate">{card.desc}</p>
                <span className="inline-block rounded-full bg-tint px-2.5 py-1 font-mono text-[10.5px] tracking-wide text-navy">
                  {card.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Backtest vs live */}
      <section className="bg-tint px-6 py-20 md:px-10">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-12 max-w-[620px]">
            <span className="mb-3.5 block font-mono text-[11px] uppercase tracking-[0.18em] text-gold">
              Backtest vs. live
            </span>
            <h2 className="mb-3.5 font-serif text-[29px] font-semibold leading-tight text-navy">
              Two kinds of evidence, never shown as one.
            </h2>
            <p className="text-[15.5px] leading-relaxed text-slate">
              Everywhere backtested and live forward-tested results appear side by side, the distinction is visual,
              not a footnote.
            </p>
          </div>
          <div className="overflow-hidden rounded-xl2 border border-line bg-panel shadow-panel">
            <div className="grid md:grid-cols-2">
              <div className="p-8">
                <span className="mb-4 inline-block rounded-full bg-tint px-3 py-1.5 font-mono text-[10.5px] tracking-wide text-slate">
                  BACKTESTED
                </span>
                <h4 className="mb-2 text-[16px] font-semibold text-navy">Historical simulation</h4>
                <p className="mb-4 text-[13.5px] leading-relaxed text-slate">
                  Walk-forward validated against the archive, with Monte Carlo significance and a Deflated Sharpe
                  Ratio attached to every run.
                </p>
                <MiniChart variant="backtest" />
              </div>
              <div className="border-t border-line p-8 md:border-l md:border-t-0">
                <span className="mb-4 inline-block rounded-full bg-tint-green px-3 py-1.5 font-mono text-[10.5px] tracking-wide text-brand-green">
                  LIVE FORWARD-PAPER
                </span>
                <h4 className="mb-2 text-[16px] font-semibold text-navy">Currently running, in real time</h4>
                <p className="mb-4 text-[13.5px] leading-relaxed text-slate">
                  Day-by-day signal outcomes and real market fills, tracked forward from today — the honest test of
                  whether the rule set still holds.
                </p>
                <MiniChart variant="live" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistical rigor */}
      <section id="rigor" className="px-6 py-20 md:px-10">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-12 max-w-[620px]">
            <span className="mb-3.5 block font-mono text-[11px] uppercase tracking-[0.18em] text-gold">
              Statistical rigor
            </span>
            <h2 className="mb-3.5 font-serif text-[29px] font-semibold leading-tight text-navy">
              Tearsheets that keep the caveats.
            </h2>
            <p className="text-[15.5px] leading-relaxed text-slate">
              Every tearsheet ships with its source run ID and generation timestamp — reproducibility is a
              requirement, not a nicety.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { k: "p < 0.05", l: "Monte Carlo significance test, reported with a plain-English note on what it does and doesn't prove." },
              { k: "DSR-adj.", l: "Deflated Sharpe Ratio, correcting for the number of trials run against the same data." },
              { k: "|z| > 2", l: "Anomaly flagging threshold on the trade return distribution — surfaced, not buried in an appendix." },
            ].map((s) => (
              <div key={s.k} className="rounded-2xl border border-line bg-panel p-6">
                <div className="mb-2 font-mono text-[25px] font-medium text-navy">{s.k}</div>
                <div className="text-[12.5px] leading-relaxed text-slate">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Access tiers */}
      <section id="access" className="bg-tint px-6 py-20 md:px-10">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-12 max-w-[620px]">
            <span className="mb-3.5 block font-mono text-[11px] uppercase tracking-[0.18em] text-gold">
              Access, scoped by role
            </span>
            <h2 className="mb-3.5 font-serif text-[29px] font-semibold leading-tight text-navy">
              Every tenant sees exactly what their role allows.
            </h2>
            <p className="text-[15.5px] leading-relaxed text-slate">
              Controls a role can&rsquo;t use are hidden, not merely disabled — an interface should never imply an
              action that will fail.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {roles.map((role) => (
              <div
                key={role.name}
                className={`rounded-2xl border border-line border-t-[3px] bg-panel p-6 ${role.tone}`}
              >
                <span className="mb-3 inline-block rounded-full bg-tint px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-wide text-slate">
                  {role.name}
                </span>
                <h3 className="mb-3 text-[16px] font-semibold text-navy">{role.title}</h3>
                <ul className="list-disc space-y-1.5 pl-5 text-[13.5px] leading-relaxed text-slate">
                  {role.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <div className="px-6 pb-20 md:px-10">
        <div className="relative mx-auto max-w-[1180px] overflow-hidden rounded-xl2 bg-gradient-to-br from-navy to-[#29327A] px-10 py-16 text-center shadow-panel">
          <Watermark opacity="opacity-[0.06]" color="text-white" />
          <div className="relative">
            <h2 className="mb-3.5 font-serif text-[28px] font-semibold text-white">
              Bring your desk onto Sentinel.
            </h2>
            <p className="mb-7 text-[14.5px] text-[#C7CBEE]">
              Institutional and retail-tier analysts, one auditable engine.
            </p>
            <div className="flex justify-center gap-3.5">
              <Button variant="gold" href="/login">
                Sign in
              </Button>
              <Button variant="outline-light" href="#top">
                Back to top
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-line px-6 py-8 text-[12.5px] text-slate md:px-10">
        <div className="flex items-center gap-2 font-mono text-[11.5px] tracking-wide text-navy">
          <svg width={18} height={18} viewBox="0 0 40 40" fill="none">
            <path d="M20 2 L36 10.5 V29.5 L20 38 L4 29.5 V10.5 Z" fill="#B8860B" />
          </svg>
          KSE SENTINEL — CORPORATE MULTI-TENANT ENGINE
        </div>
        <div>© 2026 KSE Sentinel. Decision-support only — this system does not place trades autonomously.</div>
      </footer>
    </main>
  );
}
