import {
  ClosedTrade,
  DailyReport,
  KillSwitchEvent,
  KillSwitchStatus,
  LiveSignal,
  LiveSignalSummary,
  OpenPosition,
  ScreenerRow,
  SizingTier,
  TradeLogSummary,
} from "./types";

function pick<T = unknown>(row: unknown, keys: string[]): T | null {
  if (typeof row !== "object" || row === null) return null;
  const record = row as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (value !== undefined && value !== null) return value as T;
  }
  return null;
}

function pickString(row: unknown, keys: string[]): string | null {
  const value = pick<unknown>(row, keys);
  return value === null ? null : String(value);
}

function pickNumber(row: unknown, keys: string[]): number | null {
  const value = pick<unknown>(row, keys);
  if (value === null) return null;
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? num : null;
}

export function extractArray(payload: unknown, wrapperKeys: string[] = []): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (typeof payload === "object" && payload !== null) {
    const record = payload as Record<string, unknown>;
    for (const key of ["items", "results", "data", ...wrapperKeys]) {
      if (Array.isArray(record[key])) return record[key] as unknown[];
    }
  }
  return [];
}

export function normalizeSignal(row: unknown, index: number): LiveSignal {
  return {
    id: pickString(row, ["id", "signal_id", "uuid"]) ?? `signal-${index}`,
    date: pickString(row, ["date", "signal_date", "created_at", "timestamp"]),
    ticker: pickString(row, ["ticker", "symbol"]) ?? "—",
    timeframe: pickString(row, ["timeframe", "engine", "tf"]),
    direction: pickString(row, ["direction", "side"])?.toUpperCase() ?? null,
    confluenceScore: pickNumber(row, ["confluence_score", "confluenceScore", "score"]),
    entryPrice: pickNumber(row, ["entry_price", "entryPrice", "entry"]),
    exitPrice: pickNumber(row, ["exit_price", "exitPrice", "exit"]),
    outcome: pickString(row, ["outcome", "result", "status"])?.toUpperCase() ?? null,
    returnPct: pickNumber(row, ["return_pct", "returnPct", "pnl_pct", "return"]),
  };
}

export function normalizeSignalSummary(payload: unknown): LiveSignalSummary {
  return {
    winRatePct: pickNumber(payload, ["win_rate_pct", "win_rate", "winRatePct"]),
    wins: pickNumber(payload, ["wins", "win_count"]),
    losses: pickNumber(payload, ["losses", "loss_count"]),
    openCount: pickNumber(payload, ["open_count", "open"]),
    totalCount: pickNumber(payload, ["total_count", "total"]),
    avgReturnPct: pickNumber(payload, ["avg_return_pct", "average_return_pct", "avgReturnPct"]),
  };
}

export function normalizeOpenPosition(row: unknown, index: number): OpenPosition {
  return {
    id: pickString(row, ["id", "position_id", "uuid"]) ?? `position-${index}`,
    ticker: pickString(row, ["ticker", "symbol"]) ?? "—",
    timeframe: pickString(row, ["timeframe", "engine", "tf"]),
    direction: pickString(row, ["direction", "side"])?.toUpperCase() ?? null,
    entryPrice: pickNumber(row, ["entry_price", "entryPrice", "entry"]),
    markPrice: pickNumber(row, ["mark_price", "markPrice", "current_price", "last_price"]),
    qty: pickNumber(row, ["qty", "quantity", "size"]),
    unrealizedPct: pickNumber(row, ["unrealized_pct", "unrealizedPct", "pnl_pct"]),
    openedAt: pickString(row, ["opened_at", "openedAt", "entry_time", "created_at"]),
  };
}

export function normalizeClosedTrade(row: unknown, index: number): ClosedTrade {
  return {
    id: pickString(row, ["id", "trade_id", "uuid"]) ?? `trade-${index}`,
    ticker: pickString(row, ["ticker", "symbol"]) ?? "—",
    timeframe: pickString(row, ["timeframe", "engine", "tf"]),
    direction: pickString(row, ["direction", "side"])?.toUpperCase() ?? null,
    entryPrice: pickNumber(row, ["entry_price", "entryPrice", "entry"]),
    exitPrice: pickNumber(row, ["exit_price", "exitPrice", "exit"]),
    qty: pickNumber(row, ["qty", "quantity", "size"]),
    realizedPct: pickNumber(row, ["realized_pct", "realizedPct", "pnl_pct", "return_pct"]),
    openedAt: pickString(row, ["opened_at", "openedAt", "entry_time"]),
    closedAt: pickString(row, ["closed_at", "closedAt", "exit_time"]),
  };
}

export function normalizeTradeLogSummary(payload: unknown): TradeLogSummary {
  return {
    openCount: pickNumber(payload, ["open_count", "open_positions", "open"]),
    closedCount: pickNumber(payload, ["closed_count", "closed_trades", "closed"]),
    realizedTotalPct: pickNumber(payload, ["realized_total_pct", "realized_pct_total", "total_realized_pct"]),
    winCount: pickNumber(payload, ["win_count", "wins"]),
  };
}

export function normalizeKillSwitchStatus(payload: unknown): KillSwitchStatus {
  const active = pick<unknown>(payload, ["active", "is_active", "engaged"]);
  return {
    active: active === true || active === "true" || active === 1,
    activatedBy: pickString(payload, ["activated_by", "activatedBy", "actor"]),
    activatedAt: pickString(payload, ["activated_at", "activatedAt", "timestamp"]),
    reason: pickString(payload, ["reason"]),
  };
}

export function normalizeKillSwitchEvent(row: unknown, index: number): KillSwitchEvent {
  const action = pickString(row, ["action", "event"])?.toUpperCase() ?? null;
  return {
    id: pickString(row, ["id", "event_id", "uuid"]) ?? `event-${index}`,
    action: action === "ACTIVATED" || action === "DEACTIVATED" ? action : null,
    reason: pickString(row, ["reason"]),
    actor: pickString(row, ["actor", "user", "activated_by", "triggered_by"]),
    timestamp: pickString(row, ["timestamp", "created_at", "occurred_at"]),
  };
}

export function normalizeDailyReport(payload: unknown): DailyReport {
  const flagsRaw = pick<unknown>(payload, ["risk_flags", "riskFlags", "flags"]);
  return {
    date: pickString(payload, ["date", "report_date"]),
    signalsCount: pickNumber(payload, ["signals_count", "signals"]),
    entriesCount: pickNumber(payload, ["entries_count", "entries"]),
    closedCount: pickNumber(payload, ["closed_count", "closed_trades"]),
    equityMovePct: pickNumber(payload, ["equity_move_pct", "equityMovePct", "equity_change_pct"]),
    riskFlags: Array.isArray(flagsRaw) ? flagsRaw.map((f) => String(f)) : [],
    notes: pickString(payload, ["notes", "summary"]),
  };
}

export function normalizeScreenerRow(row: unknown, index: number): ScreenerRow {
  return {
    ticker: pickString(row, ["ticker", "symbol"]) ?? `row-${index}`,
    sector: pickString(row, ["sector", "industry"]),
    close: pickNumber(row, ["close", "close_price", "last_price"]),
    meanReversionZScore: pickNumber(row, ["zscore", "z_score", "mean_reversion_zscore", "mr_zscore"]),
    distFromMeanPct: pickNumber(row, ["dist_from_mean_pct", "distFromMeanPct", "dist_pct"]),
    liquidityPercentile: pickNumber(row, [
      "adv_percentile_252d",
      "liquidity_percentile",
      "adv_percentile",
      "liquidity_pct",
    ]),
    advNotionalPkr: pickNumber(row, ["adv_notional_pkr", "advNotionalPkr", "adv_pkr"]),
    relativeStrengthPct: pickNumber(row, ["relative_strength_pct", "relative_strength", "rs_pct"]),
    error: pickString(row, ["error"]),
  };
}

export function normalizeSizingTier(row: unknown, index: number): SizingTier {
  return {
    id: pickString(row, ["tier_id", "id", "name"]) ?? `tier-${index}`,
    name: pickString(row, ["name", "tier_name", "label"]) ?? pickString(row, ["tier_id", "id"]) ?? `Tier ${index + 1}`,
    riskPerTradePct: pickNumber(row, ["risk_per_trade_pct", "riskPerTradePct", "risk_pct"]),
    validated: pick<boolean>(row, ["validated", "real_validated", "backed"]),
    gated: pick<boolean>(row, ["gated", "is_gated"]),
    description: pickString(row, ["description", "note", "summary"]),
  };
}
