import { TrialCtaButton } from "./TrialCtaButton";

type CtaStripProps = {
  headline: string;
  button: string;
  subtext: string;
  scarcityBadge: string;
  onClick: () => void;
  variant?: "default" | "accent";
};

export function CtaStrip({
  headline,
  button,
  subtext,
  scarcityBadge,
  onClick,
  variant = "default",
}: CtaStripProps) {
  const accent = variant === "accent";

  return (
    <div
      className={`relative border-y px-6 py-10 sm:py-12 ${
        accent
          ? "border-[#FF8C42]/30 bg-[#FF8C42]/[0.06]"
          : "border-white/[0.08] bg-white/[0.02]"
      }`}
    >
      {accent && (
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,140,66,0.1),transparent_70%)]"
          aria-hidden
        />
      )}
      <div className="relative mx-auto flex max-w-[900px] flex-col items-center gap-5 text-center">
        <span className="inline-flex items-center gap-2 border border-[#FF8C42]/50 bg-[#FF8C42]/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.24em] text-[#FFB86A]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#FF8C42]" aria-hidden />
          {scarcityBadge}
        </span>
        <p className="max-w-2xl text-balance text-lg font-bold leading-snug tracking-tight text-white sm:text-xl lg:text-2xl">
          {headline}
        </p>
        <TrialCtaButton size="lg" ring shine subtext={subtext} subtextOnHover onClick={onClick}>
          {button}
        </TrialCtaButton>
      </div>
    </div>
  );
}
