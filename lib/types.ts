export type Timeframe = "1H" | "1D";

export type Direction = "LONG" | "SHORT";

export type SignalOutcome = "WIN" | "LOSS" | "OPEN" | "SCRATCH";

export type Role = "trader" | "admin" | "super_admin";

export interface LiveSignal {
  id: string;
  date: string;
  ticker: string;
  timeframe: Timeframe;
  direction: Direction;
  confluenceScore: number;
  entryPrice: number;
  exitPrice: number | null;
  outcome: SignalOutcome;
  returnPct: number | null;
}

export interface OpenPosition {
  id: string;
  ticker: string;
  timeframe: Timeframe;
  direction: Direction;
  entryPrice: number;
  markPrice: number;
  qty: number;
  unrealizedPct: number;
  openedAt: string;
}

export interface ClosedTrade {
  id: string;
  ticker: string;
  timeframe: Timeframe;
  direction: Direction;
  entryPrice: number;
  exitPrice: number;
  qty: number;
  realizedPct: number;
  openedAt: string;
  closedAt: string;
}

export interface KillSwitchEvent {
  id: string;
  action: "ACTIVATED" | "DEACTIVATED";
  reason: string;
  actor: string;
  timestamp: string;
}

export interface KillSwitchStatus {
  active: boolean;
  activatedBy: string | null;
  activatedAt: string | null;
  reason: string | null;
}
