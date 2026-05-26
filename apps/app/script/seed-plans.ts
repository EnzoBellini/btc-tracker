import "dotenv/config";
import { PLAN_CATALOG } from "@trackion/billing";
import { db } from "../server/db";
import { plans } from "../shared/schema";

async function main() {
  if (!db) {
    console.error("DATABASE_URL required");
    process.exit(1);
  }
  for (const plan of Object.values(PLAN_CATALOG)) {
    await db
      .insert(plans)
      .values({
        id: plan.id,
        name: plan.name,
        priceCents: plan.priceCents,
        currency: plan.currency,
        sortOrder: plan.sortOrder,
        highlights: JSON.stringify(plan.highlights),
        isActive: true,
      })
      .onConflictDoUpdate({
        target: plans.id,
        set: {
          name: plan.name,
          priceCents: plan.priceCents,
          sortOrder: plan.sortOrder,
          highlights: JSON.stringify(plan.highlights),
        },
      });
    console.log(`plan: ${plan.id}`);
  }
  console.log("done");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
