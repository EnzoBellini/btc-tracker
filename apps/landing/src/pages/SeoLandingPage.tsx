import { ArrowLeft } from "lucide-react";
import { TrialCtaButton } from "../components/TrialCtaButton";
import { useMemo } from "react";
import { useSeo } from "../hooks/useSeo";
import { getLandingContent } from "../lib/landing-content";
import type { Market } from "../lib/locale";
import { buildSeoPageMeta, type SeoPageContent } from "../lib/seo-pages";

type SeoLandingPageProps = {
  page: SeoPageContent;
  canonicalPath: string;
  market: Market;
  onBack: () => void;
  onStartClick: () => void;
};

export default function SeoLandingPage({
  page,
  canonicalPath,
  market,
  onBack,
  onStartClick,
}: SeoLandingPageProps) {
  const nav = getLandingContent(market).static.back;
  const meta = useMemo(() => buildSeoPageMeta(page, canonicalPath), [page, canonicalPath]);
  useSeo(meta);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="pointer-events-none fixed inset-0 z-0 bg-grid-fine opacity-[0.28]" aria-hidden />
      <header className="relative z-10 border-b border-white/[0.06] bg-black/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-gray-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {nav}
          </button>
          <a href="/" className="flex items-center gap-2">
            <img src="/logo-trackion.png" alt="Trackion" width={22} height={22} className="h-5 w-5" />
            <span className="text-xs font-bold tracking-[0.28em]">TRACKION</span>
          </a>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-3xl px-6 py-12">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#FF8C42]">
          {market === "us" ? "Crypto trading journal" : "Trading journal · crypto"}
        </p>
        <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight md:text-4xl">{page.h1}</h1>
        <p className="mt-4 text-base leading-relaxed text-gray-400">{page.subtitle}</p>

        <TrialCtaButton className="mt-8" ring shine onClick={onStartClick}>
          {page.cta}
        </TrialCtaButton>

        <article className="mt-12 space-y-8">
          {page.sections.map((section, i) => (
            <section key={i}>
              <h2 className="text-lg font-semibold text-white">{section.heading}</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-300">{section.body}</p>
            </section>
          ))}
        </article>

        {page.faq.length > 0 && (
          <section className="mt-14 border-t border-white/10 pt-10" aria-labelledby="seo-faq-heading">
            <h2 id="seo-faq-heading" className="text-lg font-semibold text-white">
              {market === "us" ? "Frequently asked questions" : "Perguntas frequentes"}
            </h2>
            <dl className="mt-6 space-y-6">
              {page.faq.map((item, i) => (
                <div key={i}>
                  <dt className="text-sm font-medium text-white">{item.q}</dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-gray-400">{item.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {page.related.length > 0 && (
          <nav className="mt-14 border-t border-white/10 pt-10" aria-label={market === "us" ? "Related topics" : "Tópicos relacionados"}>
            <h2 className="font-mono text-[10px] uppercase tracking-[0.28em] text-gray-500">
              {market === "us" ? "Related" : "Relacionado"}
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {page.related.map((link) => (
                <li key={link.path}>
                  <a
                    href={link.path}
                    className="inline-block border border-white/15 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-gray-400 transition hover:border-[#FF8C42]/50 hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </main>
    </div>
  );
}
