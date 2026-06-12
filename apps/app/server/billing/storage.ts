import { and, desc, eq, ilike, lt, sql } from "drizzle-orm";
import {
  subscriptions,
  plans,
  users,
  adminAuditLog,
  type Subscription,
  type InsertSubscription,
  type Plan,
  type User,
} from "@shared/schema";
import { db } from "../db";

export async function getSubscriptionByUserId(userId: number): Promise<Subscription | undefined> {
  if (!db) return undefined;
  const [row] = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
  return row;
}

export async function upsertSubscription(data: InsertSubscription): Promise<Subscription> {
  if (!db) throw new Error("DATABASE_URL required for subscriptions");
  const existing = await getSubscriptionByUserId(data.userId);
  if (existing) {
    const [updated] = await db
      .update(subscriptions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(subscriptions.userId, data.userId))
      .returning();
    if (!updated) throw new Error("Failed to update subscription");
    return updated;
  }
  const [created] = await db.insert(subscriptions).values(data).returning();
  if (!created) throw new Error("Failed to create subscription");
  return created;
}

export async function getSubscriptionByStripeCustomerId(
  stripeCustomerId: string,
): Promise<Subscription | undefined> {
  if (!db) return undefined;
  const [row] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeCustomerId, stripeCustomerId))
    .limit(1);
  return row;
}

export async function getSubscriptionByStripeSubscriptionId(
  stripeSubscriptionId: string,
): Promise<Subscription | undefined> {
  if (!db) return undefined;
  const [row] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId))
    .limit(1);
  return row;
}

export async function updateSubscription(
  userId: number,
  data: Partial<InsertSubscription>,
): Promise<Subscription | undefined> {
  if (!db) return undefined;
  const [updated] = await db
    .update(subscriptions)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(subscriptions.userId, userId))
    .returning();
  return updated;
}

export async function expireTrialsPastDue(): Promise<number> {
  if (!db) return 0;
  const now = new Date();
  const result = await db
    .update(subscriptions)
    .set({ status: "expired", updatedAt: now })
    .where(and(eq(subscriptions.status, "trialing"), lt(subscriptions.trialEndsAt, now)))
    .returning();
  return result.length;
}

export async function listPlans(): Promise<Plan[]> {
  if (!db) return [];
  return db.select().from(plans).where(eq(plans.isActive, true)).orderBy(plans.sortOrder);
}

export async function listSubscriptionsAdmin(opts: {
  q?: string;
  limit?: number;
  offset?: number;
}): Promise<{ rows: (Subscription & { email: string })[]; total: number }> {
  if (!db) return { rows: [], total: 0 };
  const limit = opts.limit ?? 50;
  const offset = opts.offset ?? 0;
  const q = opts.q?.trim();

  const base = db
    .select({
      subscription: subscriptions,
      email: users.email,
    })
    .from(subscriptions)
    .innerJoin(users, eq(subscriptions.userId, users.id));

  const filtered = q
    ? base.where(ilike(users.email, `%${q}%`))
    : base;

  const rows = await filtered.orderBy(desc(subscriptions.updatedAt)).limit(limit).offset(offset);
  const countRows = q
    ? await db
        .select({ count: sql<number>`count(*)::int` })
        .from(subscriptions)
        .innerJoin(users, eq(subscriptions.userId, users.id))
        .where(ilike(users.email, `%${q}%`))
    : await db.select({ count: sql<number>`count(*)::int` }).from(subscriptions);

  return {
    rows: rows.map((r) => ({ ...r.subscription, email: r.email })),
    total: countRows[0]?.count ?? 0,
  };
}

export async function getAdminStats(): Promise<{
  trialing: number;
  active: number;
  expiringIn7d: number;
}> {
  if (!db) return { trialing: 0, active: 0, expiringIn7d: 0 };
  const in7d = new Date();
  in7d.setDate(in7d.getDate() + 7);
  const [trialing] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(subscriptions)
    .where(eq(subscriptions.status, "trialing"));
  const [active] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(subscriptions)
    .where(eq(subscriptions.status, "active"));
  const [expiring] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.status, "trialing"),
        lt(subscriptions.trialEndsAt, in7d),
      ),
    );
  return {
    trialing: trialing?.count ?? 0,
    active: active?.count ?? 0,
    expiringIn7d: expiring?.count ?? 0,
  };
}

export async function insertAdminAudit(action: string, targetUserId?: number, payload?: unknown) {
  if (!db) return;
  await db.insert(adminAuditLog).values({
    action,
    targetUserId: targetUserId ?? null,
    payload: payload ? JSON.stringify(payload) : null,
  });
}

export async function findUserByEmailAdmin(email: string): Promise<User | undefined> {
  if (!db) return undefined;
  const normalized = email.toLowerCase().trim();
  const [row] = await db.select().from(users).where(eq(users.email, normalized));
  return row;
}
