import { pgTable, text, integer, real, boolean, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// ── Trades ────────────────────────────────────────────────────────────────────
export const trades = pgTable("trades", {
  id: serial("id").primaryKey(),
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

export const insertTradeSchema = createInsertSchema(trades).omit({ id: true });
export type InsertTrade = z.infer<typeof insertTradeSchema>;
export type Trade = typeof trades.$inferSelect;

// ── Transfers (futures → spot BTC) ───────────────────────────────────────────
export const transfers = pgTable("transfers", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  amountUsdt: real("amount_usdt").notNull(),  // USDT moved
  btcPrice: real("btc_price").notNull(),      // BTC price at transfer time
  btcBought: real("btc_bought").notNull(),    // = amountUsdt / btcPrice
  notes: text("notes"),
});

export const insertTransferSchema = createInsertSchema(transfers).omit({ id: true });
export type InsertTransfer = z.infer<typeof insertTransferSchema>;
export type Transfer = typeof transfers.$inferSelect;

// ── BTC Holdings snapshots ────────────────────────────────────────────────────
export const btcHoldings = pgTable("btc_holdings", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  btcAmount: real("btc_amount").notNull(),    // total BTC held
  avgCostUsdt: real("avg_cost_usdt").notNull(), // avg cost per BTC
  btcPriceNow: real("btc_price_now").notNull(), // current BTC price
  notes: text("notes"),
});

export const insertBtcHoldingSchema = createInsertSchema(btcHoldings).omit({ id: true });
export type InsertBtcHolding = z.infer<typeof insertBtcHoldingSchema>;
export type BtcHolding = typeof btcHoldings.$inferSelect;

// ── Account Settings ──────────────────────────────────────────────────────────
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  totalCapital: real("total_capital").notNull().default(200),  // USDT
  futuresCapital: real("futures_capital").notNull().default(100),
  spotCapital: real("spot_capital").notNull().default(100),
  riskPerTrade: real("risk_per_trade").notNull().default(2.5), // USDT
  profitTransferThreshold: real("profit_transfer_threshold").notNull().default(10), // every +10 USDT profit → buy BTC
  defaultLeverage: integer("default_leverage").notNull().default(3),
  stopTradingDrawdown: real("stop_trading_drawdown").notNull().default(20), // % drawdown to stop
});

export const insertSettingsSchema = createInsertSchema(settings).omit({ id: true });
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;

// ── MEXC API Credentials ──────────────────────────────────────────────────────
export const mexcCredentials = pgTable("mexc_credentials", {
  id: serial("id").primaryKey(),
  apiKey: text("api_key").notNull().default(""),
  secretKey: text("secret_key").notNull().default(""),
  isConnected: boolean("is_connected").notNull().default(false),
  lastSyncAt: text("last_sync_at"),  // ISO timestamp
  lastSyncStatus: text("last_sync_status"), // "success" | "error" | null
  lastSyncMessage: text("last_sync_message"),
});

export const insertMexcCredentialsSchema = createInsertSchema(mexcCredentials).omit({ id: true });
export type InsertMexcCredentials = z.infer<typeof insertMexcCredentialsSchema>;
export type MexcCredentials = typeof mexcCredentials.$inferSelect;

// ── Goals / Plan Tracker ──────────────────────────────────────────────────────
export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  targetAmount: real("target_amount").notNull(),  // USDT target
  currentAmount: real("current_amount").notNull().default(0),
  period: text("period").notNull(),               // "daily" | "weekly" | "monthly" | "custom"
  startDate: text("start_date").notNull(),         // YYYY-MM-DD
  endDate: text("end_date").notNull(),             // YYYY-MM-DD
  status: text("status").notNull().default("active"), // "active" | "completed" | "failed" | "paused"
  notes: text("notes"),
});

export const insertGoalSchema = createInsertSchema(goals).omit({ id: true });
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;

