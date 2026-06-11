import type { Market } from "./locale";
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildOrganizationJsonLd,
  buildSoftwareAppJsonLd,
  type SeoMeta,
} from "./seo";

export type SeoPageContent = {
  id: string;
  market: Market;
  paths: string[];
  meta: SeoMeta;
  h1: string;
  subtitle: string;
  sections: { heading: string; body: string }[];
  faq: { q: string; a: string }[];
  cta: string;
  related: { label: string; path: string }[];
};

export const PAGES: SeoPageContent[] = [
  // ── BR ──────────────────────────────────────────────────────────
  {
    id: "br-trading-journal",
    market: "br",
    paths: ["/trading-journal-crypto", "/journal-trading-criptomoeda"],
    meta: {
      title: "Trading Journal para Crypto — Registre Trades com Método | Trackion",
      description:
        "O melhor trading journal para criptomoedas no Brasil. Registre futuros e spot, sincronize Binance/MEXC/Bitget via API e analise win rate, expectancy e drawdown.",
      keywords: [
        "trading journal crypto",
        "diário de trades criptomoeda",
        "journal trading bitcoin",
        "registro de trades crypto",
        "ferramenta trading journal",
      ],
    },
    h1: "Trading journal para crypto — pare de operar no escuro",
    subtitle:
      "Em 2026, buscas por Bitcoin e criptomoedas voltaram ao topo do Google Trends. Quem opera sem journal repete os mesmos erros. O Trackion centraliza cada trade com dados reais.",
    sections: [
      {
        heading: "Por que um trading journal é essencial em crypto?",
        body: "Pesquisas mostram que 64% dos traders retail entram após picos de preço e 63% ignoram stop loss. Um trading journal transforma memória seletiva em dados objetivos: win rate, expectancy, drawdown e padrões por horário, ativo e estratégia.",
      },
      {
        heading: "Futuros, spot e stack BTC no mesmo lugar",
        body: "O Trackion não é planilha genérica. Foi feito para BTCUSDT futures, altcoins e acumulação spot. Tags, notas, screenshots e metas de risco integradas ao seu histórico real de exchange.",
      },
      {
        heading: "Sync automático com exchanges",
        body: "Conecte API read-only da Binance, MEXC ou Bitget uma vez. Trades entram sozinhos — você só analisa. Sem copiar ordem por ordem, sem erro de digitação, sem PnL desatualizado.",
      },
    ],
    faq: [
      {
        q: "O que é um trading journal para crypto?",
        a: "É um diário estruturado onde você registra entradas, saídas, risco, emoção e resultado de cada operação em criptomoedas. O Trackion automatiza isso via API das exchanges.",
      },
      {
        q: "Trading journal substitui planilha de trades?",
        a: "Sim. Planilhas quebram com sync manual e fórmulas frágeis. O Trackion puxa execuções em tempo real e calcula métricas profissionais automaticamente.",
      },
    ],
    cta: "Começar trial Elite 14 dias",
    related: [
      { label: "Psicologia do trading", path: "/psicologia-do-trading" },
      { label: "Gestão de risco crypto", path: "/gestao-de-risco-crypto" },
      { label: "Futuros crypto", path: "/futuros-crypto" },
    ],
  },
  {
    id: "br-diario-trades",
    market: "br",
    paths: ["/diario-de-trades", "/diario-trades-criptomoeda", "/controle-operacoes-crypto", "/historico-trades-crypto"],
    meta: {
      title: "Diário de Trades para Criptomoedas — Registro Automático | Trackion",
      description:
        "Diário de trades profissional para crypto. Sync Binance, Bitget e MEXC, análise de performance, tags e revisão sistemática. Trial 14 dias grátis.",
      keywords: ["diário de trades", "diario de trades crypto", "registro trades bitcoin", "log de operações crypto"],
    },
    h1: "Diário de trades: a base da consistência em criptomoedas",
    subtitle:
      "Google Trends mostra picos de interesse em Bitcoin durante quedas — medo gera buscas, mas só disciplina gera resultado. Um diário de trades sério separa emoção de processo.",
    sections: [
      {
        heading: "O que registrar em cada trade",
        body: "Ativo, direção, tamanho, R:R, motivo da entrada, resultado e estado emocional. O Trackion captura execuções via API e permite anexar contexto que planilhas não guardam.",
      },
      {
        heading: "Revisão semanal que muda comportamento",
        body: "Filtre por dia da semana, horário ou estratégia. Descubra se você perde mais às segundas ou após três wins seguidos. Dados expõem vieses que psicologia de trade sozinha não corrige.",
      },
    ],
    faq: [
      {
        q: "Diário de trades é só para day trade?",
        a: "Não. Serve para scalping, swing, futuros, spot e DCA. Qualquer operação em exchange merece registro para medir expectancy real.",
      },
    ],
    cta: "Criar meu diário de trades",
    related: [
      { label: "Trading journal crypto", path: "/trading-journal-crypto" },
      { label: "Análise de performance", path: "/analise-performance-trading" },
    ],
  },
  {
    id: "br-psicologia",
    market: "br",
    paths: ["/psicologia-do-trading", "/psicologia-trading-criptomoeda"],
    meta: {
      title: "Psicologia do Trading em Crypto — FOMO, Disciplina & Dados | Trackion",
      description:
        "Domine a psicologia do trading em criptomoedas. Pare FOMO, revenge trade e overtrading com journal, metas de risco e métricas reais. Trackion — método antes da emoção.",
      keywords: [
        "psicologia do trading",
        "psicologia trading crypto",
        "FOMO criptomoeda",
        "disciplina trading",
        "revenge trade",
        "emoção no trading",
      ],
    },
    h1: "Psicologia de trade: quando o mercado testa sua mente",
    subtitle:
      "Buscas por 'bitcoin zero' bateram recorde em 2026 — medo extremo é sinal de atenção retail, não de método. Trackion coloca regras antes da emoção.",
    sections: [
      {
        heading: "FOMO, medo e revenge trade em números",
        body: "Sua memória minimiza losses e infla wins. O journal mostra a verdade: quantos trades foram impulsivos, quanto custou dobrar mão após stop, qual seu drawdown real.",
      },
      {
        heading: "Limites de risco que protegem capital e mente",
        body: "Defina teto diário de perda e receba alerta antes de virar tilt. Metas semanais e mensais criam ritmo — você para quando o plano manda, não quando a dor decide.",
      },
      {
        heading: "Disciplina nasce de revisão, não de motivação",
        body: "Traders consistentes revisam dados, não feeds. Win rate, expectancy e horários ruins viram regras escritas. Psicologia de trade funciona quando há processo mensurável.",
      },
    ],
    faq: [
      {
        q: "Como melhorar psicologia no trading de crypto?",
        a: "Registre cada trade, defina risco máximo por dia, revise padrões semanais e nunca opere sem plano. O Trackion automatiza registro e expõe vieses com relatórios.",
      },
      {
        q: "FOMO em Bitcoin: como evitar?",
        a: "Use checklist pré-trade, limite de exposição e journal para ver quantas entradas tardias você já pagou. Dados frios cortam euforia de comprar no topo.",
      },
    ],
    cta: "Trocar impulso por método",
    related: [
      { label: "FOMO trading", path: "/fomo-trading" },
      { label: "Gestão de risco", path: "/gestao-de-risco-crypto" },
    ],
  },
  {
    id: "br-risco",
    market: "br",
    paths: ["/gestao-de-risco-crypto", "/gerenciamento-risco-criptomoeda"],
    meta: {
      title: "Gestão de Risco em Crypto — Stop Loss, Drawdown & Metas | Trackion",
      description:
        "Gestão de risco para trading de criptomoedas: limites diários, drawdown, position sizing e alertas. Journal com sync de exchange. Trial Elite grátis.",
      keywords: [
        "gestão de risco crypto",
        "gerenciamento de risco trading",
        "stop loss bitcoin",
        "drawdown trading",
        "position sizing crypto",
      ],
    },
    h1: "Gestão de risco em crypto: sobreviva para operar amanhã",
    subtitle:
      "Leverage em futuros amplifica erro emocional. Sem gestão de risco, cada busca por 'comprar bitcoin' vira aposta. Trackion mede e limita exposição com dados da sua conta.",
    sections: [
      {
        heading: "Drawdown visível, não escondido",
        body: "Veja equity curve e drawdown máximo em tempo real. Saber quanto já perdeu do pico evita recuperação impossível com alavancagem crescente.",
      },
      {
        heading: "Metas de risco por sessão",
        body: "Configure perda máxima diária e receba feedback antes de ultrapassar. Risco não é só stop na ordem — é teto de exposição no dia.",
      },
    ],
    faq: [
      {
        q: "Qual gestão de risco usar em futuros crypto?",
        a: "Risco fixo por trade (1-2% do capital), stop obrigatório, limite diário de loss e journal para auditar violações. O Trackion rastreia tudo automaticamente.",
      },
    ],
    cta: "Proteger capital com método",
    related: [
      { label: "Futuros crypto", path: "/futuros-crypto" },
      { label: "Psicologia do trading", path: "/psicologia-do-trading" },
    ],
  },
  {
    id: "br-futuros",
    market: "br",
    paths: ["/futuros-crypto", "/trading-futuros-criptomoeda"],
    meta: {
      title: "Trading de Futuros Crypto — Journal, Sync & Analytics | Trackion",
      description:
        "Journal especializado em futuros crypto (BTCUSDT, altcoins). Sync Binance, MEXC, Bitget. Win rate, funding, PnL consolidado. 14 dias Elite grátis.",
      keywords: [
        "futuros crypto",
        "trading futuros bitcoin",
        "BTCUSDT futures",
        "perpetual futures journal",
        "futuros criptomoeda",
      ],
    },
    h1: "Futuros crypto exigem journal — alavancagem não perdoa",
    subtitle:
      "Interesse em Bitcoin disparou nas buscas durante volatilidade de 2026. Em futuros, cada movimento é amplificado. Registre, meça e ajuste com sync direto da exchange.",
    sections: [
      {
        heading: "PnL real da conta, não da calculadora",
        body: "API read-only importa execuções com fees e funding refletidos. Seu journal mostra o que a corretora cobrou — não o PnL imaginário da planilha.",
      },
      {
        heading: "Multi-exchange em um dashboard",
        body: "Opera MEXC, Binance e Bitget? PnL consolidado, métricas globais e histórico único. Pare de somar abas de browser.",
      },
    ],
    faq: [
      {
        q: "Trackion funciona com futuros perpétuos?",
        a: "Sim. Suportamos futuros USDT-M nas exchanges integradas, com sync de execuções e relatórios por par e estratégia.",
      },
    ],
    cta: "Journal para futuros crypto",
    related: [
      { label: "Sync exchange", path: "/sincronizar-exchange-crypto" },
      { label: "Journal Binance", path: "/journal-binance" },
    ],
  },
  {
    id: "br-exchange-sync",
    market: "br",
    paths: ["/sincronizar-exchange-crypto", "/api-exchange-criptomoeda"],
    meta: {
      title: "Sincronizar Exchange Crypto via API — Binance, MEXC, Bitget | Trackion",
      description:
        "Sincronize trades de exchange crypto automaticamente. API read-only para Binance, MEXC e Bitget. Sem permissão de saque. Journal sempre atualizado.",
      keywords: [
        "sincronizar exchange",
        "API exchange crypto",
        "importar trades binance",
        "sync bitget",
        "sync mexc",
        "exchange read only",
      ],
    },
    h1: "Sync de exchange: trades entram sozinhos no journal",
    subtitle:
      "Cadastro manual é onde nascem erros de PnL. Conecte API read-only uma vez e o Trackion monta histórico enquanto o mercado se mexe.",
    sections: [
      {
        heading: "Segurança: somente leitura",
        body: "Nunca pedimos permissão de withdraw ou execução. Suas chaves só leem histórico de trades. Revogue quando quiser na própria exchange.",
      },
      {
        heading: "Binance, MEXC, Bitget — Bybit e OKX em breve",
        body: "Cobertura das exchanges que traders BR e global mais usam. Multi-conta, spot e futuros no mesmo painel.",
      },
    ],
    faq: [
      {
        q: "É seguro conectar API da exchange?",
        a: "Sim, se for read-only. O Trackion usa apenas permissão de leitura — sem risco de saque ou ordens não autorizadas.",
      },
    ],
    cta: "Conectar minha exchange",
    related: [
      { label: "Journal Binance", path: "/journal-binance" },
      { label: "Journal MEXC", path: "/journal-mexc" },
    ],
  },
  {
    id: "br-binance",
    market: "br",
    paths: ["/journal-binance", "/trading-journal-binance", "/diario-trades-binance", "/controle-trades-binance"],
    meta: {
      title: "Trading Journal Binance — Sync API & Analytics | Trackion",
      description:
        "Journal para Binance com sync automático via API read-only. Futuros e spot, win rate, drawdown e stack BTC. Trial 14 dias grátis.",
      keywords: ["journal binance", "trading journal binance", "importar trades binance", "binance futures journal"],
    },
    h1: "Trading journal para Binance — sync automático",
    subtitle: "A exchange mais buscada do mundo merece um journal à altura. Importe execuções, analise performance e gerencie risco sem planilha.",
    sections: [
      {
        heading: "Spot + futuros USDT-M",
        body: "Um conector, histórico completo. PnL separado por mercado ou consolidado — você escolhe como revisar.",
      },
    ],
    faq: [
      { q: "Trackion importa histórico antigo da Binance?", a: "Sim, após conectar a API o sistema sincroniza execuções disponíveis na conta." },
    ],
    cta: "Conectar Binance",
    related: [{ label: "Sync exchange", path: "/sincronizar-exchange-crypto" }],
  },
  {
    id: "br-bitget",
    market: "br",
    paths: ["/journal-bitget", "/diario-trades-bitget", "/controle-trades-bitget"],
    meta: {
      title: "Trading Journal Bitget — Sync API Automático | Trackion",
      description: "Journal Bitget com importação automática de trades via API. Futuros, spot, métricas e gestão de risco integrados.",
      keywords: ["journal bitget", "bitget trading log", "sync bitget api"],
    },
    h1: "Journal Bitget com sync em tempo real",
    subtitle: "Traders de futuros na Bitget centralizam execuções, tags e relatórios no Trackion.",
    sections: [
      { heading: "API read-only", body: "Conecte uma vez. Cada fill aparece no journal com timestamp e PnL correto." },
    ],
    faq: [],
    cta: "Conectar Bitget",
    related: [{ label: "Futuros crypto", path: "/futuros-crypto" }],
  },
  {
    id: "br-mexc",
    market: "br",
    paths: ["/journal-mexc", "/diario-trades-mexc", "/controle-trades-mexc"],
    meta: {
      title: "Trading Journal MEXC — Registro Automático de Trades | Trackion",
      description: "Diário de trades MEXC com sync API. Futuros e spot, analytics profissional. 14 dias Elite grátis.",
      keywords: ["journal mexc", "mexc trading journal", "sync mexc"],
    },
    h1: "Trading journal MEXC — pare de copiar trades na mão",
    subtitle: "MEXC é hub de altcoins e futuros. O Trackion puxa cada execução para análise séria.",
    sections: [
      { heading: "Altcoins e BTC", body: "Filtre por par, meça win rate por ativo e descubra onde você realmente tem edge." },
    ],
    faq: [],
    cta: "Conectar MEXC",
    related: [{ label: "Sync exchange", path: "/sincronizar-exchange-crypto" }],
  },
  {
    id: "br-btc-stack",
    market: "br",
    paths: ["/acumular-bitcoin", "/stack-btc"],
    meta: {
      title: "Acumular Bitcoin com Método — Stack BTC & Trading Journal | Trackion",
      description:
        "Acompanhe stack BTC enquanto opera futuros. Separe trading de acumulação, meça PnL e construa reserva em Bitcoin com dados.",
      keywords: ["acumular bitcoin", "stack btc", "comprar bitcoin método", "DCA bitcoin tracking"],
    },
    h1: "Acumular Bitcoin sem misturar com trade impulsivo",
    subtitle:
      "Buscas por 'comprar bitcoin' disparam na volatilidade. Trackion separa stack spot de PnL de futuros — duas estratégias, um painel.",
    sections: [
      {
        heading: "Trading para pagar, stack para guardar",
        body: "Defina quanto do lucso de futuros vai para acumulação BTC. Veja evolução do stack ao lado do equity de trading.",
      },
    ],
    faq: [
      {
        q: "Posso rastrear compras spot de BTC?",
        a: "Sim. Trades spot importados via API alimentam visão de acumulação e custo médio.",
      },
    ],
    cta: "Organizar stack e trades",
    related: [{ label: "Trading journal", path: "/trading-journal-crypto" }],
  },
  {
    id: "br-analytics",
    market: "br",
    paths: ["/analise-performance-trading", "/metricas-trading-crypto"],
    meta: {
      title: "Análise de Performance em Trading Crypto — Win Rate & Expectancy | Trackion",
      description:
        "Analytics profissional para crypto: win rate, expectancy, drawdown, equity curve e relatórios por estratégia. Sync exchange automático.",
      keywords: [
        "análise de performance trading",
        "win rate crypto",
        "expectancy trading",
        "equity curve bitcoin",
        "métricas trading",
      ],
    },
    h1: "Análise de performance: números que traders retail ignoram",
    subtitle: "Win rate sozinho mente. Expectancy, R:R médio e drawdown contam a história real. O Trackion calcula tudo do histórico da exchange.",
    sections: [
      {
        heading: "Métricas de fundo de hedge, na sua mesa",
        body: "Dashboard com win rate, profit factor, expectancy, maior sequência de loss e evolução de capital — atualizado a cada sync.",
      },
      {
        heading: "Relatórios que revelam padrões",
        body: "Filtre por tag, dia, horário ou ativo. Descubra onde está seu edge real e onde você doa dinheiro ao mercado.",
      },
    ],
    faq: [
      {
        q: "O que é expectancy em trading?",
        a: "É o lucro médio esperado por trade ao longo do tempo. Expectancy positiva com gestão de risco = processo sustentável.",
      },
    ],
    cta: "Ver minhas métricas reais",
    related: [{ label: "Diário de trades", path: "/diario-de-trades" }],
  },
  {
    id: "br-fomo",
    market: "br",
    paths: ["/fomo-trading", "/fomo-criptomoeda"],
    meta: {
      title: "FOMO no Trading de Crypto — Como Parar de Comprar no Topo | Trackion",
      description:
        "Vença FOMO em criptomoedas com journal, limites de risco e revisão de trades impulsivos. Dados cortam euforia. Trackion — 14 dias grátis.",
      keywords: ["FOMO trading", "FOMO criptomoeda", "comprar no topo bitcoin", "trading impulsivo crypto"],
    },
    h1: "FOMO em crypto: o inimigo que Google Trends mede, mas não resolve",
    subtitle: "Picos de busca por Bitcoin coincidem com euforia e pânico. FOMO entra no journal como tag — e os números mostram o preço da impulsividade.",
    sections: [
      {
        heading: "Tagueie trades emocionais",
        body: "Marque entradas FOMO e compare expectancy delas vs. trades planejados. A diferença assusta — e educa.",
      },
    ],
    faq: [],
    cta: "Medir custo do FOMO",
    related: [{ label: "Psicologia do trading", path: "/psicologia-do-trading" }],
  },
  {
    id: "br-planilha",
    market: "br",
    paths: ["/planilha-trades-crypto", "/substituir-planilha-trading", "/planilha-de-trades", "/excel-trading-crypto"],
    meta: {
      title: "Substitua Planilha de Trades Crypto — Journal Automático | Trackion",
      description:
        "Cansado de planilha de trades? Sync automático com exchange, métricas prontas e zero fórmula quebrada. Migre para o Trackion — trial 14 dias grátis.",
      keywords: [
        "planilha de trades",
        "planilha trading crypto",
        "substituir planilha trades",
        "excel trading bitcoin",
        "planilha excel trading",
        "substituir excel trading",
      ],
    },
    h1: "Planilha de trades crypto chegou ao limite?",
    subtitle: "Planilhas não sincronizam com exchange, quebram com fees e não lembram seu estado emocional. Hora de um journal feito para crypto.",
    sections: [
      {
        heading: "Zero manutenção de fórmula",
        body: "API importa trades. Dashboard calcula win rate e drawdown. Você revisa estratégia, não VLOOKUP.",
      },
    ],
    faq: [],
    cta: "Migrar da planilha",
    related: [{ label: "Trading journal", path: "/trading-journal-crypto" }],
  },
  {
    id: "br-planilha-trading",
    market: "br",
    paths: ["/planilha-de-trading", "/planilha-day-trade", "/planilha-trading-excel"],
    meta: {
      title: "Planilha de Trading Crypto — Alternativa Automática ao Excel | Trackion",
      description:
        "Substitua sua planilha de trading por um journal com sync Binance, MEXC e Bitget. Win rate, PnL e drawdown prontos — sem fórmula quebrada. Trial 14 dias grátis.",
      keywords: [
        "planilha de trading",
        "planilha day trade",
        "planilha trading excel",
        "planilha day trade crypto",
        "controle day trade",
        "planilha operacional trading",
      ],
    },
    h1: "Planilha de trading: quando Excel não aguenta mais",
    subtitle:
      "Day trade crypto gera dezenas de execuções por dia. Planilha manual atrasa revisão, distorce PnL e não sincroniza com a exchange. O Trackion importa trades via API e calcula tudo automaticamente.",
    sections: [
      {
        heading: "Por que traders abandonam planilha de trading",
        body: "Fees, funding, múltiplas exchanges e centenas de linhas por mês quebram qualquer Excel. Um fill esquecido distorce win rate; um fee ignorado infla lucro. Journal com sync elimina erro humano.",
      },
      {
        heading: "Do day trade à revisão semanal em minutos",
        body: "Conecte API read-only da Binance, MEXC ou Bitget. Trades entram sozinhos, dashboard mostra expectancy e drawdown. Você analisa edge — não mantém fórmula.",
      },
      {
        heading: "Trial grátis para migrar sem risco",
        body: "14 dias Elite sem cartão. Importe histórico, compare com sua planilha por duas semanas e decida com números reais — não com promessa de template.",
      },
    ],
    faq: [
      {
        q: "Planilha de trading ou journal: qual escolher?",
        a: "Planilha serve para poucos trades manuais. Se você day trade crypto ou opera futuros com volume, journal com sync de exchange economiza horas e entrega PnL confiável.",
      },
      {
        q: "Posso exportar dados do Trackion?",
        a: "Sim. Seu histórico fica disponível para revisão e você mantém controle total — o journal substitui a planilha, não prende seus dados.",
      },
    ],
    cta: "Substituir planilha de trading",
    related: [
      { label: "Planilha de trades crypto", path: "/planilha-trades-crypto" },
      { label: "Day trade crypto", path: "/day-trade-crypto" },
    ],
  },
  {
    id: "br-day-trade",
    market: "br",
    paths: ["/day-trade-crypto", "/day-trade-criptomoedas", "/journal-day-trade"],
    meta: {
      title: "Day Trade Crypto — Journal com Sync Automático | Trackion",
      description:
        "Controle day trade de criptomoedas sem planilha. Sync Binance, MEXC e Bitget, win rate, drawdown e limites de risco. Trial Elite 14 dias grátis.",
      keywords: [
        "day trade crypto",
        "day trade criptomoedas",
        "day trade bitcoin",
        "journal day trade",
        "controle day trade",
        "day trade futuros",
      ],
    },
    h1: "Day trade crypto exige registro — ou você repete erro",
    subtitle:
      "Day trade de criptomoedas é volume alto, mercado 24/7 e alavancagem em futuros. Sem journal estruturado, cada sessão vira amnésia seletiva. Trackion registra cada fill automaticamente.",
    sections: [
      {
        heading: "Volume que planilha não acompanha",
        body: "Scalping e day trade geram dezenas de execuções por sessão. Copiar ordem por ordem atrasa revisão e distorce métricas. API read-only importa tudo em tempo real.",
      },
      {
        heading: "Limites de risco para sessão de day trade",
        body: "Configure perda máxima diária e pare antes do tilt. Day trade sem teto de loss é roleta — journal audita se você obedeceu às regras.",
      },
    ],
    faq: [
      {
        q: "Trackion serve para day trade e swing?",
        a: "Sim. Qualquer operação em exchange — scalping, day trade, swing ou futuros — entra no journal com tags, notas e métricas por estratégia.",
      },
    ],
    cta: "Começar day trade com método",
    related: [
      { label: "Planilha de trading", path: "/planilha-de-trading" },
      { label: "Futuros crypto", path: "/futuros-crypto" },
    ],
  },
  {
    id: "br-controle-trades",
    market: "br",
    paths: ["/controle-trades-crypto", "/registrar-trades-bitcoin", "/log-trades-criptomoeda"],
    meta: {
      title: "Controle de Trades Crypto — Registro Automático | Trackion",
      description:
        "Controle trades de Bitcoin e altcoins com sync de exchange. Registro automático, PnL real, win rate e drawdown. Sem planilha manual — trial 14 dias grátis.",
      keywords: [
        "controle de trades",
        "controle trades crypto",
        "registrar trades bitcoin",
        "log trades criptomoeda",
        "controle operações crypto",
        "registro trades automático",
      ],
    },
    h1: "Controle de trades crypto sem planilha manual",
    subtitle:
      "Registrar trades bitcoin e altcoins na mão é onde nasce erro de PnL. Trackion puxa execuções da exchange e monta histórico confiável para revisão e gestão de risco.",
    sections: [
      {
        heading: "Registro automático via API",
        body: "Binance, MEXC e Bitget conectam com permissão read-only. Cada fill aparece no journal com timestamp, fee e PnL — zero digitação.",
      },
      {
        heading: "Controle multi-exchange em um painel",
        body: "Opera em mais de uma corretora? PnL consolidado, drawdown global e expectancy por exchange — sem somar abas de browser.",
      },
    ],
    faq: [
      {
        q: "Como registrar trades de crypto automaticamente?",
        a: "Conecte API read-only da sua exchange ao Trackion. O sistema importa execuções passadas e novas, calculando métricas sem cadastro manual.",
      },
    ],
    cta: "Controlar meus trades",
    related: [
      { label: "Diário de trades", path: "/diario-de-trades" },
      { label: "Sync exchange", path: "/sincronizar-exchange-crypto" },
    ],
  },
  {
    id: "br-journal-brasil",
    market: "br",
    paths: ["/trading-journal-brasil", "/journal-trading-brasil", "/ferramenta-trading-brasil"],
    meta: {
      title: "Trading Journal Brasil — Diário de Trades Crypto | Trackion",
      description:
        "Trading journal feito para traders no Brasil. Sync Binance, MEXC e Bitget, futuros USDT, gestão de risco e psicologia de trade. Trial 14 dias grátis.",
      keywords: [
        "trading journal brasil",
        "journal trading brasil",
        "diário trades brasil",
        "ferramenta trading brasil",
        "app trading crypto brasil",
        "journal criptomoedas brasil",
      ],
    },
    h1: "Trading journal para traders no Brasil",
    subtitle:
      "Traders BR operam futuros USDT, altcoins e stack BTC em exchanges globais. O Trackion foi feito para esse perfil — sync automático, métricas profissionais e trial sem cartão.",
    sections: [
      {
        heading: "Binance, MEXC e Bitget — as exchanges que BR usa",
        body: "Integração read-only com as corretoras mais populares entre traders brasileiros. Histórico unificado, PnL com fees reais e relatórios por par.",
      },
      {
        heading: "Método antes do feeling",
        body: "Journal não é luxo — é sobrevivência em mercado 24/7. Win rate, expectancy e revisão semanal separam quem evolui de quem repete ciclo de euforia e loss.",
      },
    ],
    faq: [
      {
        q: "Qual o melhor trading journal no Brasil?",
        a: "Um que sincronize exchanges sem planilha, calcule win rate e drawdown automaticamente e tenha foco em futuros crypto. O Trackion cobre esse perfil com trial grátis.",
      },
    ],
    cta: "Testar journal no Brasil",
    related: [
      { label: "Trading journal crypto", path: "/trading-journal-crypto" },
      { label: "Planilha de trading", path: "/planilha-de-trading" },
    ],
  },
  {
    id: "br-pnl",
    market: "br",
    paths: ["/controle-pnl-crypto", "/calcular-lucro-trades-crypto", "/pnl-trading-bitcoin"],
    meta: {
      title: "Controle de PnL Crypto — Lucro Real por Trade | Trackion",
      description:
        "Calcule PnL de trades crypto com fees e funding incluídos. Sync automático Binance, MEXC e Bitget. Equity curve e drawdown prontos. Trial grátis.",
      keywords: [
        "controle pnl crypto",
        "calcular lucro trades",
        "pnl trading bitcoin",
        "lucro trades criptomoeda",
        "pnl futuros crypto",
        "resultado trades exchange",
      ],
    },
    h1: "Controle de PnL crypto: lucro real, não calculadora",
    subtitle:
      "PnL de futuros crypto inclui fees, funding e slippage. Planilha e calculadora ignoram metade disso. Trackion importa execuções reais da exchange e mostra resultado verdadeiro.",
    sections: [
      {
        heading: "PnL consolidado multi-exchange",
        body: "Some contas Binance, MEXC e Bitget em um dashboard. Saiba se o mês foi positivo de verdade — não por aba verde no browser.",
      },
      {
        heading: "Equity curve e drawdown visíveis",
        body: "Lucro acumulado ao longo do tempo, max drawdown e sequências de loss. PnL isolado por trade mente; curva de equity conta a história completa.",
      },
    ],
    faq: [],
    cta: "Ver meu PnL real",
    related: [
      { label: "Análise de performance", path: "/analise-performance-trading" },
      { label: "Controle de trades", path: "/controle-trades-crypto" },
    ],
  },
  {
    id: "br-win-rate",
    market: "br",
    paths: ["/win-rate-trading-crypto", "/calculadora-win-rate-trading"],
    meta: {
      title: "Win Rate Trading Crypto — Calcule Automaticamente | Trackion",
      description:
        "Calcule win rate de trades crypto a partir do histórico da exchange. Filtros por par, horário e estratégia. Expectancy e drawdown inclusos. Trial grátis.",
      keywords: [
        "win rate trading",
        "win rate crypto",
        "calcular win rate",
        "taxa de acerto trading",
        "win rate futuros",
        "win rate bitcoin",
      ],
    },
    h1: "Win rate em trading crypto: calcule de verdade",
    subtitle:
      "Win rate alto sozinho engana — mas sem ele você não enxerga padrão nenhum. Trackion calcula taxa de acerto, expectancy e profit factor do histórico syncado.",
    sections: [
      {
        heading: "Win rate por contexto",
        body: "Filtre por par, horário, dia da semana ou tag de setup. Talvez você acerte 70% em BTCUSDT de manhã e perca em altcoins à noite — sem filtro, mistura tudo.",
      },
      {
        heading: "Win rate + expectancy = decisão",
        body: "Taxa de acerto com R:R ruim ainda quebra conta. Dashboard mostra win rate junto com expectancy e drawdown — as três métricas que importam.",
      },
    ],
    faq: [
      {
        q: "Qual win rate é bom em crypto?",
        a: "Depende do R:R médio. 40% de acerto com expectancy positiva pode ser excelente; 70% com losses grandes ainda quebra. Meça expectancy, não só taxa de acerto.",
      },
    ],
    cta: "Calcular meu win rate",
    related: [{ label: "Análise de performance", path: "/analise-performance-trading" }],
  },
  {
    id: "br-ferramenta",
    market: "br",
    paths: ["/ferramenta-trading-crypto", "/app-controle-trades", "/software-trading-crypto"],
    meta: {
      title: "Ferramenta de Trading Crypto — Journal Profissional | Trackion",
      description:
        "Software para controle de trades crypto: sync exchange, analytics, gestão de risco e psicologia de trade. Substituí planilha Excel. Trial 14 dias grátis.",
      keywords: [
        "ferramenta trading crypto",
        "app controle trades",
        "software trading criptomoedas",
        "ferramenta day trade",
        "app trading journal",
        "plataforma trading crypto",
      ],
    },
    h1: "Ferramenta de trading crypto feita para operar de verdade",
    subtitle:
      "App genérico não sincroniza exchange; planilha não escala. Trackion é software de journal com sync Binance/MEXC/Bitget, métricas profissionais e metas de risco integradas.",
    sections: [
      {
        heading: "Tudo que planilha promete — sem manutenção",
        body: "Win rate, drawdown, equity curve, tags emocionais, screenshots de setup e revisão semanal. Um produto coeso, não três planilhas que nunca batem PnL.",
      },
      {
        heading: "Trial Elite sem cartão",
        body: "14 dias grátis para testar se a ferramenta muda sua rotina de revisão. Conecte exchange, importe histórico e compare com seu fluxo atual.",
      },
    ],
    faq: [],
    cta: "Testar ferramenta grátis",
    related: [
      { label: "Trading journal Brasil", path: "/trading-journal-brasil" },
      { label: "Substituir planilha", path: "/planilha-trades-crypto" },
    ],
  },
  {
    id: "br-scalping",
    market: "br",
    paths: ["/journal-scalping-crypto", "/scalping-bitcoin", "/scalping-criptomoedas"],
    meta: {
      title: "Journal para Scalping Crypto — Registro em Tempo Real | Trackion",
      description:
        "Scalping bitcoin e altcoins exige registro rápido. Sync automático de execuções, win rate por sessão e controle de risco. Trial Trackion 14 dias grátis.",
      keywords: [
        "scalping crypto",
        "scalping bitcoin",
        "journal scalping",
        "scalping criptomoedas",
        "registro scalping",
        "scalping futuros",
      ],
    },
    h1: "Scalping crypto: journal que acompanha o ritmo",
    subtitle:
      "Scalping gera volume extremo de execuções. Registrar na mão é impossível; revisar sem dados é inútil. Trackion importa fills em tempo real para análise pós-sessão.",
    sections: [
      {
        heading: "Centenas de trades, zero digitação",
        body: "API read-only captura cada fill com fee e timestamp. Revise sessão de scalping com win rate, expectancy e horários — não com memória falha.",
      },
    ],
    faq: [],
    cta: "Journal para scalping",
    related: [
      { label: "Day trade crypto", path: "/day-trade-crypto" },
      { label: "Futuros crypto", path: "/futuros-crypto" },
    ],
  },
  {
    id: "br-revenge",
    market: "br",
    paths: ["/revenge-trade-crypto", "/overtrading-crypto", "/tilt-trading-criptomoedas"],
    meta: {
      title: "Revenge Trade e Overtrading em Crypto — Pare com Dados | Trackion",
      description:
        "Pare revenge trade e overtrading em criptomoedas. Limites diários, tags emocionais e journal que expõe padrão destrutivo. Trial Trackion 14 dias grátis.",
      keywords: [
        "revenge trade",
        "overtrading crypto",
        "tilt trading",
        "revenge trade criptomoeda",
        "operar no impulso crypto",
        "disciplina day trade",
      ],
    },
    h1: "Revenge trade: o journal mostra o que emoção esconde",
    subtitle:
      "Dobrar mão após stop, overtrading após win, operar no tilt — padrões repetidos que planilha não tagueia. Trackion marca contexto emocional e mede custo real.",
    sections: [
      {
        heading: "Limite diário como freio",
        body: "Configure perda máxima por sessão e pare quando atingir. Mercado abre amanhã; conta zerada não. Journal audita quantas vezes você violou a regra.",
      },
      {
        heading: "Tags emocionais revelam padrão",
        body: "Marque trades como revenge, FOMO ou tilt. Compare expectancy delas vs. setups planejados — a diferença educa mais que qualquer thread.",
      },
    ],
    faq: [],
    cta: "Controlar revenge trade",
    related: [
      { label: "Psicologia do trading", path: "/psicologia-do-trading" },
      { label: "FOMO trading", path: "/fomo-trading" },
    ],
  },
  {
    id: "br-expectancy",
    market: "br",
    paths: ["/expectancy-trading-crypto", "/profit-factor-trading", "/metricas-trading-profissional"],
    meta: {
      title: "Expectancy e Profit Factor em Trading Crypto | Trackion",
      description:
        "Calcule expectancy e profit factor de trades crypto automaticamente. Sync exchange, filtros por estratégia e drawdown. Trial Elite 14 dias grátis.",
      keywords: [
        "expectancy trading",
        "profit factor trading",
        "expectancy crypto",
        "métricas trading profissional",
        "expectativa matemática trading",
        "profit factor criptomoeda",
      ],
    },
    h1: "Expectancy: a métrica que separa método de sorte",
    subtitle:
      "Win rate impressiona; expectancy decide se você sobrevive. Trackion calcula lucro médio esperado por trade, profit factor e drawdown do histórico real da exchange.",
    sections: [
      {
        heading: "Expectancy positiva com risco controlado",
        body: "Processo sustentável = expectancy positiva + drawdown tolerável. Dashboard atualiza a cada sync — você vê se estratégia evolui ou estagnou.",
      },
    ],
    faq: [
      {
        q: "O que é expectancy em trading?",
        a: "Lucro médio esperado por operação ao longo do tempo. Positiva com gestão de risco indica edge real; negativa com win rate alto indica ilusão.",
      },
    ],
    cta: "Ver minha expectancy",
    related: [{ label: "Win rate trading", path: "/win-rate-trading-crypto" }],
  },
  {
    id: "br-darf",
    market: "br",
    paths: ["/controle-trades-darf", "/day-trade-imposto-renda", "/organizar-trades-ir"],
    meta: {
      title: "Controle de Trades para DARF e IR — Day Trade Crypto | Trackion",
      description:
        "Organize trades crypto para declaração de IR e DARF de day trade. Histórico confiável via sync de exchange, PnL por mês e exportação. Trial grátis.",
      keywords: [
        "controle trades darf",
        "day trade imposto renda",
        "declarar trades crypto",
        "ir day trade crypto",
        "organizar trades imposto",
        "controle operações ir",
      ],
    },
    h1: "Controle de trades para DARF e IR: histórico que confia",
    subtitle:
      "Day trade crypto exige organização para imposto de renda. Planilha desatualizada gera erro na DARF. Trackion mantém histórico syncado com PnL real por período.",
    sections: [
      {
        heading: "Histórico confiável por mês",
        body: "Execuções importadas da exchange com fees refletidos. Filtre por mês, exchange e par para consolidar resultado — base sólida para contador ou declaração.",
      },
      {
        heading: "Menos planilha, menos erro na DARF",
        body: "PnL que bate com extrato da corretora reduz surpresa na hora do IR. Journal atualizado diariamente, não 'quando sobra tempo'.",
      },
    ],
    faq: [
      {
        q: "Trackion substitui contador?",
        a: "Não. Trackion organiza histórico e PnL de trades; consulte contador para DARF e declaração de IR conforme legislação vigente.",
      },
    ],
    cta: "Organizar trades para IR",
    related: [
      { label: "Controle de trades", path: "/controle-trades-crypto" },
      { label: "Day trade crypto", path: "/day-trade-crypto" },
    ],
  },

  {
    id: "br-cripto-geral",
    market: "br",
    paths: ["/criptomoeda-trading", "/trading-criptomoedas"],
    meta: {
      title: "Trading de Criptomoedas com Método — Journal & Exchange Sync | Trackion",
      description:
        "Plataforma completa para trading de criptomoedas: journal, sync exchange, psicologia, risco e stack BTC. Bitcoin, altcoins e futuros.",
      keywords: [
        "trading criptomoedas",
        "criptomoeda",
        "operar bitcoin",
        "comprar crypto método",
        "trading crypto brasil",
      ],
    },
    h1: "Trading de criptomoedas: método vence hype",
    subtitle:
      "Interesse em crypto nas buscas oscila com macro e preço — traders consistentes oscilam menos porque têm processo. Trackion é esse processo.",
    sections: [
      {
        heading: "Bitcoin, altcoins e futuros",
        body: "Um journal para todo o ecossistema crypto que você opera. Métricas unificadas, risco controlado, stack BTC visível.",
      },
    ],
    faq: [],
    cta: "Operar crypto com método",
    related: [
      { label: "Trading journal", path: "/trading-journal-crypto" },
      { label: "Criptomoeda", path: "/criptomoeda-trading" },
    ],
  },

  // ── US / EN ─────────────────────────────────────────────────────
  {
    id: "us-crypto-journal",
    market: "us",
    paths: ["/crypto-trading-journal", "/cryptocurrency-trading-journal"],
    meta: {
      title: "Crypto Trading Journal — #1 Trade Log with Exchange Sync | Trackion",
      description:
        "The crypto trading journal built for serious traders. Auto-sync Binance, MEXC & Bitget. Win rate, expectancy, drawdown & BTC stack. 14-day Elite trial.",
      keywords: [
        "crypto trading journal",
        "cryptocurrency trading log",
        "bitcoin trade tracker",
        "crypto trade diary",
        "best trading journal crypto",
      ],
    },
    h1: "Crypto trading journal — stop trading blind",
    subtitle:
      "Google Trends shows Bitcoin searches at 12-month highs during 2026 volatility. Traders without a journal repeat the same mistakes. Trackion turns every execution into data.",
    sections: [
      {
        heading: "Why every crypto trader needs a journal",
        body: "64% of retail traders enter after price spikes; 63% ignore stop losses. A trading journal replaces selective memory with win rate, expectancy, drawdown and pattern analysis.",
      },
      {
        heading: "Futures, spot & BTC stack in one product",
        body: "Built for BTCUSDT perps, altcoins and spot accumulation — not a generic spreadsheet. Tags, notes, screenshots and risk goals tied to real exchange history.",
      },
    ],
    faq: [
      {
        q: "What is the best crypto trading journal?",
        a: "One that syncs with your exchange via read-only API, tracks risk and psychology, and calculates pro metrics automatically. That's Trackion.",
      },
    ],
    cta: "Start 14-day Elite trial",
    related: [
      { label: "Trading psychology", path: "/trading-psychology-crypto" },
      { label: "Exchange API sync", path: "/exchange-api-sync" },
    ],
  },
  {
    id: "us-psychology",
    market: "us",
    paths: ["/trading-psychology-crypto", "/crypto-trading-psychology"],
    meta: {
      title: "Crypto Trading Psychology — Beat FOMO & Revenge Trading | Trackion",
      description:
        "Master trading psychology in crypto. Stop FOMO, revenge trades and overtrading with structured journaling, risk limits and real metrics.",
      keywords: [
        "trading psychology",
        "crypto trading psychology",
        "FOMO crypto",
        "revenge trading",
        "trading discipline",
        "emotional trading",
      ],
    },
    h1: "Trading psychology: rules before emotion",
    subtitle:
      "'Bitcoin to zero' searches hit record levels in 2026 — extreme fear signals retail attention, not method. Trackion enforces process when markets test your mind.",
    sections: [
      {
        heading: "FOMO and revenge trading in numbers",
        body: "Your memory lies. The journal doesn't: see how many trades were impulsive, what doubling down after a stop really cost, and your true max drawdown.",
      },
      {
        heading: "Daily risk limits that prevent tilt",
        body: "Set a daily loss cap and get feedback before you spiral. Weekly and monthly goals create rhythm — you stop when the plan says so.",
      },
    ],
    faq: [
      {
        q: "How to improve trading psychology in crypto?",
        a: "Log every trade, cap daily risk, review weekly patterns, never trade without a plan. Trackion automates logging and surfaces biases in reports.",
      },
    ],
    cta: "Replace impulse with method",
    related: [
      { label: "FOMO trading", path: "/fomo-crypto-trading" },
      { label: "Risk management", path: "/crypto-risk-management" },
    ],
  },
  {
    id: "us-futures",
    market: "us",
    paths: ["/crypto-futures-journal", "/bitcoin-futures-trading-log"],
    meta: {
      title: "Crypto Futures Trading Journal — BTCUSDT & Perps Sync | Trackion",
      description:
        "Futures-focused crypto journal. Sync Binance, MEXC, Bitget perps. Real PnL with fees, win rate, funding context. Free 14-day trial.",
      keywords: [
        "crypto futures journal",
        "bitcoin futures trading",
        "BTCUSDT journal",
        "perpetual futures log",
        "futures trading tracker",
      ],
    },
    h1: "Crypto futures demand a journal — leverage doesn't forgive",
    subtitle: "Bitcoin search spikes track volatility. In perps, every move is amplified. Log, measure and adjust with direct exchange sync.",
    sections: [
      {
        heading: "Real account PnL, not calculator fantasy",
        body: "Read-only API imports fills with fees reflected. Your journal shows what the exchange actually charged.",
      },
    ],
    faq: [],
    cta: "Journal for crypto futures",
    related: [{ label: "Exchange sync", path: "/exchange-api-sync" }],
  },
  {
    id: "us-exchange-sync",
    market: "us",
    paths: ["/exchange-api-sync", "/sync-crypto-exchange-trades"],
    meta: {
      title: "Crypto Exchange API Sync — Binance, MEXC, Bitget | Trackion",
      description:
        "Automatically sync crypto exchange trades via read-only API. Binance, MEXC, Bitget. No withdrawal permissions. Always-updated journal.",
      keywords: [
        "exchange API sync",
        "import binance trades",
        "crypto exchange integration",
        "read only API trading",
        "sync bitget trades",
      ],
    },
    h1: "Exchange sync: trades flow in, you analyze",
    subtitle: "Manual entry is where PnL errors begin. Connect read-only API once and Trackion builds history while markets move.",
    sections: [
      {
        heading: "Read-only security",
        body: "We never request withdraw or trade permissions. Keys only read execution history. Revoke anytime on the exchange.",
      },
    ],
    faq: [
      {
        q: "Is it safe to connect exchange API?",
        a: "Yes with read-only keys. Trackion uses read permission only — no withdrawal or unauthorized order risk.",
      },
    ],
    cta: "Connect my exchange",
    related: [
      { label: "Binance journal", path: "/binance-trading-journal" },
      { label: "MEXC trade log", path: "/mexc-trade-log" },
    ],
  },
  {
    id: "us-risk",
    market: "us",
    paths: ["/crypto-risk-management", "/trading-risk-management-crypto"],
    meta: {
      title: "Crypto Risk Management — Drawdown, Stops & Daily Limits | Trackion",
      description:
        "Professional risk management for crypto trading. Daily loss limits, drawdown tracking, position sizing alerts. Exchange-synced journal.",
      keywords: [
        "crypto risk management",
        "trading risk management",
        "drawdown tracker",
        "stop loss discipline",
        "position sizing crypto",
      ],
    },
    h1: "Crypto risk management: survive to trade tomorrow",
    subtitle: "Leverage in futures amplifies emotional mistakes. Without risk management, every 'buy bitcoin' search becomes a bet.",
    sections: [
      {
        heading: "Visible drawdown, not hidden pain",
        body: "Equity curve and max drawdown in real time. Know how far you've fallen from peak before impossible recovery sizing.",
      },
    ],
    faq: [],
    cta: "Protect capital with method",
    related: [{ label: "Trading psychology", path: "/trading-psychology-crypto" }],
  },
  {
    id: "us-binance",
    market: "us",
    paths: ["/binance-trading-journal", "/binance-trade-log"],
    meta: {
      title: "Binance Trading Journal — Automatic API Sync | Trackion",
      description: "Binance trading journal with automatic read-only API sync. Spot & futures, win rate, drawdown, BTC stack. 14-day trial.",
      keywords: ["binance trading journal", "binance trade log", "import binance trades automatically"],
    },
    h1: "Binance trading journal with auto-sync",
    subtitle: "The world's most searched exchange deserves a serious journal. Import executions, analyze performance, manage risk — no spreadsheet.",
    sections: [{ heading: "Spot + USDT-M futures", body: "One connector, full history. PnL by market or consolidated." }],
    faq: [],
    cta: "Connect Binance",
    related: [{ label: "Exchange sync", path: "/exchange-api-sync" }],
  },
  {
    id: "us-bitget",
    market: "us",
    paths: ["/bitget-trade-log", "/bitget-trading-journal"],
    meta: {
      title: "Bitget Trading Journal — Real-Time Trade Sync | Trackion",
      description: "Bitget trade log with automatic API import. Futures, spot, analytics and risk management integrated.",
      keywords: ["bitget trading journal", "bitget trade log", "bitget api sync"],
    },
    h1: "Bitget trading journal with live sync",
    subtitle: "Futures traders on Bitget centralize fills, tags and reports in Trackion.",
    sections: [{ heading: "Read-only API", body: "Connect once. Every fill appears with correct timestamp and PnL." }],
    faq: [],
    cta: "Connect Bitget",
    related: [{ label: "Crypto futures", path: "/crypto-futures-journal" }],
  },
  {
    id: "us-mexc",
    market: "us",
    paths: ["/mexc-trade-log", "/mexc-trading-journal"],
    meta: {
      title: "MEXC Trading Journal — Automatic Trade Import | Trackion",
      description: "MEXC trade log with API sync. Futures & spot, pro analytics. 14-day Elite trial free.",
      keywords: ["mexc trading journal", "mexc trade log", "mexc api import"],
    },
    h1: "MEXC trading journal — stop copying trades by hand",
    subtitle: "MEXC is an altcoin and futures hub. Trackion pulls every execution for serious review.",
    sections: [{ heading: "Altcoins & BTC", body: "Filter by pair, measure win rate per asset, find your real edge." }],
    faq: [],
    cta: "Connect MEXC",
    related: [{ label: "Exchange sync", path: "/exchange-api-sync" }],
  },
  {
    id: "us-btc-stack",
    market: "us",
    paths: ["/bitcoin-stack-tracker", "/stack-btc-tracker"],
    meta: {
      title: "Bitcoin Stack Tracker — Accumulate BTC While Trading | Trackion",
      description:
        "Track BTC stack alongside futures PnL. Separate trading from accumulation, measure performance, build Bitcoin reserves with data.",
      keywords: ["bitcoin stack tracker", "stack BTC", "buy bitcoin track", "BTC accumulation tool"],
    },
    h1: "Stack Bitcoin without mixing it with impulsive trades",
    subtitle: "'Buy bitcoin' searches spike in volatility. Trackion separates spot stack from futures PnL — two strategies, one dashboard.",
    sections: [
      {
        heading: "Trade to earn, stack to keep",
        body: "Define how much futures profit goes to BTC accumulation. Watch stack growth next to trading equity.",
      },
    ],
    faq: [],
    cta: "Organize stack & trades",
    related: [{ label: "Crypto journal", path: "/crypto-trading-journal" }],
  },
  {
    id: "us-analytics",
    market: "us",
    paths: ["/crypto-trade-analytics", "/trading-performance-analytics"],
    meta: {
      title: "Crypto Trade Analytics — Win Rate, Expectancy & Drawdown | Trackion",
      description:
        "Pro analytics for crypto traders: win rate, expectancy, drawdown, equity curve and strategy reports. Automatic exchange sync.",
      keywords: [
        "crypto trade analytics",
        "win rate tracker",
        "trading expectancy",
        "drawdown analysis",
        "equity curve crypto",
      ],
    },
    h1: "Crypto trade analytics: metrics retail traders skip",
    subtitle: "Win rate alone lies. Expectancy, average R:R and drawdown tell the real story. Trackion computes everything from exchange history.",
    sections: [
      {
        heading: "Hedge-fund metrics on your desk",
        body: "Dashboard with win rate, profit factor, expectancy, loss streaks and equity evolution — updated every sync.",
      },
    ],
    faq: [
      {
        q: "What is trading expectancy?",
        a: "Average expected profit per trade over time. Positive expectancy with risk control = sustainable process.",
      },
    ],
    cta: "See my real metrics",
    related: [{ label: "Crypto journal", path: "/crypto-trading-journal" }],
  },
  {
    id: "us-fomo",
    market: "us",
    paths: ["/fomo-crypto-trading", "/crypto-fomo-trading"],
    meta: {
      title: "FOMO Crypto Trading — Stop Buying the Top | Trackion",
      description:
        "Beat FOMO in cryptocurrency trading with journaling, risk limits and impulsive trade review. Data kills euphoria. 14-day free trial.",
      keywords: ["FOMO crypto trading", "FOMO bitcoin", "impulsive crypto trades", "buying the top crypto"],
    },
    h1: "FOMO in crypto: what Google Trends measures but doesn't fix",
    subtitle: "Bitcoin search peaks align with euphoria and panic. Tag FOMO entries in your journal — numbers show the cost of impulsivity.",
    sections: [
      {
        heading: "Tag emotional trades",
        body: "Mark FOMO entries and compare their expectancy vs. planned trades. The gap educates faster than any thread.",
      },
    ],
    faq: [],
    cta: "Measure the cost of FOMO",
    related: [{ label: "Trading psychology", path: "/trading-psychology-crypto" }],
  },
  {
    id: "us-spreadsheet",
    market: "us",
    paths: ["/crypto-trading-spreadsheet", "/replace-trading-spreadsheet"],
    meta: {
      title: "Replace Your Crypto Trading Spreadsheet — Auto Journal | Trackion",
      description:
        "Done with trading spreadsheets? Automatic exchange sync, ready-made metrics, zero broken formulas. Migrate to Trackion.",
      keywords: [
        "crypto trading spreadsheet",
        "trading journal excel",
        "replace trading spreadsheet",
        "bitcoin trading excel",
      ],
    },
    h1: "Crypto trading spreadsheet hit its limit?",
    subtitle: "Spreadsheets don't sync exchanges, break on fees, and forget your emotional state. Time for a journal built for crypto.",
    sections: [
      { heading: "Zero formula maintenance", body: "API imports trades. Dashboard computes win rate and drawdown. You review strategy, not VLOOKUP." },
    ],
    faq: [],
    cta: "Migrate from spreadsheet",
    related: [{ label: "Crypto journal", path: "/crypto-trading-journal" }],
  },
  {
    id: "us-retail",
    market: "us",
    paths: ["/retail-crypto-trading", "/buy-bitcoin-track-trades"],
    meta: {
      title: "Retail Crypto Trading with Discipline — Journal & Risk Tools | Trackion",
      description:
        "Retail crypto trading in 2026 demands process, not hype. Journal, exchange sync, psychology tools and risk limits. Bitcoin & altcoins.",
      keywords: [
        "retail crypto trading",
        "buy bitcoin track trades",
        "cryptocurrency trading",
        "disciplined crypto trading",
        "retail trader bitcoin",
      ],
    },
    h1: "Retail crypto trading: process beats hype",
    subtitle:
      "Crypto search interest swings with macro — consistent traders swing less because they run a process. Trackion is that process.",
    sections: [
      {
        heading: "Built for how retail actually trades",
        body: "Multi-exchange, mobile-friendly web app, 14-day trial without card. Pro tools without institutional minimums.",
      },
    ],
    faq: [],
    cta: "Trade crypto with method",
    related: [
      { label: "Crypto journal", path: "/crypto-trading-journal" },
      { label: "Risk management", path: "/crypto-risk-management" },
    ],
  },
];

const PATH_INDEX = new Map<string, SeoPageContent>();
for (const page of PAGES) {
  for (const p of page.paths) {
    PATH_INDEX.set(p.toLowerCase(), page);
  }
}

export function resolveSeoPage(pathname: string): SeoPageContent | null {
  const p = pathname.replace(/\/$/, "").toLowerCase();
  return PATH_INDEX.get(p) ?? null;
}

export function getAllSeoPaths(): string[] {
  return PAGES.flatMap((page) => page.paths);
}

export function getSeoPagesForMarket(market: Market): SeoPageContent[] {
  return PAGES.filter((page) => page.market === market);
}

export function buildSeoPageMeta(page: SeoPageContent, _canonicalPath: string): SeoMeta {
  const path = page.paths[0].startsWith("/") ? page.paths[0] : `/${page.paths[0]}`;
  return {
    ...page.meta,
    path,
    jsonLd: [
      buildOrganizationJsonLd(),
      buildSoftwareAppJsonLd(page.market),
      buildBreadcrumbJsonLd([
        { name: "Trackion", path: "/" },
        { name: page.h1.slice(0, 60), path },
      ]),
      ...(page.faq.length ? [buildFaqJsonLd(page.faq)] : []),
    ],
  };
}
