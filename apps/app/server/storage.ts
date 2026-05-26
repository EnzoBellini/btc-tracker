import { and, eq } from "drizzle-orm";
import {
  Trade, InsertTrade,
  Transfer, InsertTransfer,
  BtcHolding, InsertBtcHolding,
  Settings, InsertSettings,
  ExchangeCredentials, InsertExchangeCredentials, ExchangeId, EXCHANGE_IDS,
  Goal, InsertGoal,
  User, InsertUser,
  UserRule, InsertUserRule,
  RoadmapItem, InsertRoadmapItem,
  OnboardingResponse,
  EmailVerificationToken,
  trades,
  transfers,
  btcHoldings,
  settings,
  exchangeCredentials,
  goals,
  users,
  emailVerificationTokens,
  onboardingResponses,
  userRules,
  roadmapItems,
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
  updateBtcHolding(userId: number, id: number, holding: Partial<InsertBtcHolding>): Promise<BtcHolding | undefined>;
  deleteBtcHolding(userId: number, id: number): Promise<boolean>;

  getSettings(userId: number): Promise<Settings>;
  updateSettings(userId: number, s: Partial<InsertSettings>): Promise<Settings>;

  listExchangeCredentials(userId: number): Promise<ExchangeCredentials[]>;
  getExchangeCredentials(userId: number, exchange: ExchangeId): Promise<ExchangeCredentials>;
  updateExchangeCredentials(
    userId: number,
    exchange: ExchangeId,
    c: Partial<InsertExchangeCredentials>,
  ): Promise<ExchangeCredentials>;

  getGoals(userId: number): Promise<Goal[]>;
  getGoal(userId: number, id: number): Promise<Goal | undefined>;
  createGoal(userId: number, goal: InsertGoal): Promise<Goal>;
  updateGoal(userId: number, id: number, goal: Partial<InsertGoal>): Promise<Goal | undefined>;
  deleteGoal(userId: number, id: number): Promise<boolean>;

  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;

  createEmailVerificationToken(userId: number, tokenHash: string, expiresAt: Date): Promise<EmailVerificationToken>;
  findValidVerificationToken(tokenHash: string): Promise<(EmailVerificationToken & { user: User }) | undefined>;
  markVerificationTokenUsed(id: number): Promise<void>;
  invalidateUserVerificationTokens(userId: number): Promise<void>;

  saveOnboardingProgress(userId: number, step: number, answers: Record<string, unknown>): Promise<void>;
  getOnboardingAnswers(userId: number): Promise<Record<string, unknown> | null>;
  completeOnboarding(userId: number, answers: Record<string, unknown>, scores: Record<string, unknown>): Promise<void>;

  replaceUserRules(userId: number, rules: InsertUserRule[]): Promise<UserRule[]>;
  getUserRules(userId: number): Promise<UserRule[]>;

  replaceRoadmapItems(userId: number, items: InsertRoadmapItem[]): Promise<RoadmapItem[]>;
  getRoadmapItems(userId: number): Promise<RoadmapItem[]>;
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
  async updateBtcHolding(userId: number, id: number, h: Partial<InsertBtcHolding>): Promise<BtcHolding | undefined> {
    const [updated] = await db!
      .update(btcHoldings)
      .set(h)
      .where(and(eq(btcHoldings.id, id), eq(btcHoldings.userId, userId)))
      .returning();
    return updated;
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

  private decryptExchangeRow(row: ExchangeCredentials): ExchangeCredentials {
    return {
      ...row,
      apiKey: decrypt(row.apiKey),
      secretKey: decrypt(row.secretKey),
      passphrase: row.passphrase ? decrypt(row.passphrase) : "",
    };
  }

  private encryptExchangePayload(c: Partial<InsertExchangeCredentials>): Partial<InsertExchangeCredentials> {
    const payload = { ...c };
    const masked = "••••••••••••••••";
    if (payload.secretKey && payload.secretKey !== masked) {
      payload.secretKey = encrypt(payload.secretKey);
    } else {
      delete payload.secretKey;
    }
    if (payload.passphrase && payload.passphrase !== masked) {
      payload.passphrase = encrypt(payload.passphrase);
    } else {
      delete payload.passphrase;
    }
    if (payload.apiKey) {
      payload.apiKey = encrypt(payload.apiKey);
    }
    return payload;
  }

  async listExchangeCredentials(userId: number): Promise<ExchangeCredentials[]> {
    const rows = await db!.select().from(exchangeCredentials).where(eq(exchangeCredentials.userId, userId));
    const byExchange = new Map(rows.map((r) => [r.exchange, r]));
    const result: ExchangeCredentials[] = [];
    for (const exchange of EXCHANGE_IDS) {
      const row = byExchange.get(exchange);
      if (row) {
        result.push(this.decryptExchangeRow(row));
      } else {
        const [inserted] = await db!
          .insert(exchangeCredentials)
          .values({ userId, exchange, apiKey: "", secretKey: "", passphrase: "", isConnected: false })
          .returning();
        if (inserted) result.push(this.decryptExchangeRow(inserted));
      }
    }
    return result;
  }

  async getExchangeCredentials(userId: number, exchange: ExchangeId): Promise<ExchangeCredentials> {
    const [row] = await db!
      .select()
      .from(exchangeCredentials)
      .where(and(eq(exchangeCredentials.userId, userId), eq(exchangeCredentials.exchange, exchange)))
      .limit(1);
    if (!row) {
      const [inserted] = await db!
        .insert(exchangeCredentials)
        .values({ userId, exchange, apiKey: "", secretKey: "", passphrase: "", isConnected: false })
        .returning();
      if (!inserted) throw new Error(`Failed to create ${exchange} credentials`);
      return this.decryptExchangeRow(inserted);
    }
    return this.decryptExchangeRow(row);
  }

  async updateExchangeCredentials(
    userId: number,
    exchange: ExchangeId,
    c: Partial<InsertExchangeCredentials>,
  ): Promise<ExchangeCredentials> {
    const payload = this.encryptExchangePayload(c);
    const [existing] = await db!
      .select()
      .from(exchangeCredentials)
      .where(and(eq(exchangeCredentials.userId, userId), eq(exchangeCredentials.exchange, exchange)))
      .limit(1);
    if (!existing) {
      const [inserted] = await db!
        .insert(exchangeCredentials)
        .values({
          userId,
          exchange,
          apiKey: "",
          secretKey: "",
          passphrase: "",
          isConnected: false,
          ...payload,
        })
        .returning();
      if (!inserted) throw new Error(`Failed to create ${exchange} credentials`);
      return this.decryptExchangeRow(inserted);
    }
    const [updated] = await db!
      .update(exchangeCredentials)
      .set(payload)
      .where(and(eq(exchangeCredentials.userId, userId), eq(exchangeCredentials.exchange, exchange)))
      .returning();
    if (!updated) throw new Error(`Failed to update ${exchange} credentials`);
    return this.decryptExchangeRow(updated);
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
  async getUserById(id: number): Promise<User | undefined> {
    const [row] = await db!.select().from(users).where(eq(users.id, id));
    return row;
  }

  async createUser(u: InsertUser): Promise<User> {
    const [user] = await db!.insert(users).values(u).returning();
    if (!user) throw new Error("Failed to create user");
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const [updated] = await db!.update(users).set(data).where(eq(users.id, id)).returning();
    return updated;
  }

  async createEmailVerificationToken(userId: number, tokenHash: string, expiresAt: Date): Promise<EmailVerificationToken> {
    await this.invalidateUserVerificationTokens(userId);
    const [row] = await db!.insert(emailVerificationTokens).values({ userId, tokenHash, expiresAt }).returning();
    if (!row) throw new Error("Failed to create verification token");
    return row;
  }

  async findValidVerificationToken(tokenHash: string): Promise<(EmailVerificationToken & { user: User }) | undefined> {
    const [row] = await db!
      .select()
      .from(emailVerificationTokens)
      .where(eq(emailVerificationTokens.tokenHash, tokenHash))
      .limit(1);
    if (!row || row.usedAt || row.expiresAt < new Date()) return undefined;
    const user = await this.getUserById(row.userId);
    if (!user) return undefined;
    return { ...row, user };
  }

  async markVerificationTokenUsed(id: number): Promise<void> {
    await db!.update(emailVerificationTokens).set({ usedAt: new Date() }).where(eq(emailVerificationTokens.id, id));
  }

  async invalidateUserVerificationTokens(userId: number): Promise<void> {
    await db!.update(emailVerificationTokens).set({ usedAt: new Date() }).where(eq(emailVerificationTokens.userId, userId));
  }

  async saveOnboardingProgress(userId: number, step: number, answers: Record<string, unknown>): Promise<void> {
    await db!.update(users).set({ onboardingStep: step, traderProfile: JSON.stringify({ answers }) }).where(eq(users.id, userId));
  }

  async getOnboardingAnswers(userId: number): Promise<Record<string, unknown> | null> {
    const user = await this.getUserById(userId);
    if (!user?.traderProfile) return null;
    try {
      const parsed = JSON.parse(user.traderProfile) as { answers?: Record<string, unknown> };
      return parsed.answers ?? (parsed as Record<string, unknown>);
    } catch {
      return null;
    }
  }

  async completeOnboarding(userId: number, answers: Record<string, unknown>, scores: Record<string, unknown>): Promise<void> {
    await db!.delete(onboardingResponses).where(eq(onboardingResponses.userId, userId));
    await db!.insert(onboardingResponses).values({
      userId,
      answers: JSON.stringify(answers),
      scores: JSON.stringify(scores),
    });
    await db!.update(users).set({
      onboardingCompleted: true,
      onboardingStep: 0,
      traderProfile: JSON.stringify(scores),
    }).where(eq(users.id, userId));
  }

  async replaceUserRules(userId: number, rules: InsertUserRule[]): Promise<UserRule[]> {
    await db!.delete(userRules).where(eq(userRules.userId, userId));
    if (rules.length === 0) return [];
    const inserted = await db!.insert(userRules).values(rules.map((r) => ({ ...r, userId }))).returning();
    return inserted;
  }

  async getUserRules(userId: number): Promise<UserRule[]> {
    const rows = await db!.select().from(userRules).where(eq(userRules.userId, userId));
    return rows.sort((a, b) => a.priority - b.priority);
  }

  async replaceRoadmapItems(userId: number, items: InsertRoadmapItem[]): Promise<RoadmapItem[]> {
    await db!.delete(roadmapItems).where(eq(roadmapItems.userId, userId));
    if (items.length === 0) return [];
    return db!.insert(roadmapItems).values(items.map((i) => ({ ...i, userId }))).returning();
  }

  async getRoadmapItems(userId: number): Promise<RoadmapItem[]> {
    const rows = await db!.select().from(roadmapItems).where(eq(roadmapItems.userId, userId));
    return rows.sort((a, b) => a.order - b.order);
  }
}

/** Storage em memória — um mapa por userId onde necessário */
class MemStorage implements IStorage {
  private trades: Map<number, Trade> = new Map();
  private transfers: Map<number, Transfer> = new Map();
  private btcHoldings: Map<number, BtcHolding> = new Map();
  private settingsByUser: Map<number, Settings> = new Map();
  private exchangeByKey: Map<string, ExchangeCredentials> = new Map();
  private goalsMap: Map<number, Goal> = new Map();
  private usersMap: Map<number, User> = new Map();
  private verificationTokens: Map<number, EmailVerificationToken & { user?: User }> = new Map();
  private userRulesMap: Map<number, UserRule> = new Map();
  private roadmapMap: Map<number, RoadmapItem> = new Map();
  private onboardingMap: Map<number, OnboardingResponse> = new Map();
  private nextId = { trades: 1, transfers: 1, btcHoldings: 1, goals: 1, users: 1, tokens: 1, rules: 1, roadmap: 1, onboarding: 1 };

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

  private exchangeKey(userId: number, exchange: ExchangeId) {
    return `${userId}:${exchange}`;
  }

  private defaultExchange(userId: number, exchange: ExchangeId): ExchangeCredentials {
    return {
      id: userId,
      userId,
      exchange,
      apiKey: "",
      secretKey: "",
      passphrase: "",
      isConnected: false,
      lastSyncAt: null,
      lastSyncStatus: null,
      lastSyncMessage: null,
    } as ExchangeCredentials;
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
  async updateBtcHolding(userId: number, id: number, h: Partial<InsertBtcHolding>) {
    const existing = this.btcHoldings.get(id);
    if (!existing || existing.userId !== userId) return undefined;
    const updated = { ...existing, ...h } as BtcHolding;
    this.btcHoldings.set(id, updated);
    return updated;
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

  private decryptMemExchange(row: ExchangeCredentials): ExchangeCredentials {
    return {
      ...row,
      apiKey: decrypt(row.apiKey),
      secretKey: decrypt(row.secretKey),
      passphrase: row.passphrase ? decrypt(row.passphrase) : "",
    };
  }

  async listExchangeCredentials(userId: number) {
    const result: ExchangeCredentials[] = [];
    for (const exchange of EXCHANGE_IDS) {
      result.push(await this.getExchangeCredentials(userId, exchange));
    }
    return result;
  }

  async getExchangeCredentials(userId: number, exchange: ExchangeId) {
    const key = this.exchangeKey(userId, exchange);
    let c = this.exchangeByKey.get(key);
    if (!c) {
      c = this.defaultExchange(userId, exchange);
      this.exchangeByKey.set(key, c);
    }
    return this.decryptMemExchange(c);
  }

  async updateExchangeCredentials(userId: number, exchange: ExchangeId, c: Partial<InsertExchangeCredentials>) {
    const masked = "••••••••••••••••";
    const payload = { ...c };
    if (payload.secretKey && payload.secretKey !== masked) {
      payload.secretKey = encrypt(payload.secretKey);
    } else {
      delete payload.secretKey;
    }
    if (payload.passphrase && payload.passphrase !== masked) {
      payload.passphrase = encrypt(payload.passphrase);
    } else {
      delete payload.passphrase;
    }
    if (payload.apiKey) {
      payload.apiKey = encrypt(payload.apiKey);
    }
    const key = this.exchangeKey(userId, exchange);
    let row = this.exchangeByKey.get(key);
    if (!row) {
      row = this.defaultExchange(userId, exchange);
    }
    const merged = { ...row, ...payload } as ExchangeCredentials;
    this.exchangeByKey.set(key, merged);
    return this.decryptMemExchange(merged);
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

  async getUserById(id: number) {
    return this.usersMap.get(id);
  }

  async createUser(u: InsertUser) {
    const user = {
      ...u,
      id: this.nextId.users++,
      emailVerified: u.emailVerified ?? true,
      mustChangePassword: u.mustChangePassword ?? false,
      onboardingCompleted: u.onboardingCompleted ?? true,
      onboardingStep: u.onboardingStep ?? 0,
      traderProfile: u.traderProfile ?? null,
      passwordChangedAt: u.passwordChangedAt ?? null,
      trialUsedAt: u.trialUsedAt ?? null,
      createdAt: new Date(),
    } as User;
    this.usersMap.set(user.id, user);
    return user;
  }

  async updateUser(id: number, data: Partial<User>) {
    const cur = this.usersMap.get(id);
    if (!cur) return undefined;
    const updated = { ...cur, ...data } as User;
    this.usersMap.set(id, updated);
    return updated;
  }

  async createEmailVerificationToken(userId: number, tokenHash: string, expiresAt: Date) {
    await this.invalidateUserVerificationTokens(userId);
    const row = {
      id: this.nextId.tokens++,
      userId,
      tokenHash,
      expiresAt,
      usedAt: null,
      createdAt: new Date(),
    } as EmailVerificationToken;
    this.verificationTokens.set(row.id, row);
    return row;
  }

  async findValidVerificationToken(tokenHash: string) {
    for (const row of Array.from(this.verificationTokens.values())) {
      if (row.tokenHash !== tokenHash || row.usedAt || row.expiresAt < new Date()) continue;
      const user = await this.getUserById(row.userId);
      if (!user) continue;
      return { ...row, user };
    }
    return undefined;
  }

  async markVerificationTokenUsed(id: number) {
    const row = this.verificationTokens.get(id);
    if (row) row.usedAt = new Date();
  }

  async invalidateUserVerificationTokens(userId: number) {
    for (const row of Array.from(this.verificationTokens.values())) {
      if (row.userId === userId && !row.usedAt) row.usedAt = new Date();
    }
  }

  async saveOnboardingProgress(userId: number, step: number, answers: Record<string, unknown>) {
    await this.updateUser(userId, { onboardingStep: step, traderProfile: JSON.stringify({ answers }) });
  }

  async getOnboardingAnswers(userId: number) {
    const user = await this.getUserById(userId);
    if (!user?.traderProfile) return null;
    try {
      const parsed = JSON.parse(user.traderProfile) as { answers?: Record<string, unknown> };
      return parsed.answers ?? (parsed as Record<string, unknown>);
    } catch {
      return null;
    }
  }

  async completeOnboarding(userId: number, answers: Record<string, unknown>, scores: Record<string, unknown>) {
    const row = {
      id: this.nextId.onboarding++,
      userId,
      answers: JSON.stringify(answers),
      scores: JSON.stringify(scores),
      completedAt: new Date(),
    } as OnboardingResponse;
    this.onboardingMap.set(row.id, row);
    await this.updateUser(userId, {
      onboardingCompleted: true,
      onboardingStep: 0,
      traderProfile: JSON.stringify(scores),
    });
  }

  async replaceUserRules(userId: number, rules: InsertUserRule[]) {
    for (const [id, r] of Array.from(this.userRulesMap.entries())) {
      if (r.userId === userId) this.userRulesMap.delete(id);
    }
    const inserted: UserRule[] = [];
    for (const r of rules) {
      const rule = { ...r, id: this.nextId.rules++, userId, items: r.items } as UserRule;
      this.userRulesMap.set(rule.id, rule);
      inserted.push(rule);
    }
    return inserted.sort((a, b) => a.priority - b.priority);
  }

  async getUserRules(userId: number) {
    return Array.from(this.userRulesMap.values())
      .filter((r) => r.userId === userId)
      .sort((a, b) => a.priority - b.priority);
  }

  async replaceRoadmapItems(userId: number, items: InsertRoadmapItem[]) {
    for (const [id, r] of Array.from(this.roadmapMap.entries())) {
      if (r.userId === userId) this.roadmapMap.delete(id);
    }
    const inserted: RoadmapItem[] = [];
    for (const i of items) {
      const item = { ...i, id: this.nextId.roadmap++, userId } as RoadmapItem;
      this.roadmapMap.set(item.id, item);
      inserted.push(item);
    }
    return inserted.sort((a, b) => a.order - b.order);
  }

  async getRoadmapItems(userId: number) {
    return Array.from(this.roadmapMap.values())
      .filter((r) => r.userId === userId)
      .sort((a, b) => a.order - b.order);
  }
}

export const storage = db ? new DbStorage() : new MemStorage();
