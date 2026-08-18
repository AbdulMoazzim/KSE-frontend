"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";

const navItems = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: (active: boolean) => (
      <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
        <rect x="2" y="2" width="6" height="6" rx="1.5" stroke={active ? "rgb(var(--c-ink))" : "rgb(var(--c-slate))"} strokeWidth={1.6} />
        <rect x="10" y="2" width="6" height="6" rx="1.5" stroke={active ? "rgb(var(--c-ink))" : "rgb(var(--c-slate))"} strokeWidth={1.6} />
        <rect x="2" y="10" width="6" height="6" rx="1.5" stroke={active ? "rgb(var(--c-ink))" : "rgb(var(--c-slate))"} strokeWidth={1.6} />
        <rect x="10" y="10" width="6" height="6" rx="1.5" stroke={active ? "rgb(var(--c-ink))" : "rgb(var(--c-slate))"} strokeWidth={1.6} />
      </svg>
    ),
  },
  {
    href: "/dashboard/signals",
    label: "Live Signals",
    icon: (active: boolean) => (
      <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
        <path
          d="M2 13l3-4 3 2 3-6 3 3"
          stroke={active ? "rgb(var(--c-ink))" : "rgb(var(--c-slate))"}
          strokeWidth={1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/dashboard/trade-log",
    label: "Trade Log",
    icon: (active: boolean) => (
      <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
        <path d="M3 3h12v12H3z" stroke={active ? "rgb(var(--c-ink))" : "rgb(var(--c-slate))"} strokeWidth={1.6} strokeLinejoin="round" />
        <path d="M3 7.5h12M6.5 3v12" stroke={active ? "rgb(var(--c-ink))" : "rgb(var(--c-slate))"} strokeWidth={1.4} />
      </svg>
    ),
  },
  {
    href: "/dashboard/kill-switch",
    label: "Kill Switch",
    icon: (active: boolean) => (
      <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="7" stroke={active ? "rgb(var(--c-brand-red))" : "rgb(var(--c-slate))"} strokeWidth={1.7} />
        <path d="M9 4.5V9" stroke={active ? "rgb(var(--c-brand-red))" : "rgb(var(--c-slate))"} strokeWidth={1.7} strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/dashboard/daily-report",
    label: "Daily Report",
    icon: (active: boolean) => (
      <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
        <rect x="4" y="2" width="10" height="14" rx="1.5" stroke={active ? "rgb(var(--c-ink))" : "rgb(var(--c-slate))"} strokeWidth={1.6} />
        <path d="M6.5 6h5M6.5 9h5M6.5 12h3" stroke={active ? "rgb(var(--c-ink))" : "rgb(var(--c-slate))"} strokeWidth={1.4} strokeLinecap="round" />
      </svg>
    ),
  },
];

const researchNavItems = [
  {
    href: "/dashboard/analytics",
    label: "Analytics",
    icon: (active: boolean) => (
      <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
        <path d="M3 14V8M9 14V4M15 14v-6" stroke={active ? "rgb(var(--c-ink))" : "rgb(var(--c-slate))"} strokeWidth={1.6} strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/dashboard/fundamentals",
    label: "Fundamentals",
    icon: (active: boolean) => (
      <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
        <circle cx="8" cy="8" r="5.5" stroke={active ? "rgb(var(--c-ink))" : "rgb(var(--c-slate))"} strokeWidth={1.6} />
        <path d="M15 15l-3.2-3.2" stroke={active ? "rgb(var(--c-ink))" : "rgb(var(--c-slate))"} strokeWidth={1.6} strokeLinecap="round" />
      </svg>
    ),
  },
];

const configNavItems = [
  {
    href: "/dashboard/sizing",
    label: "Position Sizing",
    icon: (active: boolean) => (
      <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
        <rect x="2.5" y="10" width="3.5" height="5.5" rx="1" stroke={active ? "rgb(var(--c-ink))" : "rgb(var(--c-slate))"} strokeWidth={1.5} />
        <rect x="7.25" y="6" width="3.5" height="9.5" rx="1" stroke={active ? "rgb(var(--c-ink))" : "rgb(var(--c-slate))"} strokeWidth={1.5} />
        <rect x="12" y="2.5" width="3.5" height="13" rx="1" stroke={active ? "rgb(var(--c-ink))" : "rgb(var(--c-slate))"} strokeWidth={1.5} />
      </svg>
    ),
  },
  {
    href: "/dashboard/ops",
    label: "System Health",
    icon: (active: boolean) => (
      <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
        <path
          d="M2 9h3l1.5-4L9 13l1.5-8L12 9h4"
          stroke={active ? "rgb(var(--c-ink))" : "rgb(var(--c-slate))"}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();

  function renderItems(items: typeof navItems) {
    return items.map((item) => {
      const active = pathname === item.href;
      return (
        <Link
          key={item.href}
          href={item.href}
          className={`flex items-center gap-3 rounded-xl border-l-2 px-3 py-2.5 text-[13.5px] font-medium transition-colors ${
            active
              ? "border-primary bg-muted text-foreground"
              : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          {item.icon(active)}
          {item.label}
        </Link>
      );
    });
  }

  return (
    <aside className="sticky top-0 flex h-screen w-[240px] flex-none flex-col overflow-y-auto border-r border-line bg-panel px-5 py-6">
      <div className="mb-8 px-1">
        <Logo showSub />
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {renderItems(navItems)}

        <div className="mb-1 mt-4 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate">Research</div>
        {renderItems(researchNavItems)}

        <div className="mb-1 mt-4 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate">Configuration</div>
        {renderItems(configNavItems)}
      </nav>
      <div className="mt-4 rounded-xl border border-line bg-tint px-3.5 py-3 text-[11.5px] leading-relaxed text-slate">
        Decision-support only. This system does not place trades autonomously.
      </div>
    </aside>
  );
}
