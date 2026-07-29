import Link from "next/link";
import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "gold" | "navy" | "ghost" | "outline-light";

const variantClasses: Record<Variant, string> = {
  gold: "bg-gold text-white border-gold shadow-soft hover:bg-gold-bright hover:border-gold-bright hover:-translate-y-px",
  navy: "bg-navy text-white border-navy hover:bg-navy-soft hover:border-navy-soft hover:-translate-y-px",
  ghost:
    "bg-white text-navy border-line hover:border-navy hover:-translate-y-px",
  "outline-light":
    "bg-transparent text-white border-white/40 hover:bg-white/10 hover:border-white",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full border-[1.5px] px-6 py-2.5 text-[13.5px] font-semibold tracking-tight transition-all duration-150";

export function Button({
  variant = "navy",
  href,
  children,
  className = "",
  ...rest
}: {
  variant?: Variant;
  href?: string;
  children: ReactNode;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const classes = `${base} ${variantClasses[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
