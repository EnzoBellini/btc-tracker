import { TrialCtaButton } from "./TrialCtaButton";
import type { BlogIntent } from "../lib/blog-posts";
import type { Market } from "../lib/locale";
import { getLandingContent } from "../lib/landing-content";

type BlogCtaBlockProps = {
  market: Market;
  intent: BlogIntent;
  variant?: "inline" | "conversion" | "soft";
  onStartClick: () => void;
};

export default function BlogCtaBlock({ market, intent, variant = "inline", onStartClick }: BlogCtaBlockProps) {
  const copy = getLandingContent(market).blog;
  const isSoft = variant === "soft" || intent === "educational";
  const cta = isSoft ? copy.softCta : copy.hardCta;

  if (variant === "conversion" || (!isSoft && variant === "inline")) {
    return (
      <aside className="my-10 border border-[#FF8C42]/40 bg-[#FF8C42]/[0.1] p-6 sm:p-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#FF8C42]">{cta.eyebrow}</p>
        <p className="mt-3 text-base font-semibold leading-snug text-white">{cta.title}</p>
        <p className="mt-2 text-sm leading-relaxed text-gray-300">{cta.body}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <TrialCtaButton onClick={onStartClick}>{copy.ctaButton}</TrialCtaButton>
          <a
            href={cta.secondaryHref}
            className="inline-flex items-center border border-white/20 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-gray-300 transition hover:border-[#FF8C42] hover:text-[#FF8C42]"
          >
            {cta.secondaryLabel}
          </a>
        </div>
      </aside>
    );
  }

  return (
    <aside className="my-10 border border-white/10 bg-white/[0.03] p-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-gray-500">{cta.eyebrow}</p>
      <p className="mt-2 text-sm leading-relaxed text-gray-300">{cta.body}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <TrialCtaButton size="sm" onClick={onStartClick}>
          {copy.ctaButton}
        </TrialCtaButton>
        <a
          href={cta.secondaryHref}
          className="inline-flex items-center font-mono text-[10px] uppercase tracking-[0.18em] text-gray-500 transition hover:text-[#FF8C42]"
        >
          {cta.secondaryLabel} →
        </a>
      </div>
    </aside>
  );
}
