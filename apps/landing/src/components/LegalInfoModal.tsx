import { useEffect, useId } from "react";
import { X } from "lucide-react";
import { getStaticPageContent, type StaticPageKind } from "../lib/static-page-content";
import type { Market } from "../lib/locale";

type LegalInfoModalProps = {
  open: boolean;
  kind: StaticPageKind | null;
  market: Market;
  closeLabel: string;
  onClose: () => void;
};

export function LegalInfoModal({ open, kind, market, closeLabel, onClose }: LegalInfoModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || !kind) return null;

  const page = getStaticPageContent(market, kind);

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4"
      role="presentation"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-lg border border-white/10 bg-[#0a0a0a] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-4">
          <h2 id={titleId} className="text-lg font-bold tracking-tight text-white sm:text-xl">
            {page.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded p-1 text-gray-400 transition hover:bg-white/10 hover:text-white"
            aria-label={closeLabel}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[min(70vh,560px)] overflow-y-auto px-6 py-5">
          <div className="space-y-5 text-sm leading-relaxed text-gray-300">
            {page.sections.map((s, i) => (
              <div key={i}>
                {s.heading && (
                  <h3 className="mb-1.5 text-sm font-semibold text-white">{s.heading}</h3>
                )}
                <p className="whitespace-pre-line">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-white/10 px-6 py-3">
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-[11px] uppercase tracking-[0.22em] text-gray-400 transition hover:text-white"
          >
            {closeLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
