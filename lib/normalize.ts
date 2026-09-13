import {
  AltmanZScore,
  ClosedTrade,
  ConfidenceBucket,
  CorporateAnalysis,
  DailyReport,
  DcfValuation,
  DocIntelStatus,
  DuPontBreakdown,
  ForwardPaperProgress,
  FundamentalsFiling,
  KillSwitchEvent,
  KillSwitchStatus,
  LiveSignal,
  LiveSignalSummary,
  LotSizeStatus,
  LotSizeSymbol,
  OpenPosition,
  PiotroskiFScore,
  ScreenerRow,
  SizingTier,
  StockPricePoint,
  StrategyBreakdownRow,
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

/** One bar from /sentinel/market-data/{ticker}. Shape wasn't confirmed against the live schema, so this tries the common candidate field names and drops any bar missing a real OHLC (a bar with no close price isn't chartable). */
export function normalizeMarketDataPoint(row: unknown): StockPricePoint | null {
  const date = pick<string | number>(row, ["date", "timestamp", "t", "time", "datetime"]);
  const open = pickNumber(row, ["open", "o"]);
  const high = pickNumber(row, ["high", "h"]);
  const low = pickNumber(row, ["low", "l"]);
  const close = pickNumber(row, ["close", "c", "price"]);
  if (date === null || open === null || high === null || low === null || close === null) return null;
  return { date, open, high, low, close, volume: pickNumber(row, ["volume", "v", "vol"]) };
}

/** Buckets a docintel confidence number (unconfirmed scale — tries 0–1 and 0–100) into the three levels the UI shows. */
function bucketConfidence(raw: number | null): ConfidenceBucket {
  if (raw === null) return null;
  const pct = raw <= 1 ? raw * 100 : raw;
  if (pct >= 80) return "high";
  if (pct >= 50) return "mid";
  return "low";
}

/** /sentinel/docintel/status/{job_id} — shape unconfirmed, so this buckets whatever status string comes back by keyword rather than expecting an exact enum value. */
export function normalizeDocIntelStatus(raw: unknown): { status: DocIntelStatus; error: string | null } {
  const statusRaw = pickString(raw, ["status", "state", "job_status"]);
  const error = pickString(raw, ["error", "message", "detail"]);
  if (!statusRaw) return { status: "unknown", error };
  const s = statusRaw.toLowerCase();
  if (/(done|complete|success|finished)/.test(s)) return { status: "done", error };
  if (/(fail|error)/.test(s)) return { status: "failed", error };
  if (/(process|pending|queue|running|extract)/.test(s)) return { status: "processing", error };
  return { status: "unknown", error };
}

/** /sentinel/docintel/result/{job_id} — shape unconfirmed; best-effort field matching, never fabricated. */
export function normalizeDocIntelResult(raw: unknown): {
  documentType: string | null;
  company: string | null;
  confidence: number | null;
  confidenceBucket: ConfidenceBucket;
} {
  const confidence = pickNumber(raw, ["confidence", "confidence_score", "score"]);
  return {
    documentType: pickString(raw, ["document_type", "doc_type", "type", "classification"]),
    company: pickString(raw, ["ticker", "company", "company_name", "symbol"]),
    confidence,
    confidenceBucket: bucketConfidence(confidence),
  };
}

// ---- Corporate analysis / fundamentals (confirmed shape) -----------------

/** Pulls every numeric leaf out of an object into a flat Record, for sections like "components" or "derived_ratios" that are just a bag of named numbers. */
function pickNumberRecord(row: unknown, keys: string[]): Record<string, number> | null {
  const obj = pick<Record<string, unknown>>(row, keys);
  if (!obj || typeof obj !== "object") return null;
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(obj)) {
    const num = typeof v === "number" ? v : Number(v);
    if (Number.isFinite(num)) out[k] = num;
  }
  return Object.keys(out).length ? out : null;
}

function pickBooleanRecord(row: unknown, keys: string[]): Record<string, boolean> | null {
  const obj = pick<Record<string, unknown>>(row, keys);
  if (!obj || typeof obj !== "object") return null;
  const out: Record<string, boolean> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === "boolean") out[k] = v;
    else if (v === "Yes" || v === "yes" || v === "true") out[k] = true;
    else if (v === "No" || v === "no" || v === "false") out[k] = false;
  }
  return Object.keys(out).length ? out : null;
}

function omit(record: Record<string, unknown>, keys: string[]): Record<string, unknown> {
  const keySet = new Set(keys);
  return Object.fromEntries(Object.entries(record).filter(([k]) => !keySet.has(k)));
}

export function normalizeCorporateAnalysis(payload: unknown): CorporateAnalysis {
  if (typeof payload !== "object" || payload === null) {
    return {
      message: null,
      tickerSymbol: null,
      evaluationTimestamp: null,
      targetFiscalPeriod: null,
      dataSourceMode: null,
      dupont: null,
      altmanZ: null,
      piotroskiF: null,
      dcf: null,
      extra: {},
    };
  }
  const record = payload as Record<string, unknown>;
  const metadata = pick<Record<string, unknown>>(record, ["metadata"]) ?? {};
  const dupontRaw = pick<Record<string, unknown>>(record, ["dupont_profitability_breakdown", "dupont"]);
  const solvency = pick<Record<string, unknown>>(record, ["solvency_and_credit_metrics", "solvency"]);
  const altmanRaw = pick<Record<string, unknown>>(solvency, ["altman_z_score_results", "altman_z_score"]);
  const piotroskiRaw = pick<Record<string, unknown>>(solvency, ["piotroski_f_score"]);
  const valuation = pick<Record<string, unknown>>(record, ["intrinsic_valuation_model_output", "valuation"]);
  const valuationBreakdown = pick<Record<string, unknown>>(valuation, ["valuation_data_breakdown"]);

  const dupont: DuPontBreakdown | null = dupontRaw
    ? {
        netProfitMarginPct: pickNumber(dupontRaw, ["net_profit_margin_pct"]),
        assetTurnoverRatio: pickNumber(dupontRaw, ["asset_turnover_ratio"]),
        equityMultiplierLeverage: pickNumber(dupontRaw, ["equity_multiplier_leverage"]),
        resolvedReturnOnEquityPct: pickNumber(dupontRaw, ["resolved_return_on_equity_pct"]),
      }
    : null;

  const altmanZ: AltmanZScore | null = altmanRaw
    ? {
        score: pickNumber(altmanRaw, ["altman_z_score", "score"]),
        insolvencyRiskZone: pickString(altmanRaw, ["insolvency_risk_zone"]),
        components: pickNumberRecord(altmanRaw, ["components"]),
      }
    : null;

  const scoreBreakdown = pick<Record<string, unknown>>(piotroskiRaw, ["score_breakdown"]);
  const piotroskiF: PiotroskiFScore | null = piotroskiRaw
    ? {
        score: pickNumber(piotroskiRaw, ["piotroski_f_score_integer", "score"]),
        maxScore: 9,
        strengthRating: pickString(piotroskiRaw, ["financial_strength_rating"]),
        breakdown: pickBooleanRecord({ score_breakdown: scoreBreakdown }, ["score_breakdown"]),
      }
    : null;

  const dcf: DcfValuation | null =
    valuation || valuationBreakdown
      ? {
          valuationPkr: pickNumber(valuation, ["discounted_cash_flow_valuation_pkr"]),
          presentValueOperatingCashFlows: pickNumber(valuationBreakdown, ["present_value_operating_cash_flows"]),
          discountedTerminalValue: pickNumber(valuationBreakdown, ["discounted_terminal_value"]),
          calculatedEnterpriseValue: pickNumber(valuationBreakdown, ["calculated_enterprise_value"]),
          adjustedEquityValue: pickNumber(valuationBreakdown, ["adjusted_equity_value"]),
        }
      : null;

  const knownTopKeys = [
    "msg",
    "message",
    "ticker_symbol",
    "metadata",
    "dupont_profitability_breakdown",
    "dupont",
    "solvency_and_credit_metrics",
    "solvency",
    "intrinsic_valuation_model_output",
    "valuation",
  ];

  return {
    message: pickString(record, ["msg", "message"]),
    tickerSymbol: pickString(record, ["ticker_symbol"]),
    evaluationTimestamp: pickString(metadata, ["evaluation_timestamp"]),
    targetFiscalPeriod: pickString(metadata, ["target_fiscal_period"]),
    dataSourceMode: pickString(metadata, ["data_source_mode"]),
    dupont,
    altmanZ,
    piotroskiF,
    dcf,
    extra: omit(record, knownTopKeys),
  };
}

export function normalizeFundamentalsFiling(payload: unknown): FundamentalsFiling {
  if (typeof payload !== "object" || payload === null) {
    return {
      ticker: null,
      companyName: null,
      sector: null,
      filingPeriodEnd: null,
      consolidated: null,
      extractionStatus: null,
      verificationNotes: null,
      sourceDocumentUrl: null,
      sourceDocumentHash: null,
      unit: null,
      derivedRatios: null,
      extra: {},
    };
  }
  const record = payload as Record<string, unknown>;
  const consolidatedRaw = pick<unknown>(record, ["consolidated"]);

  const knownKeys = [
    "ticker",
    "company_name",
    "sector",
    "filing_period_end",
    "consolidated",
    "extraction_status",
    "verification_notes",
    "source_document_url",
    "source_document_hash",
    "unit",
    "derived_ratios",
    // already surfaced elsewhere on the page / not filing metadata
    "corporate_analysis",
  ];

  return {
    ticker: pickString(record, ["ticker"]),
    companyName: pickString(record, ["company_name"]),
    sector: pickString(record, ["sector"]),
    filingPeriodEnd: pickString(record, ["filing_period_end"]),
    consolidated:
      consolidatedRaw === null
        ? null
        : consolidatedRaw === true || consolidatedRaw === "Yes" || consolidatedRaw === "yes",
    extractionStatus: pickString(record, ["extraction_status"]),
    verificationNotes: pickString(record, ["verification_notes"]),
    sourceDocumentUrl: pickString(record, ["source_document_url"]),
    sourceDocumentHash: pickString(record, ["source_document_hash"]),
    unit: pickString(record, ["unit"]),
    derivedRatios: pickNumberRecord(record, ["derived_ratios"]),
    extra: omit(record, knownKeys),
  };
}

// ---- Ops / System Health (confirmed shapes) -------------------------------

export function normalizeForwardPaperProgress(payload: unknown): ForwardPaperProgress {
  return {
    targetDays: pickNumber(payload, ["target_days"]),
    daysCompleted: pickNumber(payload, ["days_completed"]),
    daysRemaining: pickNumber(payload, ["days_remaining"]),
    pctComplete: pickNumber(payload, ["pct_complete"]),
    windowStartDate: pickString(payload, ["window_start_date"]),
    firstSnapshotDate: pickString(payload, ["first_snapshot_date"]),
    lastSnapshotDate: pickString(payload, ["last_snapshot_date"]),
    calendarDaysElapsed: pickNumber(payload, ["calendar_days_elapsed_since_start"]),
  };
}

export function normalizeStrategyBreakdown(payload: unknown): StrategyBreakdownRow[] {
  const rows = extractArray(pick(payload, ["strategies"]) ?? payload, ["strategies"]);
  return rows.map((row, i) => ({
    strategyName: pickString(row, ["strategy_name", "strategy", "name"]) ?? `Strategy ${i + 1}`,
    openCount: pickNumber(row, ["open_count", "open_positions", "open"]),
    closedCount: pickNumber(row, ["closed_count", "closed_trades", "closed"]),
    realizedPnl: pickNumber(row, ["realized_pnl", "realized_pct", "pnl"]),
  }));
}

export function normalizeLotSizeStatus(payload: unknown): LotSizeStatus {
  const symbolsRaw = extractArray(pick(payload, ["symbols"]) ?? payload, ["symbols"]);
  const symbols: LotSizeSymbol[] = symbolsRaw.map((row, i) => {
    const rowExists = pick<unknown>(row, ["row_exists"]);
    return {
      symbol: pickString(row, ["symbol", "ticker"]) ?? `symbol-${i}`,
      status: pickString(row, ["status"]),
      rowExists: rowExists === null ? null : rowExists === true || rowExists === "Yes",
      lotSize: pickNumber(row, ["lot_size"]),
      lotSizeSource: pickString(row, ["lot_size_source"]),
      lotSizeVerifiedAt: pickString(row, ["lot_size_verified_at"]),
      symbolConfidence: pickString(row, ["symbol_confidence"]),
    };
  });
  return {
    totalSymbols: pickNumber(payload, ["total_symbols"]),
    confirmedCount: pickNumber(payload, ["confirmed_count"]),
    fallbackCount: pickNumber(payload, ["fallback_count"]),
    unverifiedCount: pickNumber(payload, ["unverified_symbol_count"]),
    staleCount: pickNumber(payload, ["stale_symbol_count"]),
    symbols,
  };
}

/**
 * Groups whatever /sentinel/fundamentals actually returns by statement
 * type — real nested groups if the backend provides them
 * (income_statement, balance_sheet, cash_flow), keyword-matching flat
 * field names otherwise. Shared by the Financials and Fundamentals pages.
 */
export function extractStatementBuckets(
  raw: unknown
): { income: Record<string, unknown>; balance: Record<string, unknown>; cashflow: Record<string, unknown> } {
  const empty = { income: {}, balance: {}, cashflow: {} };
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return empty;
  const record = raw as Record<string, unknown>;

  const pickNested = (keys: string[]): Record<string, unknown> | null => {
    for (const k of keys) {
      const v = record[k];
      if (v && typeof v === "object" && !Array.isArray(v)) return v as Record<string, unknown>;
    }
    return null;
  };
  const incomeNested = pickNested(["income_statement", "incomeStatement", "income"]);
  const balanceNested = pickNested(["balance_sheet", "balanceSheet", "balance"]);
  const cashflowNested = pickNested(["cash_flow", "cashFlow", "cashflow"]);
  if (incomeNested || balanceNested || cashflowNested) {
    return { income: incomeNested ?? {}, balance: balanceNested ?? {}, cashflow: cashflowNested ?? {} };
  }

  const buckets = { income: {} as Record<string, unknown>, balance: {} as Record<string, unknown>, cashflow: {} as Record<string, unknown> };
  for (const [key, value] of Object.entries(record)) {
    if (/(cash.?flow|operating.?activit|investing.?activit|financing.?activit|capex)/i.test(key)) buckets.cashflow[key] = value;
    else if (/(asset|liabilit|equity|capital|reserve|debt|payable|receivable|inventory|borrowing)/i.test(key)) buckets.balance[key] = value;
    else if (/(revenue|sales|income|profit|earning|eps|ebitda|expense|margin|tax)/i.test(key)) buckets.income[key] = value;
  }
  return buckets;
}
