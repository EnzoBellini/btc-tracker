import { useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";
import type { LandingContent } from "../lib/landing-content";
import type { StaticPageKind } from "../lib/static-page-content";

export type TrialSignupModalProps = {
  open: boolean;
  initialEmail?: string;
  copy: LandingContent["trialModal"];
  onClose: () => void;
  onSubmit: (data: { name: string; email: string; acceptTerms: boolean }) => Promise<void>;
  onOpenLegal?: (kind: StaticPageKind) => void;
  submitting?: boolean;
  error?: string | null;
  success?: boolean;
  devVerifyUrl?: string | null;
  devPassword?: string | null;
  emailSent?: boolean;
};

export function TrialSignupModal({
  open,
  initialEmail = "",
  copy,
  onClose,
  onSubmit,
  onOpenLegal,
  submitting = false,
  error = null,
  success = false,
  devVerifyUrl = null,
  devPassword = null,
  emailSent = true,
}: TrialSignupModalProps) {
  const titleId = useId();
  const termsId = useId();
  const nameRef = useRef<HTMLInputElement>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTermsAccepted(false);
    setTermsError(null);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => nameRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="presentation"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-md border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded p-1 text-gray-400 transition hover:bg-white/10 hover:text-white"
          aria-label={copy.close}
        >
          <X className="h-5 w-5" />
        </button>

        {success ? (
          <div className="space-y-4 pt-2">
            <h2 id={titleId} className="text-xl font-bold tracking-wide text-white sm:text-2xl">
              {copy.successTitle}
            </h2>
            <p className="text-sm leading-relaxed text-gray-300 sm:text-base">
              {emailSent ? copy.successEmail : copy.successDev}
            </p>
            {!emailSent && devVerifyUrl && (
              <div className="space-y-3 rounded border border-amber-500/40 bg-amber-500/10 p-3 text-left text-xs text-gray-200">
                <p>
                  <span className="font-semibold text-amber-400">{copy.devPassword}</span>{" "}
                  <code className="break-all text-white">{devPassword}</code>
                </p>
                <a
                  href={devVerifyUrl}
                  className="block break-all font-mono text-[#FF8C42] underline hover:text-[#FF7A2E]"
                >
                  {devVerifyUrl}
                </a>
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-lg bg-[#FF8C42] py-3 text-sm font-bold text-white transition hover:bg-[#FF7A2E]"
            >
              {copy.gotIt}
            </button>
          </div>
        ) : (
          <>
            <h2 id={titleId} className="pr-8 text-xl font-bold tracking-wide text-white sm:text-2xl">
              {copy.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-400">{copy.subtitle}</p>

            <form
              className="mt-6 space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!termsAccepted) {
                  setTermsError(copy.termsConsentError);
                  return;
                }
                setTermsError(null);
                const fd = new FormData(e.currentTarget);
                const name = String(fd.get("name") ?? "").trim();
                const email = String(fd.get("email") ?? "").trim();
                await onSubmit({ name, email, acceptTerms: true });
              }}
            >
              <div className="space-y-1.5">
                <label htmlFor="trial-name" className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {copy.nameLabel}
                </label>
                <input
                  ref={nameRef}
                  id="trial-name"
                  name="name"
                  type="text"
                  required
                  minLength={2}
                  maxLength={80}
                  autoComplete="name"
                  placeholder={copy.namePlaceholder}
                  className="w-full border border-white/15 bg-black px-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none transition focus:border-[#FF8C42]/60 focus:ring-1 focus:ring-[#FF8C42]/40"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="trial-email" className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {copy.emailLabel}
                </label>
                <input
                  id="trial-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  defaultValue={initialEmail}
                  placeholder={copy.emailPlaceholder}
                  className="w-full border border-white/15 bg-black px-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none transition focus:border-[#FF8C42]/60 focus:ring-1 focus:ring-[#FF8C42]/40"
                />
              </div>

              <div className="rounded border border-white/10 bg-black/50 px-3 py-3">
                <div className="flex gap-3">
                  <input
                    id={termsId}
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => {
                      setTermsAccepted(e.target.checked);
                      if (e.target.checked) setTermsError(null);
                    }}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[#FF8C42]"
                  />
                  <label htmlFor={termsId} className="text-xs leading-relaxed text-gray-400">
                    {copy.termsConsentPrefix}{" "}
                    <button
                      type="button"
                      onClick={() => onOpenLegal?.("terms")}
                      className="font-medium text-[#FF8C42] underline decoration-[#FF8C42]/40 underline-offset-2 transition hover:text-[#FFB86A]"
                    >
                      {copy.termsLink}
                    </button>
                    {" "}{copy.termsConsentMiddle}{" "}
                    <button
                      type="button"
                      onClick={() => onOpenLegal?.("privacy")}
                      className="font-medium text-[#FF8C42] underline decoration-[#FF8C42]/40 underline-offset-2 transition hover:text-[#FFB86A]"
                    >
                      {copy.privacyLink}
                    </button>
                    .
                  </label>
                </div>
                {termsError && (
                  <p className="mt-2 text-xs text-red-400" role="alert">
                    {termsError}
                  </p>
                )}
              </div>

              {error && (
                <p className="text-sm text-red-400" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-[#FF8C42] py-3 text-sm font-bold text-white transition hover:bg-[#FF7A2E] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? copy.submitting : copy.submit}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
