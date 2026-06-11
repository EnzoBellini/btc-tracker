import { ArrowLeft } from "lucide-react";
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
  const nav = getLandingContent(market).static.back;
  const blog = getLandingContent(market).blog;

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
          <div className="flex items-center gap-4">
            <a
              href="/blog"
              className="font-mono text-[10px] uppercase tracking-[0.22em] text-gray-500 transition hover:text-[#FF8C42]"
            >
              {blog.indexTitle}
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
