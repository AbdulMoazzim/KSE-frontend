"use client";

import { FormEvent, useState } from "react";
import { Watermark } from "@/components/watermark";
import Link from "next/link";
import { Logo, LogoMark } from "@/components/logo";
import axios from "axios";

export default function RegisterPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    tenantName: "",
    password: "",
    confirmPassword: "",
  });

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitted(false);

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    axios.post(`/api/register`, {
      email: form.email,
      password: form.password,
      company_name: form.tenantName
    }).then((response) => {
      if (response.status === 422) {
        setError("Invalid Credentials");
      } else {
      }
    })
      .catch(() => {
        setError("Error Occured during request!");
      }).finally(() => {
        setSubmitted(false);
      })
  }



  if (submitted) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-x-hidden bg-gradient-to-b from-tint to-bg px-5">
        <Watermark opacity="opacity-[0.035]" />
        <div className="relative z-10 w-full max-w-[420px] rounded-xl2 border border-line bg-panel p-9 text-center shadow-panel">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-tint-green">
            <svg width={26} height={26} viewBox="0 0 26 26" fill="none">
              <path d="M6 13.5l4.5 4.5L20 8" stroke="#3F8F6C" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="mb-2 font-serif text-[22px] font-semibold text-navy">Request received</h1>
          <p className="mb-7 text-[13.5px] leading-relaxed text-slate">
            We&rsquo;ve logged your request for a <strong className="text-navy">{form.tenantName || "new"}</strong>{" "}
            tenant. An admin will provision your account and email {form.email || "you"} once your desk is ready.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full border-[1.5px] border-navy bg-navy px-6 py-2.5 text-[13.5px] font-semibold text-white transition-all hover:-translate-y-px hover:bg-navy-soft"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-gradient-to-b from-tint to-bg">
      <Watermark opacity="opacity-[0.035]" />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
        <Logo showSub />
        <Link
          href="/"
          className="rounded-full border border-line bg-panel px-4 py-2 text-[13px] text-slate transition-colors hover:border-navy hover:text-navy"
        >
          ← Back to overview
        </Link>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-5 pb-16 pt-5">
        <div className="w-full max-w-[440px] rounded-xl2 border border-line bg-panel p-9 pb-8 shadow-panel">
          <div className="mb-4 flex justify-center">
            <div className="flex h-[60px] w-[60px] items-center justify-center rounded-2xl bg-tint">
              <LogoMark size={32} />
            </div>
          </div>
          <h1 className="mb-1.5 text-center font-serif text-[22px] font-semibold text-navy">
            Request institutional access
          </h1>
          <p className="mb-7 text-center text-[13px] text-slate">
            One Company, one isolated tenant. Provisioned by an admin after review.
          </p>

          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-[#F3D2CF] bg-tint-red px-3.5 py-3 text-[13px] leading-relaxed text-[#963C36]">
              <svg width={16} height={16} viewBox="0 0 16 16" fill="none" className="mt-0.5 flex-none">
                <circle cx="8" cy="8" r="7" stroke="#963C36" strokeWidth={1.4} />
                <path d="M8 4.5v4" stroke="#963C36" strokeWidth={1.4} strokeLinecap="round" />
                <circle cx="8" cy="11" r="0.9" fill="#963C36" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
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
                  className="w-full rounded-xl border-[1.5px] border-transparent bg-tint px-3.5 py-3 text-[14.5px] text-navy placeholder:text-[#A2A9C4] focus:border-gold focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="tenantName" className="mb-2 block text-[11.5px] font-semibold uppercase tracking-wide text-slate">
                  Tenant / Company
                </label>
                <input
                  id="tenantName"
                  required
                  placeholder="Company Name"
                  value={form.tenantName}
                  onChange={(e) => update("tenantName", e.target.value)}
                  className="w-full rounded-xl border-[1.5px] border-transparent bg-tint px-3.5 py-3 text-[14.5px] text-navy placeholder:text-[#A2A9C4] focus:border-gold focus:bg-white focus:outline-none"
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
                className="w-full rounded-xl border-[1.5px] border-transparent bg-tint px-3.5 py-3 text-[14.5px] text-navy placeholder:text-[#A2A9C4] focus:border-gold focus:bg-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
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
                  className="w-full rounded-xl border-[1.5px] border-transparent bg-tint px-3.5 py-3 text-[14.5px] text-navy placeholder:text-[#A2A9C4] focus:border-gold focus:bg-white focus:outline-none"
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
                  className="w-full rounded-xl border-[1.5px] border-transparent bg-tint px-3.5 py-3 text-[14.5px] text-navy placeholder:text-[#A2A9C4] focus:border-gold focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-gold py-3.5 text-[14.5px] font-semibold text-white shadow-soft transition-all hover:-translate-y-px hover:bg-gold-bright"
            >
              Submit request
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

      <footer className="relative z-10 px-5 pb-8 text-center text-[11.5px] tracking-wide text-[#9098B4]">
        New accounts are reviewed by a tenant admin before activation.
      </footer>
    </div>
  );
}
