const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ?? "";

export type TrialSignupResult = {
  ok: boolean;
  message: string;
  emailSent?: boolean;
  /** Só em dev quando Resend não está configurado */
  devVerifyUrl?: string;
  devPassword?: string;
};

export async function submitTrialSignup(name: string, email: string): Promise<TrialSignupResult> {
  const url = `${API_BASE}/api/trial-signup`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email }),
  });

  const data = (await res.json().catch(() => ({}))) as TrialSignupResult & { error?: string };

  if (!res.ok) {
    return { ok: false, message: data.error ?? "Não foi possível enviar. Tente novamente." };
  }

  return {
    ok: true,
    message: data.message ?? "Verifique seu e-mail para o link de acesso.",
    emailSent: data.emailSent,
    devVerifyUrl: data.devVerifyUrl,
    devPassword: data.devPassword,
  };
}
