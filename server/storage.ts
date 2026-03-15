import { eq } from "drizzle-orm";
import {
  Trade, InsertTrade,
  Transfer, InsertTransfer,
  BtcHolding, InsertBtcHolding,
  Settings, InsertSettings,
  MexcCredentials, InsertMexcCredentials,
  Goal, InsertGoal,
  User, InsertUser,
  trades,
  transfers,
  btcHoldings,
  settings,
  mexcCredentials,
  goals,
  users,
} from "@shared/schema";
import { db } from "./db";

export interface IStorage {
  // Trades
  getTrades(): Promise<Trade[]>;
  getTrade(id: number): Promise<Trade | undefined>;
  createTrade(trade: InsertTrade): Promise<Trade>;
  updateTrade(id: number, trade: Partial<InsertTrade>): Promise<Trade | undefined>;
  deleteTrade(id: number): Promise<boolean>;

  // Transfers
  getTransfers(): Promise<Transfer[]>;
  createTransfer(transfer: InsertTransfer): Promise<Transfer>;
  deleteTransfer(id: number): Promise<boolean>;

  // BTC Holdings
  getBtcHoldings(): Promise<BtcHolding[]>;
  createBtcHolding(holding: InsertBtcHolding): Promise<BtcHolding>;
  deleteBtcHolding(id: number): Promise<boolean>;

  // Settings
  getSettings(): Promise<Settings>;
  updateSettings(s: Partial<InsertSettings>): Promise<Settings>;

  // MEXC Credentials
  getMexcCredentials(): Promise<MexcCredentials>;
  updateMexcCredentials(c: Partial<InsertMexcCredentials>): Promise<MexcCredentials>;

  // Goals
  getGoals(): Promise<Goal[]>;
  getGoal(id: number): Promise<Goal | undefined>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: number, goal: Partial<InsertGoal>): Promise<Goal | undefined>;
  deleteGoal(id: number): Promise<boolean>;

  // Users (auth)
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class DbStorage implements IStorage {
  // ── Trades ──────────────────────────────────────────────────────────────────
  async getTrades(): Promise<Trade[]> {
    return (await db.select().from(trades)).sort((a, b) => b.id - a.id);
  }
  async getTrade(id: number): Promise<Trade | undefined> {
    const [row] = await db.select().from(trades).where(eq(trades.id, id));
    return row;
  }
  async createTrade(t: InsertTrade): Promise<Trade> {
    const [trade] = await db.insert(trades).values(t).returning();
    if (!trade) throw new Error("Failed to create trade");
    return trade;
  }
  async updateTrade(id: number, t: Partial<InsertTrade>): Promise<Trade | undefined> {
    const [updated] = await db.update(trades).set(t).where(eq(trades.id, id)).returning();
    return updated;
  }
  async deleteTrade(id: number): Promise<boolean> {
    const result = await db.delete(trades).where(eq(trades.id, id)).returning();
    return result.length > 0;
  }

  // ── Transfers ───────────────────────────────────────────────────────────────
  async getTransfers(): Promise<Transfer[]> {
    return (await db.select().from(transfers)).sort((a, b) => b.id - a.id);
  }
  async createTransfer(t: InsertTransfer): Promise<Transfer> {
    const [tr] = await db.insert(transfers).values(t).returning();
    if (!tr) throw new Error("Failed to create transfer");
    return tr;
  }
  async deleteTransfer(id: number): Promise<boolean> {
    const result = await db.delete(transfers).where(eq(transfers.id, id)).returning();
    return result.length > 0;
  }

  // ── BTC Holdings ────────────────────────────────────────────────────────────
  async getBtcHoldings(): Promise<BtcHolding[]> {
    return (await db.select().from(btcHoldings)).sort((a, b) => a.id - b.id);
  }
  async createBtcHolding(h: InsertBtcHolding): Promise<BtcHolding> {
    const [holding] = await db.insert(btcHoldings).values(h).returning();
    if (!holding) throw new Error("Failed to create BTC holding");
    return holding;
  }
  async deleteBtcHolding(id: number): Promise<boolean> {
    const result = await db.delete(btcHoldings).where(eq(btcHoldings.id, id)).returning();
    return result.length > 0;
  }

  // ── Settings ────────────────────────────────────────────────────────────────
  async getSettings(): Promise<Settings> {
    const [row] = await db.select().from(settings).limit(1);
    if (!row) {
      const [inserted] = await db.insert(settings).values({
        totalCapital: 200,
        futuresCapital: 100,
        spotCapital: 100,
        riskPerTrade: 2.5,
        profitTransferThreshold: 10,
        defaultLeverage: 3,
        stopTradingDrawdown: 20,
      }).returning();
      if (!inserted) throw new Error("Failed to create default settings");
      return inserted;
    }
    return row;
  }
  async updateSettings(s: Partial<InsertSettings>): Promise<Settings> {
    const [existing] = await db.select().from(settings).limit(1);
    if (!existing) {
      const [inserted] = await db.insert(settings).values(s).returning();
      if (!inserted) throw new Error("Failed to create settings");
      return inserted;
    }
    const [updated] = await db.update(settings).set(s).where(eq(settings.id, existing.id)).returning();
    if (!updated) throw new Error("Failed to update settings");
    return updated;
  }

  // ── MEXC Credentials ────────────────────────────────────────────────────────
  async getMexcCredentials(): Promise<MexcCredentials> {
    const [row] = await db.select().from(mexcCredentials).limit(1);
    if (!row) {
      const [inserted] = await db.insert(mexcCredentials).values({
        apiKey: "",
        secretKey: "",
        isConnected: false,
      }).returning();
      if (!inserted) throw new Error("Failed to create default MEXC credentials");
      return inserted;
    }
    return row;
  }
  async updateMexcCredentials(c: Partial<InsertMexcCredentials>): Promise<MexcCredentials> {
    const [existing] = await db.select().from(mexcCredentials).limit(1);
    if (!existing) {
      const [inserted] = await db.insert(mexcCredentials).values(c).returning();
      if (!inserted) throw new Error("Failed to create MEXC credentials");
      return inserted;
    }
    const [updated] = await db.update(mexcCredentials).set(c).where(eq(mexcCredentials.id, existing.id)).returning();
    if (!updated) throw new Error("Failed to update MEXC credentials");
    return updated;
  }

  // ── Goals ───────────────────────────────────────────────────────────────────
  async getGoals(): Promise<Goal[]> {
    return (await db.select().from(goals)).sort((a, b) => b.id - a.id);
  }
  async getGoal(id: number): Promise<Goal | undefined> {
    const [row] = await db.select().from(goals).where(eq(goals.id, id));
    return row;
  }
  async createGoal(g: InsertGoal): Promise<Goal> {
    const [goal] = await db.insert(goals).values(g).returning();
    if (!goal) throw new Error("Failed to create goal");
    return goal;
  }
  async updateGoal(id: number, g: Partial<InsertGoal>): Promise<Goal | undefined> {
    const [updated] = await db.update(goals).set(g).where(eq(goals.id, id)).returning();
    return updated;
  }
  async deleteGoal(id: number): Promise<boolean> {
    const result = await db.delete(goals).where(eq(goals.id, id)).returning();
    return result.length > 0;
  }

  // ── Users (auth) ───────────────────────────────────────────────────────────
  async getUserByEmail(email: string): Promise<User | undefined> {
    const normalized = email.toLowerCase().trim();
    const [row] = await db.select().from(users).where(eq(users.email, normalized));
    return row;
  }
  async createUser(u: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(u).returning();
    if (!user) throw new Error("Failed to create user");
    return user;
  }
}

export const storage = new DbStorage();
