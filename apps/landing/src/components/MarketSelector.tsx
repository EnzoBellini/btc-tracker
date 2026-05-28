import type { Market } from "../lib/locale";

type MarketSelectorProps = {
  market: Market;
  onChange: (market: Market) => void;
};

const OPTIONS: { id: Market; label: string; flag: string }[] = [
  { id: "br", label: "Brasil", flag: "🇧🇷" },
  { id: "us", label: "USA", flag: "🇺🇸" },
];

export function MarketSelector({ market, onChange }: MarketSelectorProps) {
  return (
    <div
      className="inline-flex border border-white/15 bg-black font-mono text-[10px] uppercase tracking-[0.18em]"
      role="group"
      aria-label="Region"
    >
      {OPTIONS.map(({ id, label, flag }) => {
        const active = market === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-pressed={active}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 transition sm:px-3 ${
              active
                ? "bg-[#FF8C42] text-black"
                : "text-gray-400 hover:bg-white/[0.04] hover:text-white"
            }`}
          >
            <span aria-hidden>{flag}</span>
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{id.toUpperCase()}</span>
          </button>
        );
      })}
    </div>
  );
}
