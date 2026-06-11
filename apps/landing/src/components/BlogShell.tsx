import { ArrowLeft, HelpCircle } from "lucide-react";
import type { ReactNode } from "react";
import { getLandingContent } from "../lib/landing-content";
import type { Market } from "../lib/locale";

type BlogShellProps = {
  market: Market;
  onBack: () => void;
  children: ReactNode;
  backLabel?: string;
};

export default function BlogShell({ market, onBack, children, backLabel }: BlogShellProps) {
  const t = getLandingContent(market);
  const nav = t.static.back;
  const blog = t.blog;

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
            {backLabel ?? nav}
          </button>
          <div className="flex items-center gap-3 sm:gap-4">
            <a
              href="/#duvidas"
              className="hidden items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-gray-500 transition hover:text-white sm:inline-flex"
            >
              <HelpCircle className="h-3.5 w-3.5" aria-hidden />
              {t.navFaq}
            </a>
            <a
              href="/blog"
              className="border border-[#FF8C42]/40 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#FF8C42] transition hover:border-[#FF8C42]"
            >
              {t.navBlog}
            </a>
            <a href="/" className="flex items-center gap-2">
              <img src="/logo-trackion.png" alt="Trackion" width={22} height={22} className="h-5 w-5" />
              <span className="hidden text-xs font-bold tracking-[0.28em] sm:inline">TRACKION</span>
            </a>
          </div>
        </div>
      </header>
      <main className="relative z-10 mx-auto max-w-3xl px-6 py-12">{children}</main>
    </div>
  );
}
