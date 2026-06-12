import { TrialCtaButton } from "./TrialCtaButton";
import type { Market } from "../lib/locale";
import { getLandingContent } from "../lib/landing-content";

type BlogProductBannerProps = {
  market: Market;
  onStartClick: () => void;
};

export default function BlogProductBanner({ market, onStartClick }: BlogProductBannerProps) {
  const banner = getLandingContent(market).blog.productBanner;

  return (
    <div className="mb-10 flex flex-col gap-4 border border-[#FF8C42]/30 bg-[#FF8C42]/[0.06] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#FF8C42]">{banner.eyebrow}</p>
        <p className="mt-1 text-sm leading-relaxed text-gray-300">{banner.text}</p>
      </div>
      <TrialCtaButton size="sm" onClick={onStartClick} className="shrink-0">
        {banner.button}
      </TrialCtaButton>
    </div>
  );
}
