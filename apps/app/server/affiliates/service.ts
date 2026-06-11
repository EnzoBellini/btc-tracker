import { createFpPromoter, getFpPromoterReports, listFpPromoters } from "./firstPromoter";
import {
  createAffiliate,
  getAffiliateBySlug,
  listAffiliates,
  updateAffiliate,
  type AffiliateRow,
} from "./storage";

const SLUG_RE = /^[a-z0-9][a-z0-9_-]{1,30}$/;
const COUPON_RE = /^[A-Z0-9]{3,20}$/;

function landingBase(): string {
  return (process.env.LANDING_URL ?? "https://trackion.app").replace(/\/$/, "");
}

function appBase(): string {
  return (process.env.APP_URL ?? "http://localhost:5000").replace(/\/$/, "");
}

export function buildAffiliateLinks(slug: string, couponCode: string) {
  return {
    landing: `${landingBase()}/afiliado/${slug}`,
    checkout: `${appBase()}/#/billing?ref=${encodeURIComponent(slug)}&coupon=${encodeURIComponent(couponCode)}`,
  };
}

async function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key?.startsWith("sk_")) return null;
  const Stripe = (await import("stripe")).default;
  return new Stripe(key, { apiVersion: "2025-02-24.acacia" });
}

export async function createStripePromotionCode(
  couponCode: string,
  discountPct: number,
): Promise<{ stripeCouponId: string; stripePromoId: string } | null> {
  const stripe = await getStripe();
  if (!stripe) return null;
  const coupon = await stripe.coupons.create({
    percent_off: discountPct,
    duration: "once",
    name: `Affiliate ${couponCode}`,
  });
  const promo = await stripe.promotionCodes.create({
    coupon: coupon.id,
    code: couponCode,
  });
  return { stripeCouponId: coupon.id, stripePromoId: promo.id };
}

export type CreateAffiliateInput = {
  name: string;
  slug: string;
  couponCode: string;
  discountPct: number;
  promoterEmail?: string;
};

export async function createAffiliatePartner(input: CreateAffiliateInput) {
  const name = input.name.trim();
  const slug = input.slug.toLowerCase().trim();
  const couponCode = input.couponCode.toUpperCase().trim();
  const discountPct = Math.min(100, Math.max(1, Math.round(input.discountPct)));

  if (!name || name.length < 2) throw new Error("Nome inválido");
  if (!SLUG_RE.test(slug)) throw new Error("Slug inválido (use letras minúsculas, números, - ou _)");
  if (!COUPON_RE.test(couponCode)) throw new Error("Cupom inválido (3–20 caracteres A-Z 0-9)");

  const existing = await getAffiliateBySlug(slug);
  if (existing) throw new Error("Slug já em uso");

  const all = await listAffiliates();
  if (all.some((a) => a.couponCode === couponCode)) throw new Error("Cupom já em uso");

  let stripeCouponId: string | undefined;
  let stripePromoId: string | undefined;
  try {
    const stripe = await createStripePromotionCode(couponCode, discountPct);
    if (stripe) {
      stripeCouponId = stripe.stripeCouponId;
      stripePromoId = stripe.stripePromoId;
    }
  } catch (err) {
    console.warn("[affiliates] stripe promo", err);
    throw new Error("Não foi possível criar cupom no Stripe");
  }

  const fpPromoterId = await createFpPromoter({
    name,
    slug,
    email: input.promoterEmail,
  });

  const affiliate = await createAffiliate({
    name,
    slug,
    couponCode,
    discountPct,
    stripeCouponId,
    stripePromoId,
    fpPromoterId: fpPromoterId ?? undefined,
    isActive: true,
  });

  return {
    affiliate,
    links: buildAffiliateLinks(slug, couponCode),
  };
}

export type AffiliateWithStats = AffiliateRow & {
  links: ReturnType<typeof buildAffiliateLinks>;
  stats: {
    clicks: number;
    signups: number;
    conversions: number;
    revenue: number;
    clickToSignupPct: number | null;
    signupToConversionPct: number | null;
  };
};

function matchFpStats(
  affiliate: AffiliateRow,
  promoters: Awaited<ReturnType<typeof listFpPromoters>>,
  reports: Awaited<ReturnType<typeof getFpPromoterReports>>,
) {
  const byFpId = affiliate.fpPromoterId
    ? promoters.find((p) => String(p.id) === affiliate.fpPromoterId)
    : undefined;
  const bySlug = promoters.find((p) => p.cust_id === affiliate.slug);
  const promoter = byFpId ?? bySlug;
  const report = reports.find(
    (r) =>
      (promoter && r.promoter_id === promoter.id) ||
      r.cust_id === affiliate.slug,
  );
  const clicks = report?.clicks_count ?? promoter?.stats?.clicks_count ?? 0;
  const signups = report?.signups_count ?? promoter?.stats?.signups_count ?? 0;
  const conversions = report?.sales_count ?? promoter?.stats?.sales_count ?? 0;
  const revenue = report?.revenue_amount ?? promoter?.stats?.revenue_amount ?? 0;
  return {
    clicks,
    signups,
    conversions,
    revenue,
    clickToSignupPct: clicks > 0 ? Math.round((signups / clicks) * 1000) / 10 : null,
    signupToConversionPct: signups > 0 ? Math.round((conversions / signups) * 1000) / 10 : null,
  };
}

export async function listAffiliatesWithStats(periodDays = 30): Promise<AffiliateWithStats[]> {
  const rows = await listAffiliates();
  const [promoters, reports] = await Promise.all([
    listFpPromoters(),
    getFpPromoterReports(periodDays),
  ]);
  return rows.map((affiliate) => ({
    ...affiliate,
    links: buildAffiliateLinks(affiliate.slug, affiliate.couponCode),
    stats: matchFpStats(affiliate, promoters, reports),
  }));
}

export async function getPublicAffiliate(slug: string) {
  const affiliate = await getAffiliateBySlug(slug);
  if (!affiliate || !affiliate.isActive) return null;
  return {
    slug: affiliate.slug,
    name: affiliate.name,
    couponCode: affiliate.couponCode,
    discountPct: affiliate.discountPct,
    links: buildAffiliateLinks(affiliate.slug, affiliate.couponCode),
  };
}

export async function resolveAffiliateCoupon(
  refId?: string,
  couponCode?: string,
): Promise<{ refId?: string; couponCode?: string; stripePromoId?: string }> {
  const slug = refId?.toLowerCase().trim();
  if (!slug) return { couponCode: couponCode?.toUpperCase() };
  const affiliate = await getAffiliateBySlug(slug);
  if (!affiliate?.isActive) return { refId: slug, couponCode: couponCode?.toUpperCase() };
  return {
    refId: slug,
    couponCode: couponCode?.toUpperCase() || affiliate.couponCode,
    stripePromoId: affiliate.stripePromoId ?? undefined,
  };
}

export async function setAffiliateActive(id: number, isActive: boolean) {
  const updated = await updateAffiliate(id, { isActive });
  if (!updated) throw new Error("Afiliado não encontrado");
  return updated;
}
