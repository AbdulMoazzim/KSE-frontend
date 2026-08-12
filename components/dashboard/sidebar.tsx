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
        <rect x="2" y="2" width="6" height="6" rx="1.5" stroke={active ? "#1E2761" : "#5B6B85"} strokeWidth={1.6} />
        <rect x="10" y="2" width="6" height="6" rx="1.5" stroke={active ? "#1E2761" : "#5B6B85"} strokeWidth={1.6} />
        <rect x="2" y="10" width="6" height="6" rx="1.5" stroke={active ? "#1E2761" : "#5B6B85"} strokeWidth={1.6} />
        <rect x="10" y="10" width="6" height="6" rx="1.5" stroke={active ? "#1E2761" : "#5B6B85"} strokeWidth={1.6} />
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
          stroke={active ? "#1E2761" : "#5B6B85"}
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
        <path d="M3 3h12v12H3z" stroke={active ? "#1E2761" : "#5B6B85"} strokeWidth={1.6} strokeLinejoin="round" />
        <path d="M3 7.5h12M6.5 3v12" stroke={active ? "#1E2761" : "#5B6B85"} strokeWidth={1.4} />
      </svg>
    ),
  },
  {
    href: "/dashboard/kill-switch",
    label: "Kill Switch",
    icon: (active: boolean) => (
      <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="7" stroke={active ? "#C0564F" : "#5B6B85"} strokeWidth={1.7} />
        <path d="M9 4.5V9" stroke={active ? "#C0564F" : "#5B6B85"} strokeWidth={1.7} strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/dashboard/daily-report",
    label: "Daily Report",
    icon: (active: boolean) => (
      <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
        <rect x="4" y="2" width="10" height="14" rx="1.5" stroke={active ? "#1E2761" : "#5B6B85"} strokeWidth={1.6} />
        <path d="M6.5 6h5M6.5 9h5M6.5 12h3" stroke={active ? "#1E2761" : "#5B6B85"} strokeWidth={1.4} strokeLinecap="round" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-[240px] flex-none flex-col border-r border-line bg-panel px-5 py-6">
      <div className="mb-8 px-1">
        <Logo showSub />
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-colors ${
                active ? "bg-tint text-navy" : "text-slate hover:bg-tint hover:text-navy"
              }`}
            >
              {item.icon(active)}
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="rounded-xl border border-line bg-tint px-3.5 py-3 text-[11.5px] leading-relaxed text-slate">
        Decision-support only. This system does not place trades autonomously.
      </div>
    </aside>
  );
}
