/**
 * Usuários sem assinatura: inicia trial Elite 14d se trial_used_at ainda null.
 */
import "dotenv/config";
import { isNull } from "drizzle-orm";
import { db } from "../server/db";
import { users } from "../shared/schema";
import { startTrialForUser } from "../server/billing/subscriptionService";
import * as billingStorage from "../server/billing/storage";

async function main() {
  if (!db) {
    console.error("DATABASE_URL required");
    process.exit(1);
  }
  const rows = await db.select().from(users).where(isNull(users.trialUsedAt));
  let started = 0;
  for (const u of rows) {
    const sub = await billingStorage.getSubscriptionByUserId(u.id);
    if (sub) continue;
    try {
      await startTrialForUser(u.id);
      started++;
      console.log(`trial: ${u.email}`);
    } catch (e) {
      console.warn(`skip ${u.email}:`, e);
    }
  }
  console.log(`done, started ${started}`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
