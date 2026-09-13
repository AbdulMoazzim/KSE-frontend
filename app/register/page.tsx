"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Logo, LogoMark } from "@/components/logo";
import { apiPost, ApiError } from "@/lib/api-client";

// The exact backend enum values for `tier` weren't confirmed against a
// live schema — these slugs match the labels shown in the product's own
// pricing mockups. If the backend rejects them with a 422, check the
// real accepted values and update TIERS below; nothing else needs to change.
const TIERS = [
  { id: "Tier-2", label: "Tier 2", price: "PKR 25,000/seat", description: "Analyst desks, screening-first workflows" },
  { id: "Tier-1", label: "Tier 1", price: "PKR 90,000/seat", description: "Everything in Tier 2, plus programmatic access" },
] as const;

export default function RegisterPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    tenantName: "",
    password: "",
    confirmPassword: "",
    tier: TIERS[0].id as string,
  });

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await apiPost("/api/register", {
        email: form.email,
        password: form.password,
        company_name: form.tenantName,
        tier: form.tier,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-x-hidden bg-bg px-5">
        <div className="relative z-10 w-full max-w-[420px] rounded-lg border border-line bg-panel p-7 text-center shadow-panel sm:p-9">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-tint-green">
            <svg width={26} height={26} viewBox="0 0 26 26" fill="none">
              <path d="M6 13.5l4.5 4.5L20 8" stroke="rgb(var(--c-brand-green))" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="mb-2 font-sans text-[21px] font-bold tracking-tight text-ink sm:text-[22px]">Request received</h1>
          <p className="mb-7 text-[13.5px] leading-relaxed text-slate">
            We&rsquo;ve logged your request for <strong className="text-ink">{form.tenantName || "your company"}</strong>.
            Accounts are reviewed by our team before activation — we&rsquo;ll email {form.email || "you"} once it&rsquo;s approved.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-md border-[1.5px] border-navy bg-navy px-6 py-2.5 text-[13.5px] font-semibold text-white transition-all hover:-translate-y-px hover:bg-navy-soft"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-bg">
      <header className="relative z-10 flex items-center justify-between px-5 py-5 sm:px-6 md:px-10">
        <Logo showSub />
        <Link
          href="/"
          className="rounded-md border border-line bg-panel px-3.5 py-2 text-[12.5px] text-slate transition-colors hover:border-navy hover:text-ink sm:px-4 sm:text-[13px]"
        >
          ← Back to overview
        </Link>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 pb-12 pt-5 sm:px-5 sm:pb-16">
        <div className="w-full max-w-[480px] rounded-lg border border-line bg-panel p-6 pb-7 shadow-panel sm:p-9 sm:pb-8">
          <div className="mb-4 flex justify-center">
            <div className="flex h-[56px] w-[56px] items-center justify-center rounded-lg bg-tint sm:h-[60px] sm:w-[60px]">
              <LogoMark size={30} />
            </div>
          </div>
          <h1 className="mb-1.5 text-center font-sans text-[20px] font-bold tracking-tight text-ink sm:text-[22px]">
            Request institutional access
          </h1>
          <p className="mb-6 text-center text-[13px] text-slate sm:mb-7">
            One company, one isolated tenant. Reviewed by our team before activation.
          </p>

          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-brand-red/30 bg-tint-red px-3.5 py-3 text-[13px] leading-relaxed text-[rgb(var(--c-brand-red))]">
              <svg width={16} height={16} viewBox="0 0 16 16" fill="none" className="mt-0.5 flex-none">
                <circle cx="8" cy="8" r="7" stroke="rgb(var(--c-brand-red))" strokeWidth={1.4} />
                <path d="M8 4.5v4" stroke="rgb(var(--c-brand-red))" strokeWidth={1.4} strokeLinecap="round" />
                <circle cx="8" cy="11" r="0.9" fill="rgb(var(--c-brand-red))" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="fullName" className="mb-2 block text-[11.5px] font-semibold uppercase tracking-wide text-slate">
                  Full name
                </label>
                <input
                  id="fullName"
                  required
                  placeholder="Abdul Rehman"
                  value={form.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  className="w-full rounded-xl border-[1.5px] border-transparent bg-tint px-3.5 py-3 text-[14.5px] text-ink placeholder:text-slate focus:border-gold focus:bg-panel focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="tenantName" className="mb-2 block text-[11.5px] font-semibold uppercase tracking-wide text-slate">
                  Company name
                </label>
                <input
                  id="tenantName"
                  required
                  placeholder="Habib Metropolitan Bank"
                  value={form.tenantName}
                  onChange={(e) => update("tenantName", e.target.value)}
                  className="w-full rounded-xl border-[1.5px] border-transparent bg-tint px-3.5 py-3 text-[14.5px] text-ink placeholder:text-slate focus:border-gold focus:bg-panel focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-[11.5px] font-semibold uppercase tracking-wide text-slate">
                Work email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@institution.com"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className="w-full rounded-xl border-[1.5px] border-transparent bg-tint px-3.5 py-3 text-[14.5px] text-ink placeholder:text-slate focus:border-gold focus:bg-panel focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="password" className="mb-2 block text-[11.5px] font-semibold uppercase tracking-wide text-slate">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  className="w-full rounded-xl border-[1.5px] border-transparent bg-tint px-3.5 py-3 text-[14.5px] text-ink placeholder:text-slate focus:border-gold focus:bg-panel focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="mb-2 block text-[11.5px] font-semibold uppercase tracking-wide text-slate">
                  Confirm
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder="Repeat password"
                  value={form.confirmPassword}
                  onChange={(e) => update("confirmPassword", e.target.value)}
                  className="w-full rounded-xl border-[1.5px] border-transparent bg-tint px-3.5 py-3 text-[14.5px] text-ink placeholder:text-slate focus:border-gold focus:bg-panel focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[11.5px] font-semibold uppercase tracking-wide text-slate">Tier</label>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {TIERS.map((t) => {
                  const active = form.tier === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => update("tier", t.id)}
                      className={`rounded-md border px-3.5 py-2.5 text-left text-[12.5px] transition-colors ${
                        active ? "border-navy bg-navy/5" : "border-line bg-panel hover:border-navy/40"
                      }`}
                    >
                      <div className={`font-medium ${active ? "text-navy" : "text-ink"}`}>{t.label}</div>
                      <div className="mt-0.5 font-mono text-[11.5px] text-slate">{t.price}</div>
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-[11.5px] leading-relaxed text-slate">
                {TIERS.find((t) => t.id === form.tier)?.description}
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-gold py-3.5 text-[14.5px] font-semibold text-on-gold shadow-soft transition-all hover:-translate-y-px hover:bg-gold-bright disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-55"
            >
              {submitting ? "Submitting…" : "Submit for review"}
            </button>
          </form>

          <p className="mt-6 text-center text-[13px] text-slate">
            Already have a desk?{" "}
            <Link href="/login" className="font-medium text-gold hover:text-gold-bright">
              Sign in
            </Link>
          </p>
        </div>
      </main>

      <footer className="relative z-10 px-5 pb-8 text-center text-[11.5px] leading-relaxed tracking-wide text-slate">
        Accounts are reviewed by our team before activation. Approved accounts start a 30-day trial automatically.
      </footer>
    </div>
  );
}
