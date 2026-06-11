import type { Market } from "@/lib/locale";

type MarketSelectorProps = {
  market: Market;
  onChange: (market: Market) => void;
  compact?: boolean;
};

const OPTIONS: { id: Market; label: string; flag: string }[] = [
  { id: "br", label: "Brasil", flag: "🇧🇷" },
  { id: "us", label: "USA", flag: "🇺🇸" },
];

export function MarketSelector({ market, onChange, compact }: MarketSelectorProps) {
  return (
    <div
      className="inline-flex border border-border bg-background font-mono-tk text-[10px] uppercase tracking-[0.18em]"
      role="group"
      aria-label="Language"
    >
      {OPTIONS.map(({ id, label, flag }) => {
        const active = market === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-pressed={active}
            className={`inline-flex items-center gap-1.5 px-2 py-1.5 transition ${
              compact ? "px-2" : "sm:px-3"
            } ${
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
            }`}
          >
            <span aria-hidden>{flag}</span>
            {!compact && <span className="hidden sm:inline">{label}</span>}
            <span className={compact ? "" : "sm:hidden"}>{id.toUpperCase()}</span>
          </button>
        );
      })}
    </div>
  );
}
