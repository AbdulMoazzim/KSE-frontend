import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-[13.5px] font-semibold tracking-tight transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border-[1.5px] border-primary bg-primary text-primary-foreground shadow-soft hover:bg-navy-soft hover:border-navy-soft hover:-translate-y-px",
        accent:
          "border-[1.5px] border-accent bg-accent text-accent-foreground shadow-soft hover:bg-gold-bright hover:border-gold-bright hover:-translate-y-px",
        outline:
          "border-[1.5px] border-line bg-card text-foreground hover:border-primary hover:-translate-y-px",
        ghost: "border-[1.5px] border-transparent text-foreground hover:bg-muted",
        "outline-light":
          "border-[1.5px] border-white/40 bg-transparent text-white hover:border-white hover:bg-white/10",
        link: "border-[1.5px] border-transparent text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-6 py-2.5",
        sm: "h-8 rounded-full px-4 text-[12.5px]",
        lg: "h-12 rounded-full px-8 text-[14.5px]",
        icon: "h-9 w-9 rounded-full p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
