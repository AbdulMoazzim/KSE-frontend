"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { KillSwitchStatus } from "@/lib/types";

interface KillSwitchContextValue {
  status: KillSwitchStatus;
  activate: (reason: string) => void;
  deactivate: (reason: string) => void;
}

const KillSwitchContext = createContext<KillSwitchContextValue | null>(null);

export function KillSwitchProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<KillSwitchStatus>({
    active: false,
    activatedBy: null,
    activatedAt: null,
    reason: null,
  });

  const value = useMemo<KillSwitchContextValue>(
    () => ({
      status,
      activate: (reason: string) =>
        setStatus({
          active: true,
          activatedBy: "you@empiric-desk",
          activatedAt: new Date().toLocaleString(),
          reason,
        }),
      deactivate: () =>
        setStatus({
          active: false,
          activatedBy: null,
          activatedAt: null,
          reason: null,
        }),
    }),
    [status]
  );

  return <KillSwitchContext.Provider value={value}>{children}</KillSwitchContext.Provider>;
}

export function useKillSwitch() {
  const ctx = useContext(KillSwitchContext);
  if (!ctx) throw new Error("useKillSwitch must be used within a KillSwitchProvider");
  return ctx;
}
