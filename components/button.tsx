import Link from "next/link";
import { ButtonHTMLAttributes, ReactNode } from "react";
import { Button as UiButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Variant = "gold" | "navy" | "ghost" | "outline-light";

// Maps the app's original brand variant names onto the shadcn/ui button's
// variant system, so every existing call site (<Button variant="gold" />
// etc.) keeps working unchanged while the actual styling now flows
// through components/ui/button.tsx.
const variantMap: Record<Variant, "accent" | "default" | "outline" | "outline-light"> = {
  gold: "accent",
  navy: "default",
  ghost: "outline",
  "outline-light": "outline-light",
};

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
  if (href) {
    return (
      <UiButton asChild variant={variantMap[variant]} className={className}>
        <Link href={href}>{children}</Link>
      </UiButton>
    );
  }

  return (
    <UiButton variant={variantMap[variant]} className={cn(className)} {...rest}>
      {children}
    </UiButton>
  );
}
