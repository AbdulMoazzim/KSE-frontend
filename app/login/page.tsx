"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Logo, LogoMark } from "@/components/logo";
import { Watermark } from "@/components/watermark";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [error, setError] = useState<string|null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    axios.post("/api/login", {
      email,
      password
    }).then((response) => {
      if (response.status === 422) {
        setError("Invalid Credentials");
      } else {
        router.push("/dashboard");
      }
    })
    .catch(() => {
      setError("Error Occured during request!");
    }).finally(()=>{
      setSubmitting(false);
    })
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
        <div className="w-full max-w-[400px] rounded-xl2 border border-line bg-panel p-9 pb-8 shadow-panel">
          <div className="mb-4 flex justify-center">
            <div className="flex h-[60px] w-[60px] items-center justify-center rounded-2xl bg-tint">
              <LogoMark size={32} />
            </div>
          </div>
          <h1 className="mb-1.5 text-center font-serif text-[22px] font-semibold text-navy">
            Sign in to your desk
          </h1>
          <p className="mb-7 text-center text-[13px] text-slate">
            Institutional access, scoped to your tenant.
          </p>

          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-[#F3D2CF] bg-tint-red px-3.5 py-3 text-[13px] leading-relaxed text-[#963C36]">
              <svg width={16} height={16} viewBox="0 0 16 16" fill="none" className="mt-0.5 flex-none">
                <circle cx="8" cy="8" r="7" stroke="#963C36" strokeWidth={1.4} />
                <path d="M8 4.5v4" stroke="#963C36" strokeWidth={1.4} strokeLinecap="round" />
                <circle cx="8" cy="11" r="0.9" fill="#963C36" />
              </svg>
              <span>
                <span>{error}</span>
              </span>
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
                className="w-full rounded-xl border-[1.5px] border-transparent bg-tint px-3.5 py-3 text-[14.5px] text-navy placeholder:text-[#A2A9C4] focus:border-gold focus:bg-white focus:outline-none"
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
                className="w-full rounded-xl border-[1.5px] border-transparent bg-tint px-3.5 py-3 text-[14.5px] text-navy placeholder:text-[#A2A9C4] focus:border-gold focus:bg-white focus:outline-none"
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
              className="w-full rounded-full bg-gold py-3.5 text-[14.5px] font-semibold text-white shadow-soft transition-all hover:-translate-y-px hover:bg-gold-bright disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-55"
            >
              Sign in
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-line" />
            <span className="font-mono text-[11px] tracking-wide text-[#A2A9C4]">SESSION</span>
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

      <footer className="relative z-10 px-5 pb-8 text-center text-[11.5px] tracking-wide text-[#9098B4]">
        Decision-support only — this system does not place trades autonomously.
        <br />© 2026 KSE Sentinel
      </footer>
    </div>
  );
}
