import Link from "next/link";

export function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 2 L36 10.5 V29.5 L20 38 L4 29.5 V10.5 Z" fill="rgb(var(--c-gold))" />
      <path
        d="M9 26 L15 20 L19.5 24 L31 12"
        stroke="rgb(var(--c-ink))"
        strokeWidth={2.4}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="31" cy="12" r="2.4" fill="rgb(var(--c-ink))" />
    </svg>
  );
}

export function Logo({
  href = "/",
  showSub = true,
}: {
  href?: string;
  showSub?: boolean;
}) {
  return (
    <Link href={href} className="flex items-center gap-2.5">
      <LogoMark />
      <span className="text-[18px] font-semibold leading-tight text-ink">
        KSE Sentinel
        {showSub && (
          <span className="block font-mono text-[9px] font-medium tracking-[0.22em] text-gold">
            CORPORATE&nbsp;·&nbsp;MULTI-TENANT
          </span>
        )}
      </span>
    </Link>
  );
}
