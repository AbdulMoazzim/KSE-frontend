"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { apiGet, apiPost, ApiError } from "@/lib/api-client";
import { normalizeKillSwitchStatus } from "@/lib/normalize";
import { KillSwitchStatus } from "@/lib/types";

interface KillSwitchContextValue {
  status: KillSwitchStatus;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  activate: (reason: string) => Promise<void>;
  deactivate: (reason: string) => Promise<void>;
}

const defaultStatus: KillSwitchStatus = {
  active: false,
  activatedBy: null,
  activatedAt: null,
  reason: null,
};

const KillSwitchContext = createContext<KillSwitchContextValue | null>(null);

export function KillSwitchProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<KillSwitchStatus>(defaultStatus);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await apiGet("/api/kill-switch/status",{"X-Tenant-ID": "1"});
      setStatus(normalizeKillSwitchStatus(raw));
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Couldn't check the kill switch status. Trading may or may not be paused — please verify before proceeding."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    // Keep the tenant-wide status fresh without the user needing to refresh the tab.
    const interval = setInterval(refresh, 30_000);
    return () => clearInterval(interval);
  }, [refresh]);

  const activate = useCallback(
    async (reason: string) => {
      await apiPost("/api/kill-switch/activate", { reason,"X-Tenant-ID": "1" });
      await refresh();
    },
    [refresh]
  );

  const deactivate = useCallback(
    async (reason: string) => {
      await apiPost("/api/kill-switch/deactivate", { reason, "X-Tenant-ID": "1" });
      await refresh();
    },
    [refresh]
  );

  return (
    <KillSwitchContext.Provider value={{ status, loading, error, refresh, activate, deactivate }}>
      {children}
    </KillSwitchContext.Provider>
  );
}

export function useKillSwitch() {
  const ctx = useContext(KillSwitchContext);
  if (!ctx) throw new Error("useKillSwitch must be used within a KillSwitchProvider");
  return ctx;
}
