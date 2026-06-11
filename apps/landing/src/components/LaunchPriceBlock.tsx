import type { ReactNode } from "react";

type LaunchPriceBlockProps = {
  planName: string;
  launchPrice: string;
  originalPrice: string;
  perMonth: string;
  originalPriceLabel: string;
  launchBadge?: string;
  savingsPct?: number;
  savingsBadge?: (pct: number) => string;
  size?: "md" | "lg";
};

export function LaunchOfferBadge({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`tk-launch-badge inline-flex items-center gap-1.5 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-[#FFB86A] ${className}`}
    >
      <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-[#FF8C42] shadow-[0_0_8px_#FF8C42]" aria-hidden />
      {children}
    </span>
  );
}

export function LaunchOfferHighlight({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`tk-launch-highlight mt-4 max-w-2xl px-4 py-3 text-sm font-medium leading-relaxed text-[#FFE4C4] sm:text-base ${className}`}
    >
      {children}
    </p>
  );
}

export function LaunchPriceBlock({
  planName,
  launchPrice,
  originalPrice,
  perMonth,
  originalPriceLabel,
  launchBadge,
  savingsPct = 0,
  savingsBadge,
  size = "md",
}: LaunchPriceBlockProps) {
  const priceSize = size === "lg" ? "text-4xl sm:text-5xl" : "text-3xl sm:text-4xl";
  const oldSize = size === "lg" ? "text-lg sm:text-xl" : "text-base";

  return (
    <div>
      {launchBadge && (
        <div className="mb-2">
          <LaunchOfferBadge>{launchBadge}</LaunchOfferBadge>
        </div>
      )}
      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-gray-400">{planName}</p>
      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className={`num font-mono font-semibold ${oldSize} text-tk-red line-through decoration-tk-red/80`}>
          {originalPriceLabel} {originalPrice}
        </span>
      </div>
      <div className="mt-1 flex flex-wrap items-end gap-x-2 gap-y-1">
        <p className={`num tk-price-neon font-sans font-bold ${priceSize}`}>{launchPrice}</p>
        <p className="pb-1 font-mono text-xs uppercase tracking-wider text-[#FFB86A]/80">{perMonth}</p>
      </div>
      {savingsPct > 0 && savingsBadge && (
        <span className="tk-launch-savings mt-3 inline-block px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest">
          {savingsBadge(savingsPct)}
        </span>
      )}
    </div>
  );
}
