import { pgTable, text, integer, real, boolean, serial, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  emailVerified: boolean("email_verified").notNull().default(true),
  mustChangePassword: boolean("must_change_password").notNull().default(false),
  onboardingCompleted: boolean("onboarding_completed").notNull().default(true),
  onboardingStep: integer("onboarding_step").notNull().default(0),
  traderProfile: text("trader_profile"),
  passwordChangedAt: timestamp("password_changed_at"),
  trialUsedAt: timestamp("trial_used_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ── Billing: plan catalog ─────────────────────────────────────────────────────
export const plans = pgTable("plans", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  priceCents: integer("price_cents").notNull(),
  currency: text("currency").notNull().default("BRL"),
  stripePriceId: text("stripe_price_id"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  highlights: text("highlights"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Plan = typeof plans.$inferSelect;

export const SUBSCRIPTION_STATUSES = [
  "trialing",
  "active",
  "past_due",
  "canceled",
  "expired",
] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export const SUBSCRIPTION_SOURCES = ["trial_signup", "checkout", "admin_override"] as const;
export type SubscriptionSource = (typeof SUBSCRIPTION_SOURCES)[number];

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    planId: text("plan_id")
      .notNull()
      .references(() => plans.id),
    status: text("status").notNull().default("trialing"),
    trialEndsAt: timestamp("trial_ends_at"),
    currentPeriodStart: timestamp("current_period_start"),
    currentPeriodEnd: timestamp("current_period_end"),
    stripeCustomerId: text("stripe_customer_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    source: text("source").notNull().default("trial_signup"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => [uniqueIndex("subscriptions_user_id_unique").on(t.userId)],
);

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

export const adminAuditLog = pgTable("admin_audit_log", {
  id: serial("id").primaryKey(),
  action: text("action").notNull(),
  targetUserId: integer("target_user_id"),
  payload: text("payload"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const emailVerificationTokens = pgTable("email_verification_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type EmailVerificationToken = typeof emailVerificationTokens.$inferSelect;

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// ── Trades ────────────────────────────────────────────────────────────────────
export const trades = pgTable("trades", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: text("date").notNull(),               // ISO date string YYYY-MM-DD
  pair: text("pair").notNull().default("BTCUSDT"),
  direction: text("direction").notNull(),     // "LONG" | "SHORT"
  entryPrice: real("entry_price").notNull(),
  stopPrice: real("stop_price").notNull(),
  targetPrice: real("target_price").notNull(),
  exitPrice: real("exit_price"),
  positionSize: real("position_size").notNull(), // USDT
  leverage: integer("leverage").notNull().default(3),
  pnl: real("pnl"),                          // realized PnL in USDT
  status: text("status").notNull().default("OPEN"), // "OPEN" | "WIN" | "LOSS" | "BREAKEVEN"
  notes: text("notes"),
});

export const insertTradeSchema = createInsertSchema(trades).omit({ id: true, userId: true });
export type InsertTrade = z.infer<typeof insertTradeSchema>;
export type Trade = typeof trades.$inferSelect;

// ── Transfers (futures → spot BTC) ───────────────────────────────────────────
export const transfers = pgTable("transfers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  amountUsdt: real("amount_usdt").notNull(),  // USDT moved
  btcPrice: real("btc_price").notNull(),      // BTC price at transfer time
  btcBought: real("btc_bought").notNull(),    // = amountUsdt / btcPrice
  notes: text("notes"),
});

export const insertTransferSchema = createInsertSchema(transfers).omit({ id: true, userId: true });
export type InsertTransfer = z.infer<typeof insertTransferSchema>;
export type Transfer = typeof transfers.$inferSelect;

// ── BTC Holdings snapshots ────────────────────────────────────────────────────
export const btcHoldings = pgTable("btc_holdings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  btcAmount: real("btc_amount").notNull(),    // total BTC held
  avgCostUsdt: real("avg_cost_usdt").notNull(), // avg cost per BTC
  btcPriceNow: real("btc_price_now").notNull(), // current BTC price
  notes: text("notes"),
});

export const insertBtcHoldingSchema = createInsertSchema(btcHoldings).omit({ id: true, userId: true });
export type InsertBtcHolding = z.infer<typeof insertBtcHoldingSchema>;
export type BtcHolding = typeof btcHoldings.$inferSelect;

// ── Account Settings (uma linha por usuário) ───────────────────────────────────
export const settings = pgTable(
  "settings",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    totalCapital: real("total_capital").notNull().default(200),  // USDT
  futuresCapital: real("futures_capital").notNull().default(100),
  spotCapital: real("spot_capital").notNull().default(100),
  riskPerTrade: real("risk_per_trade").notNull().default(2.5), // USDT
  profitTransferThreshold: real("profit_transfer_threshold").notNull().default(10), // every +10 USDT profit → buy BTC
  defaultLeverage: integer("default_leverage").notNull().default(3),
  stopTradingDrawdown: real("stop_trading_drawdown").notNull().default(20), // % drawdown to stop
  },
  (t) => [uniqueIndex("settings_user_id_unique").on(t.userId)],
);

export const insertSettingsSchema = createInsertSchema(settings).omit({ id: true, userId: true });
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;

// ── Exchange API Credentials (uma linha por usuário + exchange) ───────────────
export const EXCHANGE_IDS = ["mexc", "binance", "bitget"] as const;
export type ExchangeId = (typeof EXCHANGE_IDS)[number];

export const exchangeCredentials = pgTable(
  "exchange_credentials",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    exchange: text("exchange").notNull(), // mexc | binance | bitget
    apiKey: text("api_key").notNull().default(""),
    secretKey: text("secret_key").notNull().default(""),
    passphrase: text("passphrase").notNull().default(""),
    isConnected: boolean("is_connected").notNull().default(false),
    lastSyncAt: text("last_sync_at"),
    lastSyncStatus: text("last_sync_status"),
    lastSyncMessage: text("last_sync_message"),
  },
  (t) => [uniqueIndex("exchange_credentials_user_exchange_unique").on(t.userId, t.exchange)],
);

export const insertExchangeCredentialsSchema = createInsertSchema(exchangeCredentials).omit({
  id: true,
  userId: true,
  exchange: true,
});
export type InsertExchangeCredentials = z.infer<typeof insertExchangeCredentialsSchema>;
export type ExchangeCredentials = typeof exchangeCredentials.$inferSelect;

/** @deprecated use ExchangeCredentials */
export type MexcCredentials = ExchangeCredentials;

// ── Goals / Plan Tracker ──────────────────────────────────────────────────────
export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  targetAmount: real("target_amount").notNull(),  // USDT target
  currentAmount: real("current_amount").notNull().default(0),
  period: text("period").notNull(),               // "daily" | "weekly" | "monthly" | "custom"
  startDate: text("start_date").notNull(),         // YYYY-MM-DD
  endDate: text("end_date").notNull(),             // YYYY-MM-DD
  status: text("status").notNull().default("active"), // "active" | "completed" | "failed" | "paused"
  notes: text("notes"),
});

export const insertGoalSchema = createInsertSchema(goals).omit({ id: true, userId: true });
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;

// ── Onboarding (quiz) ─────────────────────────────────────────────────────────
export const onboardingResponses = pgTable(
  "onboarding_responses",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    answers: text("answers").notNull(),
    scores: text("scores").notNull(),
    completedAt: timestamp("completed_at").defaultNow(),
  },
  (t) => [uniqueIndex("onboarding_responses_user_id_unique").on(t.userId)],
);

export type OnboardingResponse = typeof onboardingResponses.$inferSelect;

export const userRules = pgTable("user_rules", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  category: text("category").notNull(),
  title: text("title").notNull(),
  items: text("items").notNull(),
  priority: integer("priority").notNull().default(0),
  source: text("source").notNull().default("onboarding"),
});

export const insertUserRuleSchema = createInsertSchema(userRules).omit({ id: true, userId: true });
export type InsertUserRule = z.infer<typeof insertUserRuleSchema>;
export type UserRule = typeof userRules.$inferSelect;

export const roadmapItems = pgTable("roadmap_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  phase: integer("phase").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  checklist: text("checklist").notNull(),
  status: text("status").notNull().default("active"),
  order: integer("order").notNull().default(0),
});

export const insertRoadmapItemSchema = createInsertSchema(roadmapItems).omit({ id: true, userId: true });
export type InsertRoadmapItem = z.infer<typeof insertRoadmapItemSchema>;
export type RoadmapItem = typeof roadmapItems.$inferSelect;

