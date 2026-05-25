export const EXCHANGE_FETCH_TIMEOUT =
  Number(process.env.EXCHANGE_FETCH_TIMEOUT) ||
  Number(process.env.MEXC_FETCH_TIMEOUT) ||
  20_000;

export async function exchangeFetch(
  url: string,
  init: RequestInit & { exchangeLabel?: string } = {},
): Promise<Response> {
  const label = init.exchangeLabel ?? "Exchange";
  const { exchangeLabel: _, ...fetchInit } = init;
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), EXCHANGE_FETCH_TIMEOUT);
  try {
    const res = await fetch(url, { ...fetchInit, signal: ctrl.signal });
    clearTimeout(to);
    return res;
  } catch (e: unknown) {
    clearTimeout(to);
    const err = e as { name?: string };
    if (err?.name === "AbortError") {
      throw new Error(
        `${label}: timeout após ${EXCHANGE_FETCH_TIMEOUT / 1000}s. Verifique se o IP do servidor está na whitelist da API.`,
      );
    }
    throw e;
  }
}

export async function parseJsonResponse(res: Response, label: string): Promise<unknown> {
  const text = await res.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`${label}: resposta inválida (${res.status})`);
  }
  if (!res.ok) {
    const obj = (typeof data === "object" && data !== null ? data : {}) as Record<string, unknown>;
    const msg =
      (obj.message as string) ??
      (obj.msg as string) ??
      String(obj.code ?? `HTTP ${res.status}`);
    throw new Error(`${label} ${res.status}: ${msg}`);
  }
  return data;
}
