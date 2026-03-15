import {
  Trade, InsertTrade,
  Transfer, InsertTransfer,
  BtcHolding, InsertBtcHolding,
  Settings, InsertSettings,
  MexcCredentials, InsertMexcCredentials,
  Goal, InsertGoal,
  User, InsertUser,
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private trades: Map<number, Trade> = new Map();
  private transfers: Map<number, Transfer> = new Map();
  private btcHoldings: Map<number, BtcHolding> = new Map();
  private settings: Settings = {
    id: 1,
    totalCapital: 200,
    futuresCapital: 100,
    spotCapital: 100,
    riskPerTrade: 2.5,
    profitTransferThreshold: 10,
    defaultLeverage: 3,
    stopTradingDrawdown: 20,
  };
  private mexcCreds: MexcCredentials = {
    id: 1,
    apiKey: "",
    secretKey: "",
    isConnected: false,
    lastSyncAt: null,
    lastSyncStatus: null,
    lastSyncMessage: null,
  };
  private goalsMap: Map<number, Goal> = new Map();
  private usersMap: Map<number, User> = new Map();
  private nextId = { trades: 1, transfers: 1, btcHoldings: 1, goals: 1, users: 1 };

  // ── Trades ──────────────────────────────────────────────────────────────────
  async getTrades(): Promise<Trade[]> {
    return Array.from(this.trades.values()).sort((a, b) => b.id - a.id);
  }
  async getTrade(id: number): Promise<Trade | undefined> { return this.trades.get(id); }
  async createTrade(t: InsertTrade): Promise<Trade> {
    const trade: Trade = { ...t, id: this.nextId.trades++, exitPrice: t.exitPrice ?? null, pnl: t.pnl ?? null, notes: t.notes ?? null };
    this.trades.set(trade.id, trade);
    return trade;
  }
  async updateTrade(id: number, t: Partial<InsertTrade>): Promise<Trade | undefined> {
    const existing = this.trades.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...t };
    this.trades.set(id, updated);
    return updated;
  }
  async deleteTrade(id: number): Promise<boolean> { return this.trades.delete(id); }

  // ── Transfers ───────────────────────────────────────────────────────────────
  async getTransfers(): Promise<Transfer[]> {
    return Array.from(this.transfers.values()).sort((a, b) => b.id - a.id);
  }
  async createTransfer(t: InsertTransfer): Promise<Transfer> {
    const tr: Transfer = { ...t, id: this.nextId.transfers++, notes: t.notes ?? null };
    this.transfers.set(tr.id, tr);
    return tr;
  }
  async deleteTransfer(id: number): Promise<boolean> { return this.transfers.delete(id); }

  // ── BTC Holdings ────────────────────────────────────────────────────────────
  async getBtcHoldings(): Promise<BtcHolding[]> {
    return Array.from(this.btcHoldings.values()).sort((a, b) => a.id - b.id);
  }
  async createBtcHolding(h: InsertBtcHolding): Promise<BtcHolding> {
    const holding: BtcHolding = { ...h, id: this.nextId.btcHoldings++, notes: h.notes ?? null };
    this.btcHoldings.set(holding.id, holding);
    return holding;
  }
  async deleteBtcHolding(id: number): Promise<boolean> { return this.btcHoldings.delete(id); }

  // ── Settings ────────────────────────────────────────────────────────────────
  async getSettings(): Promise<Settings> { return this.settings; }
  async updateSettings(s: Partial<InsertSettings>): Promise<Settings> {
    this.settings = { ...this.settings, ...s };
    return this.settings;
  }

  // ── MEXC Credentials ────────────────────────────────────────────────────────
  async getMexcCredentials(): Promise<MexcCredentials> { return this.mexcCreds; }
  async updateMexcCredentials(c: Partial<InsertMexcCredentials>): Promise<MexcCredentials> {
    this.mexcCreds = { ...this.mexcCreds, ...c };
    return this.mexcCreds;
  }

  // ── Goals ───────────────────────────────────────────────────────────────────
  async getGoals(): Promise<Goal[]> {
    return Array.from(this.goalsMap.values()).sort((a, b) => b.id - a.id);
  }
  async getGoal(id: number): Promise<Goal | undefined> { return this.goalsMap.get(id); }
  async createGoal(g: InsertGoal): Promise<Goal> {
    const goal: Goal = { ...g, id: this.nextId.goals++, notes: g.notes ?? null };
    this.goalsMap.set(goal.id, goal);
    return goal;
  }
  async updateGoal(id: number, g: Partial<InsertGoal>): Promise<Goal | undefined> {
    const existing = this.goalsMap.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...g };
    this.goalsMap.set(id, updated);
    return updated;
  }
  async deleteGoal(id: number): Promise<boolean> { return this.goalsMap.delete(id); }

  // ── Users ───────────────────────────────────────────────────────────────────
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(u => u.email === email);
  }
  async createUser(u: InsertUser): Promise<User> {
    const user: User = { ...u, id: this.nextId.users++ };
    this.usersMap.set(user.id, user);
    return user;
  }
}

export const storage = new MemStorage();
