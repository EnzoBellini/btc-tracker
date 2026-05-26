import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

export type TrialSignupModalProps = {
  open: boolean;
  initialEmail?: string;
  onClose: () => void;
  onSubmit: (data: { name: string; email: string }) => Promise<void>;
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
  onClose,
  onSubmit,
  submitting = false,
  error = null,
  success = false,
  devVerifyUrl = null,
  devPassword = null,
  emailSent = true,
}: TrialSignupModalProps) {
  const titleId = useId();
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
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
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        {success ? (
          <div className="space-y-4 pt-2">
            <h2 id={titleId} className="text-xl font-bold tracking-wide text-white sm:text-2xl">
              Quase lá!
            </h2>
            <p className="text-sm leading-relaxed text-gray-300 sm:text-base">
              {emailSent ? (
                <>
                  Enviamos o link de confirmação e a senha temporária para o e-mail informado. Confira a caixa de
                  entrada e o spam — o trial Elite de{" "}
                  <span className="font-semibold text-[#FF8C42]">14 dias</span> começa ao clicar no link.
                </>
              ) : (
                <>
                  Conta criada em modo dev (e-mail não configurado). Use o link e a senha abaixo para confirmar e
                  ativar o trial.
                </>
              )}
            </p>
            {!emailSent && devVerifyUrl && (
              <div className="space-y-3 rounded border border-amber-500/40 bg-amber-500/10 p-3 text-left text-xs text-gray-200">
                <p>
                  <span className="font-semibold text-amber-400">Senha temporária:</span>{" "}
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
              Entendi
            </button>
          </div>
        ) : (
          <>
            <h2 id={titleId} className="pr-8 text-xl font-bold tracking-wide text-white sm:text-2xl">
              Comece seus 14 dias grátis
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-400">
              Sem cartão de crédito. Preencha abaixo e enviaremos o link de acesso ao Trackion.
            </p>

            <form
              className="mt-6 space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const name = String(fd.get("name") ?? "").trim();
                const email = String(fd.get("email") ?? "").trim();
                await onSubmit({ name, email });
              }}
            >
              <div className="space-y-1.5">
                <label htmlFor="trial-name" className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Nome
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
                  placeholder="Seu nome"
                  className="w-full border border-white/15 bg-black px-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none transition focus:border-[#FF8C42]/60 focus:ring-1 focus:ring-[#FF8C42]/40"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="trial-email" className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  E-mail
                </label>
                <input
                  id="trial-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  defaultValue={initialEmail}
                  placeholder="voce@email.com"
                  className="w-full border border-white/15 bg-black px-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none transition focus:border-[#FF8C42]/60 focus:ring-1 focus:ring-[#FF8C42]/40"
                />
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
                {submitting ? "Enviando…" : "Enviar link de acesso"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
