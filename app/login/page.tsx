"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Logo, LogoMark } from "@/components/logo";
import { useRouter } from "next/navigation";
import { apiPost, ApiError } from "@/lib/api-client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiPost("/api/login", { email, password });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
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
        <div className="w-full max-w-[400px] rounded-lg border border-line bg-panel p-6 pb-7 shadow-panel sm:p-9 sm:pb-8">
          <div className="mb-4 flex justify-center">
            <div className="flex h-[56px] w-[56px] items-center justify-center rounded-lg bg-tint sm:h-[60px] sm:w-[60px]">
              <LogoMark size={30} />
            </div>
          </div>
          <h1 className="mb-1.5 text-center font-sans text-[20px] font-bold tracking-tight text-ink sm:text-[22px]">
            Sign in to your desk
          </h1>
          <p className="mb-6 text-center text-[13px] text-slate sm:mb-7">
            Institutional access, scoped to your tenant.
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

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <label htmlFor="email" className="mb-2 block text-[11.5px] font-semibold uppercase tracking-wide text-slate">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="username"
                placeholder="you@institution.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border-[1.5px] border-transparent bg-tint px-3.5 py-3 text-[14.5px] text-ink placeholder:text-slate focus:border-gold focus:bg-panel focus:outline-none"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="mb-2 block text-[11.5px] font-semibold uppercase tracking-wide text-slate">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border-[1.5px] border-transparent bg-tint px-3.5 py-3 text-[14.5px] text-ink placeholder:text-slate focus:border-gold focus:bg-panel focus:outline-none"
              />
            </div>
            <div className="-mt-2 mb-5 flex justify-end">
              <a href="#" className="text-[12.5px] text-slate hover:text-gold">
                Forgot password?
              </a>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-gold py-3.5 text-[14.5px] font-semibold text-on-gold shadow-soft transition-all hover:-translate-y-px hover:bg-gold-bright disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-55"
            >
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-line" />
            <span className="font-mono text-[11px] tracking-wide text-slate">SESSION</span>
            <div className="h-px flex-1 bg-line" />
          </div>

          <div className="flex items-center justify-center gap-2 font-mono text-[11px] tracking-wide text-slate">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-green" />
            JWT-authenticated · refresh handled silently
          </div>

          <p className="mt-6 text-center text-[13px] text-slate">
            Don&rsquo;t have a desk yet?{" "}
            <Link href="/register" className="font-medium text-gold hover:text-gold-bright">
              Request access
            </Link>
          </p>
        </div>
      </main>

      <footer className="relative z-10 px-5 pb-8 text-center text-[11.5px] tracking-wide text-slate">
        Decision-support only — this system does not place trades autonomously.
        <br />© 2026 KSE Sentinel
      </footer>
    </div>
  );
}
