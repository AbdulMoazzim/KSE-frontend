"use client";

import { useEffect, useRef } from "react";

const STEP_PATH =
  "M0,120 L40,120 L40,100 L80,100 L80,108 L120,108 L120,86 L160,86 L160,92 L200,92 L200,66 L240,66 L240,74 L280,74 L280,48 L320,48 L320,56 L360,56 L360,30 L400,30 L400,38 L440,38 L440,20 L460,20";

export function StepChart({
  ticker = "OGDC · 1D ENGINE",
  price = "231.40",
  sub = "Confluence score 0.82 · regime: trending · step-plotted, not smoothed",
}: {
  ticker?: string;
  price?: string;
  sub?: string;
}) {
  const lineRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const el = lineRef.current;
    if (!el) return;
    const length = el.getTotalLength();
    el.style.strokeDasharray = `${length}`;
    el.style.strokeDashoffset = `${length}`;
    // force reflow so the transition kicks in
    el.getBoundingClientRect();
    el.style.transition = "stroke-dashoffset 1.8s cubic-bezier(.4,0,.2,1)";
    requestAnimationFrame(() => {
      el.style.strokeDashoffset = "0";
    });
  }, []);

  return (
    <div className="relative rounded-xl2 border border-line bg-panel p-6 pb-4 shadow-panel">
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="font-mono text-[13px] tracking-wide text-ink">{ticker}</span>
        <span className="font-mono text-[13px] font-medium text-brand-green">
          {price} <span className="text-[rgb(var(--c-slate))]">PKR</span>
        </span>
      </div>
      <p className="mb-3.5 text-[11px] text-slate">{sub}</p>

      <svg viewBox="0 0 460 150" className="block h-[150px] w-full">
        <defs>
          <linearGradient id="fillgrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(var(--c-gold))" stopOpacity="0.16" />
            <stop offset="100%" stopColor="rgb(var(--c-gold))" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g stroke="rgb(var(--c-line))" strokeWidth={1}>
          <line x1="0" y1="30" x2="460" y2="30" />
          <line x1="0" y1="70" x2="460" y2="70" />
          <line x1="0" y1="110" x2="460" y2="110" />
        </g>
        <path
          d={`${STEP_PATH} L460,150 L0,150 Z`}
          fill="url(#fillgrad)"
        />
        <path
          ref={lineRef}
          d={STEP_PATH}
          fill="none"
          stroke="rgb(var(--c-gold))"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <polygon points="120,116 126,126 114,126" fill="rgb(var(--c-brand-green))" />
        <text x="120" y="140" textAnchor="middle" fontFamily="var(--font-plex-mono)" fontSize="9" fill="rgb(var(--c-brand-green))">
          BUY
        </text>
        <polygon points="360,20 366,10 354,10" fill="rgb(var(--c-brand-red))" />
        <text x="360" y="8" textAnchor="middle" fontFamily="var(--font-plex-mono)" fontSize="9" fill="rgb(var(--c-brand-red))">
          SELL
        </text>
        <circle cx="460" cy="20" r="4" fill="rgb(var(--c-gold))">
          <animate attributeName="r" values="4;7;4" dur="2.2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;0.4;1" dur="2.2s" repeatCount="indefinite" />
        </circle>
      </svg>

      <div className="mt-3 flex items-center gap-2 border-t border-line pt-3.5">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-green opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-green" />
        </span>
        <span className="font-mono text-[11px] tracking-wide text-slate">
          TRADING ACTIVE — KILL SWITCH DISENGAGED
        </span>
      </div>
    </div>
  );
}
