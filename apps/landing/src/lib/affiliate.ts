const STORAGE_KEY = "trackion_affiliate";
const TTL_MS = 90 * 24 * 60 * 60 * 1000;

export type StoredAffiliate = {
  refId: string;
  couponCode?: string;
  discountPct?: number;
  name?: string;
  savedAt: number;
};

export function saveAffiliateAttribution(data: Omit<StoredAffiliate, "savedAt">): void {
  try {
    const payload: StoredAffiliate = { ...data, savedAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

export function readAffiliateAttribution(): StoredAffiliate | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAffiliate;
    if (!parsed.refId || !parsed.savedAt) return null;
    if (Date.now() - parsed.savedAt > TTL_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function getAffiliateSignupPayload(): {
  refId?: string;
  couponCode?: string;
  fpromTid?: string;
} {
  const stored = readAffiliateAttribution();
  const fpromTid = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("_fprom_tid="))
    ?.split("=")[1];
  return {
    refId: stored?.refId,
    couponCode: stored?.couponCode,
    fpromTid: fpromTid ? decodeURIComponent(fpromTid) : undefined,
  };
}

export function readAffiliateSlugFromPath(): string | null {
  const match = window.location.pathname.match(/^\/afiliado\/([a-z0-9_-]+)\/?$/i);
  return match?.[1]?.toLowerCase() ?? null;
}
