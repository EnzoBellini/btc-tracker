import { useMemo } from "react";
import type { TradeChartResponse } from "@shared/tradeChart";
import { fmtUsdt } from "@/lib/format";
import { cn } from "@/lib/utils";
import { StatPill } from "@/components/tk";

const CHART_W = 640;
const CHART_H = 240;
const PAD = { top: 16, right: 72, bottom: 28, left: 8 };

type Props = {
  data: TradeChartResponse;
  className?: string;
};

function exitReasonLabel(reason: TradeChartResponse["exitReason"]): { label: string; tone: "profit" | "loss" | "neutral" | "info" } {
  switch (reason) {
    case "TP":
      return { label: "Saída no alvo (TP)", tone: "profit" };
    case "SL":
      return { label: "Saída no stop (SL)", tone: "loss" };
    case "MANUAL":
      return { label: "Saída manual / parcial", tone: "neutral" };
    default:
      return { label: "Saída indefinida", tone: "info" };
  }
}

export default function TradeChart({ data, className }: Props) {
  const innerW = CHART_W - PAD.left - PAD.right;
  const innerH = CHART_H - PAD.top - PAD.bottom;

  const { yMin, yMax, exitIdx } = useMemo(() => {
    const prices = data.candles.flatMap((c) => [c.high, c.low]);
    const levelPrices = Object.values(data.levels).filter((v): v is number => v != null && v > 0);
    const all = [...prices, ...levelPrices];
    if (!all.length) return { yMin: 0, yMax: 1, exitIdx: -1 };

    let min = Math.min(...all);
    let max = Math.max(...all);
    const pad = (max - min) * 0.08 || max * 0.01 || 1;
    min -= pad;
    max += pad;

    let idx = -1;
    if (data.levels.exit) {
      let best = Infinity;
      data.candles.forEach((c, i) => {
        const dist = Math.abs(c.close - data.levels.exit!);
        if (dist < best) {
          best = dist;
          idx = i;
        }
      });
    } else {
      idx = data.candles.length - 1;
    }

    return { yMin: min, yMax: max, exitIdx: idx };
  }, [data]);

  const yScale = (price: number) => {
    const range = yMax - yMin || 1;
    return PAD.top + innerH - ((price - yMin) / range) * innerH;
  };

  const xScale = (index: number) => {
    const n = Math.max(data.candles.length - 1, 1);
    return PAD.left + (index / n) * innerW;
  };

  const candleW = Math.max(2, Math.min(8, innerW / Math.max(data.candles.length, 1) * 0.65));
  const exitCfg = exitReasonLabel(data.exitReason);

  const levelLines: { key: keyof TradeChartResponse["levels"]; price?: number; color: string; dash?: string; label: string }[] = [
    { key: "target", price: data.levels.target, color: "hsl(var(--profit))", dash: "6 4", label: "TP" },
    { key: "entry", price: data.levels.entry, color: "hsl(var(--primary))", label: "Entrada" },
    { key: "stop", price: data.levels.stop, color: "hsl(var(--loss))", dash: "6 4", label: "SL" },
    { key: "exit", price: data.levels.exit, color: "#fff", label: "Saída" },
  ];

  const timeLabels = useMemo(() => {
    if (data.candles.length < 2) return [];
    const picks = [0, Math.floor(data.candles.length / 2), data.candles.length - 1];
    return Array.from(new Set(picks)).map((i) => ({
      x: xScale(i),
      label: new Date(data.candles[i].time).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
    }));
  }, [data.candles]);

  if (!data.candles.length) {
    return (
      <div className={cn("flex h-[280px] items-center justify-center border border-border bg-black/20", className)}>
        <p className="font-mono-tk text-xs text-muted-foreground">Sem candles para este intervalo.</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <StatPill tone={exitCfg.tone}>{exitCfg.label}</StatPill>
        <span className="font-mono-tk text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {data.interval} · {data.klineSource}
        </span>
      </div>

      <div className="overflow-x-auto border border-border bg-black/30">
        <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} width="100%" height={CHART_H} className="min-w-[320px]">
          {/* grid */}
          {[0.25, 0.5, 0.75].map((pct) => {
            const y = PAD.top + innerH * pct;
            return (
              <line
                key={pct}
                x1={PAD.left}
                x2={CHART_W - PAD.right}
                y1={y}
                y2={y}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={1}
              />
            );
          })}

          {/* candles */}
          {data.candles.map((c, i) => {
            const x = xScale(i);
            const bullish = c.close >= c.open;
            const color = bullish ? "hsl(var(--profit))" : "hsl(var(--loss))";
            const bodyTop = yScale(Math.max(c.open, c.close));
            const bodyBot = yScale(Math.min(c.open, c.close));
            const bodyH = Math.max(bodyBot - bodyTop, 1);
            return (
              <g key={c.time}>
                <line x1={x} x2={x} y1={yScale(c.high)} y2={yScale(c.low)} stroke={color} strokeWidth={1} opacity={0.85} />
                <rect x={x - candleW / 2} y={bodyTop} width={candleW} height={bodyH} fill={color} opacity={0.9} />
              </g>
            );
          })}

          {/* level lines */}
          {levelLines.map(({ key, price, color, dash, label }) => {
            if (!price || price <= 0) return null;
            const y = yScale(price);
            return (
              <g key={key}>
                <line
                  x1={PAD.left}
                  x2={CHART_W - PAD.right}
                  y1={y}
                  y2={y}
                  stroke={color}
                  strokeWidth={key === "entry" || key === "exit" ? 1.5 : 1}
                  strokeDasharray={dash}
                  opacity={key === "exit" ? 0.95 : 0.7}
                />
                <text
                  x={CHART_W - PAD.right + 6}
                  y={y + 4}
                  fill={color}
                  fontSize={10}
                  fontFamily="var(--font-mono, monospace)"
                >
                  {label} {fmtUsdt(price)}
                </text>
              </g>
            );
          })}

          {/* exit marker */}
          {exitIdx >= 0 && data.levels.exit && (
            <circle
              cx={xScale(exitIdx)}
              cy={yScale(data.levels.exit)}
              r={5}
              fill="#fff"
              stroke={data.exitReason === "TP" ? "hsl(var(--profit))" : data.exitReason === "SL" ? "hsl(var(--loss))" : "hsl(var(--primary))"}
              strokeWidth={2}
            />
          )}

          {/* time axis */}
          {timeLabels.map(({ x, label }) => (
            <text key={label} x={x} y={CHART_H - 6} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize={9} fontFamily="var(--font-mono, monospace)">
              {label}
            </text>
          ))}
        </svg>
      </div>

      {data.warnings.length > 0 && (
        <ul className="space-y-1 border-l-2 border-primary/30 pl-3">
          {data.warnings.map((w) => (
            <li key={w} className="font-mono-tk text-[10px] leading-relaxed text-muted-foreground">
              {w}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
