export type AffiliateAttribution = {
  refId?: string;
  couponCode?: string;
  fpromTid?: string;
};

export function parseAffiliateBody(body: unknown): AffiliateAttribution {
  if (!body || typeof body !== "object") return {};
  const b = body as Record<string, unknown>;
  const refId =
    typeof b.refId === "string"
      ? b.refId
      : typeof b.ref_id === "string"
        ? b.ref_id
        : undefined;
  const couponCode =
    typeof b.couponCode === "string"
      ? b.couponCode
      : typeof b.coupon_code === "string"
        ? b.coupon_code
        : undefined;
  const fpromTid =
    typeof b.fpromTid === "string"
      ? b.fpromTid
      : typeof b.tid === "string"
        ? b.tid
        : undefined;
  return {
    refId: refId?.trim() || undefined,
    couponCode: couponCode?.trim().toUpperCase() || undefined,
    fpromTid: fpromTid?.trim() || undefined,
  };
}

export function mergeTraderProfile(
  existingJson: string | null | undefined,
  patch: Record<string, unknown>,
): string {
  let existing: Record<string, unknown> = {};
  if (existingJson) {
    try {
      existing = JSON.parse(existingJson) as Record<string, unknown>;
    } catch {
      existing = {};
    }
  }
  return JSON.stringify({ ...existing, ...patch });
}
