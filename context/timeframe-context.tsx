"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Timeframe = "1H" | "1D";

const STORAGE_KEY = "kse-timeframe";

interface TimeframeContextValue {
  timeframe: Timeframe;
  setTimeframe: (t: Timeframe) => void;
}

const TimeframeContext = createContext<TimeframeContextValue | null>(null);

export function TimeframeProvider({ children }: { children: React.ReactNode }) {
  const [timeframe, setTimeframeState] = useState<Timeframe>("1D");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "1H" || stored === "1D") setTimeframeState(stored);
  }, []);

  function setTimeframe(t: Timeframe) {
    setTimeframeState(t);
    window.localStorage.setItem(STORAGE_KEY, t);
  }

  return (
    <TimeframeContext.Provider value={{ timeframe, setTimeframe }}>{children}</TimeframeContext.Provider>
  );
}

export function useTimeframe() {
  const ctx = useContext(TimeframeContext);
  if (!ctx) throw new Error("useTimeframe must be used within a TimeframeProvider");
  return ctx;
}
