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

export function readAffiliateFromBillingHash(): { refId?: string; couponCode?: string } {
  const hash = window.location.hash.replace(/^#/, "");
  const query = hash.includes("?") ? hash.split("?")[1] : "";
  const params = new URLSearchParams(query);
  const refId = params.get("ref") ?? undefined;
  const couponCode = params.get("coupon")?.toUpperCase() ?? undefined;
  if (refId) {
    saveAffiliateAttribution({ refId, couponCode });
  }
  return { refId, couponCode };
}
