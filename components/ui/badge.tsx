import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full font-mono text-[10.5px] tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-muted px-2.5 py-1 text-foreground",
        green: "bg-tint-green px-3 py-1.5 text-brand-green",
        red: "bg-tint-red px-3 py-1.5 text-brand-red",
        slate: "bg-muted px-3 py-1.5 text-muted-foreground",
        gold: "bg-tint-gold px-3 py-1.5 text-accent",
        outline: "border border-line px-3 py-1.5 text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
