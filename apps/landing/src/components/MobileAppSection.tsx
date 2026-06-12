import { QrCode, Smartphone } from "lucide-react";
import type { LandingContent } from "../lib/landing-content";

const DEFAULT_APP_URL = "https://app.trackion.app";

type MobileAppSectionProps = {
  copy: LandingContent["mobileApp"];
  appUrl?: string;
};

export function MobileAppSection({ copy, appUrl = DEFAULT_APP_URL }: MobileAppSectionProps) {
  const qrSrc = `https://quickchart.io/qr?text=${encodeURIComponent(appUrl)}&size=220&dark=FF8C42&light=0a0a0a&margin=1`;

  return (
    <section id="mobile" className="relative z-[1] scroll-mt-28 border-y border-white/[0.06] bg-black py-24 sm:py-28">
      <div className="relative mx-auto max-w-[1100px] px-6">
        <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.28em]">
          <span className="text-[#FF8C42]">[—]</span>
          <span className="h-px w-8 bg-white/20" aria-hidden />
          <span className="text-white">{copy.sectionLabel}</span>
        </div>

        <div className="mt-10 grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-2 border border-[#FF8C42]/40 bg-[#FF8C42]/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.24em] text-[#FFB86A]">
              <Smartphone className="h-3.5 w-3.5" aria-hidden />
              {copy.badge}
            </div>
            <h2 className="mt-6 text-balance text-4xl font-bold leading-[0.95] tracking-tight text-white sm:text-5xl">
              {copy.title}
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-gray-400">{copy.subtitle}</p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-gray-500">{copy.note}</p>

            <div className="mt-8 hidden border border-white/10 bg-white/[0.02] p-5 sm:block">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-gray-500">{copy.urlLabel}</p>
              <a
                href={appUrl}
                className="mt-2 block break-all font-mono text-sm text-[#FF8C42] transition hover:text-[#FFB86A]"
              >
                {appUrl.replace(/^https:\/\//, "")}
              </a>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-[auto_1fr]">
              <div className="mx-auto border border-[#FF8C42]/30 bg-black p-4 sm:mx-0">
                <img
                  src={qrSrc}
                  width={220}
                  height={220}
                  alt={copy.qrAlt}
                  className="block h-[180px] w-[180px] sm:h-[220px] sm:w-[220px]"
                  loading="lazy"
                  decoding="async"
                />
                <p className="mt-3 flex items-center justify-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400">
                  <QrCode className="h-3.5 w-3.5 text-[#FF8C42]" aria-hidden />
                  {copy.qrLabel}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <article className="border border-white/10 bg-white/[0.02] p-5">
                  <h3 className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#FF8C42]">
                    {copy.androidTitle}
                  </h3>
                  <ol className="mt-4 space-y-3">
                    {copy.androidSteps.map((step, i) => (
                      <li key={step} className="flex gap-3 text-sm leading-relaxed text-gray-300">
                        <span className="font-mono text-[10px] text-gray-600">{String(i + 1).padStart(2, "0")}</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </article>

                <article className="border border-white/10 bg-white/[0.02] p-5">
                  <h3 className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#FF8C42]">
                    {copy.iosTitle}
                  </h3>
                  <ol className="mt-4 space-y-3">
                    {copy.iosSteps.map((step, i) => (
                      <li key={step} className="flex gap-3 text-sm leading-relaxed text-gray-300">
                        <span className="font-mono text-[10px] text-gray-600">{String(i + 1).padStart(2, "0")}</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </article>
              </div>
            </div>

            <a
              href={appUrl}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 border border-[#FF8C42] bg-[#FF8C42]/10 px-6 py-3.5 font-bold uppercase tracking-[0.2em] text-[#FF8C42] transition hover:bg-[#FF8C42] hover:text-black sm:hidden"
            >
              <Smartphone className="h-4 w-4" aria-hidden />
              {copy.cta}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
