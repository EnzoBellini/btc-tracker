import { and, eq } from "drizzle-orm";
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
import { encrypt, decrypt } from "./crypto";

const defaultSettingsRow = (userId: number): Omit<InsertSettings, never> & { userId: number } => ({
  userId,
  totalCapital: 200,
  futuresCapital: 100,
  spotCapital: 100,
  riskPerTrade: 2.5,
  profitTransferThreshold: 10,
  defaultLeverage: 3,
  stopTradingDrawdown: 20,
});

export interface IStorage {
  getTrades(userId: number): Promise<Trade[]>;
  getTrade(userId: number, id: number): Promise<Trade | undefined>;
  createTrade(userId: number, trade: InsertTrade): Promise<Trade>;
  updateTrade(userId: number, id: number, trade: Partial<InsertTrade>): Promise<Trade | undefined>;
  deleteTrade(userId: number, id: number): Promise<boolean>;

  getTransfers(userId: number): Promise<Transfer[]>;
  createTransfer(userId: number, transfer: InsertTransfer): Promise<Transfer>;
  deleteTransfer(userId: number, id: number): Promise<boolean>;

  getBtcHoldings(userId: number): Promise<BtcHolding[]>;
  createBtcHolding(userId: number, holding: InsertBtcHolding): Promise<BtcHolding>;
  deleteBtcHolding(userId: number, id: number): Promise<boolean>;

  getSettings(userId: number): Promise<Settings>;
  updateSettings(userId: number, s: Partial<InsertSettings>): Promise<Settings>;

  getMexcCredentials(userId: number): Promise<MexcCredentials>;
  updateMexcCredentials(userId: number, c: Partial<InsertMexcCredentials>): Promise<MexcCredentials>;

  getGoals(userId: number): Promise<Goal[]>;
  getGoal(userId: number, id: number): Promise<Goal | undefined>;
  createGoal(userId: number, goal: InsertGoal): Promise<Goal>;
  updateGoal(userId: number, id: number, goal: Partial<InsertGoal>): Promise<Goal | undefined>;
  deleteGoal(userId: number, id: number): Promise<boolean>;

  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class DbStorage implements IStorage {
  async getTrades(userId: number): Promise<Trade[]> {
    const rows = await db!.select().from(trades).where(eq(trades.userId, userId));
    return rows.sort((a, b) => {
      const d = b.date.localeCompare(a.date);
      return d !== 0 ? d : b.id - a.id;
    });
  }
  async getTrade(userId: number, id: number): Promise<Trade | undefined> {
    const [row] = await db!.select().from(trades).where(and(eq(trades.id, id), eq(trades.userId, userId)));
    return row;
  }
  async createTrade(userId: number, t: InsertTrade): Promise<Trade> {
    const [trade] = await db!.insert(trades).values({ ...t, userId }).returning();
    if (!trade) throw new Error("Failed to create trade");
    return trade;
  }
  async updateTrade(userId: number, id: number, t: Partial<InsertTrade>): Promise<Trade | undefined> {
    const existing = await this.getTrade(userId, id);
    if (!existing) return undefined;
    const [updated] = await db!.update(trades).set(t).where(and(eq(trades.id, id), eq(trades.userId, userId))).returning();
    return updated;
  }
  async deleteTrade(userId: number, id: number): Promise<boolean> {
    const result = await db!.delete(trades).where(and(eq(trades.id, id), eq(trades.userId, userId))).returning();
    return result.length > 0;
  }

  async getTransfers(userId: number): Promise<Transfer[]> {
    return (await db!.select().from(transfers).where(eq(transfers.userId, userId))).sort((a, b) => b.id - a.id);
  }
  async createTransfer(userId: number, t: InsertTransfer): Promise<Transfer> {
    const [tr] = await db!.insert(transfers).values({ ...t, userId }).returning();
    if (!tr) throw new Error("Failed to create transfer");
    return tr;
  }
  async deleteTransfer(userId: number, id: number): Promise<boolean> {
    const result = await db!.delete(transfers).where(and(eq(transfers.id, id), eq(transfers.userId, userId))).returning();
    return result.length > 0;
  }

  async getBtcHoldings(userId: number): Promise<BtcHolding[]> {
    return (await db!.select().from(btcHoldings).where(eq(btcHoldings.userId, userId))).sort((a, b) => a.id - b.id);
  }
  async createBtcHolding(userId: number, h: InsertBtcHolding): Promise<BtcHolding> {
    const [holding] = await db!.insert(btcHoldings).values({ ...h, userId }).returning();
    if (!holding) throw new Error("Failed to create BTC holding");
    return holding;
  }
  async deleteBtcHolding(userId: number, id: number): Promise<boolean> {
    const result = await db!.delete(btcHoldings).where(and(eq(btcHoldings.id, id), eq(btcHoldings.userId, userId))).returning();
    return result.length > 0;
  }

  async getSettings(userId: number): Promise<Settings> {
    const [row] = await db!.select().from(settings).where(eq(settings.userId, userId)).limit(1);
    if (!row) {
      const [inserted] = await db!.insert(settings).values(defaultSettingsRow(userId)).returning();
      if (!inserted) throw new Error("Failed to create default settings");
      return inserted;
    }
    return row;
  }
  async updateSettings(userId: number, s: Partial<InsertSettings>): Promise<Settings> {
    const [existing] = await db!.select().from(settings).where(eq(settings.userId, userId)).limit(1);
    if (!existing) {
      const [inserted] = await db!.insert(settings).values({ ...defaultSettingsRow(userId), ...s }).returning();
      if (!inserted) throw new Error("Failed to create settings");
      return inserted;
    }
    const [updated] = await db!.update(settings).set(s).where(eq(settings.userId, userId)).returning();
    if (!updated) throw new Error("Failed to update settings");
    return updated;
  }

  async getMexcCredentials(userId: number): Promise<MexcCredentials> {
    const [row] = await db!.select().from(mexcCredentials).where(eq(mexcCredentials.userId, userId)).limit(1);
    if (!row) {
      const [inserted] = await db!.insert(mexcCredentials).values({
        userId,
        apiKey: "",
        secretKey: "",
        isConnected: false,
      }).returning();
      if (!inserted) throw new Error("Failed to create default MEXC credentials");
      return inserted;
    }
    return { ...row, secretKey: decrypt(row.secretKey) };
  }
  async updateMexcCredentials(userId: number, c: Partial<InsertMexcCredentials>): Promise<MexcCredentials> {
    const payload = { ...c };
    if (payload.secretKey && payload.secretKey !== "••••••••••••••••") {
      payload.secretKey = encrypt(payload.secretKey);
    }
    const [existing] = await db!.select().from(mexcCredentials).where(eq(mexcCredentials.userId, userId)).limit(1);
    if (!existing) {
      const [inserted] = await db!.insert(mexcCredentials).values({ userId, apiKey: "", secretKey: "", isConnected: false, ...payload }).returning();
      if (!inserted) throw new Error("Failed to create MEXC credentials");
      return { ...inserted, secretKey: decrypt(inserted.secretKey) };
    }
    const [updated] = await db!.update(mexcCredentials).set(payload).where(eq(mexcCredentials.userId, userId)).returning();
    if (!updated) throw new Error("Failed to update MEXC credentials");
    return { ...updated, secretKey: decrypt(updated.secretKey) };
  }

  async getGoals(userId: number): Promise<Goal[]> {
    return (await db!.select().from(goals).where(eq(goals.userId, userId))).sort((a, b) => b.id - a.id);
  }
  async getGoal(userId: number, id: number): Promise<Goal | undefined> {
    const [row] = await db!.select().from(goals).where(and(eq(goals.id, id), eq(goals.userId, userId)));
    return row;
  }
  async createGoal(userId: number, g: InsertGoal): Promise<Goal> {
    const [goal] = await db!.insert(goals).values({ ...g, userId }).returning();
    if (!goal) throw new Error("Failed to create goal");
    return goal;
  }
  async updateGoal(userId: number, id: number, g: Partial<InsertGoal>): Promise<Goal | undefined> {
    const existing = await this.getGoal(userId, id);
    if (!existing) return undefined;
    const [updated] = await db!.update(goals).set(g).where(and(eq(goals.id, id), eq(goals.userId, userId))).returning();
    return updated;
  }
  async deleteGoal(userId: number, id: number): Promise<boolean> {
    const result = await db!.delete(goals).where(and(eq(goals.id, id), eq(goals.userId, userId))).returning();
    return result.length > 0;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const normalized = email.toLowerCase().trim();
    const [row] = await db!.select().from(users).where(eq(users.email, normalized));
    return row;
  }
  async createUser(u: InsertUser): Promise<User> {
    const [user] = await db!.insert(users).values(u).returning();
    if (!user) throw new Error("Failed to create user");
    return user;
  }
}

/** Storage em memória — um mapa por userId onde necessário */
class MemStorage implements IStorage {
  private trades: Map<number, Trade> = new Map();
  private transfers: Map<number, Transfer> = new Map();
  private btcHoldings: Map<number, BtcHolding> = new Map();
  private settingsByUser: Map<number, Settings> = new Map();
  private mexcByUser: Map<number, MexcCredentials> = new Map();
  private goalsMap: Map<number, Goal> = new Map();
  private usersMap: Map<number, User> = new Map();
  private nextId = { trades: 1, transfers: 1, btcHoldings: 1, goals: 1, users: 1 };

  private defaultSettings(userId: number): Settings {
    return {
      id: userId,
      userId,
      totalCapital: 200,
      futuresCapital: 100,
      spotCapital: 100,
      riskPerTrade: 2.5,
      profitTransferThreshold: 10,
      defaultLeverage: 3,
      stopTradingDrawdown: 20,
    } as Settings;
  }

  private defaultMexc(userId: number): MexcCredentials {
    return {
      id: userId,
      userId,
      apiKey: "",
      secretKey: "",
      isConnected: false,
      lastSyncAt: null,
      lastSyncStatus: null,
      lastSyncMessage: null,
    } as MexcCredentials;
  }

  async getTrades(userId: number) {
    return Array.from(this.trades.values())
      .filter(t => t.userId === userId)
      .sort((a, b) => {
        const d = b.date.localeCompare(a.date);
        return d !== 0 ? d : b.id - a.id;
      });
  }
  async getTrade(userId: number, id: number) {
    const t = this.trades.get(id);
    return t?.userId === userId ? t : undefined;
  }
  async createTrade(userId: number, t: InsertTrade) {
    const trade = {
      ...t,
      id: this.nextId.trades++,
      userId,
      exitPrice: t.exitPrice ?? null,
      pnl: t.pnl ?? null,
      notes: t.notes ?? null,
    } as Trade;
    this.trades.set(trade.id, trade);
    return trade;
  }
  async updateTrade(userId: number, id: number, t: Partial<InsertTrade>) {
    const existing = await this.getTrade(userId, id);
    if (!existing) return undefined;
    const updated = { ...existing, ...t } as Trade;
    this.trades.set(id, updated);
    return updated;
  }
  async deleteTrade(userId: number, id: number) {
    const t = this.trades.get(id);
    if (!t || t.userId !== userId) return false;
    return this.trades.delete(id);
  }

  async getTransfers(userId: number) {
    return Array.from(this.transfers.values()).filter(t => t.userId === userId).sort((a, b) => b.id - a.id);
  }
  async createTransfer(userId: number, t: InsertTransfer) {
    const tr = { ...t, id: this.nextId.transfers++, userId, notes: t.notes ?? null } as Transfer;
    this.transfers.set(tr.id, tr);
    return tr;
  }
  async deleteTransfer(userId: number, id: number) {
    const t = this.transfers.get(id);
    if (!t || t.userId !== userId) return false;
    return this.transfers.delete(id);
  }

  async getBtcHoldings(userId: number) {
    return Array.from(this.btcHoldings.values()).filter(h => h.userId === userId).sort((a, b) => a.id - b.id);
  }
  async createBtcHolding(userId: number, h: InsertBtcHolding) {
    const holding = { ...h, id: this.nextId.btcHoldings++, userId, notes: h.notes ?? null } as BtcHolding;
    this.btcHoldings.set(holding.id, holding);
    return holding;
  }
  async deleteBtcHolding(userId: number, id: number) {
    const h = this.btcHoldings.get(id);
    if (!h || h.userId !== userId) return false;
    return this.btcHoldings.delete(id);
  }

  async getSettings(userId: number) {
    let s = this.settingsByUser.get(userId);
    if (!s) {
      s = this.defaultSettings(userId);
      this.settingsByUser.set(userId, s);
    }
    return s;
  }
  async updateSettings(userId: number, s: Partial<InsertSettings>) {
    const cur = await this.getSettings(userId);
    const updated = { ...cur, ...s } as Settings;
    this.settingsByUser.set(userId, updated);
    return updated;
  }

  async getMexcCredentials(userId: number) {
    let c = this.mexcByUser.get(userId);
    if (!c) {
      c = this.defaultMexc(userId);
      this.mexcByUser.set(userId, c);
    }
    return c;
  }
  async updateMexcCredentials(userId: number, c: Partial<InsertMexcCredentials>) {
    const cur = await this.getMexcCredentials(userId);
    const updated = { ...cur, ...c } as MexcCredentials;
    this.mexcByUser.set(userId, updated);
    return updated;
  }

  async getGoals(userId: number) {
    return Array.from(this.goalsMap.values()).filter(g => g.userId === userId).sort((a, b) => b.id - a.id);
  }
  async getGoal(userId: number, id: number) {
    const g = this.goalsMap.get(id);
    return g?.userId === userId ? g : undefined;
  }
  async createGoal(userId: number, g: InsertGoal) {
    const goal = { ...g, id: this.nextId.goals++, userId, notes: g.notes ?? null } as Goal;
    this.goalsMap.set(goal.id, goal);
    return goal;
  }
  async updateGoal(userId: number, id: number, g: Partial<InsertGoal>) {
    const existing = await this.getGoal(userId, id);
    if (!existing) return undefined;
    const updated = { ...existing, ...g } as Goal;
    this.goalsMap.set(id, updated);
    return updated;
  }
  async deleteGoal(userId: number, id: number) {
    const g = this.goalsMap.get(id);
    if (!g || g.userId !== userId) return false;
    return this.goalsMap.delete(id);
  }

  async getUserByEmail(email: string) {
    return Array.from(this.usersMap.values()).find(u => u.email === email.toLowerCase().trim());
  }
  async createUser(u: InsertUser) {
    const user = { ...u, id: this.nextId.users++ } as User;
    this.usersMap.set(user.id, user);
    return user;
  }
}

export const storage = db ? new DbStorage() : new MemStorage();
