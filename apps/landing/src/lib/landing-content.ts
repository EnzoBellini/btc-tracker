import type { ComponentType, SVGProps } from "react";
import {
  Ban,
  Brain,
  ClipboardList,
  Clock,
  Compass,
  LineChart,
  Link2,
  PieChart,
  RefreshCw,
  ShieldCheck,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import type { Market } from "./locale";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

export type LandingContent = {
  nav: { href: string; index: string; label: string }[];
  navLogin: string;
  navCta: string;
  heroMeta: { beta: string; trial: string; noCard: string };
  heroEyebrow: string;
  heroTitle: [string, string, string];
  heroCtaPrimary: string;
  heroCtaSecondary: string;
  heroPills: { icon: IconType; text: string }[];
  heroFig: string;
  heroLive: string;
  statsHeader: string;
  statsUpdated: string;
  bigStats: { label: string; value: string; caption: string; index: string }[];
  features: {
    sectionLabel: string;
    title: [string, string];
    subtitle: string;
    footer: string;
    items: { icon: IconType; title: string; description: string; tag: string }[];
  };
  integrations: {
    sectionLabel: string;
    title: [string, string, string];
    subtitle: string;
    tableHeaders: { exchange: string; type: string; status: string; io: string };
    exchanges: { name: string; status: "live" | "soon"; pair: string }[];
    chartLabels: { pnl: string; trades: string; sharpe: string };
    benefitsTitle: string;
    benefits: { icon: IconType; title: string; description: string }[];
  };
  manifesto: {
    sectionLabel: string;
    title: [string, string];
    thesisLabel: string;
    thesis: string;
    pillars: { k: string; v: string }[];
    points: { icon: IconType; title: string; description: string; tag: string }[];
    nextLabel: string;
    nextText: string;
    cta: string;
  };
  pricing: {
    sectionLabel: string;
    title: string;
    subtitle: string;
    perMonth: string;
    anchorBadge: string;
    trialCta: string;
    terminalHeader: string;
    terminalReady: string;
    emailPlaceholder: string;
    startTrial: string;
    terminalFooter: string;
  };
  footer: {
    tagline: string;
    taglineEn: string;
    product: string;
    account: string;
    lastSync: string;
    links: { product: string[]; account: string[] };
    login: string;
    trial: string;
    status: string;
    copyright: string;
    legal: string[];
    syncLabels: { timestamp: string; status: string; version: string };
    online: string;
  };
  trialModal: {
    close: string;
    successTitle: string;
    successEmail: string;
    successDev: string;
    devPassword: string;
    gotIt: string;
    title: string;
    subtitle: string;
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    submitting: string;
    submit: string;
  };
};

const EXCHANGES = [
  { name: "MEXC", status: "live" as const, pair: "spot · futures" },
  { name: "Bitget", status: "live" as const, pair: "spot · futures" },
  { name: "Binance", status: "live" as const, pair: "spot · futures" },
  { name: "Bybit", status: "soon" as const, pair: "Q1 2026" },
  { name: "OKX", status: "soon" as const, pair: "Q1 2026" },
];

const BR: LandingContent = {
  nav: [
    { href: "#recursos", index: "01", label: "Recursos" },
    { href: "#integracoes", index: "02", label: "Integrações" },
    { href: "#metodo", index: "03", label: "Método" },
    { href: "#precos", index: "04", label: "Preços" },
  ],
  navLogin: "Entrar →",
  navCta: "Start Free",
  heroMeta: { beta: "Beta privado", trial: "14 dias grátis", noCard: "sem cartão de crédito" },
  heroEyebrow: "[00 — Trading Journal]",
  heroTitle: ["DOMINE", "SEUS", "trades"],
  heroCtaPrimary: "$ start --trial=14d",
  heroCtaSecondary: "Watch demo",
  heroPills: [
    { icon: LineChart, text: "Analytics avançado" },
    { icon: Target, text: "Metas & risco" },
    { icon: Zap, text: "Sync em tempo real" },
    { icon: Compass, text: "Foco em método" },
  ],
  heroFig: "fig.01 — dashboard.exec",
  heroLive: "live",
  statsHeader: "índices · operação trackion",
  statsUpdated: "ATUALIZADO",
  bigStats: [
    { label: "Trades importados", value: "1.28M", caption: "via API · 30d", index: "01" },
    { label: "Métricas calculadas", value: "27+", caption: "win rate · expectancy · DD · R/R", index: "02" },
    { label: "Setup inicial", value: "< 2min", caption: "conecte sua exchange", index: "03" },
    { label: "Dias grátis", value: "14", caption: "sem cartão de crédito", index: "04" },
  ],
  features: {
    sectionLabel: "Recursos",
    title: ["Tudo num", "só lugar."],
    subtitle:
      "Registro, análise e metas em um produto coeso — não em três planilhas e dois apps desconectados.",
    footer: "4 módulos / 1 dashboard / 0 planilhas",
    items: [
      {
        icon: LineChart,
        tag: "DASHBOARD",
        title: "Performance ao vivo",
        description:
          "Win rate, expectancy, drawdown e evolução do capital em um painel claro e objetivo — não em planilhas espalhadas.",
      },
      {
        icon: ClipboardList,
        tag: "JOURNAL",
        title: "Registro completo de trades",
        description:
          "Cadastre entradas, saídas, tags e notas. Anexe screenshots. Revise o que funciona com contexto real.",
      },
      {
        icon: Trophy,
        tag: "GOALS",
        title: "Metas e disciplina",
        description:
          "Defina objetivos diários, semanais e mensais. Receba feedback quando passar do limite de risco do dia.",
      },
      {
        icon: PieChart,
        tag: "REPORTS",
        title: "Relatórios inteligentes",
        description:
          "Filtre por ativo, estratégia, dia da semana ou horário. Enxergue padrões que sua memória esquece.",
      },
    ],
  },
  integrations: {
    sectionLabel: "Integrações via API",
    title: ["Trades entram", "sozinhos.", "Você só analisa."],
    subtitle:
      "Conectamos com as principais exchanges para puxar execuções em tempo real. Sem planilha, sem cadastro manual — Trackion monta seu histórico enquanto o mercado se mexe.",
    tableHeaders: { exchange: "EXCHANGE", type: "TIPO", status: "STATUS", io: "I/O" },
    exchanges: EXCHANGES,
    chartLabels: { pnl: "PNL", trades: "TRADES", sharpe: "SHARPE" },
    benefitsTitle: "↳ no que muda",
    benefits: [
      {
        icon: RefreshCw,
        title: "Sync automático",
        description:
          "Conecte a API da exchange uma vez. O Trackion puxa execuções em tempo real, sem copiar ordem por ordem.",
      },
      {
        icon: Clock,
        title: "Histórico sempre atualizado",
        description:
          "Seu journal reflete o que realmente aconteceu na conta. PnL e métricas prontas no momento que você opera.",
      },
      {
        icon: ShieldCheck,
        title: "Read-only · seguro",
        description:
          "Pedimos permissão apenas de leitura — sem withdraw, sem trade. Seu capital permanece intocado.",
      },
      {
        icon: Link2,
        title: "Multi-exchange",
        description:
          "Centralize todas as suas contas em um só lugar. PnL consolidado, métricas globais, zero retrabalho.",
      },
    ],
  },
  manifesto: {
    sectionLabel: "Manifesto",
    title: ["PARE", "DE APOSTAR."],
    thesisLabel: "↳ thesis",
    thesis:
      "Trading não é sorte. Quem opera no impulso está apostando o próprio capital. Trackion coloca processo, métricas e consistência no centro — onde sempre deveriam estar.",
    pillars: [
      { k: "PROBLEMA", v: "Trading no feeling" },
      { k: "CAUSA", v: "Falta de método" },
      { k: "REMÉDIO", v: "Dados + disciplina" },
    ],
    points: [
      {
        icon: Ban,
        tag: "PROBLEMA",
        title: "Operar no feeling é apostar.",
        description:
          "Entrar sem plano, dobrar mão após loss, ignorar o histórico — o mercado vira cassino. O Trackion mostra a realidade dos seus números, não a sua memória seletiva.",
      },
      {
        icon: Brain,
        tag: "CAUSA",
        title: "Disciplina nasce de dados.",
        description:
          "Quando você enxerga win rate, drawdown e expectancy reais, deixa de repetir os mesmos erros. Decisões passam a ter método — não palpite.",
      },
      {
        icon: ShieldCheck,
        tag: "REMÉDIO",
        title: "Regras antes da emoção.",
        description:
          "Metas, limites de risco e revisão sistemática criam um processo. Você opera como um profissional, não como um apostador esperando sorte.",
      },
    ],
    nextLabel: "↳ next step",
    nextText: "Pare de confiar no feeling. Comece a confiar nos seus dados.",
    cta: "Trocar aposta por método",
  },
  pricing: {
    sectionLabel: "Planos · trial Elite 14d",
    title: "Planos para cada fase do seu trading.",
    subtitle:
      "Teste todos os recursos Elite por 14 dias grátis. Depois do trial, escolha o plano que combina com seu volume e número de contas.",
    perMonth: "/ mês",
    anchorBadge: "Âncora",
    trialCta: "Trial Elite 14d",
    terminalHeader: "trackion.app — signup --trial=elite --days=14",
    terminalReady: "ready",
    emailPlaceholder: "seu@email.com",
    startTrial: "Iniciar trial",
    terminalFooter: "› trial = Elite completo · sem cartão no cadastro",
  },
  footer: {
    tagline: "Não aposte. Registre.",
    taglineEn: "Don't bet. Track.",
    product: "Produto",
    account: "Conta",
    lastSync: "Last sync",
    links: {
      product: ["Recursos", "Integrações", "Método", "Preços"],
      account: ["Entrar", "Trial 14d", "Status"],
    },
    login: "Entrar",
    trial: "Trial 14d",
    status: "Status",
    copyright: "Trading com método, não no achismo",
    legal: ["Privacidade", "Termos", "Contato"],
    syncLabels: { timestamp: "timestamp", status: "status", version: "version" },
    online: "● online",
  },
  trialModal: {
    close: "Fechar",
    successTitle: "Quase lá!",
    successEmail:
      "Enviamos o link de confirmação e a senha temporária para o e-mail informado. Confira a caixa de entrada e o spam — o trial Elite de 14 dias começa ao clicar no link.",
    successDev:
      "Conta criada em modo dev (e-mail não configurado). Use o link e a senha abaixo para confirmar e ativar o trial.",
    devPassword: "Senha temporária:",
    gotIt: "Entendi",
    title: "Comece seus 14 dias grátis",
    subtitle: "Sem cartão de crédito. Preencha abaixo e enviaremos o link de acesso ao Trackion.",
    nameLabel: "Nome",
    namePlaceholder: "Seu nome",
    emailLabel: "E-mail",
    emailPlaceholder: "voce@email.com",
    submitting: "Enviando…",
    submit: "Enviar link de acesso",
  },
};

const US: LandingContent = {
  nav: [
    { href: "#recursos", index: "01", label: "Features" },
    { href: "#integracoes", index: "02", label: "Integrations" },
    { href: "#metodo", index: "03", label: "Method" },
    { href: "#precos", index: "04", label: "Pricing" },
  ],
  navLogin: "Log in →",
  navCta: "Start Free",
  heroMeta: { beta: "Private beta", trial: "14-day free trial", noCard: "no credit card" },
  heroEyebrow: "[00 — Trading Journal]",
  heroTitle: ["MASTER", "YOUR", "trades"],
  heroCtaPrimary: "$ start --trial=14d",
  heroCtaSecondary: "Watch demo",
  heroPills: [
    { icon: LineChart, text: "Advanced analytics" },
    { icon: Target, text: "Goals & risk" },
    { icon: Zap, text: "Real-time sync" },
    { icon: Compass, text: "Method-first" },
  ],
  heroFig: "fig.01 — dashboard.exec",
  heroLive: "live",
  statsHeader: "indices · trackion ops",
  statsUpdated: "UPDATED",
  bigStats: [
    { label: "Trades imported", value: "1.28M", caption: "via API · 30d", index: "01" },
    { label: "Metrics computed", value: "27+", caption: "win rate · expectancy · DD · R/R", index: "02" },
    { label: "Initial setup", value: "< 2min", caption: "connect your exchange", index: "03" },
    { label: "Free days", value: "14", caption: "no credit card", index: "04" },
  ],
  features: {
    sectionLabel: "Features",
    title: ["Everything in", "one place."],
    subtitle:
      "Logging, analysis, and goals in one cohesive product — not three spreadsheets and two disconnected apps.",
    footer: "4 modules / 1 dashboard / 0 spreadsheets",
    items: [
      {
        icon: LineChart,
        tag: "DASHBOARD",
        title: "Live performance",
        description:
          "Win rate, expectancy, drawdown, and equity curve in a clear dashboard — not scattered spreadsheets.",
      },
      {
        icon: ClipboardList,
        tag: "JOURNAL",
        title: "Complete trade log",
        description:
          "Record entries, exits, tags, and notes. Attach screenshots. Review what works with real context.",
      },
      {
        icon: Trophy,
        tag: "GOALS",
        title: "Goals & discipline",
        description:
          "Set daily, weekly, and monthly targets. Get feedback when you exceed your daily risk limit.",
      },
      {
        icon: PieChart,
        tag: "REPORTS",
        title: "Smart reports",
        description:
          "Filter by asset, strategy, day of week, or time. Spot patterns your memory forgets.",
      },
    ],
  },
  integrations: {
    sectionLabel: "API integrations",
    title: ["Trades flow in", "automatically.", "You just analyze."],
    subtitle:
      "We connect to major exchanges to pull executions in real time. No spreadsheet, no manual entry — Trackion builds your history while the market moves.",
    tableHeaders: { exchange: "EXCHANGE", type: "TYPE", status: "STATUS", io: "I/O" },
    exchanges: EXCHANGES,
    chartLabels: { pnl: "PNL", trades: "TRADES", sharpe: "SHARPE" },
    benefitsTitle: "↳ what changes",
    benefits: [
      {
        icon: RefreshCw,
        title: "Automatic sync",
        description:
          "Connect your exchange API once. Trackion pulls executions in real time — no copying order by order.",
      },
      {
        icon: Clock,
        title: "Always up-to-date history",
        description:
          "Your journal reflects what actually happened in the account. PnL and metrics ready when you trade.",
      },
      {
        icon: ShieldCheck,
        title: "Read-only · secure",
        description:
          "We only request read permission — no withdraw, no trading. Your capital stays untouched.",
      },
      {
        icon: Link2,
        title: "Multi-exchange",
        description:
          "Centralize all your accounts in one place. Consolidated PnL, global metrics, zero rework.",
      },
    ],
  },
  manifesto: {
    sectionLabel: "Manifesto",
    title: ["STOP", "GAMBLING."],
    thesisLabel: "↳ thesis",
    thesis:
      "Trading isn't luck. Trading on impulse is betting your own capital. Trackion puts process, metrics, and consistency at the center — where they always should be.",
    pillars: [
      { k: "PROBLEM", v: "Trading on gut feel" },
      { k: "CAUSE", v: "No method" },
      { k: "FIX", v: "Data + discipline" },
    ],
    points: [
      {
        icon: Ban,
        tag: "PROBLEM",
        title: "Trading on gut feel is gambling.",
        description:
          "Entering without a plan, doubling down after a loss, ignoring history — the market becomes a casino. Trackion shows your real numbers, not selective memory.",
      },
      {
        icon: Brain,
        tag: "CAUSA",
        title: "Discipline comes from data.",
        description:
          "When you see real win rate, drawdown, and expectancy, you stop repeating the same mistakes. Decisions get a method — not a guess.",
      },
      {
        icon: ShieldCheck,
        tag: "FIX",
        title: "Rules before emotion.",
        description:
          "Goals, risk limits, and systematic review create a process. You trade like a professional, not a gambler hoping for luck.",
      },
    ],
    nextLabel: "↳ next step",
    nextText: "Stop trusting gut feel. Start trusting your data.",
    cta: "Replace gambling with method",
  },
  pricing: {
    sectionLabel: "Plans · 14-day Elite trial",
    title: "Plans for every stage of your trading.",
    subtitle:
      "Try all Elite features free for 14 days. After the trial, pick the plan that fits your volume and number of accounts.",
    perMonth: "/ mo",
    anchorBadge: "Popular",
    trialCta: "Elite trial 14d",
    terminalHeader: "trackion.app — signup --trial=elite --days=14",
    terminalReady: "ready",
    emailPlaceholder: "you@email.com",
    startTrial: "Start trial",
    terminalFooter: "› trial = full Elite · no card at signup",
  },
  footer: {
    tagline: "Don't bet. Track.",
    taglineEn: "Don't bet. Track.",
    product: "Product",
    account: "Account",
    lastSync: "Last sync",
    links: {
      product: ["Features", "Integrations", "Method", "Pricing"],
      account: ["Log in", "14-day trial", "Status"],
    },
    login: "Log in",
    trial: "14-day trial",
    status: "Status",
    copyright: "Trade with method, not guesswork",
    legal: ["Privacy", "Terms", "Contact"],
    syncLabels: { timestamp: "timestamp", status: "status", version: "version" },
    online: "● online",
  },
  trialModal: {
    close: "Close",
    successTitle: "Almost there!",
    successEmail:
      "We sent a confirmation link and temporary password to your email. Check inbox and spam — your 14-day Elite trial starts when you click the link.",
    successDev:
      "Account created in dev mode (email not configured). Use the link and password below to confirm and activate your trial.",
    devPassword: "Temporary password:",
    gotIt: "Got it",
    title: "Start your 14-day free trial",
    subtitle: "No credit card. Fill in below and we'll send your Trackion access link.",
    nameLabel: "Name",
    namePlaceholder: "Your name",
    emailLabel: "Email",
    emailPlaceholder: "you@email.com",
    submitting: "Sending…",
    submit: "Send access link",
  },
};

export function getLandingContent(market: Market): LandingContent {
  return market === "us" ? US : BR;
}
