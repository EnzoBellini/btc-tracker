export type TradeChartCandle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type TradeChartLevel = {
  entry?: number;
  stop?: number;
  target?: number;
  exit?: number;
};

export type TradeChartExitReason = "TP" | "SL" | "MANUAL" | "UNKNOWN";

export type TradeChartResponse = {
  pair: string;
  direction: string;
  status: string;
  interval: string;
  candles: TradeChartCandle[];
  levels: TradeChartLevel;
  exitReason: TradeChartExitReason;
  warnings: string[];
  closeTime: string;
  klineSource: string;
};
