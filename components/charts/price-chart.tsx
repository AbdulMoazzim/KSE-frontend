"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  LineStyle,
  type IChartApi,
  type Time,
  type UTCTimestamp,
  type LineWidth,
} from "lightweight-charts";

/**
 * Ported from the KSE Sentinel Terminal (Vite) project's PriceChart.jsx,
 * unchanged in behavior and palette — this is a deliberately distinct
 * "MT4/MT5 terminal" look (cream background, serif-free mono legend),
 * not a re-skin to the dashboard's own light/dark tokens. It does not
 * yet respond to the dashboard's dark-mode toggle; say the word if you
 * want a dark variant added.
 */
const GREEN = "#3F6C51";
const RED = "#A13D3D";
const NAVY = "#1E2761";
const SLATE = "#44546A";
const GOLD = "#B8860B";

// The dashboard already loads these exact families (see app/layout.tsx),
// so reference the loaded font vars instead of hoping the OS has them.
const FONT_MONO = "var(--font-plex-mono), 'IBM Plex Mono', monospace";
const FONT_SANS = "var(--font-plex-sans), 'IBM Plex Sans', sans-serif";

export interface OhlcPoint {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
}
export interface VolumePoint {
  time: Time;
  value: number;
}
export interface TradeMarker {
  date: Time;
  type: "BUY" | "SELL" | "EXIT";
  outcome?: "WIN" | "LOSS";
}
export interface PositionLine {
  price: number;
  color?: string;
  label: string;
}
export interface MeanReversionPoint {
  date: Time;
  mean?: number | null;
  median?: number | null;
  zscore?: number | null;
}
export interface DataWindowPos {
  x: number;
  y: number;
}

/**
 * Converts a StockPricePoint's `date` (shape unconfirmed — see
 * lib/normalize.ts) into lightweight-charts' `Time`: a UTC seconds
 * timestamp for numbers (auto-detecting milliseconds), or the
 * 'YYYY-MM-DD' business-day string it expects for daily bars.
 */
export function toChartTime(date: string | number): Time {
  if (typeof date === "number") {
    const seconds = date > 1e12 ? Math.floor(date / 1000) : date;
    return seconds as UTCTimestamp;
  }
  return date.slice(0, 10) as Time;
}

interface Legend {
  time: Time;
  open: string;
  high: string;
  low: string;
  close: string;
  up: boolean;
  volume: string | null;
  mean: string | null;
  median: string | null;
  zscore: string | null;
}
interface PixelMarker {
  x: number;
  y: number;
  text: string;
  color: string;
  direction: "up" | "down";
}

export interface PriceChartProps {
  symbol?: string;
  ohlcData?: OhlcPoint[];
  volumeData?: VolumePoint[] | null;
  markers?: TradeMarker[];
  positionLines?: PositionLine[];
  meanReversionData?: MeanReversionPoint[] | null;
  watermarkText?: string;
  height?: number;
  dataWindowPos: DataWindowPos;
  onDataWindowPosChange: (pos: DataWindowPos) => void;
}

export default function PriceChart({
  symbol = "",
  ohlcData = [],
  volumeData = null,
  markers = [],
  positionLines = [],
  meanReversionData = null,
  watermarkText = "KSE SENTINEL",
  height = 420,
  dataWindowPos,
  onDataWindowPosChange,
}: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [legend, setLegend] = useState<Legend | null>(null);
  const [pixelMarkers, setPixelMarkers] = useState<PixelMarker[]>([]);

  const hasReversionData = !!meanReversionData && meanReversionData.length > 0;

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      height,
      layout: {
        background: { color: "#FCFBF8" },
        textColor: SLATE,
        fontFamily: FONT_MONO,
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: "rgba(30,39,97,0.08)" },
        horzLines: { color: "rgba(30,39,97,0.08)" },
      },
      timeScale: { borderColor: "rgba(30,39,97,0.20)" },
      rightPriceScale: { borderColor: "rgba(30,39,97,0.20)" },
      crosshair: { mode: 0 },
    });
    chartRef.current = chart;

    chart.priceScale("right").applyOptions({
      scaleMargins: hasReversionData ? { top: 0.05, bottom: 0.45 } : { top: 0.05, bottom: 0.05 },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: GREEN,
      downColor: RED,
      borderVisible: false,
      wickUpColor: GREEN,
      wickDownColor: RED,
    });
    candleSeries.setData(
      ohlcData.map((d) => ({ time: d.time, open: d.open, high: d.high, low: d.low, close: d.close }))
    );

    let volumeByTime: Record<string, number> = {};
    if (volumeData && volumeData.length > 0) {
      volumeByTime = Object.fromEntries(volumeData.map((v) => [String(v.time), v.value]));
      const volumeSeries = chart.addSeries(HistogramSeries, {
        priceFormat: { type: "volume" },
        priceScaleId: "volume",
      });
      chart.priceScale("volume").applyOptions({
        scaleMargins: hasReversionData ? { top: 0.58, bottom: 0.22 } : { top: 0.82, bottom: 0 },
        visible: false,
      });
      volumeSeries.setData(
        volumeData.map((v, i) => {
          const bar = ohlcData[i];
          const up = bar ? bar.close >= bar.open : true;
          return { time: v.time, value: v.value, color: up ? "rgba(63,108,81,0.5)" : "rgba(161,61,61,0.5)" };
        })
      );
    }

    if (hasReversionData && meanReversionData) {
      const meanSeries = chart.addSeries(LineSeries, {
        color: GOLD,
        lineWidth: 1.5 as LineWidth,
        lineStyle: LineStyle.Solid,
        priceScaleId: "right",
        lastValueVisible: false,
        priceLineVisible: false,
      });
      meanSeries.setData(
        meanReversionData
          .filter((d) => d.mean !== null && d.mean !== undefined)
          .map((d) => ({ time: d.date, value: d.mean as number }))
      );

      const medianSeries = chart.addSeries(LineSeries, {
        color: "rgba(184,134,11,0.85)",
        lineWidth: 1.5 as LineWidth,
        lineStyle: LineStyle.Dotted,
        priceScaleId: "right",
        lastValueVisible: false,
        priceLineVisible: false,
      });
      medianSeries.setData(
        meanReversionData
          .filter((d) => d.median !== null && d.median !== undefined)
          .map((d) => ({ time: d.date, value: d.median as number }))
      );

      const zscoreSeries = chart.addSeries(LineSeries, {
        color: NAVY,
        lineWidth: 1.5 as LineWidth,
        priceScaleId: "zscore",
        lastValueVisible: true,
        priceLineVisible: false,
      });
      chart.priceScale("zscore").applyOptions({
        scaleMargins: { top: 0.83, bottom: 0 },
      });
      zscoreSeries.setData(
        meanReversionData
          .filter((d) => d.zscore !== null && d.zscore !== undefined)
          .map((d) => ({ time: d.date, value: d.zscore as number }))
      );
      zscoreSeries.createPriceLine({
        price: 2.0, color: RED, lineWidth: 1, lineStyle: LineStyle.Dashed,
        axisLabelVisible: true, title: "+2.0",
      });
      zscoreSeries.createPriceLine({
        price: -2.0, color: GREEN, lineWidth: 1, lineStyle: LineStyle.Dashed,
        axisLabelVisible: true, title: "-2.0",
      });
      zscoreSeries.createPriceLine({
        price: 0, color: "rgba(68,84,106,0.35)", lineWidth: 1, lineStyle: LineStyle.Solid,
        axisLabelVisible: false, title: "",
      });
    }

    positionLines.forEach((line) => {
      candleSeries.createPriceLine({
        price: line.price,
        color: line.color || NAVY,
        lineWidth: 2,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: line.label,
      });
    });

    const dataByTime: Record<string, OhlcPoint> = Object.fromEntries(ohlcData.map((d) => [String(d.time), d]));
    const reversionByDate: Record<string, MeanReversionPoint> = Object.fromEntries(
      (meanReversionData || []).map((d) => [String(d.date), d])
    );

    function computePixelMarkers() {
      const pts = markers
        .map((m): PixelMarker | null => {
          const bar = dataByTime[String(m.date)];
          if (!bar) return null;
          const x = chart.timeScale().timeToCoordinate(m.date);
          if (x === null) return null;

          if (m.type === "EXIT") {
            const priceY = candleSeries.priceToCoordinate(bar.high);
            if (priceY === null) return null;
            return { x, y: priceY - 10, text: "Exit", color: m.outcome === "WIN" ? GREEN : RED, direction: "down" };
          }
          if (m.type === "BUY") {
            const priceY = candleSeries.priceToCoordinate(bar.low);
            if (priceY === null) return null;
            return { x, y: priceY + 10, text: "Buy", color: GREEN, direction: "up" };
          }
          const priceY = candleSeries.priceToCoordinate(bar.high);
          if (priceY === null) return null;
          return { x, y: priceY - 10, text: "Sell", color: RED, direction: "down" };
        })
        .filter((p): p is PixelMarker => p !== null);

      const MIN_GAP = 50;
      pts.sort((a, b) => a.x - b.x);
      for (let i = 1; i < pts.length; i++) {
        if (pts[i].x - pts[i - 1].x < MIN_GAP) {
          pts[i].x = pts[i - 1].x + MIN_GAP;
        }
      }

      setPixelMarkers(pts);
    }

    computePixelMarkers();
    chart.timeScale().subscribeVisibleTimeRangeChange(computePixelMarkers);
    chart.timeScale().fitContent();

    const showLegendFor = (bar: OhlcPoint | undefined) => {
      if (!bar) return setLegend(null);
      const rev = reversionByDate[String(bar.time)];
      setLegend({
        time: bar.time,
        open: bar.open.toFixed(2),
        high: bar.high.toFixed(2),
        low: bar.low.toFixed(2),
        close: bar.close.toFixed(2),
        up: bar.close >= bar.open,
        volume: volumeByTime[String(bar.time)] != null ? Math.round(volumeByTime[String(bar.time)]).toLocaleString("en-US") : null,
        mean: rev && rev.mean != null ? rev.mean.toFixed(2) : null,
        median: rev && rev.median != null ? rev.median.toFixed(2) : null,
        zscore: rev && rev.zscore != null ? rev.zscore.toFixed(2) : null,
      });
    };
    showLegendFor(ohlcData[ohlcData.length - 1]);

    chart.subscribeCrosshairMove((param) => {
      if (!param.time) {
        showLegendFor(ohlcData[ohlcData.length - 1]);
        return;
      }
      showLegendFor(dataByTime[String(param.time)]);
    });

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
      computePixelMarkers();
    };
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.timeScale().unsubscribeVisibleTimeRangeChange(computePixelMarkers);
      chart.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ohlcData, volumeData, markers, positionLines, meanReversionData, height]);

  const tileCols = 5;
  const tileRows = 4;
  const watermarkTiles: React.ReactNode[] = [];
  for (let r = 0; r < tileRows; r++) {
    for (let c = 0; c < tileCols; c++) {
      watermarkTiles.push(
        <span
          key={`${r}-${c}`}
          style={{
            position: "absolute",
            top: `${(r / tileRows) * 100}%`,
            left: `${(c / tileCols) * 100}%`,
            transform: "rotate(-28deg)",
            fontFamily: FONT_SANS,
            fontSize: 14,
            fontWeight: 600,
            color: "rgba(30,39,97,0.16)",
            whiteSpace: "nowrap",
          }}
        >
          {watermarkText}
        </span>
      );
    }
  }

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <DataWindow symbol={symbol} legend={legend} pos={dataWindowPos} setPos={onDataWindowPosChange} />

      {hasReversionData && (
        <div
          style={{
            position: "absolute", top: 8, right: 8, zIndex: 3,
            fontFamily: FONT_MONO, fontSize: 11,
            color: SLATE, background: "rgba(252,251,248,0.85)",
            padding: "3px 8px", borderRadius: 2, pointerEvents: "none",
          }}
        >
          <span style={{ color: GOLD, fontWeight: 600 }}>— mean</span>
          <span style={{ marginLeft: 8, color: "rgba(184,134,11,0.9)" }}>···· median</span>
          <span style={{ marginLeft: 8, color: NAVY }}>z-score below</span>
        </div>
      )}

      <div ref={containerRef} style={{ width: "100%", height }} />

      <div
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 1 }}
      >
        {watermarkTiles}
      </div>

      {pixelMarkers.map((pm, i) => (
        <PillMarker key={i} x={pm.x} y={pm.y} text={pm.text} color={pm.color} direction={pm.direction} />
      ))}
    </div>
  );
}

/**
 * MT4/MT5-style floating table showing OHLCV + mean-reversion values for
 * whatever bar is under the crosshair. Draggable by its header; position
 * is controlled from the parent (dataWindowPos/onDataWindowPosChange) so
 * it survives PriceChart re-renders within the same page mount.
 */
function DataWindow({
  symbol, legend, pos, setPos,
}: { symbol: string; legend: Legend | null; pos: DataWindowPos; setPos: (pos: DataWindowPos) => void }) {
  const dragState = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

  const onMouseMove = (e: MouseEvent) => {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    setPos({ x: dragState.current.origX + dx, y: dragState.current.origY + dy });
  };

  const onMouseUp = () => {
    dragState.current = null;
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  };

  const onHeaderMouseDown = (e: React.MouseEvent) => {
    dragState.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!legend) {
    return (
      <div
        style={{
          position: "absolute", left: pos.x, top: pos.y, zIndex: 3,
          fontFamily: FONT_MONO, fontSize: 12.5,
          color: SLATE, background: "rgba(252,251,248,0.9)",
          padding: "4px 8px", borderRadius: 2, pointerEvents: "none",
        }}
      >
        {symbol && <span style={{ fontWeight: 700, color: NAVY }}>{symbol}</span>} no data
      </div>
    );
  }

  const rows: [string, string, string?][] = [
    ["Date", String(legend.time)],
    ["Open", legend.open],
    ["High", legend.high],
    ["Low", legend.low],
    ["Close", legend.close],
    ...(legend.volume != null ? [["Volume", legend.volume] as [string, string]] : []),
    ...(legend.mean != null ? [["Mean", legend.mean, GOLD] as [string, string, string]] : []),
    ...(legend.median != null ? [["Median", legend.median, "rgba(184,134,11,0.75)"] as [string, string, string]] : []),
    ...(legend.zscore != null ? [["Z-Score", legend.zscore, NAVY] as [string, string, string]] : []),
  ];

  return (
    <div
      style={{
        position: "absolute", left: pos.x, top: pos.y, zIndex: 3,
        fontFamily: FONT_MONO, fontSize: 12,
        color: SLATE, background: "rgba(252,251,248,0.96)",
        border: "1px solid rgba(30,39,97,0.18)", borderRadius: 3,
        minWidth: 178, overflow: "hidden",
        boxShadow: "0 2px 8px rgba(30,39,97,0.15)",
      }}
    >
      <div
        onMouseDown={onHeaderMouseDown}
        style={{
          padding: "6px 10px", background: "rgba(30,39,97,0.06)",
          fontWeight: 700, color: NAVY, fontSize: 12.5,
          borderBottom: "1px solid rgba(30,39,97,0.12)",
          cursor: "grab", userSelect: "none", pointerEvents: "auto",
        }}
      >
        {symbol}
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", pointerEvents: "none" }}>
        <tbody>
          {rows.map(([label, value, color], i) => (
            <tr key={label} style={{ borderTop: i > 0 ? "1px solid rgba(30,39,97,0.08)" : "none" }}>
              <td style={{ padding: "3px 10px", color: SLATE, fontSize: 11 }}>{label}</td>
              <td style={{ padding: "3px 10px", textAlign: "right", fontWeight: 600, color: color || NAVY }}>
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PillMarker({ x, y, text, color, direction }: { x: number; y: number; text: string; color: string; direction: "up" | "down" }) {
  const W = 46, H = 20, TAIL = 7, TAILW = 9, R = 5;
  const totalH = H + TAIL;
  const top = direction === "up" ? y : y - totalH;
  const pillTop = direction === "up" ? TAIL : 0;
  const tailPoints = direction === "up"
    ? `${W / 2 - TAILW / 2},${TAIL} ${W / 2 + TAILW / 2},${TAIL} ${W / 2},0`
    : `${W / 2 - TAILW / 2},${H} ${W / 2 + TAILW / 2},${H} ${W / 2},${H + TAIL}`;
  return (
    <svg width={W} height={totalH} style={{ position: "absolute", left: x - W / 2, top, zIndex: 2, pointerEvents: "none" }}>
      <polygon points={tailPoints} fill={color} />
      <rect x={0} y={pillTop} width={W} height={H} rx={R} ry={R} fill={color} />
      <text x={W / 2} y={pillTop + H / 2 + 4} textAnchor="middle" fontFamily={FONT_SANS} fontSize="10.5" fontWeight="700" fill="#FFFFFF">
        {text}
      </text>
    </svg>
  );
}
