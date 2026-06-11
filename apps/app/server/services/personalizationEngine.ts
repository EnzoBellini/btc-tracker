import type { InsertGoal, InsertSettings, InsertUserRule, InsertRoadmapItem } from "@shared/schema";

export type QuizAnswers = Record<string, string | number>;
export type PersonalizationLocale = "pt" | "en";

export interface TraderProfileScores {
  experience: number;
  riskTolerance: number;
  discipline: number;
  capitalTier: "micro" | "small" | "medium" | "large";
  style: "scalper" | "day" | "swing";
  objective: "btc_stack" | "income" | "learning" | "hybrid";
  archetype: string;
}

const CAPITAL_MAP: Record<string, number> = {
  under_200: 150,
  "200_500": 350,
  "500_2000": 1000,
  "2000_plus": 3000,
};

export function computeScores(answers: QuizAnswers, locale: PersonalizationLocale = "pt"): TraderProfileScores {
  const exp = Number(answers.experience ?? 3);
  const riskPct = Number(answers.riskPerTradePct ?? 2);
  const drawdown = Number(answers.drawdownStop ?? 20);
  const capitalKey = String(answers.capitalTier ?? "200_500");

  const experience = Math.min(100, (exp / 5) * 100);
  const riskTolerance = Math.min(100, riskPct * 20 + (30 - drawdown));
  const discipline =
    answers.afterLoss === "analyze"
      ? 85
      : answers.afterLoss === "stop"
        ? 70
        : 35;

  const style = (answers.tradingStyle as TraderProfileScores["style"]) ?? "day";
  const objective = (answers.objective as TraderProfileScores["objective"]) ?? "hybrid";
  const capitalTier = (capitalKey.replace(/\d/g, "").includes("plus")
    ? "large"
    : capitalKey.includes("2000")
      ? "large"
      : capitalKey.includes("500")
        ? "medium"
        : capitalKey.includes("200")
          ? "small"
          : "micro") as TraderProfileScores["capitalTier"];

  const archetypes = locale === "en"
    ? {
        balanced: "Balanced Builder",
        conservative: "Conservative Accumulator",
        income: "Income Builder",
        learner: "Protected Learner",
        aggressive: "Controlled Aggressive",
        recovery: "Disciplined Recovery",
      }
    : {
        balanced: "Construtor Equilibrado",
        conservative: "Conservador Acumulador",
        income: "Construtor de Renda",
        learner: "Aprendiz Protegido",
        aggressive: "Agressivo Controlado",
        recovery: "Recuperação Disciplinada",
      };

  let archetype = archetypes.balanced;
  if (objective === "btc_stack" && riskPct <= 2) archetype = archetypes.conservative;
  else if (objective === "income") archetype = archetypes.income;
  else if (experience < 40) archetype = archetypes.learner;
  else if (riskPct >= 3 && discipline >= 70) archetype = archetypes.aggressive;
  else if (answers.afterLoss === "revenge") archetype = archetypes.recovery;

  return {
    experience,
    riskTolerance,
    discipline,
    capitalTier: capitalKey in CAPITAL_MAP
      ? (capitalKey === "under_200" ? "micro" : capitalKey === "200_500" ? "small" : capitalKey === "500_2000" ? "medium" : "large")
      : capitalTier,
    style,
    objective,
    archetype,
  };
}

export function mapToSettings(answers: QuizAnswers, scores: TraderProfileScores): Partial<InsertSettings> {
  const totalCapital = CAPITAL_MAP[String(answers.capitalTier)] ?? 200;
  const riskPct = Number(answers.riskPerTradePct ?? 2) / 100;

  let futuresRatio = 0.5;
  if (scores.objective === "btc_stack") futuresRatio = 0.5;
  else if (scores.objective === "income") futuresRatio = 0.7;
  else if (scores.objective === "learning") futuresRatio = 0.4;

  const futuresCapital = Math.round(totalCapital * futuresRatio * 100) / 100;
  const spotCapital = Math.round((totalCapital - futuresCapital) * 100) / 100;
  const riskPerTrade = Math.min(futuresCapital * 0.05, Math.round(futuresCapital * riskPct * 100) / 100);

  let defaultLeverage = Number(answers.leverage ?? 3);
  if (scores.experience < 40) defaultLeverage = Math.min(defaultLeverage, 2);
  if (scores.experience >= 80) defaultLeverage = Math.min(defaultLeverage, 5);

  let profitTransferThreshold = 10;
  if (scores.objective === "btc_stack") profitTransferThreshold = 10;
  else if (scores.objective === "income") profitTransferThreshold = 20;
  else if (scores.objective === "learning") profitTransferThreshold = 15;

  return {
    totalCapital,
    futuresCapital,
    spotCapital,
    riskPerTrade,
    defaultLeverage: Math.round(defaultLeverage),
    stopTradingDrawdown: Number(answers.drawdownStop ?? 20),
    profitTransferThreshold,
  };
}

function rrMin(style: string): string {
  if (style === "scalper") return "1:1,5";
  if (style === "swing") return "1:3";
  return "1:2";
}

function maxOpen(style: string, raw: string | number): number {
  const n = Number(raw) || 2;
  if (style === "scalper") return 1;
  return Math.min(n, 2);
}

export function buildUserRules(
  answers: QuizAnswers,
  scores: TraderProfileScores,
  settings: Partial<InsertSettings>,
  locale: PersonalizationLocale = "pt",
): InsertUserRule[] {
  const tc = settings.totalCapital ?? 200;
  const fc = settings.futuresCapital ?? 100;
  const sc = settings.spotCapital ?? 100;
  const risk = settings.riskPerTrade ?? 2.5;
  const lev = settings.defaultLeverage ?? 3;
  const dd = settings.stopTradingDrawdown ?? 20;
  const transfer = settings.profitTransferThreshold ?? 10;
  const style = scores.style;
  const maxTrades = maxOpen(style, answers.maxOpenPositions ?? 2);

  const isEn = locale === "en";

  return [
    {
      category: "capital",
      title: isEn ? "Capital Allocation" : "Alocação de Capital",
      items: JSON.stringify(
        isEn
          ? [
              `Total capital: ${tc} USDT`,
              `${Math.round((fc / tc) * 100)}% in futures (${fc} USDT) — leveraged trading`,
              `${Math.round((sc / tc) * 100)}% in spot BTC (${sc} USDT) — BTC accumulation`,
              "Never risk more than the allocated futures capital",
            ]
          : [
              `Capital total: ${tc} USDT`,
              `${Math.round((fc / tc) * 100)}% em futuros (${fc} USDT) — operação com alavancagem`,
              `${Math.round((sc / tc) * 100)}% em spot BTC (${sc} USDT) — acumulação de BTC`,
              "Nunca arrisque mais do que o capital de futuros alocado",
            ],
      ),
      priority: 1,
      source: "onboarding",
    },
    {
      category: "risk",
      title: isEn ? "Risk Rules" : "Regras de Risco",
      items: JSON.stringify(
        isEn
          ? [
              `Maximum risk per trade: ${risk} USDT`,
              `Default leverage: ${lev}x`,
              "Stop-loss required on ALL trades — never move stop after entry",
              `Stop trading when futures capital drawdown reaches -${dd}%`,
            ]
          : [
              `Risco máximo por trade: ${risk} USDT`,
              `Alavancagem padrão: ${lev}x`,
              "Stop-loss obrigatório em TODOS os trades — nunca mover o stop após entrada",
              `Parar de operar ao atingir -${dd}% de drawdown no capital de futuros`,
            ],
      ),
      priority: 2,
      source: "onboarding",
    },
    {
      category: "entry_exit",
      title: isEn ? "Entry and Exit" : "Entrada e Saída",
      items: JSON.stringify(
        isEn
          ? [
              `Minimum R:R: ${rrMin(style)} (${style} profile)`,
              "Stop below/above the last relevant pivot",
              `Maximum of ${maxTrades} open position(s) at a time`,
              scores.discipline < 50
                ? "After 2 consecutive losses: 24h pause — no revenge trading"
                : "No revenge trading after a loss — log and analyze",
            ]
          : [
              `R:R mínimo: ${rrMin(style)} (perfil ${style})`,
              "Stop abaixo/acima do último pivot relevante",
              `Máximo de ${maxTrades} posição(ões) aberta(s) simultaneamente`,
              scores.discipline < 50
                ? "Após 2 perdas seguidas: pausa de 24h — sem revenge trading"
                : "Sem revenge trading após perda — registrar e analisar",
            ],
      ),
      priority: 3,
      source: "onboarding",
    },
    {
      category: "transfer",
      title: isEn ? "Profit Transfer" : "Transferência de Lucro",
      items: JSON.stringify(
        isEn
          ? [
              `Every +${transfer} USDT profit in futures → buy BTC on spot`,
              "Log transfer with exact BTC price",
              scores.objective === "btc_stack"
                ? "Primary goal: grow BTC stack, not accumulate USDT"
                : "Reinvest profits according to Plan Tracker goal",
            ]
          : [
              `A cada +${transfer} USDT de lucro nos futuros → comprar BTC no spot`,
              "Registrar transferência com preço exato do BTC",
              scores.objective === "btc_stack"
                ? "Objetivo principal: crescer o BTC stack, não acumular USDT"
                : "Reinvestir lucros conforme meta definida no Plan Tracker",
            ],
      ),
      priority: 4,
      source: "onboarding",
    },
  ];
}

export function buildInitialGoals(
  answers: QuizAnswers,
  scores: TraderProfileScores,
  settings: Partial<InsertSettings>,
  locale: PersonalizationLocale = "pt",
): InsertGoal[] {
  const isEn = locale === "en";
  const tc = settings.totalCapital ?? 200;
  const monthlyPct = Number(answers.monthlyGoalPct ?? 5);
  const targetAmount = Math.round(tc * (monthlyPct / 100) * 100) / 100;
  const today = new Date();
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  const goals: InsertGoal[] = [
    {
      title:
        scores.objective === "btc_stack"
          ? (isEn ? "Monthly profit for BTC transfer" : "Lucro mensal para transferência BTC")
          : (isEn ? "Futures profit goal (month)" : "Meta de lucro em futuros (mês)"),
      targetAmount: Math.max(targetAmount, 5),
      currentAmount: 0,
      period: "monthly",
      startDate: fmt(today),
      endDate: fmt(end),
      status: "active",
      notes: isEn
        ? `Generated by onboarding — ${scores.archetype} profile`
        : `Gerado pelo onboarding — perfil ${scores.archetype}`,
    },
  ];

  if (scores.discipline < 60) {
    goals.push({
      title: isEn ? "30 days without revenge trading" : "30 dias sem revenge trading",
      targetAmount: 0,
      currentAmount: 0,
      period: "custom",
      startDate: fmt(today),
      endDate: fmt(new Date(today.getTime() + 30 * 86400000)),
      status: "active",
      notes: isEn ? "Discipline goal from quiz" : "Meta de disciplina do quiz",
    });
  }

  return goals;
}

export function buildRoadmap(
  answers: QuizAnswers,
  scores: TraderProfileScores,
  locale: PersonalizationLocale = "pt",
): InsertRoadmapItem[] {
  const isEn = locale === "en";
  const settings = mapToSettings(answers, scores);
  const transferThreshold = settings.profitTransferThreshold ?? 10;
  const items: InsertRoadmapItem[] = [];
  let order = 0;

  if (scores.discipline < 50 || answers.afterLoss === "revenge") {
    items.push({
      phase: 0,
      title: isEn ? "Pause and discipline" : "Pausa e disciplina",
      description: isEn
        ? "Establish the 24h rule after 2 consecutive losses before scaling volume."
        : "Estabeleça a regra dos 24h após 2 perdas consecutivas antes de escalar volume.",
      checklist: JSON.stringify(
        isEn
          ? [
              { task: "Read personalized risk rules", done: false },
              { task: "Set drawdown alert in journal", done: false },
            ]
          : [
              { task: "Ler regras de risco personalizadas", done: false },
              { task: "Configurar alerta de drawdown no diário", done: false },
            ],
      ),
      status: "active",
      order: order++,
    });
  }

  if (scores.experience < 40) {
    items.push({
      phase: 0,
      title: isEn ? "Minimum size trading" : "Operação em tamanho mínimo",
      description: isEn
        ? "First 10 trades at 50% of calculated risk until consistency."
        : "Primeiras 10 operações com 50% do risco calculado até consistência.",
      checklist: JSON.stringify(
        isEn
          ? [
              { task: "Log 5 trades in journal", done: false },
              { task: "Review win rate after 10 trades", done: false },
            ]
          : [
              { task: "Registrar 5 trades no diário", done: false },
              { task: "Revisar win rate após 10 trades", done: false },
            ],
      ),
      status: "active",
      order: order++,
    });
  }

  items.push(
    {
      phase: 1,
      title: isEn ? "Foundation — week 1–2" : "Fundação — semana 1–2",
      description: isEn
        ? "Connect exchange, validate settings and log trades."
        : "Conectar exchange, validar settings e registrar operações.",
      checklist: JSON.stringify(
        isEn
          ? [
              { task: "Connect exchanges (MEXC, Binance, Bitget) in Settings", done: false },
              { task: "Confirm capital and risk per trade", done: false },
              { task: "Log first trade with stop and target", done: false },
            ]
          : [
              { task: "Conectar exchanges (MEXC, Binance, Bitget) em Configurações", done: false },
              { task: "Confirmar capital e risco por trade", done: false },
              { task: "Registrar primeiro trade com stop e alvo", done: false },
            ],
      ),
      status: "active",
      order: order++,
    },
    {
      phase: 2,
      title: isEn ? "Consistency — week 3–4" : "Consistência — semana 3–4",
      description: isEn
        ? "10 trades respecting fixed risk and minimum R:R."
        : "10 trades respeitando risco fixo e R:R mínimo.",
      checklist: JSON.stringify(
        isEn
          ? [
              { task: "Complete 10 trades with planned risk", done: false },
              { task: "Win rate and PnL in reports", done: false },
            ]
          : [
              { task: "Completar 10 trades com risco planejado", done: false },
              { task: "Win rate e PnL no relatório", done: false },
            ],
      ),
      status: "active",
      order: order++,
    },
    {
      phase: 3,
      title: isEn ? "BTC stack — month 2" : "BTC stack — mês 2",
      description: isEn
        ? "First profit transfer to spot."
        : "Primeira transferência de lucro para spot.",
      checklist: JSON.stringify(
        isEn
          ? [
              { task: `Reach +${transferThreshold} USDT accumulated profit`, done: false },
              { task: "Log transfer in Transfers", done: false },
            ]
          : [
              { task: `Atingir +${transferThreshold} USDT de lucro acumulado`, done: false },
              { task: "Registrar transferência em Transferências", done: false },
            ],
      ),
      status: "active",
      order: order++,
    },
  );

  return items;
}

export function applyPersonalization(answers: QuizAnswers, locale: PersonalizationLocale = "pt") {
  const scores = computeScores(answers, locale);
  const settings = mapToSettings(answers, scores);
  const rules = buildUserRules(answers, scores, settings, locale);
  const goals = buildInitialGoals(answers, scores, settings, locale);
  const roadmap = buildRoadmap(answers, scores, locale);
  return { scores, settings, rules, goals, roadmap };
}
