import {
  BarChart3,
  TrendingUp,
  Target,
  Zap,
  ArrowRight,
  LineChart,
  ClipboardList,
  Trophy,
  PieChart,
  ShieldCheck,
  Brain,
  Ban,
  Link2,
  RefreshCw,
  Clock,
} from "lucide-react";
import { useState, useEffect } from "react";
import { AnimatedWealthChart } from "./components/AnimatedWealthChart";
import { HeroWaveCanvas } from "./components/HeroWaveCanvas";
import { TrialSignupModal } from "./components/TrialSignupModal";
import { submitTrialSignup } from "./lib/trialSignup";

export type LandingPageProps = {
  /** Ex.: abrir dashboard / auth — opcional na landing estática */
  onStartClick?: () => void;
};

const OFFERINGS = [
  {
    icon: LineChart,
    title: "Dashboard de performance",
    description: "Visualize win rate, expectancy, drawdown e evolução do capital em um painel claro e objetivo.",
  },
  {
    icon: ClipboardList,
    title: "Registro completo de trades",
    description: "Cadastre entradas, saídas, tags e notas — tudo organizado para revisar o que funciona.",
  },
  {
    icon: Trophy,
    title: "Metas e disciplina",
    description: "Defina objetivos diários, semanais e mensais e acompanhe se está no caminho certo.",
  },
  {
    icon: PieChart,
    title: "Relatórios inteligentes",
    description: "Filtre por ativo, estratégia ou período e enxergue padrões nos seus resultados.",
  },
];

const EXCHANGES = ["MEXC", "Bitget", "Binance"] as const;

const INTEGRATION_BENEFITS = [
  {
    icon: RefreshCw,
    title: "Trades sincronizados automaticamente",
    description:
      "Conecte sua exchange e deixe o Trackion importar execuções em tempo real — sem copiar ordem por ordem para uma planilha.",
  },
  {
    icon: Clock,
    title: "Histórico sempre atualizado",
    description:
      "Seu journal reflete o que realmente aconteceu na conta. PnL, win rate e métricas ficam prontos para análise assim que você opera.",
  },
  {
    icon: ShieldCheck,
    title: "Menos erro, mais confiança nos dados",
    description:
      "Acabou o risco de esquecer um trade ou errar tamanho de posição na hora de registrar. Você analisa números reais, não memória.",
  },
  {
    icon: Link2,
    title: "Mais exchanges a caminho",
    description:
      "MEXC, Bitget e Binance já estão no radar — e estamos expandindo integrações para você centralizar tudo em um só lugar.",
  },
];

const STOP_BETTING_POINTS = [
  {
    icon: Ban,
    title: "Operar no feeling é apostar",
    description:
      "Entrar sem plano, dobrar mão após loss ou ignorar o histórico transforma o mercado em cassino. Trackion mostra a realidade dos seus números.",
  },
  {
    icon: Brain,
    title: "Disciplina nasce de dados",
    description:
      "Quando você enxerga win rate, drawdown e expectancy, deixa de repetir os mesmos erros e passa a tomar decisões com método.",
  },
  {
    icon: ShieldCheck,
    title: "Regras antes da emoção",
    description:
      "Metas, limites e revisão de trades criam um processo — não um palpite. Você opera como profissional, não como apostador.",
  },
];

type OfferingsContentProps = {
  onStart: () => void;
};

function OfferingsContent({ onStart }: OfferingsContentProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-widest text-[#FF8C42]">O que oferecemos</p>
        <h2 className="text-3xl font-bold leading-tight tracking-wide text-white sm:text-4xl lg:text-[2.5rem]">
          Tudo que você precisa para evoluir como trader
        </h2>
        <p className="max-w-lg text-base leading-relaxed text-gray-300">
          O Trackion reúne registro, análise e metas em um só lugar — para você parar de adivinhar e passar a operar
          com clareza sobre os seus números.
        </p>
      </div>

      <ul className="space-y-5">
        {OFFERINGS.map(({ icon: Icon, title, description }) => (
          <li key={title} className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FF8C42]/15">
              <Icon className="h-5 w-5 text-[#FF8C42]" aria-hidden />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold tracking-wide text-white sm:text-lg">{title}</h3>
              <p className="text-sm leading-relaxed text-gray-400 sm:text-base">{description}</p>
            </div>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onStart}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#FF8C42] px-6 py-2.5 text-base font-bold text-white transition hover:bg-[#FF7A2E]"
      >
        Conhecer o app
        <ArrowRight className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

/**
 * Landing Trackion — faixa halftone contínua na junção hero/ofertas; seção de ofertas com PC.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LandingPage({ onStartClick }: LandingPageProps) {
  const [scrollY, setScrollY] = useState(0);
  const [footerEmail, setFooterEmail] = useState("");
  const [trialModalOpen, setTrialModalOpen] = useState(false);
  const [trialSubmitting, setTrialSubmitting] = useState(false);
  const [trialError, setTrialError] = useState<string | null>(null);
  const [trialSuccess, setTrialSuccess] = useState(false);
  const goStart = onStartClick ?? (() => {});

  const openTrialModal = (email?: string) => {
    if (email?.trim()) setFooterEmail(email.trim());
    setTrialError(null);
    setTrialSuccess(false);
    setTrialModalOpen(true);
  };

  const handleFooterCta = () => {
    const trimmed = footerEmail.trim();
    if (!trimmed || !EMAIL_RE.test(trimmed)) {
      openTrialModal();
      return;
    }
    openTrialModal(trimmed);
  };

  const handleTrialSubmit = async ({ name, email }: { name: string; email: string }) => {
    setTrialSubmitting(true);
    setTrialError(null);
    const result = await submitTrialSignup(name, email);
    setTrialSubmitting(false);
    if (!result.ok) {
      setTrialError(result.message);
      return;
    }
    setTrialSuccess(true);
    setFooterEmail(email);
  };

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/[0.06] bg-black">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo-trackion.png"
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 shrink-0 object-contain"
              decoding="async"
            />
            <span className="text-xl font-bold tracking-wide text-white">TRACKION</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#recursos" className="text-sm text-gray-300 transition hover:text-white">
              Recursos
            </a>
            <a href="#integracoes" className="text-sm text-gray-300 transition hover:text-white">
              Integrações
            </a>
            <a href="#pare-de-apostar" className="text-sm text-gray-300 transition hover:text-white">
              Como funciona
            </a>
            <a href="#" className="text-sm text-gray-300 transition hover:text-white">
              Preços
            </a>
            <a href="#" className="text-sm text-gray-300 transition hover:text-white">
              Blog
            </a>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={goStart}
              className="inline-flex items-center justify-center rounded-lg border border-white bg-transparent px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={goStart}
              className="inline-flex items-center justify-center rounded-lg bg-[#FF8C42] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#FF7A2E]"
            >
              Começar agora
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-screen items-center overflow-visible bg-black px-6 pb-0 pt-32">
        {/* Faixa halftone — ancora no rodapé do hero e continua na seção abaixo */}
        <div
          className="pointer-events-none absolute inset-x-0 z-[2] h-[min(46vh,400px)] sm:h-[min(50vh,440px)]"
          style={{ bottom: "max(-14vh, -120px)" }}
          aria-hidden
        >
          <div className="h-full w-full [mask-image:linear-gradient(to_bottom,#000_0%,#000_42%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,#000_0%,#000_42%,transparent_100%)]">
            <HeroWaveCanvas variant="orangeBlack" crop="wave-band" fit="stretch" />
          </div>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-8 xl:max-w-[100rem] xl:px-8 2xl:max-w-[108rem]">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.78fr)] lg:gap-6 xl:gap-8">
            <div className="space-y-6 lg:space-y-5 lg:max-w-md xl:max-w-lg">
              <div className="space-y-3">
                <h1 className="text-4xl font-bold leading-[1.08] tracking-wide text-white sm:text-5xl lg:text-[2.35rem] xl:text-5xl 2xl:text-6xl">
                  Domine seus trades.
                  <br />
                  Acompanhe sua
                  <br />
                  <span className="text-[#FF8C42]">performance.</span>
                </h1>
                <p className="max-w-sm text-sm leading-relaxed text-gray-300 sm:max-w-md sm:text-base">
                  Tracktion é o sistema completo para traders que querem enxergar resultado, controlar metas e tomar
                  decisões melhores com base nos próprios dados.
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                {[
                  { icon: TrendingUp, text: "Análises avançadas" },
                  { icon: Target, text: "Relatórios inteligentes" },
                  { icon: Zap, text: "Metas e objetivos" },
                  { icon: BarChart3, text: "100% focado em resultados" },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#FF8C42]/20">
                        <Icon className="h-4 w-4 text-[#FF8C42]" aria-hidden />
                      </div>
                      <span className="text-sm font-medium text-white sm:text-base">{item.text}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-3 pt-4">
                <button
                  type="button"
                  onClick={goStart}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#FF8C42] px-6 py-2.5 text-base font-bold text-white transition hover:bg-[#FF7A2E] sm:px-8"
                >
                  Começar agora
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-lg border-2 border-white bg-black/40 px-6 py-2.5 text-base font-bold text-white backdrop-blur-sm transition hover:bg-white/10 sm:px-8"
                >
                  Ver demo
                </button>
              </div>
            </div>

            <div className="relative mx-auto w-full min-w-0 justify-self-center lg:justify-self-end">
              <div className="relative mx-auto w-full max-w-3xl sm:max-w-4xl lg:max-w-none lg:w-[min(100%,90rem)] xl:w-[min(100%,100rem)] 2xl:w-[min(100%,112rem)]">
                <img
                  src="/mockup_pc.png"
                  alt="Trackion Dashboard Desktop"
                  className="relative z-10 mx-auto block h-auto w-full drop-shadow-2xl"
                  style={{
                    transform: `translateY(${scrollY * 0.04}px)`,
                    transition: "transform 0.2s ease-out",
                  }}
                  decoding="async"
                />
                <img
                  src="/mockup_mobile.png"
                  alt="Trackion Dashboard Mobile"
                  className="absolute right-[4%] bottom-0 z-20 h-auto min-w-[80px] w-[24%] max-w-[190px] drop-shadow-2xl sm:min-w-[95px] sm:max-w-[230px] lg:w-[26%] lg:max-w-[270px] xl:max-w-[300px] 2xl:max-w-[320px]"
                  style={{
                    transform: `translateY(${scrollY * 0.065}px)`,
                    transition: "transform 0.2s ease-out",
                  }}
                  decoding="async"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ofertas — imagem responsiva: celular em telas pequenas, PC em telas grandes */}
      <section
        id="recursos"
        className="relative z-10 -mt-[min(14vh,128px)] bg-[linear-gradient(to_bottom,transparent_0%,transparent_10%,rgba(0,0,0,0.75)_26%,#000_42%,#000_100%)] px-6 pb-24 pt-[min(20vh,180px)] sm:pb-32 sm:pt-[min(22vh,200px)]"
      >
        <div className="mx-auto w-full max-w-7xl px-4 xl:max-w-[100rem] xl:px-8">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,0.88fr)] lg:gap-10 xl:gap-12">
            <div className="relative mx-auto w-full max-w-[240px] sm:max-w-[280px] lg:mx-0 lg:max-w-none lg:w-[min(100%,100rem)] xl:w-[min(100%,108rem)]">
              <img
                src="/mockup_pc.png"
                alt="Trackion — painel desktop"
                className="hidden h-auto w-full drop-shadow-2xl lg:block"
                style={{ transform: `translateY(${scrollY * 0.02}px)` }}
                decoding="async"
                loading="lazy"
              />
              <img
                src="/mockup_mobile.png"
                alt="Trackion — app no celular"
                className="block h-auto w-full drop-shadow-2xl lg:hidden"
                style={{ transform: `translateY(${scrollY * 0.02}px)` }}
                decoding="async"
                loading="lazy"
              />
            </div>
            <OfferingsContent onStart={goStart} />
          </div>
        </div>
      </section>

      {/* Divisor laranja com fade nas pontas */}
      <div className="relative z-10 bg-black px-6 py-10 sm:py-12" aria-hidden>
        <div className="mx-auto h-px max-w-3xl bg-[linear-gradient(to_right,transparent_0%,rgba(255,140,66,0.35)_12%,#FF8C42_50%,rgba(255,140,66,0.35)_88%,transparent_100%)] sm:max-w-4xl" />
      </div>

      {/* Integrações com exchanges — sync automático de trades */}
      <section id="integracoes" className="relative z-10 bg-black px-6 py-24 sm:py-32">
        <div className="mx-auto w-full max-w-7xl space-y-14 px-4 xl:max-w-[100rem] xl:px-8">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.25fr)] lg:gap-14">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#FF8C42]">Integrações via API</p>
              <h2 className="text-3xl font-bold leading-tight tracking-wide text-white sm:text-4xl lg:text-[2.75rem]">
                Seus trades entram sozinhos.
                <br /> Você só analisa.
              </h2>
              <p className="max-w-xl text-base leading-relaxed text-gray-300 sm:text-lg">
                Conectamos com as principais exchanges para puxar execuções automaticamente. Sem planilha, sem cadastro
                manual trade a trade — o Trackion monta seu histórico enquanto você foca no mercado.
              </p>

              <p className="font-mono text-xs tracking-[0.32em] text-gray-500 sm:text-sm">
                {EXCHANGES.map((name, i) => (
                  <span key={name}>
                    {i > 0 && <span className="mx-2 text-[#FF8C42]/50 sm:mx-3">/</span>}
                    <span className="text-white">{name}</span>
                  </span>
                ))}
                <span className="mx-2 text-[#FF8C42]/50 sm:mx-3">/</span>
                <span className="text-gray-500">+ em breve</span>
              </p>
            </div>

            <div className="relative mx-auto w-full max-w-3xl lg:max-w-none">
              <AnimatedWealthChart />
            </div>
          </div>

          <ol className="grid grid-cols-1 gap-x-8 gap-y-10 border-y border-white/[0.06] py-10 sm:grid-cols-2 xl:grid-cols-4">
            {INTEGRATION_BENEFITS.map(({ icon: Icon, title, description }, i) => (
              <li key={title} className="relative pl-12">
                <span className="absolute left-0 top-0 font-mono text-xs font-medium tracking-[0.25em] text-[#FF8C42]/80">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Icon className="mt-8 h-6 w-6 text-[#FF8C42]" aria-hidden />
                <h3 className="mt-4 text-lg font-bold tracking-wide text-white sm:text-xl">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-400 sm:text-base">{description}</p>
              </li>
            ))}
          </ol>

          <p className="max-w-2xl text-sm leading-relaxed text-gray-500 sm:text-base">
            Integração segura via API — você autoriza a leitura das operações; nós cuidamos de organizar, calcular e
            exibir tudo no dashboard.
          </p>
        </div>
      </section>

      {/* Pare de apostar — trading com método, não no achismo */}
      <section
        id="pare-de-apostar"
        className="relative z-10 bg-black px-6 pb-24 pt-4 sm:pb-32 sm:pt-6"
      >
        <div className="mx-auto max-w-4xl px-4 text-center xl:max-w-5xl xl:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#FF8C42]">Mindset de trader</p>
          <h2 className="mt-4 text-4xl font-bold leading-[1.05] tracking-wide text-white sm:text-5xl lg:text-6xl">
            PARE DE <span className="text-[#FF8C42]">APOSTAR</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-gray-300 sm:text-lg">
            Trading não é sorte. Quem opera no impulso — sem registrar, medir e revisar — está apostando o próprio
            capital. O Trackion existe para tirar você desse ciclo e colocar{" "}
            <span className="font-semibold text-white">processo, métricas e consistência</span> no centro.
          </p>
        </div>

        <div className="mx-auto mt-14 max-w-5xl px-4 sm:mt-16 xl:max-w-6xl xl:px-8">
          <div className="divide-y divide-white/[0.08]">
            {STOP_BETTING_POINTS.map(({ icon: Icon, title, description }, i) => (
              <article
                key={title}
                className="group grid grid-cols-1 gap-4 py-10 first:pt-0 last:pb-0 sm:grid-cols-[auto_1fr] sm:gap-8 sm:py-12"
              >
                <div className="flex items-start gap-4 sm:flex-col sm:items-center sm:gap-2">
                  <span
                    className="text-5xl font-bold leading-none tracking-tighter text-white/25 transition-colors group-hover:text-[#FF8C42]/55 sm:text-6xl"
                    aria-hidden
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <Icon className="h-7 w-7 shrink-0 text-[#FF8C42] sm:h-8 sm:w-8" aria-hidden />
                </div>
                <div className="sm:border-l sm:border-white/[0.06] sm:pl-8">
                  <h3 className="text-xl font-bold tracking-wide text-white sm:text-2xl">{title}</h3>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-400 sm:text-base">{description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-14 max-w-2xl px-4 text-center sm:mt-16">
          <p className="text-sm leading-relaxed text-gray-400 sm:text-base">
            Pare de confiar no &ldquo;feeling&rdquo;. Comece a confiar nos seus dados — e deixe o mercado trabalhar a
            seu favor com estratégia, não com esperança.
          </p>
          <button
            type="button"
            onClick={goStart}
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-[#FF8C42] px-8 py-3 text-base font-bold text-white transition hover:bg-[#FF7A2E]"
          >
            Trocar aposta por método
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </section>

      {/* CTA trial — footer */}
      <footer
        id="trial"
        className="relative z-10 border-t border-white/[0.08] bg-black px-6 py-20 sm:py-28"
      >
        <div className="mx-auto max-w-3xl px-4 text-center xl:px-8">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.3em] text-[#FF8C42]">14 dias grátis</p>
          <h2 className="mt-4 text-2xl font-bold leading-tight tracking-wide text-white sm:text-3xl lg:text-4xl">
            Deseja usar o Trackion na sua vida e ver resultados?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-gray-400 sm:text-base">
            Deixe seu e-mail e comece agora —{" "}
            <span className="text-white">14 dias gratuitos</span>, sem cartão de crédito.
          </p>

          <div className="mx-auto mt-8 flex max-w-lg flex-col gap-3 sm:flex-row sm:items-stretch">
            <input
              type="email"
              value={footerEmail}
              onChange={(e) => setFooterEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleFooterCta()}
              placeholder="seu@email.com"
              autoComplete="email"
              className="min-w-0 flex-1 border border-white/15 bg-black px-4 py-3.5 text-sm text-white placeholder:text-gray-600 outline-none transition focus:border-[#FF8C42]/60 focus:ring-1 focus:ring-[#FF8C42]/40"
            />
            <button
              type="button"
              onClick={handleFooterCta}
              className="shrink-0 rounded-lg bg-[#FF8C42] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#FF7A2E] sm:px-8"
            >
              Usar 14 dias grátis
            </button>
          </div>
          <p className="mt-4 text-xs text-gray-500">Sem cartão · Cancele quando quiser · Link enviado por e-mail</p>
        </div>

        <div className="mx-auto mt-16 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-white/[0.06] px-4 pt-8 text-center text-xs text-gray-500 sm:flex-row sm:text-left xl:px-8">
          <div className="flex items-center gap-2">
            <img src="/logo-trackion.png" alt="" width={24} height={24} className="h-6 w-6 object-contain" />
            <span className="font-bold tracking-wide text-gray-400">TRACKION</span>
          </div>
          <p>© {new Date().getFullYear()} Trackion. Trading com método, não no achismo.</p>
        </div>
      </footer>

      <TrialSignupModal
        open={trialModalOpen}
        initialEmail={footerEmail}
        onClose={() => {
          setTrialModalOpen(false);
          if (trialSuccess) {
            setTrialSuccess(false);
            setTrialError(null);
          }
        }}
        onSubmit={handleTrialSubmit}
        submitting={trialSubmitting}
        error={trialError}
        success={trialSuccess}
      />
    </div>
  );
}
