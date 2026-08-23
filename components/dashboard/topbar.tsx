"use client";

import { StatusPill } from "@/components/badge";
import { useKillSwitch } from "@/context/kill-switch-context";
import { useMobileNav } from "@/context/mobile-nav-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { TimeframeToggle } from "@/components/timeframe-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Topbar({
  title,
  subtitle,
  showTimeframe = true,
}: {
  title: string;
  subtitle?: string;
  showTimeframe?: boolean;
}) {
  const { status } = useKillSwitch();
  const { open } = useMobileNav();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-card/80 px-4 py-4 backdrop-blur-md sm:px-6 sm:py-5 lg:px-8">
      <div className="flex min-w-0 items-start gap-3">
        <button
          onClick={open}
          aria-label="Open navigation"
          className="mt-0.5 shrink-0 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
        >
          <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
            <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
          </svg>
        </button>
        <div className="min-w-0">
          <h1 className="truncate font-serif text-[19px] font-semibold text-foreground sm:text-[21px]">{title}</h1>
          {subtitle && <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted-foreground sm:text-[13px]">{subtitle}</p>}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
        {showTimeframe && <TimeframeToggle />}
        {status.active ? (
          <StatusPill label="KILL SWITCH ACTIVE" tone="red" pulse />
        ) : (
          <StatusPill label="TRADING ACTIVE" tone="green" pulse />
        )}
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full outline-none ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring">
            <Avatar>
              <AvatarFallback>AR</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Abdul Rehman</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Account settings</DropdownMenuItem>
            <DropdownMenuItem>Tenant preferences</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:bg-tint-red">Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
