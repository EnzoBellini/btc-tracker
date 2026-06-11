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
    launchBadge: string;
    originalPriceLabel: string;
    trialCta: string;
    afterTrialNote: string;
    planTrialNote: (planName: string, price: string) => string;
    terminalHeader: string;
    terminalReady: string;
    emailPlaceholder: string;
    startTrial: string;
    terminalFooter: string;
    emailInvalid: string;
  };
  launchPromo: {
    sectionLabel: string;
    badge: string;
    title: string;
    subtitle: string;
    priceRowLabel: string;
    savingsBadge: (pct: number) => string;
    cta: string;
    finePrint: string;
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
    termsConsentPrefix: string;
    termsLink: string;
    termsConsentMiddle: string;
    privacyLink: string;
    termsConsentError: string;
  };
  navBrandSubtitle: string;
  heroMarketPulse: string;
  affiliate: {
    loading: string;
    partner: string;
    coupon: string;
    discount: (pct: number) => string;
  };
  static: { back: string; close: string };
  footerPaths: {
    privacy: string;
    terms: string;
    contact: string;
    status: string;
  };
  navMenuOpen: string;
  navMenuClose: string;
  seo: {
    sectionLabel: string;
    title: [string, string];
    subtitle: string;
    faqTitle: string;
    faq: { q: string; a: string }[];
    guidesTitle: string;
    guides: { label: string; path: string }[];
    blogLink: string;
    blogCta: string;
  };
  blog: {
    eyebrow: string;
    indexTitle: string;
    indexSubtitle: string;
    readMore: string;
    readTime: (min: number) => string;
    backToBlog: string;
    relatedTitle: string;
    ctaText: string;
    ctaButton: string;
    inlineCta: string;
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
  navCta: "Trial grátis 14d",
  navBrandSubtitle: "— trading journal · crypto",
  heroMeta: { beta: "Beta privado", trial: "14 dias Elite grátis", noCard: "sem cartão de crédito" },
  heroEyebrow: "[00 — Journal · BTCUSDT futures]",
  heroTitle: ["DOMINE", "SEUS", "trades"],
  heroMarketPulse: "BTC · futuros USDT · stack spot",
  heroCtaPrimary: "Começar trial 14 dias",
  heroCtaSecondary: "Ver recursos",
  heroPills: [
    { icon: LineChart, text: "Analytics avançado" },
    { icon: Target, text: "Metas & risco" },
    { icon: Zap, text: "Sync em tempo real" },
    { icon: Compass, text: "Foco em método" },
  ],
  heroFig: "fig.01 — dashboard.exec",
  heroLive: "live",
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
    sectionLabel: "Planos · promo de lançamento",
    title: "Planos para cada fase do seu trading.",
    subtitle:
      "Teste todos os recursos Elite por 14 dias grátis. Depois do trial, assine com preço de lançamento — Starter R$20 · Pro R$40 · Elite R$60/mês.",
    perMonth: "/ mês",
    anchorBadge: "Recomendado",
    launchBadge: "Lançamento",
    originalPriceLabel: "De",
    trialCta: "Trial Elite 14d",
    afterTrialNote: "Preço promocional de lançamento válido para novas assinaturas após o trial.",
    planTrialNote: (planName, price) => `Após o trial: ${planName} · ${price}/mês`,
    terminalHeader: "trackion.app — signup --trial=elite --days=14",
    terminalReady: "ready",
    emailPlaceholder: "seu@email.com",
    startTrial: "Iniciar trial",
    terminalFooter: "› trial = Elite completo · sem cartão no cadastro",
    emailInvalid: "Informe um e-mail válido para continuar.",
  },
  launchPromo: {
    sectionLabel: "Promo · lançamento Trackion",
    badge: "Oferta de lançamento",
    title: "Preço de estreia para quem começa com método.",
    subtitle:
      "Celebramos o lançamento com valores especiais: Starter, Pro e Elite por R$20, R$40 e R$60/mês. Trial Elite de 14 dias grátis — sem cartão.",
    priceRowLabel: "Starter · Pro · Elite",
    savingsBadge: (pct) => `−${pct}% vs. preço regular`,
    cta: "Garantir preço de lançamento",
    finePrint: "Valores promocionais aplicados na assinatura após o trial de 14 dias.",
  },
  footer: {
    tagline: "Não aposte. Registre.",
    taglineEn: "Don't bet. Track.",
    product: "Produto",
    account: "Conta",
    lastSync: "Última sync",
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
    termsConsentPrefix: "Li e aceito os",
    termsLink: "Termos de Uso",
    termsConsentMiddle: "e a",
    privacyLink: "Política de Privacidade",
    termsConsentError: "Aceite os Termos de Uso e a Política de Privacidade para continuar.",
  },
  affiliate: {
    loading: "Carregando oferta do parceiro…",
    partner: "Parceiro",
    coupon: "Cupom",
    discount: (pct) => `${pct}% off na assinatura`,
  },
  static: { back: "Voltar ao site", close: "Fechar" },
  footerPaths: {
    privacy: "/privacidade",
    terms: "/termos",
    contact: "/contato",
    status: "/status",
  },
  navMenuOpen: "Abrir menu",
  navMenuClose: "Fechar menu",
  seo: {
    sectionLabel: "Guia · Crypto",
    title: ["Trading de", "criptomoedas"],
    subtitle:
      "Em 2026, buscas por Bitcoin e crypto bateram máximas no Google Trends — mas volume de busca não é método. Journal, sync de exchange, psicologia de trade e gestão de risco separam quem acumula de quem aposta.",
    faqTitle: "Perguntas frequentes",
    faq: [
      {
        q: "O que é um trading journal para criptomoedas?",
        a: "É um diário estruturado de operações em Bitcoin, altcoins e futuros. O Trackion sincroniza trades via API read-only das exchanges e calcula win rate, expectancy e drawdown automaticamente.",
      },
      {
        q: "Qual a melhor ferramenta para registrar trades de crypto?",
        a: "Uma que conecta Binance, MEXC e Bitget sem planilha, com metas de risco e foco em psicologia de trading. O Trackion foi feito para futuros USDT e stack BTC.",
      },
      {
        q: "Como melhorar psicologia no trading de crypto?",
        a: "Registre cada trade, defina limite diário de perda, revise padrões semanais e marque entradas por FOMO. Dados expõem vieses que emoção esconde.",
      },
      {
        q: "Trackion sincroniza com quais exchanges?",
        a: "Binance, MEXC e Bitget via API read-only (sem saque). Bybit e OKX em desenvolvimento para Q1 2026.",
      },
      {
        q: "Preciso de cartão para testar?",
        a: "Não. Trial Elite de 14 dias grátis, sem cartão de crédito no cadastro.",
      },
      {
        q: "Serve para futuros e spot?",
        a: "Sim. BTCUSDT perpétuo, altcoins e acumulação spot no mesmo dashboard, com PnL consolidado multi-exchange.",
      },
    ],
    guidesTitle: "Guias por tema",
    guides: [
      { label: "Trading journal crypto", path: "/trading-journal-crypto" },
      { label: "Diário de trades", path: "/diario-de-trades" },
      { label: "Psicologia do trading", path: "/psicologia-do-trading" },
      { label: "Gestão de risco", path: "/gestao-de-risco-crypto" },
      { label: "Futuros crypto", path: "/futuros-crypto" },
      { label: "Sync exchange", path: "/sincronizar-exchange-crypto" },
      { label: "Journal Binance", path: "/journal-binance" },
      { label: "Acumular Bitcoin", path: "/acumular-bitcoin" },
      { label: "Análise de performance", path: "/analise-performance-trading" },
      { label: "FOMO trading", path: "/fomo-trading" },
      { label: "Substituir planilha", path: "/planilha-trades-crypto" },
      { label: "Trading criptomoedas", path: "/criptomoeda-trading" },
    ],
    blogLink: "Ver todos os artigos →",
    blogCta: "Blog · trading crypto",
  },
  blog: {
    eyebrow: "Blog · Trackion",
    indexTitle: "Trading crypto com método",
    indexSubtitle:
      "Artigos sobre Google Trends, psicologia de trade, gestão de risco, sync de exchange e por que journal vence planilha — escrito para quem opera Bitcoin e futuros de verdade.",
    readMore: "Ler artigo",
    readTime: (min) => `${min} min de leitura`,
    backToBlog: "Voltar ao blog",
    relatedTitle: "Artigos relacionados",
    ctaText: "Registre trades com sync automático de exchange, metas de risco e analytics profissional.",
    ctaButton: "Trial Elite 14 dias grátis",
    inlineCta:
      "Pare de confiar na memória. O Trackion sincroniza Binance, MEXC e Bitget, calcula win rate e expectancy e ajuda você a operar com método — não no feeling.",
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
  navCta: "Free 14-day trial",
  navBrandSubtitle: "— trading journal · crypto",
  heroMeta: { beta: "Private beta", trial: "14-day Elite trial", noCard: "no credit card" },
  heroEyebrow: "[00 — Journal · BTCUSDT futures]",
  heroTitle: ["MASTER", "YOUR", "trades"],
  heroMarketPulse: "BTC · USDT futures · spot stack",
  heroCtaPrimary: "Start 14-day trial",
  heroCtaSecondary: "See features",
  heroPills: [
    { icon: LineChart, text: "Advanced analytics" },
    { icon: Target, text: "Goals & risk" },
    { icon: Zap, text: "Real-time sync" },
    { icon: Compass, text: "Method-first" },
  ],
  heroFig: "fig.01 — dashboard.exec",
  heroLive: "live",
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
        tag: "CAUSE",
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
    sectionLabel: "Plans · launch promo",
    title: "Plans for every stage of your trading.",
    subtitle:
      "Try all Elite features free for 14 days. After the trial, subscribe at launch pricing — Starter $20 · Pro $40 · Elite $60/mo.",
    perMonth: "/ mo",
    anchorBadge: "Popular",
    launchBadge: "Launch",
    originalPriceLabel: "Was",
    trialCta: "Elite trial 14d",
    afterTrialNote: "Launch promo pricing applies to new subscriptions after the trial.",
    planTrialNote: (planName, price) => `After trial: ${planName} · ${price}/mo`,
    terminalHeader: "trackion.app — signup --trial=elite --days=14",
    terminalReady: "ready",
    emailPlaceholder: "you@email.com",
    startTrial: "Start trial",
    terminalFooter: "› trial = full Elite · no card at signup",
    emailInvalid: "Enter a valid email to continue.",
  },
  launchPromo: {
    sectionLabel: "Promo · Trackion launch",
    badge: "Launch offer",
    title: "Intro pricing for traders who lead with data.",
    subtitle:
      "Celebrate our launch with special rates: Starter, Pro, and Elite at $20, $40, and $60/mo. 14-day Elite trial — no card required.",
    priceRowLabel: "Starter · Pro · Elite",
    savingsBadge: (pct) => `−${pct}% vs. regular price`,
    cta: "Lock in launch pricing",
    finePrint: "Promo rates apply when you subscribe after the 14-day trial.",
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
    termsConsentPrefix: "I have read and accept the",
    termsLink: "Terms of Use",
    termsConsentMiddle: "and the",
    privacyLink: "Privacy Policy",
    termsConsentError: "You must accept the Terms of Use and Privacy Policy to continue.",
  },
  affiliate: {
    loading: "Loading partner offer…",
    partner: "Partner",
    coupon: "Coupon",
    discount: (pct) => `${pct}% off subscription`,
  },
  static: { back: "Back to site", close: "Close" },
  footerPaths: {
    privacy: "/privacy",
    terms: "/terms",
    contact: "/contact",
    status: "/status",
  },
  navMenuOpen: "Open menu",
  navMenuClose: "Close menu",
  seo: {
    sectionLabel: "Guide · Crypto",
    title: ["Cryptocurrency", "trading"],
    subtitle:
      "In 2026, Bitcoin and crypto searches hit Google Trends highs — but search volume isn't a method. Journaling, exchange sync, trading psychology and risk management separate accumulators from gamblers.",
    faqTitle: "Frequently asked questions",
    faq: [
      {
        q: "What is a crypto trading journal?",
        a: "A structured log of Bitcoin, altcoin and futures trades. Trackion syncs via read-only exchange API and computes win rate, expectancy and drawdown automatically.",
      },
      {
        q: "What's the best tool to log crypto trades?",
        a: "One that connects Binance, MEXC and Bitget without spreadsheets, with risk goals and trading psychology built in. Trackion is built for USDT futures and BTC stacking.",
      },
      {
        q: "How to improve trading psychology in crypto?",
        a: "Log every trade, set a daily loss limit, review weekly patterns and tag FOMO entries. Data exposes biases emotion hides.",
      },
      {
        q: "Which exchanges does Trackion sync?",
        a: "Binance, MEXC and Bitget via read-only API (no withdrawals). Bybit and OKX coming Q1 2026.",
      },
      {
        q: "Do I need a card to try it?",
        a: "No. 14-day Elite trial free, no credit card at signup.",
      },
      {
        q: "Does it work for futures and spot?",
        a: "Yes. BTCUSDT perps, altcoins and spot accumulation in one dashboard with multi-exchange consolidated PnL.",
      },
    ],
    guidesTitle: "Topic guides",
    guides: [
      { label: "Crypto trading journal", path: "/crypto-trading-journal" },
      { label: "Trading psychology", path: "/trading-psychology-crypto" },
      { label: "Crypto futures journal", path: "/crypto-futures-journal" },
      { label: "Exchange API sync", path: "/exchange-api-sync" },
      { label: "Risk management", path: "/crypto-risk-management" },
      { label: "Binance journal", path: "/binance-trading-journal" },
      { label: "Bitcoin stack tracker", path: "/bitcoin-stack-tracker" },
      { label: "Trade analytics", path: "/crypto-trade-analytics" },
      { label: "FOMO trading", path: "/fomo-crypto-trading" },
      { label: "Replace spreadsheet", path: "/crypto-trading-spreadsheet" },
      { label: "Retail crypto trading", path: "/retail-crypto-trading" },
    ],
    blogLink: "Browse all articles →",
    blogCta: "Blog · crypto trading",
  },
  blog: {
    eyebrow: "Blog · Trackion",
    indexTitle: "Crypto trading with method",
    indexSubtitle:
      "Articles on Google Trends, trading psychology, risk management, exchange sync and why journals beat spreadsheets — for traders who actually operate Bitcoin and futures.",
    readMore: "Read article",
    readTime: (min) => `${min} min read`,
    backToBlog: "Back to blog",
    relatedTitle: "Related articles",
    ctaText: "Log trades with automatic exchange sync, risk goals and pro analytics.",
    ctaButton: "Free 14-day Elite trial",
    inlineCta:
      "Stop trusting memory. Trackion syncs Binance, MEXC and Bitget, computes win rate and expectancy, and helps you trade with method — not gut feel.",
  },
};

export function getLandingContent(market: Market): LandingContent {
  return market === "us" ? US : BR;
}
