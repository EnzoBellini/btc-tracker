import type { Market } from "./locale";

export type NavItem = {
  href: string;
  index: string;
  label: string;
  mono: string;
};

export type AppContent = {
  shell: {
    nav: NavItem[];
    brandSubtitle: string;
    exchLive: (count: number) => string;
    exchOff: string;
    navigationEyebrow: string;
    online: string;
    logout: string;
    closeMenu: string;
    openMenu: string;
    operational: string;
    errorTitle: string;
    errorReload: string;
    errorRetry: string;
    loadingSession: string;
    tradesImported: (count: number) => string;
  };
  login: {
    features: { index: string; label: string }[];
    stepMeta: Record<
      "email" | "check_email" | "password",
      { index: string; title: string; hint: string }
    >;
    heroTitle: [string, string, string];
    emailLabel: string;
    emailPlaceholder: string;
    continue: string;
    sending: string;
    checkEmailBody: (email: string) => string;
    resend: string;
    resending: string;
    confirmedEnterPassword: string;
    useOtherEmail: string;
    passwordLabel: string;
    hidePassword: string;
    showPassword: string;
    enter: string;
    entering: string;
    back: string;
    stepFooter: string;
    toastPasswordRequired: string;
    toastCheckEmail: string;
    toastWelcome: string;
    toastResent: string;
    toastLoginError: string;
    toastError: string;
  };
  verifyEmail: {
    invalidLink: string;
    confirming: string;
    confirmed: string;
    redirecting: string;
    toastConfirmed: string;
  };
  pendingEmail: {
    title: string;
    body: (email: string) => string;
    emailLabel: string;
    resend: string;
    resending: string;
    resent: string;
    hint: string;
    error: string;
  };
  changePassword: {
    title: string;
    loggedAs: string;
    subtitle: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    save: string;
    saving: string;
    deleteTitle: string;
    deleteDesc: string;
    confirmEmail: string;
    yourPassword: string;
    delete: string;
    deleting: string;
    passwordsMismatch: string;
    success: string;
    emailMismatch: string;
    deleteConfirm: string;
    accountDeleted: string;
    deleteError: string;
    error: string;
  };
  notFound: {
    title: string;
    description: string;
  };
  subscriptionWall: {
    eyebrow: string;
    trialEndedTitle: string;
    choosePlanTitle: string;
    trialEndedDesc: string;
    daysLeftDesc: (days: number) => string;
    subscriptionRequired: string;
    recommended: string;
    originalPrice: string;
    perMonth: string;
    subscribe: string;
    footer: string;
    loading: string;
  };
  billing: {
    eyebrow: string;
    title: string;
    subtitle: string;
    paymentReceived: string;
    refresh: string;
    loading: string;
    currentPlan: string;
    noAccess: string;
    trialElite: string;
    status: string;
    trialDays: (days: number) => string;
    manageStripe: string;
    availablePlans: string;
    currentPlanBtn: string;
    subscribe: string;
  };
  dashboard: {
    eyebrow: string;
    title: string;
    subtitle: string;
    canTrade: string;
    stopTrading: string;
    transferToBtc: string;
    totalPnl: string;
    winRate: string;
    btcAccumulated: string;
    openTrades: string;
    livePositions: string;
    noClosedTrades: string;
    equityCurve: string;
    lastTrades: string;
    defaultLeverage: string;
    roadmapEyebrow: string;
    roadmapTitle: string;
    roadmapPhases: (n: number) => string;
    planTrackerEyebrow: string;
    figEquity: string;
    figLastTrades: string;
    samples: (n: number) => string;
    configSection: string;
    configReadOnly: string;
    labelTotalCapital: string;
    labelFuturesCapital: string;
    labelSpotCapital: string;
    labelRiskPerTrade: string;
    labelTransferWhen: string;
    labelStopDrawdown: string;
    labelTotalTrades: string;
    captionRealizedUsdt: string;
    captionWinRate: string;
    captionSpotConverted: string;
    tradesCount: (n: number) => string;
    emptyConnectHint: string;
    emptyConnectCta: string;
  };
  trades: {
    eyebrow: string;
    title: string;
    subtitle: string;
    newTrade: string;
    editTrade: string;
    sync: string;
    syncing: string;
    searchPlaceholder: string;
    statusFilter: string;
    directionFilter: string;
    all: string;
    noTrades: string;
    date: string;
    pair: string;
    direction: string;
    status: string;
    entry: string;
    exit: string;
    pnl: string;
    setup: string;
    notes: string;
    setupPlaceholder: string;
    notesPlaceholder: string;
    save: string;
    saving: string;
    cancel: string;
    delete: string;
    actions: string;
    detailTitle: string;
    chartTitle: string;
    chartError: string;
    viewChart: string;
    tableHeaders: { k: string; w: string }[];
  };
  transfers: {
    eyebrow: string;
    title: string;
    subtitle: string;
    newTransfer: string;
    totalTransferred: string;
    totalBtc: string;
    avgPrice: string;
    noTransfers: string;
    date: string;
    amountUsdt: string;
    btcPrice: string;
    btcBought: string;
    notes: string;
    save: string;
    cancel: string;
    delete: string;
    chartBtcOverTime: string;
    tableTransfers: string;
    tableRows: (n: number) => string;
    emptyTransfers: string;
  };
  btcHoldings: {
    eyebrow: string;
    title: string;
    subtitle: string;
    newSnapshot: string;
    totalBtc: string;
    avgCost: string;
    currentValue: string;
    unrealizedPnl: string;
    noSnapshots: string;
    date: string;
    btcAmount: string;
    avgCostUsdt: string;
    btcPriceNow: string;
    notes: string;
    save: string;
    cancel: string;
    delete: string;
    chartBtcAccumulated: string;
    chartPriceVsCost: string;
    tableSnapshots: string;
    tableRows: (n: number) => string;
    emptySnapshots: string;
    chartBtcLabel: string;
    chartPriceLabel: string;
    chartCostLabel: string;
  };
  rules: {
    eyebrow: string;
    title: string;
    subtitle: string;
    settingsTitle: string;
    saveSettings: string;
    saving: string;
    capitalTotal: string;
    futuresCapital: string;
    spotCapital: string;
    riskPerTrade: string;
    transferThreshold: string;
    defaultLeverage: string;
    stopDrawdown: string;
    yourRules: string;
    noRules: string;
    doctrineEyebrow: string;
    pillar: (i: number, total: number) => string;
    positionSizingTitle: string;
    scenariosEyebrow: string;
    scenariosTitle: string;
    decisionTree: string;
    settingsSectionTitle: string;
    settingsEyebrow: string;
    configStrategyEyebrow: string;
  };
  reports: {
    eyebrow: string;
    title: string;
    subtitle: string;
    totalPnl: string;
    globalWinRate: string;
    totalTrades: string;
    sharpe: string;
    btcBought: string;
    maxDrawdown: string;
    sharpeRatio: string;
    dailyReturns: string;
    weeklyInsights: string;
    proUpsellTitle: string;
    proUpsellDesc: string;
    byHour: string;
    emptyNoData: string;
    emptyNoTrades: string;
    emptyNoSlice: string;
    tableMonth: string;
    tableWeek: string;
    tableTrades: string;
    tableWins: string;
    tableLosses: string;
    tableWinRate: string;
    tablePnl: string;
    chartPnlMonth: string;
    chartWinRateMonth: string;
    chartPnlWeeks: string;
    chartTradesWeek: string;
  };
  apiSettings: {
    eyebrow: string;
    title: string;
    subtitle: string;
    connected: (exchange: string) => string;
    notConnected: string;
    ipError: string;
    save: string;
    test: string;
    sync: string;
    readOnlyNote: string;
    futuresNote: string;
    mexcSteps: string[];
    binanceSteps: string[];
    bitgetSteps: string[];
    closedPositions: string;
    btcStackSnapshot: string;
  };
  onboarding: {
    title: string;
    stepOf: (step: number, total: number) => string;
    back: string;
    next: string;
    finish: string;
    generating: string;
    profileConfigured: (archetype: string) => string;
    configuredDefault: string;
    error: string;
    welcomeTitle: string;
    welcomeSubtitle: string;
    welcomeArchetype: (archetype: string) => string;
    connectExchange: string;
    exploreDashboard: string;
    fields: {
      capital: string;
      riskPerTrade: (pct: number) => string;
      experience: string;
      timePerDay: string;
      drawdownStop: string;
      objective: string;
      tradingStyle: string;
      leverage: string;
      maxOpenPositions: string;
      afterLoss: string;
      usesStopLoss: string;
      monthlyGoal: string;
      monthlyGoalHint: string;
    };
    options: {
      capitalTier: Record<string, string>;
      timePerDay: Record<string, string>;
      objective: Record<string, string>;
      tradingStyle: Record<string, string>;
      afterLoss: Record<string, string>;
      usesStopLoss: Record<string, string>;
    };
  };
  common: {
    loading: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    error: string;
    noData: string;
  };
  toasts: {
    tradeRegistered: string;
    tradeUpdated: string;
    tradeRemoved: string;
    tradeError: string;
    tradeUpdateError: string;
    tradeRemoveError: string;
    transferRegistered: string;
    transferRemoved: string;
    transferError: string;
    transferRemoveError: string;
    snapshotRegistered: string;
    snapshotRemoved: string;
    snapshotError: string;
    snapshotRemoveError: string;
    settingsSaved: string;
    settingsError: string;
    goalCreated: string;
    goalUpdated: string;
    goalRemoved: string;
    goalError: string;
    credentialsSaved: string;
    credentialsError: string;
    connectionOk: string;
    connectionFailed: string;
    connectionTestError: string;
    synced: string;
    syncFailed: string;
    syncError: string;
    tradesImported: (count: number) => string;
    tradesImportedParts: (parts: string) => string;
    exchangeSyncError: string;
    noNewTrades: string;
  };
};

const BR: AppContent = {
  shell: {
    nav: [
      { href: "/", index: "01", label: "Dashboard", mono: "DASHBOARD" },
      { href: "/trades", index: "02", label: "Trades", mono: "TRADES" },
      { href: "/transfers", index: "03", label: "Transferências", mono: "TRANSFERS" },
      { href: "/btc-holdings", index: "04", label: "BTC Stack", mono: "BTC.STACK" },
      { href: "/reports", index: "05", label: "Relatórios", mono: "REPORTS" },
      { href: "/rules", index: "06", label: "Regras & Metas", mono: "RULES" },
      { href: "/api-settings", index: "07", label: "API Exchanges", mono: "API.EXCH" },
      { href: "/billing", index: "08", label: "Assinatura", mono: "BILLING" },
      { href: "/conta", index: "09", label: "Conta", mono: "ACCOUNT" },
    ],
    brandSubtitle: "trading journal · v2",
    exchLive: (n) => `${n} EXCH LIVE`,
    exchOff: "EXCH OFF",
    navigationEyebrow: "↳ navigation · 09 modules",
    online: "● online",
    logout: "Sair",
    closeMenu: "Fechar menu",
    openMenu: "Abrir menu",
    operational: "OPERATIONAL",
    errorTitle: "Algo deu errado",
    errorReload: "Recarregar",
    errorRetry: "Tentar novamente",
    loadingSession: "Carregando sessão…",
    tradesImported: (n) => `${n} trade(s) importado(s)`,
  },
  login: {
    features: [
      { index: "01", label: "Rastreie trades BTCUSDT em tempo real" },
      { index: "02", label: "Gerencie risco com regras personalizadas" },
      { index: "03", label: "Sincronize MEXC, Binance e Bitget via API" },
    ],
    stepMeta: {
      email: {
        index: "01",
        title: "Identifique-se.",
        hint: "Digite seu e-mail para entrar ou criar conta",
      },
      check_email: {
        index: "02",
        title: "Confirme o e-mail.",
        hint: "Enviamos instruções para sua caixa de entrada",
      },
      password: {
        index: "03",
        title: "Acesso seguro.",
        hint: "Use a senha enviada ao seu e-mail",
      },
    },
    heroTitle: ["Journal crypto.", "Domine BTCUSDT", "futures."],
    emailLabel: "$ email",
    emailPlaceholder: "seu@email.com",
    continue: "continuar",
    sending: "enviando…",
    checkEmailBody: (email) =>
      `Enviamos um e-mail para ${email} com sua senha temporária e o link de confirmação.`,
    resend: "reenviar e-mail",
    resending: "reenviando…",
    confirmedEnterPassword: "já confirmei — inserir senha",
    useOtherEmail: "usar outro e-mail",
    passwordLabel: "$ password",
    hidePassword: "Ocultar senha",
    showPassword: "Mostrar senha",
    enter: "entrar",
    entering: "entrando…",
    back: "voltar",
    stepFooter: "↳ step {step} / 03 · read-only api recommended",
    toastPasswordRequired: "Informe a senha enviada ao seu e-mail",
    toastCheckEmail: "Verifique seu e-mail",
    toastWelcome: "Bem-vindo ao Trackion!",
    toastResent: "E-mail reenviado",
    toastLoginError: "Erro ao entrar",
    toastError: "Erro",
  },
  verifyEmail: {
    invalidLink: "Link de verificação inválido",
    confirming: "Confirmando seu e-mail...",
    confirmed: "E-mail confirmado",
    redirecting: "Redirecionando...",
    toastConfirmed: "E-mail confirmado!",
  },
  pendingEmail: {
    title: "Confirme seu e-mail",
    body: (email) =>
      `Enviamos um link de confirmação e senha temporária para ${email}. Abra o e-mail e clique no link para ativar seu trial.`,
    emailLabel: "E-mail da conta",
    resend: "Reenviar e-mail de confirmação",
    resending: "Reenviando…",
    resent: "E-mail reenviado. Verifique sua caixa de entrada.",
    hint: "Não encontrou? Verifique spam ou promoções.",
    error: "Não foi possível reenviar",
  },
  changePassword: {
    title: "Conta",
    loggedAs: "Logado como",
    subtitle: "Altere sua senha ou exclua a conta para testar o cadastro novamente.",
    currentPassword: "Senha atual",
    newPassword: "Nova senha (mín. 12 caracteres)",
    confirmPassword: "Confirmar nova senha",
    save: "Salvar nova senha",
    saving: "Salvando...",
    deleteTitle: "Excluir conta",
    deleteDesc:
      "Remove todos os seus dados permanentemente. Esta ação não pode ser desfeita.",
    confirmEmail: "Confirme seu e-mail",
    yourPassword: "Sua senha",
    delete: "Excluir minha conta",
    deleting: "Excluindo...",
    passwordsMismatch: "As senhas não coincidem",
    success: "Senha alterada com sucesso",
    emailMismatch: "Digite seu e-mail exatamente como na conta",
    deleteConfirm:
      "Excluir sua conta permanentemente? Você poderá se cadastrar de novo com o mesmo e-mail.",
    accountDeleted: "Conta excluída",
    deleteError: "Erro ao excluir",
    error: "Erro",
  },
  notFound: {
    title: "404 — Página não encontrada",
    description: "A página que você procura não existe ou foi movida.",
  },
  subscriptionWall: {
    eyebrow: "[billing] · assinatura",
    trialEndedTitle: "Seu trial Elite terminou",
    choosePlanTitle: "Escolha seu plano",
    trialEndedDesc:
      "Você usou 14 dias com todos os recursos Elite. Assine um plano para continuar usando o Trackion.",
    daysLeftDesc: (days) =>
      `Você ainda tem ${days} dia(s) de trial Elite. Assine agora para não perder o acesso.`,
    subscriptionRequired: "Assinatura necessária para continuar.",
    recommended: "Recomendado",
    originalPrice: "De",
    perMonth: "/ mês",
    subscribe: "Assinar",
    footer: "Pagamento seguro via Stripe · cancele quando quiser",
    loading: "Carregando planos…",
  },
  billing: {
    eyebrow: "billing · assinatura",
    title: "Assinatura",
    subtitle: "Gerencie seu plano Trackion",
    paymentReceived: "Pagamento recebido. Atualizando assinatura…",
    refresh: "Atualizar",
    loading: "Carregando…",
    currentPlan: "plano atual",
    noAccess: "Sem acesso",
    trialElite: "Trial Elite",
    status: "Status",
    trialDays: (days) => `${days} dia(s) de trial`,
    manageStripe: "Gerenciar no Stripe",
    availablePlans: "planos disponíveis",
    currentPlanBtn: "Plano atual",
    subscribe: "Assinar",
  },
  dashboard: {
    eyebrow: "Dashboard · overview",
    title: "Visão geral da estratégia BTC.",
    subtitle: "Performance, regras e plano de execução — tudo num só painel.",
    canTrade: "PODE OPERAR",
    stopTrading: "PARAR OPERAÇÕES",
    transferToBtc: "TRANSFERIR P/ BTC",
    totalPnl: "PNL TOTAL",
    winRate: "WIN RATE",
    btcAccumulated: "BTC ACUMULADO",
    openTrades: "TRADES ABERTOS",
    livePositions: "posições live",
    noClosedTrades: "Nenhum trade fechado ainda",
    equityCurve: "equity_curve · pnl acumulado",
    lastTrades: "last_10 · trades",
    defaultLeverage: "Alavancagem padrão",
    roadmapEyebrow: "seu plano de ação · roadmap",
    roadmapTitle: "Próximas fases.",
    roadmapPhases: (n) => `${n} fases`,
    planTrackerEyebrow: "plan tracker · metas ativas",
    figEquity: "fig.01 — equity",
    figLastTrades: "fig.02 — last_10",
    samples: (n) => `${n} amostras`,
    configSection: "[06] · strategy.config",
    configReadOnly: "read-only",
    labelTotalCapital: "Capital Total",
    labelFuturesCapital: "Capital Futuros",
    labelSpotCapital: "Capital Spot BTC",
    labelRiskPerTrade: "Risco / Trade",
    labelTransferWhen: "Transferir quando",
    labelStopDrawdown: "Parar c/ drawdown",
    labelTotalTrades: "Total trades",
    captionRealizedUsdt: "USDT realizado",
    captionWinRate: "taxa de acerto",
    captionSpotConverted: "spot · convertido",
    tradesCount: (n) => `${n} trades`,
    emptyConnectHint: "Conecte uma exchange ou registre trades para ver métricas.",
    emptyConnectCta: "Conectar exchange",
  },
  trades: {
    eyebrow: "Trades · execution log",
    title: "Registro de operações.",
    subtitle: "Tudo que foi executado — manual ou via sync da exchange.",
    newTrade: "Novo trade",
    editTrade: "Editar trade",
    sync: "Sync exchanges",
    syncing: "Sincronizando…",
    searchPlaceholder: "Buscar par ou notas...",
    statusFilter: "Status",
    directionFilter: "Direção",
    all: "Todos",
    noTrades: "Nenhum trade registrado",
    date: "Data",
    pair: "Par",
    direction: "Direção",
    status: "Status",
    entry: "Entrada",
    exit: "Saída",
    pnl: "PNL",
    setup: "Setup",
    notes: "Notas",
    setupPlaceholder: "Ex: scalp, breakout…",
    notesPlaceholder: "Observações...",
    save: "Salvar",
    saving: "Salvando…",
    cancel: "Cancelar",
    delete: "Excluir",
    actions: "Ações",
    detailTitle: "Detalhe do trade",
    chartTitle: "Snapshot do trade",
    chartError: "Não foi possível carregar o gráfico.",
    viewChart: "Ver gráfico",
    tableHeaders: [
      { k: "Data", w: "w-24" },
      { k: "Par", w: "w-28" },
      { k: "Dir", w: "w-16" },
      { k: "Status", w: "w-20" },
      { k: "Entrada", w: "" },
      { k: "Saída", w: "" },
      { k: "PNL", w: "w-24" },
      { k: "", w: "w-16" },
    ],
  },
  transfers: {
    eyebrow: "Transfers · futuros → spot",
    title: "Conversões para BTC.",
    subtitle: "A cada +10 USDT de lucro nos futuros, transfira para BTC spot. Repita.",
    newTransfer: "Nova transferência",
    totalTransferred: "TOTAL TRANSFERIDO",
    totalBtc: "BTC COMPRADO",
    avgPrice: "PREÇO MÉDIO",
    noTransfers: "Nenhuma transferência registrada",
    date: "Data",
    amountUsdt: "Valor (USDT)",
    btcPrice: "Preço BTC",
    btcBought: "BTC comprado",
    notes: "Notas",
    save: "Registrar",
    cancel: "Cancelar",
    delete: "Excluir",
    chartBtcOverTime: "fig.01 · btc_acumulado_ao_longo_do_tempo",
    tableTransfers: "table · transfers",
    tableRows: (n) => `${n} rows`,
    emptyTransfers: "Nenhuma transferência registrada",
  },
  btcHoldings: {
    eyebrow: "BTC.STACK · holdings",
    title: "Acompanhe o stack.",
    subtitle: "Snapshots periódicos do saldo BTC e custo médio — porque o objetivo final é acumular bitcoin.",
    newSnapshot: "Novo snapshot",
    totalBtc: "BTC TOTAL",
    avgCost: "CUSTO MÉDIO",
    currentValue: "VALOR ATUAL",
    unrealizedPnl: "PNL NÃO REALIZADO",
    noSnapshots: "Nenhum snapshot registrado",
    date: "Data",
    btcAmount: "Quantidade BTC",
    avgCostUsdt: "Custo médio (USDT)",
    btcPriceNow: "Preço BTC atual",
    notes: "Notas",
    save: "Registrar",
    cancel: "Cancelar",
    delete: "Excluir",
    chartBtcAccumulated: "fig.01 · btc_acumulado",
    chartPriceVsCost: "fig.02 · price_vs_avg_cost",
    tableSnapshots: "table · snapshots",
    tableRows: (n) => `${n} rows`,
    emptySnapshots: "Nenhum snapshot registrado",
    chartBtcLabel: "BTC",
    chartPriceLabel: "Preço BTC",
    chartCostLabel: "Custo médio",
  },
  rules: {
    eyebrow: "Rules · doctrine",
    title: "Manual de trading.",
    subtitle: "Leia antes de operar. Disciplina nasce de regras escritas, não de palpite.",
    settingsTitle: "config · capital & risco",
    saveSettings: "Salvar configurações",
    saving: "Salvando…",
    capitalTotal: "Capital Total (USDT)",
    futuresCapital: "Capital Futuros (USDT)",
    spotCapital: "Capital Spot BTC (USDT)",
    riskPerTrade: "Risco por Trade (USDT)",
    transferThreshold: "Transferir a cada +X USDT",
    defaultLeverage: "Alavancagem padrão (x)",
    stopDrawdown: "Parar com drawdown (%)",
    yourRules: "Suas regras personalizadas",
    noRules: "Complete o onboarding para ver regras sugeridas.",
    doctrineEyebrow: "doutrina · 4 pilares",
    pillar: (i, total) => `pilar ${i} / ${total}`,
    positionSizingTitle: "position_sizing · exemplo",
    scenariosEyebrow: "scenarios · playbook",
    scenariosTitle: "O que fazer quando…",
    decisionTree: "decision tree",
    settingsSectionTitle: "Configurações da estratégia.",
    settingsEyebrow: "config · strategy",
    configStrategyEyebrow: "goals · plan tracker",
  },
  reports: {
    eyebrow: "Reports · performance",
    title: "Análise temporal.",
    subtitle: "Performance agregada por semana e mês — disciplina é repetir o que funciona.",
    totalPnl: "PNL TOTAL",
    globalWinRate: "WIN RATE GLOBAL",
    totalTrades: "TOTAL TRADES",
    sharpe: "SHARPE",
    btcBought: "BTC COMPRADO",
    maxDrawdown: "MAX DRAWDOWN",
    sharpeRatio: "SHARPE RATIO",
    dailyReturns: "retornos diários",
    weeklyInsights: "insights · semana",
    proUpsellTitle: "Insights semanais",
    proUpsellDesc:
      "Veja em qual par você ganhou ou perdeu, faixas de horário fracas e sequências de loss — disponível no Pro Trader.",
    byHour: "por horário",
    emptyNoData: "Nenhum dado disponível ainda",
    emptyNoTrades: "Nenhum trade fechado ainda para gerar relatório",
    emptyNoSlice: "Sem dados para este recorte.",
    tableMonth: "Mês",
    tableWeek: "Semana",
    tableTrades: "Trades",
    tableWins: "Wins",
    tableLosses: "Losses",
    tableWinRate: "Win Rate",
    tablePnl: "PnL",
    chartPnlMonth: "fig.01 · pnl_por_mes",
    chartWinRateMonth: "fig.02 · win_rate_por_mes",
    chartPnlWeeks: "fig.03 · pnl_ultimas_12_semanas",
    chartTradesWeek: "fig.04 · trades_por_semana",
  },
  apiSettings: {
    eyebrow: "API · Multi-exchange",
    title: "Conecte suas exchanges.",
    subtitle: "MEXC, Binance e Bitget — importe trades de várias fontes ao mesmo tempo. Somente leitura.",
    connected: (ex) => `Conectado à ${ex}`,
    notConnected: "Não conectado",
    ipError: "Não foi possível obter o IP",
    save: "Salvar credenciais",
    test: "Testar conexão",
    sync: "Sincronizar trades",
    readOnlyNote: "Use chaves somente leitura — nunca habilite saque ou trading.",
    futuresNote: " Importação de futuros via REALIZED_PNL (aproximada).",
    mexcSteps: [
      "Acesse mexc.com e faça login",
      "Perfil → Gestão de API → Criar API",
      "Crie uma API Key com permissão de leitura",
    ],
    binanceSteps: [
      "Acesse binance.com e faça login",
      "Perfil → API Management → Create API",
      "Crie uma API Key com permissão de leitura",
    ],
    bitgetSteps: [
      "Acesse bitget.com e faça login",
      "Perfil → API → Criar API",
      "Crie API com permissão de leitura",
    ],
    closedPositions: "Posições fechadas (Futuros)",
    btcStackSnapshot: "Snapshot no BTC Stack quando disponível",
  },
  onboarding: {
    title: "Configure seu perfil de trader",
    stepOf: (step, total) => `Passo ${step} de ${total} — suas regras serão geradas automaticamente`,
    back: "Voltar",
    next: "Próximo",
    finish: "Finalizar",
    generating: "Gerando...",
    profileConfigured: (a) => `Perfil: ${a}`,
    configuredDefault: "configurado",
    error: "Erro",
    welcomeTitle: "Seu plano está pronto",
    welcomeSubtitle: "Regras, metas e roadmap foram gerados com base no seu perfil.",
    welcomeArchetype: (a) => `Arquétipo: ${a}`,
    connectExchange: "Conectar exchange",
    exploreDashboard: "Explorar dashboard",
    fields: {
      capital: "Capital disponível para trading (USDT)",
      riskPerTrade: (pct) => `Risco por trade: ${pct}% do capital de futuros`,
      experience: "Experiência com futuros em cripto (1 = iniciante, 5 = avançado)",
      timePerDay: "Tempo dedicado ao mercado por dia",
      drawdownStop: "Drawdown máximo antes de parar (%)",
      objective: "Objetivo principal",
      tradingStyle: "Estilo de operação",
      leverage: "Alavancagem confortável",
      maxOpenPositions: "Posições abertas simultâneas",
      afterLoss: "Após uma perda, você costuma:",
      usesStopLoss: "Usa stop-loss em 100% dos trades?",
      monthlyGoal: "Meta de lucro mensal (% do capital total)",
      monthlyGoalHint:
        "Com base nas respostas, geraremos suas regras de risco, settings e roadmap inicial.",
    },
    options: {
      capitalTier: {
        under_200: "Até 200 USDT",
        "200_500": "200 – 500 USDT",
        "500_2000": "500 – 2.000 USDT",
        "2000_plus": "Acima de 2.000 USDT",
      },
      timePerDay: {
        under_1h: "< 1h",
        "1_3h": "1 – 3h",
        "3h_plus": "3h+",
      },
      objective: {
        btc_stack: "Acumular BTC",
        income: "Renda em USDT",
        learning: "Aprender / paper",
        hybrid: "Híbrido",
      },
      tradingStyle: {
        scalper: "Scalp",
        day: "Day trade",
        swing: "Swing",
      },
      afterLoss: {
        stop: "Parar por hoje",
        revenge: "Revenge trading",
        analyze: "Analisar e seguir o plano",
      },
      usesStopLoss: {
        yes: "Sim",
        partial: "Às vezes",
        no: "Não",
      },
    },
  },
  common: {
    loading: "Carregando…",
    save: "Salvar",
    cancel: "Cancelar",
    delete: "Excluir",
    edit: "Editar",
    add: "Adicionar",
    error: "Erro",
    noData: "Sem dados",
  },
  toasts: {
    tradeRegistered: "Trade registrado",
    tradeUpdated: "Trade atualizado",
    tradeRemoved: "Trade removido",
    tradeError: "Erro ao registrar trade",
    tradeUpdateError: "Erro ao atualizar trade",
    tradeRemoveError: "Erro ao remover trade",
    transferRegistered: "Transferência registrada",
    transferRemoved: "Transferência removida",
    transferError: "Erro ao registrar transferência",
    transferRemoveError: "Erro ao remover transferência",
    snapshotRegistered: "Snapshot registrado",
    snapshotRemoved: "Snapshot removido",
    snapshotError: "Erro ao registrar snapshot",
    snapshotRemoveError: "Erro ao remover snapshot",
    settingsSaved: "Configurações salvas",
    settingsError: "Erro ao salvar configurações",
    goalCreated: "Meta criada",
    goalUpdated: "Meta atualizada",
    goalRemoved: "Meta removida",
    goalError: "Erro ao salvar meta",
    credentialsSaved: "Credenciais salvas",
    credentialsError: "Erro ao salvar credenciais",
    connectionOk: "Conexão OK",
    connectionFailed: "Falha no teste",
    connectionTestError: "Erro ao testar conexão",
    synced: "Sincronizado",
    syncFailed: "Falha na sincronização",
    syncError: "Erro ao sincronizar",
    tradesImported: (n) => `${n} trade(s) importado(s)`,
    tradesImportedParts: (p) => `Importados: ${p}`,
    exchangeSyncError: "Erro ao sincronizar exchanges",
    noNewTrades: "Nenhum trade novo para importar",
  },
};

const US: AppContent = {
  shell: {
    nav: [
      { href: "/", index: "01", label: "Dashboard", mono: "DASHBOARD" },
      { href: "/trades", index: "02", label: "Trades", mono: "TRADES" },
      { href: "/transfers", index: "03", label: "Transfers", mono: "TRANSFERS" },
      { href: "/btc-holdings", index: "04", label: "BTC Stack", mono: "BTC.STACK" },
      { href: "/reports", index: "05", label: "Reports", mono: "REPORTS" },
      { href: "/rules", index: "06", label: "Rules & Goals", mono: "RULES" },
      { href: "/api-settings", index: "07", label: "API Exchanges", mono: "API.EXCH" },
      { href: "/billing", index: "08", label: "Subscription", mono: "BILLING" },
      { href: "/conta", index: "09", label: "Account", mono: "ACCOUNT" },
    ],
    brandSubtitle: "trading journal · v2",
    exchLive: (n) => `${n} EXCH LIVE`,
    exchOff: "EXCH OFF",
    navigationEyebrow: "↳ navigation · 09 modules",
    online: "● online",
    logout: "Log out",
    closeMenu: "Close menu",
    openMenu: "Open menu",
    operational: "OPERATIONAL",
    errorTitle: "Something went wrong",
    errorReload: "Reload",
    errorRetry: "Try again",
    loadingSession: "Loading session…",
    tradesImported: (n) => `${n} trade(s) imported`,
  },
  login: {
    features: [
      { index: "01", label: "Track BTCUSDT trades in real time" },
      { index: "02", label: "Manage risk with custom rules" },
      { index: "03", label: "Sync MEXC, Binance and Bitget via API" },
    ],
    stepMeta: {
      email: {
        index: "01",
        title: "Identify yourself.",
        hint: "Enter your email to sign in or create an account",
      },
      check_email: {
        index: "02",
        title: "Confirm your email.",
        hint: "We sent instructions to your inbox",
      },
      password: {
        index: "03",
        title: "Secure access.",
        hint: "Use the password sent to your email",
      },
    },
    heroTitle: ["Crypto journal.", "Master BTCUSDT", "futures."],
    emailLabel: "$ email",
    emailPlaceholder: "you@email.com",
    continue: "continue",
    sending: "sending…",
    checkEmailBody: (email) =>
      `We sent an email to ${email} with your temporary password and confirmation link.`,
    resend: "resend email",
    resending: "resending…",
    confirmedEnterPassword: "confirmed — enter password",
    useOtherEmail: "use another email",
    passwordLabel: "$ password",
    hidePassword: "Hide password",
    showPassword: "Show password",
    enter: "sign in",
    entering: "signing in…",
    back: "back",
    stepFooter: "↳ step {step} / 03 · read-only api recommended",
    toastPasswordRequired: "Enter the password sent to your email",
    toastCheckEmail: "Check your email",
    toastWelcome: "Welcome to Trackion!",
    toastResent: "Email resent",
    toastLoginError: "Sign-in error",
    toastError: "Error",
  },
  verifyEmail: {
    invalidLink: "Invalid verification link",
    confirming: "Confirming your email...",
    confirmed: "Email confirmed",
    redirecting: "Redirecting...",
    toastConfirmed: "Email confirmed!",
  },
  pendingEmail: {
    title: "Confirm your email",
    body: (email) =>
      `We sent a confirmation link and temporary password to ${email}. Open the email and click the link to activate your trial.`,
    emailLabel: "Account email",
    resend: "Resend confirmation email",
    resending: "Resending…",
    resent: "Email resent. Check your inbox.",
    hint: "Can't find it? Check spam or promotions.",
    error: "Could not resend",
  },
  changePassword: {
    title: "Account",
    loggedAs: "Signed in as",
    subtitle: "Change your password or delete the account to test signup again.",
    currentPassword: "Current password",
    newPassword: "New password (min. 12 characters)",
    confirmPassword: "Confirm new password",
    save: "Save new password",
    saving: "Saving...",
    deleteTitle: "Delete account",
    deleteDesc:
      "Permanently removes all your data. This action cannot be undone.",
    confirmEmail: "Confirm your email",
    yourPassword: "Your password",
    delete: "Delete my account",
    deleting: "Deleting...",
    passwordsMismatch: "Passwords do not match",
    success: "Password changed successfully",
    emailMismatch: "Enter your email exactly as on the account",
    deleteConfirm:
      "Permanently delete your account? You can sign up again with the same email.",
    accountDeleted: "Account deleted",
    deleteError: "Error deleting account",
    error: "Error",
  },
  notFound: {
    title: "404 — Page not found",
    description: "The page you're looking for doesn't exist or was moved.",
  },
  subscriptionWall: {
    eyebrow: "[billing] · subscription",
    trialEndedTitle: "Your Elite trial has ended",
    choosePlanTitle: "Choose your plan",
    trialEndedDesc:
      "You used 14 days with all Elite features. Subscribe to keep using Trackion.",
    daysLeftDesc: (days) =>
      `You still have ${days} day(s) of Elite trial. Subscribe now to keep access.`,
    subscriptionRequired: "Subscription required to continue.",
    recommended: "Recommended",
    originalPrice: "Was",
    perMonth: "/ month",
    subscribe: "Subscribe",
    footer: "Secure payment via Stripe · cancel anytime",
    loading: "Loading plans…",
  },
  billing: {
    eyebrow: "billing · subscription",
    title: "Subscription",
    subtitle: "Manage your Trackion plan",
    paymentReceived: "Payment received. Updating subscription…",
    refresh: "Refresh",
    loading: "Loading…",
    currentPlan: "current plan",
    noAccess: "No access",
    trialElite: "Elite Trial",
    status: "Status",
    trialDays: (days) => `${days} trial day(s)`,
    manageStripe: "Manage on Stripe",
    availablePlans: "available plans",
    currentPlanBtn: "Current plan",
    subscribe: "Subscribe",
  },
  dashboard: {
    eyebrow: "Dashboard · overview",
    title: "BTC strategy overview.",
    subtitle: "Performance, rules and execution plan — all in one panel.",
    canTrade: "CAN TRADE",
    stopTrading: "STOP TRADING",
    transferToBtc: "TRANSFER TO BTC",
    totalPnl: "TOTAL PNL",
    winRate: "WIN RATE",
    btcAccumulated: "BTC ACCUMULATED",
    openTrades: "OPEN TRADES",
    livePositions: "live positions",
    noClosedTrades: "No closed trades yet",
    equityCurve: "equity_curve · cumulative pnl",
    lastTrades: "last_10 · trades",
    defaultLeverage: "Default leverage",
    roadmapEyebrow: "your action plan · roadmap",
    roadmapTitle: "Next phases.",
    roadmapPhases: (n) => `${n} phases`,
    planTrackerEyebrow: "plan tracker · active goals",
    figEquity: "fig.01 — equity",
    figLastTrades: "fig.02 — last_10",
    samples: (n) => `${n} samples`,
    configSection: "[06] · strategy.config",
    configReadOnly: "read-only",
    labelTotalCapital: "Total Capital",
    labelFuturesCapital: "Futures Capital",
    labelSpotCapital: "Spot BTC Capital",
    labelRiskPerTrade: "Risk / Trade",
    labelTransferWhen: "Transfer when",
    labelStopDrawdown: "Stop at drawdown",
    labelTotalTrades: "Total trades",
    captionRealizedUsdt: "realized USDT",
    captionWinRate: "win rate",
    captionSpotConverted: "spot · converted",
    tradesCount: (n) => `${n} trades`,
    emptyConnectHint: "Connect an exchange or log trades to see metrics.",
    emptyConnectCta: "Connect exchange",
  },
  trades: {
    eyebrow: "Trades · execution log",
    title: "Trade log.",
    subtitle: "Everything executed — manual or via exchange sync.",
    newTrade: "New trade",
    editTrade: "Edit trade",
    sync: "Sync exchanges",
    syncing: "Syncing…",
    searchPlaceholder: "Search pair or notes...",
    statusFilter: "Status",
    directionFilter: "Direction",
    all: "All",
    noTrades: "No trades recorded",
    date: "Date",
    pair: "Pair",
    direction: "Direction",
    status: "Status",
    entry: "Entry",
    exit: "Exit",
    pnl: "PNL",
    setup: "Setup",
    notes: "Notes",
    setupPlaceholder: "e.g. scalp, breakout…",
    notesPlaceholder: "Notes...",
    save: "Save",
    saving: "Saving…",
    cancel: "Cancel",
    delete: "Delete",
    actions: "Actions",
    detailTitle: "Trade detail",
    chartTitle: "Trade snapshot",
    chartError: "Could not load chart.",
    viewChart: "View chart",
    tableHeaders: [
      { k: "Date", w: "w-24" },
      { k: "Pair", w: "w-28" },
      { k: "Dir", w: "w-16" },
      { k: "Status", w: "w-20" },
      { k: "Entry", w: "" },
      { k: "Exit", w: "" },
      { k: "PNL", w: "w-24" },
      { k: "", w: "w-16" },
    ],
  },
  transfers: {
    eyebrow: "Transfers · futures → spot",
    title: "BTC conversions.",
    subtitle: "Every +10 USDT profit in futures, transfer to spot BTC. Repeat.",
    newTransfer: "New transfer",
    totalTransferred: "TOTAL TRANSFERRED",
    totalBtc: "BTC BOUGHT",
    avgPrice: "AVG PRICE",
    noTransfers: "No transfers recorded",
    date: "Date",
    amountUsdt: "Amount (USDT)",
    btcPrice: "BTC price",
    btcBought: "BTC bought",
    notes: "Notes",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    chartBtcOverTime: "fig.01 · btc_over_time",
    tableTransfers: "table · transfers",
    tableRows: (n) => `${n} rows`,
    emptyTransfers: "No transfers recorded",
  },
  btcHoldings: {
    eyebrow: "BTC.STACK · holdings",
    title: "Track your stack.",
    subtitle: "Periodic BTC balance snapshots and average cost — because the end goal is accumulating bitcoin.",
    newSnapshot: "New snapshot",
    totalBtc: "TOTAL BTC",
    avgCost: "AVG COST",
    currentValue: "CURRENT VALUE",
    unrealizedPnl: "UNREALIZED PNL",
    noSnapshots: "No snapshots recorded",
    date: "Date",
    btcAmount: "BTC amount",
    avgCostUsdt: "Avg cost (USDT)",
    btcPriceNow: "Current BTC price",
    notes: "Notes",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    chartBtcAccumulated: "fig.01 · btc_accumulated",
    chartPriceVsCost: "fig.02 · price_vs_avg_cost",
    tableSnapshots: "table · snapshots",
    tableRows: (n) => `${n} rows`,
    emptySnapshots: "No snapshots recorded",
    chartBtcLabel: "BTC",
    chartPriceLabel: "BTC price",
    chartCostLabel: "Avg cost",
  },
  rules: {
    eyebrow: "Rules · doctrine",
    title: "Trading manual.",
    subtitle: "Read before trading. Discipline comes from written rules, not gut feeling.",
    settingsTitle: "config · capital & risk",
    saveSettings: "Save settings",
    saving: "Saving…",
    capitalTotal: "Total Capital (USDT)",
    futuresCapital: "Futures Capital (USDT)",
    spotCapital: "Spot BTC Capital (USDT)",
    riskPerTrade: "Risk per Trade (USDT)",
    transferThreshold: "Transfer every +X USDT",
    defaultLeverage: "Default leverage (x)",
    stopDrawdown: "Stop at drawdown (%)",
    yourRules: "Your custom rules",
    noRules: "Complete onboarding to see suggested rules.",
    doctrineEyebrow: "doctrine · 4 pillars",
    pillar: (i, total) => `pillar ${i} / ${total}`,
    positionSizingTitle: "position_sizing · example",
    scenariosEyebrow: "scenarios · playbook",
    scenariosTitle: "What to do when…",
    decisionTree: "decision tree",
    settingsSectionTitle: "Strategy settings.",
    settingsEyebrow: "config · strategy",
    configStrategyEyebrow: "goals · plan tracker",
  },
  reports: {
    eyebrow: "Reports · performance",
    title: "Temporal analysis.",
    subtitle: "Performance aggregated by week and month — discipline is repeating what works.",
    totalPnl: "TOTAL PNL",
    globalWinRate: "GLOBAL WIN RATE",
    totalTrades: "TOTAL TRADES",
    sharpe: "SHARPE",
    btcBought: "BTC BOUGHT",
    maxDrawdown: "MAX DRAWDOWN",
    sharpeRatio: "SHARPE RATIO",
    dailyReturns: "daily returns",
    weeklyInsights: "insights · week",
    proUpsellTitle: "Weekly insights",
    proUpsellDesc:
      "See which pairs you won or lost on, weak time slots and loss streaks — available on Pro Trader.",
    byHour: "by hour",
    emptyNoData: "No data available yet",
    emptyNoTrades: "No closed trades yet to generate a report",
    emptyNoSlice: "No data for this slice.",
    tableMonth: "Month",
    tableWeek: "Week",
    tableTrades: "Trades",
    tableWins: "Wins",
    tableLosses: "Losses",
    tableWinRate: "Win Rate",
    tablePnl: "PnL",
    chartPnlMonth: "fig.01 · pnl_by_month",
    chartWinRateMonth: "fig.02 · win_rate_by_month",
    chartPnlWeeks: "fig.03 · pnl_last_12_weeks",
    chartTradesWeek: "fig.04 · trades_per_week",
  },
  apiSettings: {
    eyebrow: "API · Multi-exchange",
    title: "Connect your exchanges.",
    subtitle: "MEXC, Binance and Bitget — import trades from multiple sources at once. Read-only.",
    connected: (ex) => `Connected to ${ex}`,
    notConnected: "Not connected",
    ipError: "Could not get IP",
    save: "Save credentials",
    test: "Test connection",
    sync: "Sync trades",
    readOnlyNote: "Use read-only keys — never enable withdrawal or trading.",
    futuresNote: " Futures import via REALIZED_PNL (approximate).",
    mexcSteps: [
      "Go to mexc.com and sign in",
      "Profile → API Management → Create API",
      "Create an API Key with read permission",
    ],
    binanceSteps: [
      "Go to binance.com and sign in",
      "Profile → API Management → Create API",
      "Create an API Key with read permission",
    ],
    bitgetSteps: [
      "Go to bitget.com and sign in",
      "Profile → API → Create API",
      "Create API with read permission",
    ],
    closedPositions: "Closed positions (Futures)",
    btcStackSnapshot: "BTC Stack snapshot when available",
  },
  onboarding: {
    title: "Set up your trader profile",
    stepOf: (step, total) => `Step ${step} of ${total} — your rules will be generated automatically`,
    back: "Back",
    next: "Next",
    finish: "Finish",
    generating: "Generating...",
    profileConfigured: (a) => `Profile: ${a}`,
    configuredDefault: "configured",
    error: "Error",
    welcomeTitle: "Your plan is ready",
    welcomeSubtitle: "Rules, goals and roadmap were generated from your profile.",
    welcomeArchetype: (a) => `Archetype: ${a}`,
    connectExchange: "Connect exchange",
    exploreDashboard: "Explore dashboard",
    fields: {
      capital: "Available trading capital (USDT)",
      riskPerTrade: (pct) => `Risk per trade: ${pct}% of futures capital`,
      experience: "Crypto futures experience (1 = beginner, 5 = advanced)",
      timePerDay: "Time dedicated to the market per day",
      drawdownStop: "Maximum drawdown before stopping (%)",
      objective: "Primary objective",
      tradingStyle: "Trading style",
      leverage: "Comfortable leverage",
      maxOpenPositions: "Simultaneous open positions",
      afterLoss: "After a loss, you usually:",
      usesStopLoss: "Do you use stop-loss on 100% of trades?",
      monthlyGoal: "Monthly profit target (% of total capital)",
      monthlyGoalHint:
        "Based on your answers, we'll generate your risk rules, settings and initial roadmap.",
    },
    options: {
      capitalTier: {
        under_200: "Up to 200 USDT",
        "200_500": "200 – 500 USDT",
        "500_2000": "500 – 2,000 USDT",
        "2000_plus": "Above 2,000 USDT",
      },
      timePerDay: {
        under_1h: "< 1h",
        "1_3h": "1 – 3h",
        "3h_plus": "3h+",
      },
      objective: {
        btc_stack: "Accumulate BTC",
        income: "USDT income",
        learning: "Learn / paper trade",
        hybrid: "Hybrid",
      },
      tradingStyle: {
        scalper: "Scalp",
        day: "Day trade",
        swing: "Swing",
      },
      afterLoss: {
        stop: "Stop for the day",
        revenge: "Revenge trading",
        analyze: "Analyze and follow the plan",
      },
      usesStopLoss: {
        yes: "Yes",
        partial: "Sometimes",
        no: "No",
      },
    },
  },
  common: {
    loading: "Loading…",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    error: "Error",
    noData: "No data",
  },
  toasts: {
    tradeRegistered: "Trade saved",
    tradeUpdated: "Trade updated",
    tradeRemoved: "Trade removed",
    tradeError: "Error saving trade",
    tradeUpdateError: "Error updating trade",
    tradeRemoveError: "Error removing trade",
    transferRegistered: "Transfer saved",
    transferRemoved: "Transfer removed",
    transferError: "Error saving transfer",
    transferRemoveError: "Error removing transfer",
    snapshotRegistered: "Snapshot saved",
    snapshotRemoved: "Snapshot removed",
    snapshotError: "Error saving snapshot",
    snapshotRemoveError: "Error removing snapshot",
    settingsSaved: "Settings saved",
    settingsError: "Error saving settings",
    goalCreated: "Goal created",
    goalUpdated: "Goal updated",
    goalRemoved: "Goal removed",
    goalError: "Error saving goal",
    credentialsSaved: "Credentials saved",
    credentialsError: "Error saving credentials",
    connectionOk: "Connection OK",
    connectionFailed: "Connection test failed",
    connectionTestError: "Error testing connection",
    synced: "Synced",
    syncFailed: "Sync failed",
    syncError: "Error syncing",
    tradesImported: (n) => `${n} trade(s) imported`,
    tradesImportedParts: (p) => `Imported: ${p}`,
    exchangeSyncError: "Error syncing exchanges",
    noNewTrades: "No new trades to import",
  },
};

export function getAppContent(market: Market): AppContent {
  return market === "us" ? US : BR;
}
