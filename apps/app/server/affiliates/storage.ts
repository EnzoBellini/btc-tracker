import { eq, desc } from "drizzle-orm";
import { affiliates, type Affiliate, type InsertAffiliate } from "@shared/schema";
import { db } from "../db";

export type AffiliateRow = Affiliate;

const memAffiliates: AffiliateRow[] = [];
let memNextId = 1;

export async function listAffiliates(): Promise<AffiliateRow[]> {
  if (db) {
    return db.select().from(affiliates).orderBy(desc(affiliates.createdAt));
  }
  return [...memAffiliates].sort(
    (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
  );
}

export async function getAffiliateBySlug(slug: string): Promise<AffiliateRow | undefined> {
  const normalized = slug.toLowerCase().trim();
  if (db) {
    const [row] = await db.select().from(affiliates).where(eq(affiliates.slug, normalized));
    return row;
  }
  return memAffiliates.find((a) => a.slug === normalized);
}

export async function getAffiliateById(id: number): Promise<AffiliateRow | undefined> {
  if (db) {
    const [row] = await db.select().from(affiliates).where(eq(affiliates.id, id));
    return row;
  }
  return memAffiliates.find((a) => a.id === id);
}

export async function createAffiliate(data: InsertAffiliate): Promise<AffiliateRow> {
  const row: InsertAffiliate = {
    ...data,
    slug: data.slug.toLowerCase().trim(),
    couponCode: data.couponCode.toUpperCase().trim(),
  };
  if (db) {
    const [created] = await db.insert(affiliates).values(row).returning();
    if (!created) throw new Error("Falha ao criar afiliado");
    return created;
  }
  const created = {
    ...row,
    id: memNextId++,
    isActive: row.isActive ?? true,
    createdAt: new Date(),
    stripeCouponId: row.stripeCouponId ?? null,
    stripePromoId: row.stripePromoId ?? null,
    fpPromoterId: row.fpPromoterId ?? null,
  } as AffiliateRow;
  memAffiliates.push(created);
  return created;
}

export async function updateAffiliate(
  id: number,
  patch: Partial<InsertAffiliate>,
): Promise<AffiliateRow | undefined> {
  if (db) {
    const [updated] = await db.update(affiliates).set(patch).where(eq(affiliates.id, id)).returning();
    return updated;
  }
  const idx = memAffiliates.findIndex((a) => a.id === id);
  if (idx < 0) return undefined;
  memAffiliates[idx] = { ...memAffiliates[idx], ...patch };
  return memAffiliates[idx];
}
