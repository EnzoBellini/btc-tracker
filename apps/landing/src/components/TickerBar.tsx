import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useMarketTicker } from "@/hooks/useMarketTicker";

/** Ícones Lucide importados estaticamente — sem render dinâmico. */
function TickerDeltaIcon({ up }: { up: boolean }) {
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={`inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full ${
        up ? "bg-tk-green/15" : "bg-tk-red/15"
      }`}
      aria-hidden
    >
      <Icon className={`h-2.5 w-2.5 ${up ? "text-tk-green" : "text-tk-red"}`} strokeWidth={2.75} />
    </span>
  );
}

export function TickerBar() {
  const { items } = useMarketTicker();

  return (
    <div className="tk-ticker-bar relative overflow-x-clip border-y border-white/[0.08] bg-black">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-black to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-black to-transparent" />
      <div className="flex w-max min-h-[38px] items-center tk-marquee">
        {[...items, ...items].map((item, i) => (
          <div
            key={`${item.symbol}-${i}`}
            className="flex shrink-0 items-center gap-3 border-r border-white/[0.06] px-6 py-3 font-mono text-[11px] leading-none"
          >
            <span className="tracking-[0.18em] text-gray-500">{item.symbol}</span>
            <span className="num font-semibold text-white">{item.price}</span>
            <span
              className={`num inline-flex items-center gap-1.5 font-semibold ${
                item.up ? "text-tk-green" : "text-tk-red"
              }`}
            >
              <TickerDeltaIcon up={item.up} />
              {item.delta}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
