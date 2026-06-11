import type { BlogSection } from "./blog-posts";

/** Conteúdo didático completo — aplicado sobre os posts base em blog-posts.ts */
export type ExpandedBlogMeta = {
  readMinutes: number;
  sections: BlogSection[];
};

export const EXPANDED_BLOG: Record<string, ExpandedBlogMeta> = {
  // ── PT-BR ───────────────────────────────────────────────────────
  "br:bitcoin-google-trends-2026": {
    readMinutes: 11,
    sections: [
      {
        paragraphs: [
          "Em fevereiro e junho de 2026, o interesse global por Bitcoin no Google Trends atingiu pontuação 100 — o máximo da escala relativa do Google. Isso coincidiu com quedas acentuadas de preço e, em paralelo, buscas recordes por termos como \"bitcoin zero\" e \"comprar bitcoin\".",
          "Para quem opera futuros ou spot, isso não é curiosidade de feed social: é termômetro de comportamento retail. Quando o público volta a pesquisar em massa, normalmente não está calmo — está assustado, curioso ou com FOMO. O problema é que sentimento de massa e o seu PnL real são coisas completamente diferentes.",
          "Neste artigo você vai entender o que picos de busca realmente medem, como não cair em narrativas contrarian automáticas e como usar esses momentos para revisar sua disciplina — com dados do seu journal, não com opinião de influencer.",
        ],
      },
      {
        heading: "O que o Google Trends mede (e o que não mede)",
        paragraphs: [
          "Google Trends não mostra volume absoluto de buscas — mostra interesse relativo ao pico histórico do termo na região escolhida. Score 100 significa \"o máximo que esse termo atingiu no período analisado\", não \"todo mundo no mundo está buscando Bitcoin agora\".",
          "Por isso comparar 2026 com 2018 ou 2022 exige cautela: a base de usuários crypto é muito maior hoje. Um score 100 em 2026 pode representar milhões de buscas mais que um score 100 em 2018, ou menos pânico proporcional — depende do contexto demográfico e geográfico.",
          "Trends também não diz se quem busca vai comprar, vender ou só ler notícia. Ele mede atenção. Atenção alta + volume de exchange baixo (padrão visto em partes de 2026) sugere muita gente olhando, pouca gente operando com convicção — um ambiente onde entradas impulsivas costumam ser piores.",
        ],
      },
      {
        heading: "Busca alta não significa compra",
        paragraphs: [
          "Dados de 2026 mostram um padrão diferente de ciclos anteriores: atenção retail voltou, mas volume em exchanges spot caiu para mínimas em vários períodos. Ou seja: hype de busca sem fluxo proporcional de capital.",
          "Picos de \"comprar bitcoin\" e \"comprar crypto\" durante crashes costumam misturar três perfis: quem quer entrar barato com plano, quem quer confirmar medo para vender, e quem busca validação emocional no Google. Sem journal, você não sabe em qual grupo esteve na última semana — só lembra da narrativa que escolheu.",
          "Exercício prático: abra seus trades dos últimos 14 dias e marque quais foram planejados vs. reativos ao preço ou ao feed. Se a maioria foi reativa em dias de Trends 90+, o problema não é o Google — é processo.",
        ],
      },
      {
        heading: "\"Bitcoin zero\" como sinal contrarian — com ressalvas",
        paragraphs: [
          "Analistas tradicionais tratam extremos de medo como possível fundo local. Em teoria, quando até quem nunca operou busca \"bitcoin zero\", o capitulación pode estar madura. Em 2026, porém, o ecossistema é mais institucional e mais fragmentado geograficamente.",
          "Medo não é uniforme: Ásia, Europa e EUA podem estar em fases diferentes na mesma semana. Um score global 100 não captura essa nuance. Trends é contexto macro de atenção, não gatilho de compra com timing preciso.",
          "Use \"bitcoin zero\" como lembrete de revisão de risco: drawdown atual, limite diário, tamanho de posição. Se você está no drawdown e buscando confirmação no Google, provavelmente precisa de pausa — não de mais exposição.",
        ],
      },
      {
        heading: "Como usar picos de busca na sua rotina de trading",
        paragraphs: [
          "Trate picos de Trends como alarme de disciplina, não como call. Checklist em dia de volatilidade: (1) limite diário definido antes da sessão, (2) setups escritos, (3) tag emocional no journal após cada trade, (4) comparação de expectancy em dias voláteis vs. calmos.",
          "Se sua expectancy cai 40% em dias de Trends acima de 80, você tem um dado acionável: reduzir tamanho ou não operar nesses dias. Isso só aparece com histórico confiável — planilha manual quase nunca mantém essa granularidade por semanas.",
          "Compare também win rate por horário: muitos traders performam melhor fora das janelas de maior atenção retail (abertura US, notícias de tarde). Filtros por contexto separam edge real de coincidência.",
        ],
      },
      {
        heading: "Onde o Trackion entra nessa história",
        paragraphs: [
          "Um trading journal com sync de exchange elimina a narrativa que você conta depois do candle. O Trackion importa execuções de Binance, MEXC e Bitget via API read-only em ~2 segundos e calcula win rate, expectancy e drawdown automaticamente — você revisa padrão, não VLOOKUP.",
          "Tags como FOMO, revenge ou \"entrada por feed\" permitem filtrar trades em dias de alta volatilidade e ver se o número confirma o feeling. Metas de risco diárias ajudam a parar quando o plano manda — antes de virar estatística no Google Trends.",
          "O trial Elite de 14 dias, sem cartão, existe para você testar se dados mudam decisões em semanas de hype. Se após duas semanas você não consegue responder \"minha expectancy em dias de pânico é X\", o journal ainda vale mais que outra aba de Trends aberta no browser.",
        ],
      },
    ],
  },
  "br:psicologia-trading-crypto-fomo": {
    readMinutes: 12,
    sections: [
      {
        paragraphs: [
          "Psicologia de trade não é afirmação de coach — é padrão repetido sob pressão. Em crypto, com mercado 24/7, alavancagem em futuros e feeds infinitos, o intervalo entre impulso e clique é de segundos.",
          "Pesquisas com traders retail em 2026 indicam que a maioria compra depois que o preço já subiu e ignora stop loss em mais de 60% das operações. O mercado não precisa te vencer; basta você repetir o mesmo erro emocional até o equity curve virar contra você.",
          "A boa notícia: emoção vira dado quando você registra contexto junto com execução. Este guia cobre FOMO, revenge trade, medo de perder e como transformar tudo isso em processo mensurável.",
        ],
      },
      {
        heading: "FOMO: o custo invisível que não aparece na planilha",
        paragraphs: [
          "FOMO (Fear Of Missing Out) raramente aparece na planilha como linha própria. Por isso parece gratuito. Na prática, entradas tardias diluem expectancy, aumentam drawdown e elevam fees em altcoins com spread largo — o custo é real, só é difuso.",
          "Características de trade FOMO: entrada após movimento já esticado, tamanho maior que o plano, falta de stop definido antes do clique, justificativa posterior (\"eu sabia que ia subir\"). Se você reconhece isso, já tem material para tag no journal.",
          "Marque trades como FOMO. Depois de 30 operações, compare win rate e R:R médio vs. setups planejados. A diferença costuma ser o melhor argumento contra a próxima entrada impulsiva — mais forte que qualquer post de disciplina.",
        ],
      },
      {
        heading: "Revenge trade: a amígdala contra a conta",
        paragraphs: [
          "Revenge trade é operar imediatamente após um stop ou loss para \"recuperar\". Dobrar mão, trocar de par sem critério, ignorar limite diário — tudo na mesma sessão emocional.",
          "Neurologicamente, loss ativa resposta de ameaça. O cérebro busca reverter a sensação rápido, não o PnL racional. Limite de perda por sessão não é frescura — é freio físico para amígdala.",
          "Configure teto diário no Trackion (ex.: 3R ou 4% da conta) e trate como ordem inegociável. Profissionais param quando o plano manda; amadores param quando a conta não deixa mais. O journal audita quantos dias você violou o limite — dado brutal e útil.",
        ],
      },
      {
        heading: "Medo, overtrading e a ilusão de controle",
        paragraphs: [
          "Medo de perder lucro aberto gera saídas prematuras; medo de confirmar loss gera stops largos ou ausentes. Ambos distorcem expectancy em direções opostas, mas o resultado comum é performance abaixo do setup teórico.",
          "Overtrading após sequência de wins (euforia) é espelho do revenge após loss. Mais trades, mais fees, mais exposição em setups de menor qualidade. Win rate pode até subir no curto prazo — expectancy cai.",
          "Rotina que funciona: mesma quantidade de trades planejados por dia, mesma revisão semanal, mesmas métricas. Motivação some no drawdown; processo fica. Win rate, expectancy e horários ruins viram regras escritas — não promessas de domingo.",
        ],
      },
      {
        heading: "Tags emocionais e revisão semanal",
        paragraphs: [
          "Cada trade pode carregar contexto qualitativo: setup (breakout, pullback), emoção (FOMO, calmo, ansioso), violação de regra (sim/não). Qualitativo + quantitativo no mesmo registro é o que planilha genérica não faz bem.",
          "Revisão semanal em 30 minutos: (1) três melhores trades — o que repetir, (2) três piores — o que eliminar, (3) um padrão emocional que se repetiu. Sem essa estrutura, revisão vira reler screenshots sem conclusão.",
          "Após 8–12 semanas com tags consistentes, você terá evidência se FOMO custa 2R por mês ou se revenge trade concentra 80% do drawdown em duas sessões. Isso muda comportamento mais que afirmação motivacional.",
        ],
      },
      {
        heading: "Trackion: psicologia virando processo",
        paragraphs: [
          "O Trackion combina sync automático de exchange (Binance, MEXC, Bitget) com metas de risco, tags e relatórios filtrados. Você não precisa confiar na memória após um dia vermelho — o histórico mostra o padrão emocional com números.",
          "Alertas de limite diário e feedback quando ultrapassa o risco planejado transformam regra abstrata em evento visível no dashboard. PnL consolidado em <30s após cada trade reduz a ansiedade de \"não saber onde estou\" — uma das fontes de clique impulsivo.",
          "Teste 14 dias Elite grátis, sem cartão. Se após duas semanas você identifica um padrão FOMO mensurável, o journal já pagou o investimento em clareza — antes de qualquer assinatura.",
        ],
      },
    ],
  },
  "br:planilha-trades-futuros-crypto": {
    readMinutes: 10,
    sections: [
      {
        paragraphs: [
          "Planilha de trades funcionou quando você fazia dez operações por mês em um par, numa exchange, sem funding e sem dezenas de partial fills. Futuros crypto em 2026 é outro esporte: execuções fragmentadas, fees maker/taker, funding a cada 8 horas e contas em três exchanges.",
          "Cada cópia manual é ponto de falha. Um fill esquecido distorce win rate. Um fee ignorado infla expectancy. Depois de três meses, muitos traders otimizam narrativa — não performance.",
          "Este artigo explica quando a planilha vira gargalo, o que ela não captura e como migrar para um journal com sync sem perder o controle dos dados.",
        ],
      },
      {
        heading: "A matemática que quebra o Excel",
        paragraphs: [
          "Futuros USDT perp: PnL depende de preço de entrada, saída, quantidade, fee de abertura, fee de fechamento, funding acumulado e eventual liquidação parcial. Uma operação \"simples\" pode gerar 4–15 linhas na exchange.",
          "Multiplicar isso por 20 trades/dia em duas exchanges e você tem centenas de linhas mensais. Excel sem automação vira segundo emprego — e ainda assim erra.",
          "Estimativa conservadora: 15–20 minutos por dia de manutenção manual = 8+ horas por mês só em entrada de dados. Esse tempo deveria ir para revisão de edge, não para Ctrl+C.",
        ],
      },
      {
        heading: "O que a planilha não captura bem",
        paragraphs: [
          "Estado emocional no momento da entrada, screenshot do setup, tag de estratégia, violação de risco, notas de contexto macro — dados qualitativos que explicam por que os números são bons ou ruins.",
          "Planilha pode ter coluna \"emoção\", mas se execução vem manualmente, a emoção é registrada horas depois — memória já editou o evento.",
          "API + journal estruturado guarda execução (verdade da exchange) e contexto (sua interpretação) no mesmo registro, com timestamp alinhado. Isso é o mínimo para aprendizado honesto.",
        ],
      },
      {
        heading: "Sinais de que você precisa migrar",
        paragraphs: [
          "Você adia atualizar a planilha \"até o fim do dia\" e nunca atualiza. Win rate da planilha não bate com o da exchange. Você tem abas diferentes para cada exchange e nunca consolidou PnL global.",
          "Você parou de registrar trades pequenos \"porque não importam\" — e esses trades somam fees que comem expectancy. Qualquer um desses é sinal vermelho.",
          "Migração não precisa ser trauma: comece importando histórico via API read-only, mantenha planilha paralela por 2 semanas e compare. Quando os números batem e a planilha fica obsoleta, você sabe que cruzou a linha.",
        ],
      },
      {
        heading: "Sync read-only resolve 80% do trabalho",
        paragraphs: [
          "Binance, MEXC e Bitget expõem histórico via API somente leitura. Sem permissão de saque ou trade — higiene básica de segurança. O Trackion importa fills, calcula PnL com fees e funding e mantém dashboard atualizado em ~2 segundos após sync.",
          "Você revisa edge, expectancy por par e drawdown — não fórmulas que quebram quando muda coluna. Relatórios filtrados por tag, horário e exchange revelam onde a planilha só mostrava média genérica.",
          "Multi-exchange consolidado: um painel para PnL global, sem copiar saldo de três abas de browser. Para quem operava MEXC + Binance + Bitget, isso sozinho elimina horas de reconciliação mensal.",
        ],
      },
      {
        heading: "Próximo passo sem compromisso",
        paragraphs: [
          "Trial Elite 14 dias grátis, sem cartão. Conecte uma exchange, importe histórico e rode sua checklist de revisão semanal no Trackion. Compare com a planilha — os números devem convergir; o tempo gasto não.",
          "Se após duas semanas você economizou entrada manual e enxergou um padrão que a planilha escondia (ex.: altcoin à noite com expectancy negativa), a migração já se justificou.",
        ],
      },
    ],
  },
  "br:sincronizar-exchange-journal": {
    readMinutes: 10,
    sections: [
      {
        paragraphs: [
          "Conectar exchange ao journal não é automação de trade — é automação de verdade. Você continua decidindo entrada, tamanho e saída; o sistema registra o que de fato executou, com timestamp e fee que a exchange confirma.",
          "Sem sync, journal vira diário de intenções. Com sync read-only, vira auditoria da sua execução real. A diferença entre os dois é onde traders descobrem que \"seguem o plano\" na memória — mas não nos fills.",
          "Guia prático para conectar Binance, MEXC e Bitget ao seu workflow de análise.",
        ],
      },
      {
        heading: "Por que API read-only é o padrão certo",
        paragraphs: [
          "Chaves com permissão de saque ou trading são risco desnecessário para um journal. Read-only basta para histórico de ordens, fills, fees e posições. Se a ferramenta pede mais, questione.",
          "Revogue e recrie chaves periodicamente — higiene básica. Restrinja IP se a exchange oferece. Nunca compartilhe chave em chat ou screenshot.",
          "No Trackion, credenciais são armazenadas criptografadas. Você pode desconectar a exchange no app e revogar a chave no painel da corretora — controle total dos dois lados.",
        ],
      },
      {
        heading: "Passo a passo conceitual da conexão",
        paragraphs: [
          "Na exchange: criar API key com permissão apenas de leitura (Read). Copiar key e secret. No Trackion: adicionar conexão, selecionar exchange, colar credenciais, confirmar.",
          "Primeira sync pode levar alguns minutos se há meses de histórico — normal. Syncs seguintes são incrementais e rápidas (~2 segundos para atualizações recentes).",
          "Valide: total de trades importados vs. histórico da exchange no mesmo período. Pequenas diferenças de timezone existem; grandes gaps indicam configuração errada ou par não suportado — corrija antes de confiar nas métricas.",
        ],
      },
      {
        heading: "Multi-exchange sem PnL fragmentado",
        paragraphs: [
          "Muitos traders usam MEXC para altcoins, Binance para liquidez e Bitget por promoção de fee. Sem consolidação, você não sabe se o mês foi positivo — só se uma aba do browser pareceu verde.",
          "Journal multi-conta unifica métricas: drawdown global, expectancy por exchange, concentração de risco por ativo. Você vê se a conta \"secundária\" está sabotando o resultado principal.",
          "O Trackion trata futuros e spot no mesmo ecossistema — BTCUSDT perp, altcoins e stack spot com PnL separado mas visível no mesmo dashboard.",
        ],
      },
      {
        heading: "Futuros vs. spot na mesma conexão",
        paragraphs: [
          "Futuros USDT: PnL inclui funding e fees de maker/taker. Spot: PnL de acumulação e stack BTC é estratégia diferente de trading direcional — misturar sem separar confunde análise.",
          "Journal bom permite filtrar por tipo de conta e produto. Você mede trading de futuros com métricas de trading; mede stack com métricas de acumulação — sem contaminar um com o outro.",
          "Sync automático garante que funding de ontem à noite entrou no cálculo de hoje — sem você lembrar de abrir a aba de histórico de funding na exchange.",
        ],
      },
      {
        heading: "Trackion como hub de execução real",
        paragraphs: [
          "Binance, MEXC e Bitget live hoje. Bybit e OKX em Q1 2026. Conecte em minutos, importe histórico e comece revisão com win rate, expectancy e equity curve automáticos.",
          "Metas de risco diárias e alertas complementam o sync: você sabe o que executou e se ainda pode operar dentro do plano — PnL real em <30s, não estimativa mental.",
          "Trial 14 dias Elite, sem cartão. Ideal para validar sync com sua exchange antes de assinar qualquer plano.",
        ],
      },
    ],
  },
  "br:gestao-risco-futuros-crypto": {
    readMinutes: 11,
    sections: [
      {
        paragraphs: [
          "Gestão de risco em futuros crypto não começa no stop da ordem — começa no tamanho da posição. Alavancagem transforma pequeno erro de timing em grande dano de conta. 1% de risco por trade em conta de $5.000 é $50. Parece pouco até você ignorar por cinco trades seguidos.",
          "Este artigo estrutura risco em três camadas: por trade, por dia e por conta. E mostra como medir se você realmente obedece às regras — não só se as escreveu no Notion.",
          "Risco bom é auditable. Se não está no journal, não existe.",
        ],
      },
      {
        heading: "Position sizing: a variável que você controla",
        paragraphs: [
          "Defina risco em R (múltiplos do stop) ou % fixo da conta. Ex.: stop de 1% do preço, risco 1% da conta → tamanho de posição calculado automaticamente. Sem esse cálculo antes do clique, stop vira sugestão.",
          "Alavancagem 10x não é \"estratégia\" — é amplificador. O mesmo 1% de movimento contra com tamanho errado vira 10% da margem. Profissionais dimensionam antes; amadores dimensionam depois do loss.",
          "Registre tamanho planejado vs. executado no journal. Se executado > planejado em 30% dos trades, expectancy sofre mesmo com win rate alto.",
        ],
      },
      {
        heading: "Drawdown: a métrica que importa mais que win rate",
        paragraphs: [
          "Win rate alto com drawdown profundo ainda quebra conta — matematicamente e psicologicamente. Max drawdown e equity curve devem estar sempre visíveis, não enterrados em aba mensal da planilha.",
          "Recuperar 50% de drawdown exige 100% de ganho sobre o saldo atual. A matemática de recuperação é brutal; prevenção via tamanho e limite diário é mais barata.",
          "O Trackion mostra equity curve e drawdown em tempo real com dados da exchange — você vê o buraco enquanto ainda pode parar, não só no fim do mês.",
        ],
      },
      {
        heading: "Limite diário como circuit breaker",
        paragraphs: [
          "Defina perda máxima por dia (ex.: 3R ou 4% da conta). Ao atingir, pare. O mercado abre amanhã; conta zerada não. Sem exceção \"só dessa vez\".",
          "Limite diário também protege contra sequência de wins que gera overconfidence — alguns traders definem teto de ganho diário para evitar devolver tudo na última operação.",
          "Journal audita compliance: quantos dias você violou o limite em 2026? Se a resposta for \"vários\", o problema não é setup — é execução de risco. Dado honesto, incômodo, necessário.",
        ],
      },
      {
        heading: "Stop loss: ordem vs. disciplina",
        paragraphs: [
          "Stop na exchange protege contra gap e desconexão. Stop mental protege só se você é robô. A maioria move stop, remove stop ou \"dá mais um candle\" — journal mostra frequência disso.",
          "Relação R:R planejada vs. realizada: se você planeja 2R mas realiza 0.8R porque sai cedo no medo, expectancy cai mesmo com 60% win rate. Risco é saída também.",
          "Tags de \"stop violado\" ou \"saída antecipada\" no Trackion permitem quantificar esse custo em R por mês — argumento concreto para trabalhar psicologia de saída.",
        ],
      },
      {
        heading: "Trackion: risco visível, não abstrato",
        paragraphs: [
          "Metas diárias de perda e ganho, feedback ao ultrapassar limite, PnL consolidado multi-exchange. Risco vira número na tela — não feeling de \"acho que estou bem\".",
          "Sync read-only garante que o PnL do dia reflete fees e funding reais. Relatórios por par e por horário mostram onde o risco se concentra (ex.: 70% do drawdown mensal em duas altcoins).",
          "Trial 14 dias grátis para configurar limites e auditar uma semana completa. Se você violou limite 3 de 5 dias, já sabe o trabalho do mês — antes de buscar novo setup no YouTube.",
        ],
      },
    ],
  },
  "br:trading-journal-vs-feeling": {
    readMinutes: 10,
    sections: [
      {
        paragraphs: [
          "Operar no feeling é confundir intensidade emocional com convicção. Candle verde forte parece confirmação; candle vermelho parece injustiça. Sem registro, você aprende histórias, não padrões.",
          "Dados de 2026 mostram retail voltando a olhar crypto enquanto volume institucional domina negócios grandes. Quem sobrevive sem journal repete ciclo: euforia → overtrade → drawdown → capitulação → reentrada tardia.",
          "Journal não é burocracia para influencer — é espelho sem filtro. Este artigo compara feeling vs. método com exemplos práticos e quando migrar.",
        ],
      },
      {
        heading: "O que o feeling esconde",
        paragraphs: [
          "Memória seletiva: você lembra os wins emocionantes e esquece os losses medianos. Win rate \"de cabeça\" quase sempre é otimista. Expectancy negativa não mente — mas precisa de dados para aparecer.",
          "Confirmação no feed: após entrar, você busca tweets que validam. Após sair, você busca quem \"errou também\". Nenhum disso entra no PnL.",
          "Seu último mês pode ter parecido \"quase\" — os números dizem se foi quase lucro ou quase recuperação de buraco maior. Journal responde sem drama.",
        ],
      },
      {
        heading: "Journal como espelho sem filtro",
        paragraphs: [
          "Registro completo: entrada, saída, size, fee, tag, nota, screenshot. Revisão semanal comparando plano vs. execução. Métricas: win rate, expectancy, profit factor, drawdown, melhor/horário pior.",
          "Loop de método: hipótese (setup) → execução → dado → ajuste. Feeling pula o dado e vai direto ao ajuste emocional (\"mercado mudou\", \"hoje não é meu dia\").",
          "Após 90 dias de journal consistente, muitos traders descobrem que um único erro (FOMO ou revenge) concentra metade do drawdown anual. Foco vira claro.",
        ],
      },
      {
        heading: "Método não é rigidez — é feedback",
        paragraphs: [
          "Journal bom permite experimentar: nova estratégia com tag própria, 20 trades, comparar expectancy com baseline. Sem método, experimento vira ruído misturado com histórico antigo.",
          "Flexibilidade com dados: se pullback em BTC funciona e breakout em alt não, você corta alt — não abandona \"método\" inteiro por um loss.",
          "Feeling pede abandono total após um dia ruim. Dados pedem ajuste cirúrgico após amostra suficiente.",
        ],
      },
      {
        heading: "Retail 2026: olhar sem operar",
        paragraphs: [
          "Google Trends e redes mostram atenção alta com volume spot baixo em vários períodos — muita gente assistindo, pouca convicção. Ambiente perigoso para feeling: movimentos rápidos, liquidez irregular em altcoins.",
          "Quem tem journal sabe se performance cai em dias de hype. Quem não tem, acha que \"todo mundo está ganhando menos eu\".",
          "Separar acumulação (stack BTC) de trading direcional também é método — duas estratégias, dois conjuntos de métricas. Feeling mistura tudo num saldo emocional.",
        ],
      },
      {
        heading: "Trackion acelera o loop",
        paragraphs: [
          "Sync de exchange (Binance, MEXC, Bitget), metas de risco, relatórios por contexto. O Trackion elimina 8h/mês de planilha e coloca expectancy na tela em <30s após operar.",
          "Trial de 14 dias sem cartão existe para testar se dados mudam suas decisões — não para adicionar mais uma aba aberta no browser. Se após duas semanas você opera menos no feeling, o produto já cumpriu o papel.",
        ],
      },
    ],
  },
  "br:analise-performance-win-rate": {
    readMinutes: 10,
    sections: [
      {
        paragraphs: [
          "Trader retail ama win rate porque é fácil de entender. 70% de acerto soa impressionante — até você perceber que os 30% de loss levam três vezes o ganho médio. Win rate sozinho engana; expectancy conta a história completa.",
          "Este artigo explica win rate, expectancy, profit factor e drawdown — como calcular, como interpretar e como filtrar para encontrar edge real. Sem fórmula mágica: com histórico confiável da sua exchange.",
          "Métricas certas transformam \"acho que estou bem\" em \"estou +0.4R por trade neste setup\".",
        ],
      },
      {
        heading: "Win rate: útil, mas incompleto",
        paragraphs: [
          "Win rate = trades ganhos / total de trades. Simples. Problema: não incorpora tamanho do ganho vs. tamanho da perda. 80% win com loss médio 3x win médio = expectancy negativa.",
          "Win rate alto pode ser saída prematura (muitos wins pequenos) ou concentração em um par favorável enquanto outros sangram silenciosamente.",
          "Use win rate junto com average win, average loss e número de trades. Amostra < 30 trades: cautela estatística — não conclusões fortes.",
        ],
      },
      {
        heading: "Expectancy: a pergunta certa",
        paragraphs: [
          "Expectancy (simplificada) = (win rate × avg win) − (loss rate × avg loss). Responde: \"quanto eu ganho em média por trade ao longo do tempo?\" Positiva com risco controlado = processo. Negativa com win rate alto = ilusão.",
          "Expectancy por R é mais limpa: avg R ganho nos wins vs. avg R perdido nos losses, ponderado por frequência. Trader profissional monitora expectancy em R, não só em dólares — escala com conta.",
          "O Trackion calcula expectancy automaticamente a partir dos fills importados — você não mantém fórmula que quebra quando adiciona coluna na planilha.",
        ],
      },
      {
        heading: "Profit factor e drawdown",
        paragraphs: [
          "Profit factor = gross profit / gross loss. Acima de 1.5 com amostra razoável sugere edge; abaixo de 1.0 = perda líquida. Complementa expectancy com visão de magnitude total.",
          "Max drawdown: maior queda do pico ao fundo na equity curve. Psicologicamente é o número que testa se você continua seguindo o plano. Muitos abandonam método no fundo do drawdown — exatamente quando revisão é mais valiosa.",
          "Equity curve deve ser visível diariamente, não só em relatório mensal. Curva plana com picos de revenge = padrão diagnosticável.",
        ],
      },
      {
        heading: "Filtros que revelam edge real",
        paragraphs: [
          "Win rate e expectancy por horário, par, tag de setup, dia da semana. Talvez você seja lucrativo só em BTCUSDT de manhã e doe dinheiro em altcoins à noite. Sem filtro, mistura tudo e acha que \"o mercado mudou\".",
          "Filtro por emoção (FOMO vs. plano): diferença de expectancy aqui paga o journal sozinho. Filtro por exchange: conta secundária pode ter expectancy negativa enquanto principal salva o mês.",
          "Relatórios inteligentes no Trackion aplicam esses filtros em histórico syncado — segundos para insight que planilha levaria horas e ainda erraria um fill.",
        ],
      },
      {
        heading: "Do dado à decisão com Trackion",
        paragraphs: [
          "Sync ~2s, PnL <30s, métricas automáticas. Conecte Binance, MEXC ou Bitget, importe histórico e rode seus filtros favoritos na primeira semana.",
          "Trial Elite 14 dias grátis, sem cartão. Se você descobre que um filtro muda sua alocação de tempo (ex.: parar altcoin à noite), o analytics já vale mais que outro indicador no chart.",
        ],
      },
    ],
  },

  // ── EN-US (mirrored structure) ──────────────────────────────────
  "us:bitcoin-google-trends-2026": {
    readMinutes: 11,
    sections: [
      {
        paragraphs: [
          "In February and June 2026, global Bitcoin interest on Google Trends hit a score of 100 — the top of Google's relative scale. It coincided with sharp price drops and record searches for terms like \"bitcoin going to zero\" and \"buy bitcoin.\"",
          "For futures and spot traders, this isn't Twitter trivia: it's a retail behavior thermometer. When the public searches en masse, they're usually not calm — they're scared, curious, or riding FOMO. Mass sentiment and your real PnL are completely different things.",
          "This article explains what search spikes actually measure, how to avoid automatic contrarian narratives, and how to use volatile attention moments to review discipline — with journal data, not influencer takes.",
        ],
      },
      {
        heading: "What Google Trends measures (and doesn't)",
        paragraphs: [
          "Google Trends doesn't show absolute search volume — it shows relative interest compared to the term's historical peak in the chosen region. Score 100 means \"the maximum this term reached in the analyzed period,\" not \"everyone on earth is searching Bitcoin now.\"",
          "Comparing 2026 to 2018 or 2022 requires caution: the crypto user base is much larger today. A 2026 score of 100 may represent millions more searches than a 2018 score of 100, or less proportional panic — context matters.",
          "Trends also doesn't say whether searchers will buy, sell, or just read news. It measures attention. High attention + low exchange volume (a 2026 pattern in several periods) suggests lots of watching, less conviction trading — where impulsive entries often perform worse.",
        ],
      },
      {
        heading: "High search doesn't mean buying",
        paragraphs: [
          "2026 data shows a different pattern from past cycles: retail attention returned, but exchange spot volume fell to lows in several periods. Hype without proportional capital flow.",
          "Spikes in \"buy bitcoin\" and \"buy crypto\" during crashes mix three profiles: planned dip buyers, fear confirmers selling, and people seeking emotional validation on Google. Without a journal, you don't know which group you were in last week — only the story you chose to remember.",
          "Practical exercise: open your last 14 days of trades and mark planned vs. reactive entries. If most were reactive on Trends 90+ days, the problem isn't Google — it's process.",
        ],
      },
      {
        heading: "\"Bitcoin zero\" as contrarian signal — with caveats",
        paragraphs: [
          "Traditional analysts treat extreme fear as a possible local bottom. When even non-traders search \"bitcoin zero,\" capitulation may be mature. In 2026, however, the ecosystem is more institutional and geographically fragmented.",
          "Fear isn't uniform: Asia, Europe and the US can be in different phases the same week. A global score of 100 doesn't capture that nuance. Trends is macro attention context, not a precise buy trigger.",
          "Use \"bitcoin zero\" as a risk review reminder: current drawdown, daily limit, position size. If you're in drawdown and searching Google for confirmation, you probably need a pause — not more exposure.",
        ],
      },
      {
        heading: "Using search spikes in your trading routine",
        paragraphs: [
          "Treat Trends spikes as discipline alarms, not calls. Volatility day checklist: (1) daily limit set before session, (2) written setups, (3) emotional tag after each trade, (4) compare expectancy on volatile vs. calm days.",
          "If expectancy drops 40% on Trends 80+ days, you have actionable data: reduce size or don't trade those days. That only appears with reliable history — manual spreadsheets rarely maintain this granularity for weeks.",
          "Also compare win rate by time of day: many traders perform better outside peak retail attention windows. Context filters separate real edge from coincidence.",
        ],
      },
      {
        heading: "Where Trackion fits",
        paragraphs: [
          "A trading journal with exchange sync kills the story you tell after the candle. Trackion imports executions from Binance, MEXC and Bitget via read-only API in ~2 seconds and computes win rate, expectancy and drawdown automatically — you review patterns, not VLOOKUP.",
          "Tags like FOMO, revenge or \"feed entry\" let you filter trades on high-volatility days and see if numbers confirm gut feel. Daily risk goals help you stop when the plan says stop — before you become a Google Trends statistic.",
          "The 14-day Elite trial, no card required, exists to test whether data changes decisions during hype weeks. If after two weeks you can't answer \"my expectancy on panic days is X,\" the journal still beats another Trends tab open in the browser.",
        ],
      },
    ],
  },
  "us:crypto-trading-psychology-fomo": {
    readMinutes: 12,
    sections: [
      {
        paragraphs: [
          "Trading psychology isn't a coach quote — it's repeated behavior under pressure. In crypto, with 24/7 markets, futures leverage and infinite feeds, the gap between impulse and click is seconds.",
          "2026 retail research shows most buy after price already rose and skip stop losses on 60%+ of trades. The market doesn't need to beat you; you just repeat the same emotional mistake until the equity curve turns against you.",
          "The good news: emotion becomes data when you log context alongside execution. This guide covers FOMO, revenge trading, fear of loss and how to turn all of it into measurable process.",
        ],
      },
      {
        heading: "FOMO: the invisible cost",
        paragraphs: [
          "FOMO rarely gets its own spreadsheet row, so it feels free. Late entries dilute expectancy, deepen drawdown and raise fees on altcoins with wide spreads — the cost is real, just diffuse.",
          "FOMO trade traits: entry after extended move, size above plan, no stop defined before click, post-hoc justification (\"I knew it would pump\"). If you recognize this, you have material for journal tags.",
          "Tag FOMO trades. After 30 trades, compare win rate and average R:R vs. planned setups. The gap is usually the best argument against the next impulsive entry — stronger than any discipline post.",
        ],
      },
      {
        heading: "Revenge trading: amygdala vs. account",
        paragraphs: [
          "Revenge trading is operating immediately after a stop or loss to \"get it back.\" Doubling size, switching pairs without criteria, ignoring daily limits — all in the same emotional session.",
          "Neurologically, loss activates threat response. The brain seeks to reverse the feeling fast, not rational PnL. A session loss cap isn't fussy — it's a physical brake for your amygdala.",
          "Set a daily ceiling in Trackion (e.g. 3R or 4% of account) and treat it as non-negotiable. Pros stop when the plan says stop; amateurs stop when the account won't let them continue. Your journal audits how many days you broke the limit — brutal, useful data.",
        ],
      },
      {
        heading: "Fear, overtrading and illusion of control",
        paragraphs: [
          "Fear of losing open profit causes premature exits; fear of confirming loss causes wide or missing stops. Both distort expectancy in opposite directions, but common result is performance below theoretical setup quality.",
          "Overtrading after a win streak (euphoria) mirrors revenge after loss. More trades, more fees, more exposure on lower-quality setups. Win rate may even rise short-term — expectancy falls.",
          "Routine that works: same planned trade count per day, same weekly review, same metrics. Motivation vanishes in drawdown; process stays. Win rate, expectancy and bad hours become written rules — not Sunday promises.",
        ],
      },
      {
        heading: "Emotional tags and weekly review",
        paragraphs: [
          "Each trade can carry qualitative context: setup (breakout, pullback), emotion (FOMO, calm, anxious), rule violation (yes/no). Qualitative + quantitative in one record is what generic spreadsheets do poorly.",
          "Weekly review in 30 minutes: (1) three best trades — what to repeat, (2) three worst — what to cut, (3) one emotional pattern that repeated. Without structure, review becomes rereading screenshots without conclusion.",
          "After 8–12 weeks of consistent tags, you'll have evidence whether FOMO costs 2R per month or revenge trading concentrates 80% of drawdown in two sessions. That changes behavior more than motivational quotes.",
        ],
      },
      {
        heading: "Trackion: psychology as process",
        paragraphs: [
          "Trackion combines automatic exchange sync (Binance, MEXC, Bitget) with risk goals, tags and filtered reports. You don't trust memory after a red day — history shows the emotional pattern in numbers.",
          "Daily limit alerts and feedback when exceeding planned risk turn abstract rules into visible dashboard events. Consolidated PnL in <30s after each trade reduces \"not knowing where I stand\" anxiety — a source of impulsive clicks.",
          "Try 14-day Elite free, no card. If after two weeks you identify a measurable FOMO pattern, the journal already paid for itself in clarity — before any subscription.",
        ],
      },
    ],
  },
  "us:crypto-futures-spreadsheet-limit": {
    readMinutes: 10,
    sections: [
      {
        paragraphs: [
          "Spreadsheets worked when you placed ten trades a month on one pair, one exchange, no funding and no partial fills. Crypto futures in 2026 is different: fragmented executions, maker/taker fees, funding every 8 hours and accounts across three exchanges.",
          "Every manual copy is a failure point. One forgotten fill distorts win rate. One ignored fee inflates expectancy. After three months, many traders optimize narrative — not performance.",
          "This article explains when spreadsheets become bottlenecks, what they don't capture and how to migrate to a synced journal without losing data control.",
        ],
      },
      {
        heading: "The math that breaks Excel",
        paragraphs: [
          "USDT perp futures: PnL depends on entry, exit, size, open fee, close fee, accumulated funding and partial liquidations. One \"simple\" trade can generate 4–15 exchange lines.",
          "Multiply by 20 trades/day on two exchanges and you have hundreds of monthly lines. Excel without automation becomes a second job — and still gets wrong.",
          "Conservative estimate: 15–20 minutes daily maintenance = 8+ hours monthly just on data entry. That time should go to edge review, not Ctrl+C.",
        ],
      },
      {
        heading: "What spreadsheets don't capture well",
        paragraphs: [
          "Emotional state at entry, setup screenshot, strategy tag, risk violation, macro context notes — qualitative data explaining why numbers are good or bad.",
          "Spreadsheets can have an \"emotion\" column, but if execution is manual, emotion is logged hours later — memory already edited the event.",
          "API + structured journal stores execution (exchange truth) and context (your interpretation) in one record with aligned timestamps. Minimum for honest learning.",
        ],
      },
      {
        heading: "Signs you need to migrate",
        paragraphs: [
          "You delay updating the sheet \"until end of day\" and never do. Sheet win rate doesn't match exchange win rate. Separate tabs per exchange, never consolidated global PnL.",
          "You stopped logging small trades \"because they don't matter\" — those trades sum fees that eat expectancy. Any of these is a red flag.",
          "Migration doesn't need to be traumatic: import history via read-only API, keep spreadsheet parallel for 2 weeks and compare. When numbers match and the sheet feels obsolete, you've crossed the line.",
        ],
      },
      {
        heading: "Read-only sync solves 80% of the work",
        paragraphs: [
          "Binance, MEXC and Bitget expose history via read-only API. No withdraw or trade permission — basic security hygiene. Trackion imports fills, computes PnL with fees and funding, keeps dashboard current in ~2 seconds after sync.",
          "You review edge, expectancy per pair and drawdown — not formulas that break when you change a column. Filtered reports by tag, time and exchange reveal what spreadsheets only showed as generic averages.",
          "Multi-exchange consolidation: one panel for global PnL without copying balances from three browser tabs. For MEXC + Binance + Bitget operators, that alone eliminates hours of monthly reconciliation.",
        ],
      },
      {
        heading: "Next step without commitment",
        paragraphs: [
          "14-day Elite trial free, no card. Connect one exchange, import history and run your weekly review checklist in Trackion. Compare with spreadsheet — numbers should converge; time spent shouldn't.",
          "If after two weeks you saved manual entry and spotted a pattern the sheet hid (e.g. negative expectancy on late-night altcoins), migration already justified itself.",
        ],
      },
    ],
  },
  "us:sync-exchange-trading-journal": {
    readMinutes: 10,
    sections: [
      {
        paragraphs: [
          "Connecting an exchange to your journal isn't trade automation — it's truth automation. You still decide entry, size and exit; the system records what actually executed, with timestamp and fee the exchange confirms.",
          "Without sync, a journal is a diary of intentions. With read-only sync, it's an audit of real execution. The gap between them is where traders discover they \"follow the plan\" in memory — but not in fills.",
          "Practical guide to connecting Binance, MEXC and Bitget into your analysis workflow.",
        ],
      },
      {
        heading: "Why read-only API is the right standard",
        paragraphs: [
          "Keys with withdraw or trading permission are unnecessary risk for a journal. Read-only is enough for order, fill, fee and position history. If a tool asks for more, question it.",
          "Rotate keys periodically — basic hygiene. Restrict IP if the exchange offers it. Never share keys in chat or screenshots.",
          "In Trackion, credentials are stored encrypted. Disconnect in the app and revoke on the exchange dashboard — full control on both sides.",
        ],
      },
      {
        heading: "Conceptual connection steps",
        paragraphs: [
          "On exchange: create API key with read-only permission. Copy key and secret. In Trackion: add connection, select exchange, paste credentials, confirm.",
          "First sync may take minutes for months of history — normal. Subsequent syncs are incremental and fast (~2 seconds for recent updates).",
          "Validate: imported trade count vs. exchange history for same period. Small timezone differences exist; large gaps mean wrong config or unsupported pair — fix before trusting metrics.",
        ],
      },
      {
        heading: "Multi-exchange without fragmented PnL",
        paragraphs: [
          "Many use MEXC for altcoins, Binance for liquidity and Bitget for fee promos. Without consolidation, you don't know if the month was green — only if one browser tab looked green.",
          "Multi-account journaling unifies metrics: global drawdown, expectancy per exchange, risk concentration per asset. You see if the \"secondary\" account sabotages main results.",
          "Trackion handles futures and spot in one ecosystem — BTCUSDT perps, altcoins and spot stack with separate but visible PnL in one dashboard.",
        ],
      },
      {
        heading: "Futures vs. spot on the same connection",
        paragraphs: [
          "USDT futures: PnL includes funding and maker/taker fees. Spot: accumulation and BTC stack are different strategy from directional trading — mixing without separation confuses analysis.",
          "Good journals filter by account type and product. Measure futures with trading metrics; measure stack with accumulation metrics — without cross-contamination.",
          "Automatic sync ensures last night's funding entered today's calculation — without you opening the exchange funding history tab.",
        ],
      },
      {
        heading: "Trackion as hub of real execution",
        paragraphs: [
          "Binance, MEXC and Bitget live today. Bybit and OKX Q1 2026. Connect in minutes, import history and start review with automatic win rate, expectancy and equity curve.",
          "Daily risk goals and alerts complement sync: you know what executed and whether you can still trade within plan — real PnL in <30s, not mental estimate.",
          "14-day Elite trial, no card. Ideal to validate sync with your exchange before subscribing.",
        ],
      },
    ],
  },
  "us:crypto-futures-risk-management": {
    readMinutes: 11,
    sections: [
      {
        paragraphs: [
          "Futures risk management doesn't start at the order stop — it starts at position size. Leverage turns small timing errors into large account damage. 1% risk per trade on a $5,000 account is $50. Seems small until you ignore it five trades in a row.",
          "This article structures risk in three layers: per trade, per day and per account. And shows how to measure whether you actually follow rules — not just wrote them in Notion.",
          "Good risk is auditable. If it's not in the journal, it doesn't exist.",
        ],
      },
      {
        heading: "Position sizing: the variable you control",
        paragraphs: [
          "Define risk in R (stop multiples) or fixed account %. E.g. 1% price stop, 1% account risk → position size calculated before click. Without that calculation, stop becomes a suggestion.",
          "10x leverage isn't a \"strategy\" — it's an amplifier. Same 1% adverse move with wrong size becomes 10% of margin. Pros size before; amateurs size after the loss.",
          "Log planned vs. executed size in journal. If executed > planned on 30% of trades, expectancy suffers even with high win rate.",
        ],
      },
      {
        heading: "Drawdown: the metric that matters more than win rate",
        paragraphs: [
          "High win rate with deep drawdown still blows accounts — mathematically and psychologically. Max drawdown and equity curve should always be visible, not buried in a monthly spreadsheet tab.",
          "Recovering 50% drawdown requires 100% gain on current balance. Recovery math is brutal; prevention via size and daily limits is cheaper.",
          "Trackion shows equity curve and drawdown in real time from exchange data — you see the hole while you can still stop, not only at month end.",
        ],
      },
      {
        heading: "Daily limit as circuit breaker",
        paragraphs: [
          "Set max daily loss (e.g. 3R or 4% of account). Hit it, stop. Market opens tomorrow; zeroed account doesn't. No \"just this once\" exceptions.",
          "Daily limits also protect against win-streak overconfidence — some traders cap daily gain to avoid giving it all back on the last trade.",
          "Journal audits compliance: how many days did you break the limit in 2026? If \"several,\" the problem isn't setup — it's risk execution. Honest, uncomfortable, necessary data.",
        ],
      },
      {
        heading: "Stop loss: order vs. discipline",
        paragraphs: [
          "Exchange stop protects against gaps and disconnects. Mental stop only works if you're a robot. Most move stops, remove stops or \"give it one more candle\" — journal shows frequency.",
          "Planned vs. realized R:R: if you plan 2R but realize 0.8R from fear exits, expectancy falls even at 60% win rate. Risk is exit too.",
          "Tags for \"stop violated\" or \"early exit\" in Trackion quantify that cost in R per month — concrete argument to work exit psychology.",
        ],
      },
      {
        heading: "Trackion: risk visible, not abstract",
        paragraphs: [
          "Daily loss and gain goals, feedback when exceeding limits, multi-exchange consolidated PnL. Risk becomes a number on screen — not \"I think I'm fine\" feeling.",
          "Read-only sync ensures daily PnL reflects real fees and funding. Reports by pair and time show where risk concentrates (e.g. 70% of monthly drawdown in two altcoins).",
          "14-day free trial to configure limits and audit a full week. If you broke limits 3 of 5 days, you know the month's work — before searching YouTube for a new setup.",
        ],
      },
    ],
  },
  "us:trading-journal-vs-gut-feel": {
    readMinutes: 10,
    sections: [
      {
        paragraphs: [
          "Trading on gut feel is confusing emotional intensity with conviction. A strong green candle feels like confirmation; a red one feels unfair. Without logs, you learn stories, not patterns.",
          "2026 data shows retail watching crypto again while institutional volume dominates large trades. Traders without a journal repeat the cycle: euphoria → overtrade → drawdown → capitulation → late re-entry.",
          "A journal isn't influencer bureaucracy — it's an unfiltered mirror. This article compares gut feel vs. method with practical examples and when to migrate.",
        ],
      },
      {
        heading: "What gut feel hides",
        paragraphs: [
          "Selective memory: you remember emotional wins and forget mediocre losses. Mental win rate is almost always optimistic. Negative expectancy doesn't lie — but needs data to appear.",
          "Feed confirmation: after entering, you seek validating tweets. After exiting, you seek others who \"were wrong too.\" None of that enters PnL.",
          "Your last month might have felt \"close\" — numbers say whether it was close to profit or close to digging out of a bigger hole. Journal answers without drama.",
        ],
      },
      {
        heading: "Journal as unfiltered mirror",
        paragraphs: [
          "Full log: entry, exit, size, fee, tag, note, screenshot. Weekly review comparing plan vs. execution. Metrics: win rate, expectancy, profit factor, drawdown, best/worst hours.",
          "Method loop: hypothesis (setup) → execution → data → adjustment. Gut feel skips data and jumps to emotional adjustment (\"market changed,\" \"not my day today\").",
          "After 90 days of consistent journaling, many discover one error (FOMO or revenge) concentrates half of annual drawdown. Focus becomes clear.",
        ],
      },
      {
        heading: "Method isn't rigidity — it's feedback",
        paragraphs: [
          "Good journals allow experiments: new strategy with own tag, 20 trades, compare expectancy to baseline. Without method, experiment becomes noise mixed with old history.",
          "Flexibility with data: if BTC pullbacks work and alt breakouts don't, cut alts — don't abandon entire \"method\" after one loss.",
          "Gut feel demands total abandonment after a bad day. Data demands surgical adjustment after sufficient sample.",
        ],
      },
      {
        heading: "Retail 2026: watching without trading",
        paragraphs: [
          "Google Trends and social show high attention with low spot volume in several periods — lots watching, little conviction. Dangerous environment for gut feel: fast moves, irregular altcoin liquidity.",
          "Journal traders know if performance drops on hype days. Non-journal traders think \"everyone is winning except me.\"",
          "Separating accumulation (BTC stack) from directional trading is also method — two strategies, two metric sets. Gut feel mixes everything into one emotional balance.",
        ],
      },
      {
        heading: "Trackion speeds the loop",
        paragraphs: [
          "Exchange sync (Binance, MEXC, Bitget), risk goals, context reports. Trackion eliminates 8h/month of spreadsheet work and puts expectancy on screen in <30s after trading.",
          "14-day no-card trial exists to test whether data changes decisions — not to add another open browser tab. If after two weeks you trade less on gut feel, the product already did its job.",
        ],
      },
    ],
  },
  "us:win-rate-expectancy-crypto": {
    readMinutes: 10,
    sections: [
      {
        paragraphs: [
          "Retail traders love win rate because it's easy. 70% accuracy sounds impressive — until the 30% of losses are triple your average win. Win rate alone misleads; expectancy tells the full story.",
          "This article explains win rate, expectancy, profit factor and drawdown — how to calculate, interpret and filter to find real edge. No magic formula: with reliable exchange history.",
          "Right metrics turn \"I think I'm doing okay\" into \"I'm +0.4R per trade on this setup.\"",
        ],
      },
      {
        heading: "Win rate: useful but incomplete",
        paragraphs: [
          "Win rate = winning trades / total trades. Simple. Problem: doesn't incorporate win size vs. loss size. 80% win rate with 3x average loss vs. win = negative expectancy.",
          "High win rate can mean premature exits (many small wins) or concentration in one favorable pair while others bleed quietly.",
          "Use win rate with average win, average loss and trade count. Sample < 30 trades: statistical caution — no strong conclusions.",
        ],
      },
      {
        heading: "Expectancy: the right question",
        paragraphs: [
          "Expectancy (simplified) = (win rate × avg win) − (loss rate × avg loss). Answers: \"how much do I make on average per trade over time?\" Positive with controlled risk = process. Negative with high win rate = illusion.",
          "Expectancy in R is cleaner: avg R on wins vs. avg R on losses, weighted by frequency. Pros monitor expectancy in R, not just dollars — scales with account.",
          "Trackion computes expectancy automatically from imported fills — no formula that breaks when you add a spreadsheet column.",
        ],
      },
      {
        heading: "Profit factor and drawdown",
        paragraphs: [
          "Profit factor = gross profit / gross loss. Above 1.5 with reasonable sample suggests edge; below 1.0 = net loss. Complements expectancy with total magnitude view.",
          "Max drawdown: largest peak-to-trough drop on equity curve. Psychologically the number that tests whether you keep following the plan. Many abandon method at drawdown bottom — exactly when review is most valuable.",
          "Equity curve should be visible daily, not only in monthly reports. Flat curve with revenge spikes = diagnosable pattern.",
        ],
      },
      {
        heading: "Filters that reveal real edge",
        paragraphs: [
          "Win rate and expectancy by time, pair, setup tag, day of week. Maybe you're profitable only on morning BTCUSDT and donate on late-night altcoins. Without filters, you blend everything and think \"the market changed.\"",
          "Filter by emotion (FOMO vs. plan): expectancy difference here pays for the journal alone. Filter by exchange: secondary account may be negative while main saves the month.",
          "Smart reports in Trackion apply these filters on synced history — seconds for insight spreadsheets would take hours and still miss a fill.",
        ],
      },
      {
        heading: "From data to decision with Trackion",
        paragraphs: [
          "~2s sync, <30s PnL, automatic metrics. Connect Binance, MEXC or Bitget, import history and run your favorite filters in the first week.",
          "14-day Elite trial free, no card. If you discover one filter changes how you allocate time (e.g. stop late-night altcoins), analytics already beat another chart indicator.",
        ],
      },
    ],
  },
};
