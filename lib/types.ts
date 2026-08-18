export type Role = "trader" | "admin" | "super_admin";

export interface LiveSignal {
  id: string;
  date: string | null;
  ticker: string;
  timeframe: string | null;
  direction: string | null;
  confluenceScore: number | null;
  entryPrice: number | null;
  exitPrice: number | null;
  outcome: string | null;
  returnPct: number | null;
}

export interface LiveSignalSummary {
  winRatePct: number | null;
  wins: number | null;
  losses: number | null;
  openCount: number | null;
  totalCount: number | null;
  avgReturnPct: number | null;
}

export interface OpenPosition {
  id: string;
  ticker: string;
  timeframe: string | null;
  direction: string | null;
  entryPrice: number | null;
  markPrice: number | null;
  qty: number | null;
  unrealizedPct: number | null;
  openedAt: string | null;
}

export interface ClosedTrade {
  id: string;
  ticker: string;
  timeframe: string | null;
  direction: string | null;
  entryPrice: number | null;
  exitPrice: number | null;
  qty: number | null;
  realizedPct: number | null;
  openedAt: string | null;
  closedAt: string | null;
}

export interface TradeLogSummary {
  openCount: number | null;
  closedCount: number | null;
  realizedTotalPct: number | null;
  winCount: number | null;
}

export interface KillSwitchEvent {
  id: string;
  action: "ACTIVATED" | "DEACTIVATED" | null;
  reason: string | null;
  actor: string | null;
  timestamp: string | null;
}

export interface KillSwitchStatus {
  active: boolean;
  activatedBy: string | null;
  activatedAt: string | null;
  reason: string | null;
}

export interface DailyReport {
  date: string | null;
  signalsCount: number | null;
  entriesCount: number | null;
  closedCount: number | null;
  equityMovePct: number | null;
  riskFlags: string[];
  notes: string | null;
}

export interface ScreenerRow {
  ticker: string;
  sector: string | null;
  close: number | null;
  meanReversionZScore: number | null;
  distFromMeanPct: number | null;
  liquidityPercentile: number | null;
  advNotionalPkr: number | null;
  relativeStrengthPct: number | null;
  error: string | null;
}

export interface SizingTier {
  id: string;
  name: string;
  riskPerTradePct: number | null;
  validated: boolean | null;
  gated: boolean | null;
  description: string | null;
}