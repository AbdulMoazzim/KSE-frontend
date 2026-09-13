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

/** One OHLCV bar from /sentinel/market-data/{ticker}. Response shape wasn't confirmed against the live schema — see lib/normalize.ts. */
export interface StockPricePoint {
  date: string | number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number | null;
}

export type DocIntelStatus = "processing" | "done" | "failed" | "unknown";
export type ConfidenceBucket = "high" | "mid" | "low" | null;

/**
 * One uploaded document, tracked client-side for this session. There's
 * no list/history endpoint in the docintel API (submit + poll status +
 * fetch result only), so this page can only show what was uploaded
 * during the current visit — not a persisted archive.
 */
export interface DocIntelJob {
  jobId: string;
  filename: string;
  uploadedAt: Date;
  status: DocIntelStatus;
  documentType: string | null;
  company: string | null;
  confidence: number | null;
  confidenceBucket: ConfidenceBucket;
  error: string | null;
}
// ---- Corporate analysis (GET /corporate/analyze/{ticker}) ----------------
// Field names confirmed from a real response — see lib/normalize.ts for
// the (still defensive) key-picking, since minor naming drift is still
// possible across tickers/filing types.

export interface DuPontBreakdown {
  netProfitMarginPct: number | null;
  assetTurnoverRatio: number | null;
  equityMultiplierLeverage: number | null;
  resolvedReturnOnEquityPct: number | null;
}

export interface AltmanZScore {
  score: number | null;
  insolvencyRiskZone: string | null;
  components: Record<string, number> | null;
}

export interface PiotroskiFScore {
  score: number | null;
  maxScore: number;
  strengthRating: string | null;
  breakdown: Record<string, boolean> | null;
}

export interface DcfValuation {
  valuationPkr: number | null;
  presentValueOperatingCashFlows: number | null;
  discountedTerminalValue: number | null;
  calculatedEnterpriseValue: number | null;
  adjustedEquityValue: number | null;
}

export interface CorporateAnalysis {
  message: string | null;
  tickerSymbol: string | null;
  evaluationTimestamp: string | null;
  targetFiscalPeriod: string | null;
  dataSourceMode: string | null;
  dupont: DuPontBreakdown | null;
  altmanZ: AltmanZScore | null;
  piotroskiF: PiotroskiFScore | null;
  dcf: DcfValuation | null;
  /** Anything present in the response that isn't one of the sections above — never silently dropped. */
  extra: Record<string, unknown>;
}

export interface FundamentalsFiling {
  ticker: string | null;
  companyName: string | null;
  sector: string | null;
  filingPeriodEnd: string | null;
  consolidated: boolean | null;
  extractionStatus: string | null;
  verificationNotes: string | null;
  sourceDocumentUrl: string | null;
  sourceDocumentHash: string | null;
  unit: string | null;
  derivedRatios: Record<string, number> | null;
  /** Anything present that isn't one of the fields above. */
  extra: Record<string, unknown>;
}

// ---- Ops / System Health (confirmed shapes) -------------------------------

export interface ForwardPaperProgress {
  targetDays: number | null;
  daysCompleted: number | null;
  daysRemaining: number | null;
  pctComplete: number | null;
  windowStartDate: string | null;
  firstSnapshotDate: string | null;
  lastSnapshotDate: string | null;
  calendarDaysElapsed: number | null;
}

export interface StrategyBreakdownRow {
  strategyName: string;
  openCount: number | null;
  closedCount: number | null;
  realizedPnl: number | null;
}

export interface LotSizeSymbol {
  symbol: string;
  status: string | null;
  rowExists: boolean | null;
  lotSize: number | null;
  lotSizeSource: string | null;
  lotSizeVerifiedAt: string | null;
  symbolConfidence: string | null;
}

export interface LotSizeStatus {
  totalSymbols: number | null;
  confirmedCount: number | null;
  fallbackCount: number | null;
  unverifiedCount: number | null;
  staleCount: number | null;
  symbols: LotSizeSymbol[];
}
