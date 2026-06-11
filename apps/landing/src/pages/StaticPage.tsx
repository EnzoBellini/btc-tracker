import { ArrowLeft } from "lucide-react";
import { getLandingContent } from "../lib/landing-content";
import { getStaticPageContent, type StaticPageKind } from "../lib/static-page-content";
import type { Market } from "../lib/locale";

export type { StaticPageKind };

type StaticPageProps = {
  kind: StaticPageKind;
  market: Market;
  onBack: () => void;
};

export default function StaticPage({ kind, market, onBack }: StaticPageProps) {
  const nav = getLandingContent(market).static.back;
  const page = getStaticPageContent(market, kind);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="pointer-events-none fixed inset-0 z-0 bg-grid-fine opacity-[0.28]" aria-hidden />
      <header className="relative z-10 border-b border-white/[0.06] bg-black/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-6 py-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-gray-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {nav}
          </button>
        </div>
      </header>
      <main className="relative z-10 mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight">{page.title}</h1>
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-gray-300">
          {page.sections.map((s, i) => (
            <div key={i}>
              {s.heading && (
                <h2 className="mb-2 text-base font-semibold text-white">{s.heading}</h2>
              )}
              <p className="whitespace-pre-line">{s.body}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export { resolveStaticPage } from "../lib/static-page-content";
