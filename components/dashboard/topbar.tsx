"use client";

import { StatusPill } from "@/components/badge";
import { useKillSwitch } from "@/context/kill-switch-context";
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

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-card/80 px-8 py-5 backdrop-blur-md">
      <div>
        <h1 className="font-serif text-[21px] font-semibold text-foreground">{title}</h1>
        {subtitle && <p className="mt-0.5 text-[13px] text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
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
