"use client";

import { FormEvent, useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/button";

const tiers = [
  {
    name: "Tier 2",
    blurb: "For analyst desks and screening-first workflows",
    accent: false,
    features: ["Full-universe screener", "Live signals & confluence scoring", "Trade log & tearsheet exports", "Kill switch & audit trail"],
  },
  {
    name: "Tier 1",
    blurb: "Everything in Tier 2, plus programmatic access",
    accent: true,
    features: ["Data-as-a-Service API", "Analyst document upload & extraction", "Priority onboarding support"],
  },
];

export default function ForBrokersPage() {
  const [form, setForm] = useState({ company: "", role: "", email: "" });
  const [submitted, setSubmitted] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // No lead-capture endpoint exists yet — this confirms locally rather
  // than silently pretending to submit somewhere. Wire it up to a real
  // endpoint (or a mailto/CRM webhook) once one exists.
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-tint to-bg">
      <Header />

      <section className="px-6 pb-4 pt-16 text-center md:px-10">
        <h1 className="mx-auto mb-3.5 max-w-[560px] font-sans text-[29px] font-bold tracking-tight leading-tight text-ink">
          Two tiers, built for how your desk actually works
        </h1>
        <p className="mx-auto max-w-[460px] text-[14px] leading-relaxed text-slate">
          Both tiers share the same audit-grade infrastructure. Tier 1 adds programmatic access and document
          intelligence for teams running their own workflows on top of ours.
        </p>
      </section>

      <section className="px-6 py-12 md:px-10">
        <div className="mx-auto grid max-w-[760px] gap-5 md:grid-cols-2">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`rounded-lg border bg-card p-6 shadow-sm ${t.accent ? "border-gold" : "border-line"}`}
            >
              <div className="mb-0.5 text-[15px] font-semibold text-ink">{t.name}</div>
              <div className="mb-4 text-[12.5px] text-slate">{t.blurb}</div>
              <ul>
                {t.features.map((f) => (
                  <li key={f} className="border-t border-line py-2 text-[12.5px] text-slate first:border-t-0">
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 pb-20 md:px-10">
        <p className="mb-6 text-center text-[13px] text-slate">
          Volume and annual-prepay discounts available for larger seat counts.
        </p>

        <div className="mx-auto max-w-[360px] rounded-lg border border-line bg-panel p-6 shadow-panel">
          {submitted ? (
            <div className="py-4 text-center">
              <div className="mb-1.5 text-[14px] font-semibold text-ink">Request received</div>
              <p className="text-[13px] leading-relaxed text-slate">
                We&rsquo;ll follow up at {form.email || "your work email"} with current pricing for your desk.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="mb-1 text-center text-[13px] font-medium text-ink">See current pricing for your desk</div>
              <div>
                <label htmlFor="company" className="mb-1 block text-[11px] text-slate">
                  Company name
                </label>
                <input
                  id="company"
                  required
                  placeholder="Habib Metropolitan Bank"
                  value={form.company}
                  onChange={(e) => update("company", e.target.value)}
                  className="w-full rounded-md border border-line bg-panel px-3 py-2 text-[12.5px] text-ink placeholder:text-slate focus:border-gold focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="role" className="mb-1 block text-[11px] text-slate">
                  Your role
                </label>
                <input
                  id="role"
                  required
                  placeholder="Head of Trading"
                  value={form.role}
                  onChange={(e) => update("role", e.target.value)}
                  className="w-full rounded-md border border-line bg-panel px-3 py-2 text-[12.5px] text-ink placeholder:text-slate focus:border-gold focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="email" className="mb-1 block text-[11px] text-slate">
                  Work email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className="w-full rounded-md border border-line bg-panel px-3 py-2 text-[12.5px] text-ink placeholder:text-slate focus:border-gold focus:outline-none"
                />
              </div>
              <Button type="submit" variant="navy" className="mt-1 w-full">
                See pricing
              </Button>
            </form>
          )}
        </div>
      </section>

      <footer className="border-t border-line px-6 py-8 text-center text-[12.5px] text-slate md:px-10">
        © 2026 KSE Sentinel. Decision-support only — this system does not place trades autonomously.
      </footer>
    </main>
  );
}
