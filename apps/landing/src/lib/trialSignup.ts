import type { Market } from "./locale";

/** Em dev vazio = proxy Vite → :5000. Em prod sem env, fallback para o app público. */
function resolveApiBase(): string {
  const configured = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "");
  if (configured) return configured;
  if (import.meta.env.DEV) return "";
  return "https://app.trackion.app";
}

const API_BASE = resolveApiBase();

export type TrialSignupResult = {
  ok: boolean;
  message: string;
  emailSent?: boolean;
  /** Só em dev quando Resend não está configurado */
  devVerifyUrl?: string;
  devPassword?: string;
};

const FALLBACK = {
  br: {
    error: "Não foi possível enviar. Tente novamente.",
    success: "Verifique seu e-mail para o link de acesso.",
  },
  us: {
    error: "Could not submit. Please try again.",
    success: "Check your email for the access link.",
  },
} as const;

export async function submitTrialSignup(
  name: string,
  email: string,
  market: Market,
): Promise<TrialSignupResult> {
  const copy = FALLBACK[market];
  const url = `${API_BASE}/api/trial-signup`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, market }),
  });

  const data = (await res.json().catch(() => ({}))) as TrialSignupResult & { error?: string };

  if (!res.ok) {
    return { ok: false, message: data.error ?? copy.error };
  }

  return {
    ok: true,
    message: data.message ?? copy.success,
    emailSent: data.emailSent,
    devVerifyUrl: data.devVerifyUrl,
    devPassword: data.devPassword,
  };
}
