import type { Market } from "./locale";
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildOrganizationJsonLd,
  type SeoMeta,
} from "./seo";

export type BlogSection = {
  heading?: string;
  paragraphs: string[];
};

export type BlogPost = {
  slug: string;
  market: Market;
  publishedAt: string;
  readMinutes: number;
  title: string;
  excerpt: string;
  tags: string[];
  keywords: string[];
  sections: BlogSection[];
  relatedSlugs: string[];
};

const POSTS: BlogPost[] = [
  // ── PT-BR ───────────────────────────────────────────────────────
  {
    slug: "bitcoin-google-trends-2026",
    market: "br",
    publishedAt: "2026-06-01",
    readMinutes: 7,
    title: "Bitcoin no Google Trends em 2026: o que picos de busca realmente significam",
    excerpt:
      "Buscas por Bitcoin bateram máximas de 12 meses durante a volatilidade de 2026. Entenda o que isso revela sobre psicologia retail — e por que volume de busca não é estratégia.",
    tags: ["Bitcoin", "Google Trends", "Criptomoeda", "Psicologia"],
    keywords: ["bitcoin google trends", "comprar bitcoin", "criptomoeda 2026", "bitcoin zero", "interesse retail crypto"],
    sections: [
      {
        paragraphs: [
          "Em fevereiro e junho de 2026, o interesse global por Bitcoin no Google Trends atingiu pontuação 100 — o máximo da escala relativa. Coincidiu com quedas acentuadas de preço e, em paralelo, buscas recordes por termos como \"bitcoin zero\".",
          "Para traders, isso não é curiosidade de Twitter: é termômetro de comportamento retail. Quando o público volta a pesquisar em massa, normalmente não está calmo — está assustado, curioso ou com FOMO.",
        ],
      },
      {
        heading: "Busca alta não significa compra",
        paragraphs: [
          "Dados de 2026 mostram um padrão diferente de ciclos anteriores: atenção retail voltou, mas volume em exchanges caiu para mínimos. Ou seja, muita gente olhando, pouca gente operando com convicção.",
          "Picos de \"comprar bitcoin\" e \"comprar crypto\" durante crashes costumam misturar três perfis: quem quer entrar barato, quem quer confirmar medo e quem busca validação para vender. Sem journal, você não sabe em qual grupo caiu na última semana.",
        ],
      },
      {
        heading: "\"Bitcoin zero\" como sinal contrarian — com ressalvas",
        paragraphs: [
          "Analistas tradicionais tratam extremos de medo como possível fundo local. Em 2026, a base de usuários crypto é muito maior que em 2018 ou 2022 — um score 100 no Trends não representa o mesmo pânico absoluto de antes.",
          "Além disso, o medo não é uniforme no mundo. Ásia, Europa e EUA podem estar em fases diferentes. Conclusão: Trends é contexto, não gatilho de compra.",
        ],
      },
      {
        heading: "O que fazer na prática",
        paragraphs: [
          "Use picos de busca como lembrete de disciplina, não como call. Registre se suas entradas da semana foram planejadas ou reativas. Compare expectancy de trades em dias de alta volatilidade vs. dias calmos.",
          "Um trading journal com sync de exchange elimina a narrativa que você conta depois do candle. Os números mostram se você é o trader que compra o dip com plano — ou o que reage ao feed.",
        ],
      },
    ],
    relatedSlugs: ["psicologia-trading-crypto-fomo", "trading-journal-vs-feeling", "gestao-risco-futuros-crypto"],
  },
  {
    slug: "psicologia-trading-crypto-fomo",
    market: "br",
    publishedAt: "2026-06-03",
    readMinutes: 8,
    title: "Psicologia do trading em crypto: FOMO, medo e revenge trade em dados",
    excerpt:
      "64% dos traders retail entram após picos de preço. Veja como journal, tags emocionais e limites de risco transformam psicologia de trade em processo mensurável.",
    tags: ["Psicologia", "FOMO", "Trading", "Disciplina"],
    keywords: ["psicologia do trading", "FOMO crypto", "revenge trade", "disciplina trading", "emoção no trading"],
    sections: [
      {
        paragraphs: [
          "Psicologia de trade não é afirmação de coach — é padrão repetido sob pressão. Em crypto, com mercado 24/7 e alavancagem em futuros, o intervalo entre impulso e clique é de segundos.",
          "Pesquisas com traders retail em 2026 indicam que a maioria compra depois que o preço já subiu e ignora stop loss em mais de 60% das operações. O mercado não precisa te vencer; basta você repetir o mesmo erro emocional.",
        ],
      },
      {
        heading: "FOMO: o custo invisível",
        paragraphs: [
          "FOMO raramente aparece na planilha como linha própria. Por isso parece gratuito. Na prática, entradas tardias diluem expectancy e aumentam drawdown — especialmente em altcoins com spread largo.",
          "Marque trades como FOMO no journal. Depois de 30 operações, compare win rate e R:R médio vs. setups planejados. A diferença costuma ser o melhor argumento contra a próxima entrada impulsiva.",
        ],
      },
      {
        heading: "Revenge trade após stop",
        paragraphs: [
          "Dobrar mão para \"recuperar\" é o caminho mais rápido para limite diário estourado. Limite de perda por sessão não é frescura — é freio físico para amígdala.",
          "Configure teto diário no Trackion e trate como ordem inegociável. Profissionais param quando o plano manda; amadores param quando a conta não deixa mais.",
        ],
      },
      {
        heading: "Disciplina é revisão, não motivação",
        paragraphs: [
          "Motivação some no drawdown. Processo fica: mesma rotina de registro, mesma revisão semanal, mesmas métricas. Win rate, expectancy e horários ruins viram regras escritas — não promessas.",
        ],
      },
    ],
    relatedSlugs: ["bitcoin-google-trends-2026", "gestao-risco-futuros-crypto", "trading-journal-vs-feeling"],
  },
  {
    slug: "planilha-trades-futuros-crypto",
    market: "br",
    publishedAt: "2026-06-05",
    readMinutes: 6,
    title: "Por que planilha de trades não funciona mais em futuros crypto",
    excerpt:
      "Fees, funding, multi-exchange e centenas de execuções por mês quebram qualquer Excel. Entenda quando migrar para um journal com sync automático.",
    tags: ["Planilha", "Futuros", "Exchange", "Journal"],
    keywords: ["planilha de trades", "excel trading crypto", "futuros crypto", "diário de trades", "substituir planilha"],
    sections: [
      {
        paragraphs: [
          "Planilha funcionou quando você fazia dez trades por mês em um par. Futuros crypto em 2026: dezenas de execuções por dia, funding a cada 8h, fees em maker/taker e contas em mais de uma exchange.",
          "Cada cópia manual é ponto de falha. Um fill esquecido distorce win rate. Um fee ignorado infla expectancy. Depois de três meses, você otimiza narrativa — não performance.",
        ],
      },
      {
        heading: "O que a planilha não captura",
        paragraphs: [
          "Estado emocional, screenshot do setup, tag de estratégia, violação de risco, contexto de macro — dados qualitativos que explicam números. API + journal estruturado guardam execução e contexto no mesmo lugar.",
        ],
      },
      {
        heading: "Sync read-only resolve 80% do trabalho",
        paragraphs: [
          "Binance, MEXC e Bitget expõem histórico via API somente leitura. O Trackion importa fills, calcula PnL e mantém dashboard atualizado. Você revisa edge, não VLOOKUP.",
        ],
      },
    ],
    relatedSlugs: ["sincronizar-exchange-journal", "trading-journal-vs-feeling", "analise-performance-win-rate"],
  },
  {
    slug: "sincronizar-exchange-journal",
    market: "br",
    publishedAt: "2026-06-07",
    readMinutes: 5,
    title: "Como sincronizar Binance, MEXC e Bitget no seu trading journal",
    excerpt:
      "Passo a passo conceitual para conectar exchanges via API read-only, centralizar futuros e spot e manter histórico confiável para análise.",
    tags: ["Exchange", "API", "Binance", "Sync"],
    keywords: ["sincronizar exchange", "API binance read only", "importar trades", "journal bitget", "journal mexc"],
    sections: [
      {
        paragraphs: [
          "Conectar exchange ao journal não é automação de trade — é automação de verdade. Você continua decidindo; o sistema registra o que de fato executou.",
        ],
      },
      {
        heading: "Por que read-only",
        paragraphs: [
          "Chaves com permissão de saque ou trading são risco desnecessário. Read-only basta para histórico de ordens e fills. Revogue e recrie chaves periodicamente — higiene básica.",
        ],
      },
      {
        heading: "Multi-exchange sem PnL fragmentado",
        paragraphs: [
          "Muitos traders operam MEXC para altcoins, Binance para liquidez e Bitget por promoção. Sem consolidação, você não sabe se o mês foi positivo — só se uma aba do browser pareceu verde.",
          "Journal multi-conta unifica métricas: drawdown global, expectancy por exchange, concentração de risco por ativo.",
        ],
      },
    ],
    relatedSlugs: ["planilha-trades-futuros-crypto", "gestao-risco-futuros-crypto", "analise-performance-win-rate"],
  },
  {
    slug: "gestao-risco-futuros-crypto",
    market: "br",
    publishedAt: "2026-06-09",
    readMinutes: 7,
    title: "Gestão de risco em futuros crypto: drawdown, stop e limites diários",
    excerpt:
      "Alavancagem transforma pequeno erro em grande dano. Aprenda a estruturar risco por trade, por dia e por conta — e medir se você realmente obedece às regras.",
    tags: ["Risco", "Futuros", "Drawdown", "Stop loss"],
    keywords: ["gestão de risco crypto", "drawdown trading", "stop loss futuros", "position sizing", "limite diário perda"],
    sections: [
      {
        paragraphs: [
          "Gestão de risco em futuros não começa no stop da ordem — começa no tamanho da posição. 1% de risco por trade em conta de $5.000 é $50. Parece pouco até você ignorar por cinco trades seguidos.",
        ],
      },
      {
        heading: "Drawdown: a métrica que importa",
        paragraphs: [
          "Win rate alto com drawdown profundo ainda quebra conta — matematicamente e psicologicamente. Equity curve e max drawdown devem estar sempre visíveis, não enterrados em aba mensal.",
        ],
      },
      {
        heading: "Limite diário como circuit breaker",
        paragraphs: [
          "Defina perda máxima por dia (ex.: 3R ou 4% da conta). Ao atingir, pare. O mercado abre amanhã; conta zerada não.",
          "Journal audita compliance: quantos dias você violou o limite em 2026? Se a resposta for \"vários\", o problema não é setup — é execução de risco.",
        ],
      },
    ],
    relatedSlugs: ["psicologia-trading-crypto-fomo", "analise-performance-win-rate", "sincronizar-exchange-journal"],
  },
  {
    slug: "trading-journal-vs-feeling",
    market: "br",
    publishedAt: "2026-06-11",
    readMinutes: 6,
    title: "Trading journal vs operar no feeling: o que os dados de 2026 mostram",
    excerpt:
      "Retail voltou a olhar crypto, mas institucional domina volume. Quem sobrevive sem journal repete ciclo de euforia, capitulação e reentrada tardia.",
    tags: ["Trading journal", "Método", "Retail", "Dados"],
    keywords: ["trading journal", "operar no feeling", "trading com método", "retail crypto", "diário de trades"],
    sections: [
      {
        paragraphs: [
          "Operar no feeling é confundir intensidade emocional com convicção. Candle verde forte parece confirmação; candle vermelho parece injustiça. Sem registro, você aprende histórias, não padrões.",
        ],
      },
      {
        heading: "Journal como espelho sem filtro",
        paragraphs: [
          "Expectancy negativa não mente. Seu último mês pode ter parecido \"quase\" — os números dizem se foi quase lucro ou quase recuperação de buraco maior.",
        ],
      },
      {
        heading: "Método não é rigidez — é feedback",
        paragraphs: [
          "Journal bom não é burocracia. É loop: hipótese → execução → dado → ajuste. Trackion acelera o loop com sync de exchange, metas de risco e relatórios por contexto.",
          "Trial de 14 dias sem cartão existe para você testar se dados mudam suas decisões — não para adicionar mais uma aba aberta no browser.",
        ],
      },
    ],
    relatedSlugs: ["bitcoin-google-trends-2026", "psicologia-trading-crypto-fomo", "planilha-trades-futuros-crypto"],
  },
  {
    slug: "analise-performance-win-rate",
    market: "br",
    publishedAt: "2026-06-10",
    readMinutes: 6,
    title: "Win rate, expectancy e drawdown: as métricas que todo trader crypto ignora",
    excerpt:
      "Win rate sozinho engana. Entenda expectancy, profit factor e drawdown — e como calculá-los automaticamente a partir do histórico da exchange.",
    tags: ["Analytics", "Win rate", "Expectancy", "Métricas"],
    keywords: ["win rate crypto", "expectancy trading", "profit factor", "análise de performance", "métricas trading"],
    sections: [
      {
        paragraphs: [
          "Trader retail ama win rate porque é fácil de entender. 70% de acerto soa impressionante — até você perceber que os 30% de loss levam três vezes o ganho médio.",
        ],
      },
      {
        heading: "Expectancy: a pergunta certa",
        paragraphs: [
          "Expectancy responde: \"quanto eu ganho em média por trade ao longo do tempo?\" Positiva com risco controlado = processo. Negativa com win rate alto = ilusão.",
        ],
      },
      {
        heading: "Filtros que revelam edge real",
        paragraphs: [
          "Win rate por horário, por par, por tag de setup. Talvez você seja lucrativo só em BTCUSDT de manhã e doe dinheiro em altcoins à noite. Sem filtro, mistura tudo e acha que \"o mercado mudou\".",
        ],
      },
    ],
    relatedSlugs: ["gestao-risco-futuros-crypto", "trading-journal-vs-feeling", "sincronizar-exchange-journal"],
  },

  // ── EN-US ───────────────────────────────────────────────────────
  {
    slug: "bitcoin-google-trends-2026",
    market: "us",
    publishedAt: "2026-06-01",
    readMinutes: 7,
    title: "Bitcoin on Google Trends in 2026: what search spikes really mean",
    excerpt:
      "Bitcoin searches hit 12-month highs during 2026 volatility. Learn what that reveals about retail psychology — and why search volume isn't a strategy.",
    tags: ["Bitcoin", "Google Trends", "Cryptocurrency", "Psychology"],
    keywords: ["bitcoin google trends", "buy bitcoin", "cryptocurrency 2026", "bitcoin zero", "retail crypto interest"],
    sections: [
      {
        paragraphs: [
          "In February and June 2026, global Bitcoin interest on Google Trends hit a score of 100 — the top of the relative scale. It coincided with sharp price drops and record searches for terms like \"bitcoin going to zero.\"",
          "For traders, this isn't Twitter trivia: it's a retail behavior thermometer. When the public searches en masse, they're usually not calm — they're scared, curious, or riding FOMO.",
        ],
      },
      {
        heading: "High search doesn't mean buying",
        paragraphs: [
          "2026 data shows a different pattern from past cycles: retail attention returned, but exchange spot volume fell to lows. Lots of watching, less conviction trading.",
          "Spikes in \"buy bitcoin\" and \"buy crypto\" during crashes mix three profiles: dip buyers, fear confirmers, and people researching exits. Without a journal, you don't know which group you were in last week.",
        ],
      },
      {
        heading: "\"Bitcoin zero\" as contrarian signal — with caveats",
        paragraphs: [
          "Analysts traditionally treat extreme fear as a possible local bottom. In 2026, the crypto user base is far larger than 2018 or 2022 — a Trends score of 100 isn't the same absolute panic as before.",
          "Fear also isn't uniform worldwide. Asia, Europe and the US can be in different phases. Conclusion: Trends is context, not a buy trigger.",
        ],
      },
      {
        heading: "What to do in practice",
        paragraphs: [
          "Use search spikes as discipline reminders, not calls. Log whether your week's entries were planned or reactive. Compare expectancy on high-volatility days vs. calm sessions.",
          "A trading journal with exchange sync kills the story you tell after the candle. Numbers show if you're the trader who buys the dip with a plan — or reacts to the feed.",
        ],
      },
    ],
    relatedSlugs: ["crypto-trading-psychology-fomo", "trading-journal-vs-gut-feel", "crypto-futures-risk-management"],
  },
  {
    slug: "crypto-trading-psychology-fomo",
    market: "us",
    publishedAt: "2026-06-03",
    readMinutes: 8,
    title: "Crypto trading psychology: FOMO, fear and revenge trading in data",
    excerpt:
      "64% of retail traders enter after price spikes. See how journaling, emotional tags and risk limits turn trading psychology into measurable process.",
    tags: ["Psychology", "FOMO", "Trading", "Discipline"],
    keywords: ["trading psychology", "FOMO crypto", "revenge trading", "trading discipline", "emotional trading"],
    sections: [
      {
        paragraphs: [
          "Trading psychology isn't a coach quote — it's repeated behavior under pressure. In crypto, with 24/7 markets and futures leverage, the gap between impulse and click is seconds.",
          "2026 retail trader research shows most buy after price already rose and skip stop losses on 60%+ of trades. The market doesn't need to beat you; you just repeat the same emotional mistake.",
        ],
      },
      {
        heading: "FOMO: the invisible cost",
        paragraphs: [
          "FOMO rarely gets its own spreadsheet row, so it feels free. Late entries dilute expectancy and deepen drawdown — especially on altcoins with wide spreads.",
          "Tag FOMO trades in your journal. After 30 trades, compare win rate and average R:R vs. planned setups. The gap is usually the best argument against the next impulsive entry.",
        ],
      },
      {
        heading: "Revenge trading after a stop",
        paragraphs: [
          "Doubling size to \"get it back\" is the fastest path to a blown daily limit. A session loss cap isn't fussy — it's a physical brake for your amygdala.",
          "Set a daily ceiling in Trackion and treat it as non-negotiable. Pros stop when the plan says stop; amateurs stop when the account won't let them continue.",
        ],
      },
      {
        heading: "Discipline is review, not motivation",
        paragraphs: [
          "Motivation vanishes in drawdown. Process stays: same logging routine, same weekly review, same metrics. Win rate, expectancy and bad hours become written rules — not promises.",
        ],
      },
    ],
    relatedSlugs: ["bitcoin-google-trends-2026", "crypto-futures-risk-management", "trading-journal-vs-gut-feel"],
  },
  {
    slug: "crypto-futures-spreadsheet-limit",
    market: "us",
    publishedAt: "2026-06-05",
    readMinutes: 6,
    title: "Why crypto futures traders outgrow trading spreadsheets",
    excerpt:
      "Fees, funding, multi-exchange accounts and hundreds of fills per month break any Excel workflow. Know when to migrate to a journal with automatic sync.",
    tags: ["Spreadsheet", "Futures", "Exchange", "Journal"],
    keywords: ["crypto trading spreadsheet", "excel trading bitcoin", "crypto futures", "trade log", "replace spreadsheet"],
    sections: [
      {
        paragraphs: [
          "Spreadsheets worked when you placed ten trades a month on one pair. Crypto futures in 2026: dozens of fills per day, funding every 8 hours, maker/taker fees and accounts across multiple exchanges.",
          "Every manual copy is a failure point. One forgotten fill distorts win rate. One ignored fee inflates expectancy. After three months, you optimize narrative — not performance.",
        ],
      },
      {
        heading: "What spreadsheets don't capture",
        paragraphs: [
          "Emotional state, setup screenshots, strategy tags, risk violations, macro context — qualitative data that explains numbers. API + structured journal keeps execution and context together.",
        ],
      },
      {
        heading: "Read-only sync solves 80% of the work",
        paragraphs: [
          "Binance, MEXC and Bitget expose history via read-only API. Trackion imports fills, computes PnL and keeps dashboards current. You review edge, not VLOOKUP.",
        ],
      },
    ],
    relatedSlugs: ["sync-exchange-trading-journal", "trading-journal-vs-gut-feel", "win-rate-expectancy-crypto"],
  },
  {
    slug: "sync-exchange-trading-journal",
    market: "us",
    publishedAt: "2026-06-07",
    readMinutes: 5,
    title: "How to sync Binance, MEXC and Bitget into your trading journal",
    excerpt:
      "A practical overview of connecting exchanges via read-only API, centralizing futures and spot, and keeping reliable history for analysis.",
    tags: ["Exchange", "API", "Binance", "Sync"],
    keywords: ["exchange API sync", "binance read only api", "import trades", "bitget journal", "mexc trade log"],
    sections: [
      {
        paragraphs: [
          "Connecting an exchange to your journal isn't trade automation — it's truth automation. You still decide; the system records what actually executed.",
        ],
      },
      {
        heading: "Why read-only",
        paragraphs: [
          "Keys with withdraw or trading permissions are unnecessary risk. Read-only is enough for order and fill history. Rotate keys periodically — basic hygiene.",
        ],
      },
      {
        heading: "Multi-exchange without fragmented PnL",
        paragraphs: [
          "Many traders use MEXC for altcoins, Binance for liquidity and Bitget for promos. Without consolidation, you don't know if the month was green — only if one browser tab looked green.",
          "Multi-account journaling unifies metrics: global drawdown, expectancy per exchange, risk concentration per asset.",
        ],
      },
    ],
    relatedSlugs: ["crypto-futures-spreadsheet-limit", "crypto-futures-risk-management", "win-rate-expectancy-crypto"],
  },
  {
    slug: "crypto-futures-risk-management",
    market: "us",
    publishedAt: "2026-06-09",
    readMinutes: 7,
    title: "Risk management for crypto futures: drawdown, stops and daily limits",
    excerpt:
      "Leverage turns small mistakes into large damage. Structure risk per trade, per day and per account — and measure whether you actually follow the rules.",
    tags: ["Risk", "Futures", "Drawdown", "Stop loss"],
    keywords: ["crypto risk management", "drawdown trading", "futures stop loss", "position sizing", "daily loss limit"],
    sections: [
      {
        paragraphs: [
          "Futures risk management doesn't start at the order stop — it starts at position size. 1% risk per trade on a $5,000 account is $50. Seems small until you ignore it five trades in a row.",
        ],
      },
      {
        heading: "Drawdown: the metric that matters",
        paragraphs: [
          "High win rate with deep drawdown still blows accounts — mathematically and psychologically. Equity curve and max drawdown should always be visible, not buried in a monthly tab.",
        ],
      },
      {
        heading: "Daily limit as circuit breaker",
        paragraphs: [
          "Set a max daily loss (e.g. 3R or 4% of account). Hit it, stop. The market opens tomorrow; a zeroed account doesn't.",
          "Your journal audits compliance: how many days did you break the limit in 2026? If the answer is \"several,\" the problem isn't setup — it's risk execution.",
        ],
      },
    ],
    relatedSlugs: ["crypto-trading-psychology-fomo", "win-rate-expectancy-crypto", "sync-exchange-trading-journal"],
  },
  {
    slug: "trading-journal-vs-gut-feel",
    market: "us",
    publishedAt: "2026-06-11",
    readMinutes: 6,
    title: "Trading journal vs gut feel: what 2026 retail data shows",
    excerpt:
      "Retail is watching crypto again, but institutions dominate volume. Traders without a journal repeat the cycle of euphoria, capitulation and late re-entry.",
    tags: ["Trading journal", "Method", "Retail", "Data"],
    keywords: ["trading journal", "gut feel trading", "disciplined trading", "retail crypto", "crypto trade log"],
    sections: [
      {
        paragraphs: [
          "Trading on gut feel is confusing emotional intensity with conviction. A strong green candle feels like confirmation; a red one feels unfair. Without logs, you learn stories, not patterns.",
        ],
      },
      {
        heading: "Journal as unfiltered mirror",
        paragraphs: [
          "Negative expectancy doesn't lie. Your last month might have felt \"close\" — numbers say whether it was close to profit or close to digging out of a bigger hole.",
        ],
      },
      {
        heading: "Method isn't rigidity — it's feedback",
        paragraphs: [
          "A good journal isn't bureaucracy. It's a loop: hypothesis → execution → data → adjustment. Trackion speeds the loop with exchange sync, risk goals and context reports.",
          "The 14-day no-card trial exists to test whether data changes your decisions — not to add another open browser tab.",
        ],
      },
    ],
    relatedSlugs: ["bitcoin-google-trends-2026", "crypto-trading-psychology-fomo", "crypto-futures-spreadsheet-limit"],
  },
  {
    slug: "win-rate-expectancy-crypto",
    market: "us",
    publishedAt: "2026-06-10",
    readMinutes: 6,
    title: "Win rate, expectancy and drawdown: metrics every crypto trader skips",
    excerpt:
      "Win rate alone misleads. Understand expectancy, profit factor and drawdown — and compute them automatically from exchange history.",
    tags: ["Analytics", "Win rate", "Expectancy", "Metrics"],
    keywords: ["win rate crypto", "trading expectancy", "profit factor", "trade performance analytics", "crypto metrics"],
    sections: [
      {
        paragraphs: [
          "Retail traders love win rate because it's easy. 70% accuracy sounds impressive — until you realize the 30% of losses are triple your average win.",
        ],
      },
      {
        heading: "Expectancy: the right question",
        paragraphs: [
          "Expectancy answers: \"how much do I make on average per trade over time?\" Positive with controlled risk = process. Negative with high win rate = illusion.",
        ],
      },
      {
        heading: "Filters that reveal real edge",
        paragraphs: [
          "Win rate by time of day, pair and setup tag. Maybe you're profitable only on morning BTCUSDT and donate on late-night altcoins. Without filters, you blend everything and think \"the market changed.\"",
        ],
      },
    ],
    relatedSlugs: ["crypto-futures-risk-management", "trading-journal-vs-gut-feel", "sync-exchange-trading-journal"],
  },
];

const SLUG_INDEX = new Map<string, BlogPost>();
for (const post of POSTS) {
  SLUG_INDEX.set(`${post.market}:${post.slug}`, post);
}

export function getBlogPost(market: Market, slug: string): BlogPost | null {
  return SLUG_INDEX.get(`${market}:${slug}`) ?? null;
}

export function getBlogPosts(market: Market): BlogPost[] {
  return POSTS.filter((p) => p.market === market).sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export function resolveBlogPost(pathname: string): { market: Market; slug: string } | null {
  const match = pathname.replace(/\/$/, "").match(/^\/blog\/([^/]+)$/);
  if (!match) return null;
  return { market: "br", slug: match[1] }; // market resolved by caller via useMarket
}

export function isBlogIndex(pathname: string): boolean {
  return pathname.replace(/\/$/, "") === "/blog";
}

export function formatBlogDate(iso: string, market: Market): string {
  const locale = market === "us" ? "en-US" : "pt-BR";
  return new Date(iso + "T12:00:00").toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function buildBlogPostMeta(post: BlogPost): SeoMeta {
  const path = `/blog/${post.slug}`;
  return {
    title: `${post.title} | Trackion Blog`,
    description: post.excerpt,
    path,
    keywords: post.keywords,
    jsonLd: [
      buildOrganizationJsonLd(),
      buildBreadcrumbJsonLd([
        { name: "Trackion", path: "/" },
        { name: "Blog", path: "/blog" },
        { name: post.title.slice(0, 60), path },
      ]),
      buildArticleJsonLd({
        title: post.title,
        description: post.excerpt,
        path,
        publishedAt: post.publishedAt,
      }),
    ],
  };
}

export function buildBlogIndexMeta(market: Market): SeoMeta {
  const isUs = market === "us";
  return {
    title: isUs
      ? "Trackion Blog — Crypto Trading, Psychology & Exchange Sync"
      : "Blog Trackion — Trading Crypto, Psicologia & Exchange",
    description: isUs
      ? "Articles on crypto trading journals, Google Trends signals, trading psychology, risk management and exchange API sync. Method over hype."
      : "Artigos sobre trading journal crypto, Google Trends, psicologia de trade, gestão de risco e sync de exchange. Método, não hype.",
    path: "/blog",
    keywords: isUs
      ? ["crypto trading blog", "trading psychology articles", "bitcoin trends", "trading journal tips"]
      : ["blog trading crypto", "psicologia trading", "bitcoin trends", "diário de trades"],
    jsonLd: [
      buildOrganizationJsonLd(),
      buildBreadcrumbJsonLd([
        { name: "Trackion", path: "/" },
        { name: "Blog", path: "/blog" },
      ]),
    ],
  };
}

export function getAllBlogPaths(): string[] {
  const paths = ["/blog"];
  for (const post of POSTS) {
    paths.push(`/blog/${post.slug}`);
  }
  return [...new Set(paths)];
}
