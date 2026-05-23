import {
  ArrowDownRight,
  ArrowUpRight,
  Ban,
  Brain,
  ClipboardList,
  Clock,
  Compass,
  LineChart,
  Link2,
  PieChart,
  Plus,
  RefreshCw,
  ShieldCheck,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { useEffect, useState, type ComponentType, type SVGProps } from "react";
import { AnimatedWealthChart } from "./components/AnimatedWealthChart";
import { HeroWaveCanvas } from "./components/HeroWaveCanvas";
import { TrialSignupModal } from "./components/TrialSignupModal";
import { submitTrialSignup } from "./lib/trialSignup";
import { useMarketTicker } from "./hooks/useMarketTicker";

export type LandingPageProps = {
  onStartClick?: () => void;
};

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ============================== DATA ==============================

const NAV_LINKS = [
  { href: "#recursos", index: "01", label: "Recursos" },
  { href: "#integracoes", index: "02", label: "Integrações" },
  { href: "#metodo", index: "03", label: "Método" },
  { href: "#precos", index: "04", label: "Preços" },
] as const;

const BIG_STATS = [
  { label: "Trades importados", value: "1.28M", caption: "via API · 30d", index: "01" },
  { label: "Métricas calculadas", value: "27+", caption: "win rate · expectancy · DD · R/R", index: "02" },
  { label: "Setup inicial", value: "< 2min", caption: "conecte sua exchange", index: "03" },
  { label: "Dias grátis", value: "14", caption: "sem cartão de crédito", index: "04" },
] as const;

const OFFERINGS: ReadonlyArray<{ icon: IconType; title: string; description: string; tag: string }> = [
  {
    tag: "DASHBOARD",
    icon: LineChart,
    title: "Performance ao vivo",
    description:
      "Win rate, expectancy, drawdown e evolução do capital em um painel claro e objetivo — não em planilhas espalhadas.",
  },
  {
    tag: "JOURNAL",
    icon: ClipboardList,
    title: "Registro completo de trades",
    description:
      "Cadastre entradas, saídas, tags e notas. Anexe screenshots. Revise o que funciona com contexto real.",
  },
  {
    tag: "GOALS",
    icon: Trophy,
    title: "Metas e disciplina",
    description:
      "Defina objetivos diários, semanais e mensais. Receba feedback quando passar do limite de risco do dia.",
  },
  {
    tag: "REPORTS",
    icon: PieChart,
    title: "Relatórios inteligentes",
    description:
      "Filtre por ativo, estratégia, dia da semana ou horário. Enxergue padrões que sua memória esquece.",
  },
];

const EXCHANGES: ReadonlyArray<{ name: string; status: "live" | "soon"; pair: string }> = [
  { name: "MEXC", status: "live", pair: "spot · futures" },
  { name: "Bitget", status: "live", pair: "spot · futures" },
  { name: "Binance", status: "live", pair: "spot · futures" },
  { name: "Bybit", status: "soon", pair: "Q1 2026" },
  { name: "OKX", status: "soon", pair: "Q1 2026" },
];

const INTEGRATION_BENEFITS: ReadonlyArray<{ icon: IconType; title: string; description: string }> = [
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
];

const STOP_BETTING_POINTS: ReadonlyArray<{ icon: IconType; title: string; description: string; tag: string }> = [
  {
    tag: "PROBLEMA",
    icon: Ban,
    title: "Operar no feeling é apostar.",
    description:
      "Entrar sem plano, dobrar mão após loss, ignorar o histórico — o mercado vira cassino. O Trackion mostra a realidade dos seus números, não a sua memória seletiva.",
  },
  {
    tag: "CAUSA",
    icon: Brain,
    title: "Disciplina nasce de dados.",
    description:
      "Quando você enxerga win rate, drawdown e expectancy reais, deixa de repetir os mesmos erros. Decisões passam a ter método — não palpite.",
  },
  {
    tag: "REMÉDIO",
    icon: ShieldCheck,
    title: "Regras antes da emoção.",
    description:
      "Metas, limites de risco e revisão sistemática criam um processo. Você opera como um profissional, não como um apostador esperando sorte.",
  },
];

const HERO_PILLS: ReadonlyArray<{ icon: IconType; text: string }> = [
  { icon: LineChart, text: "Analytics avançado" },
  { icon: Target, text: "Metas & risco" },
  { icon: Zap, text: "Sync em tempo real" },
  { icon: Compass, text: "Foco em método" },
];

// ============================== UI HELPERS ==============================

function TickerBar() {
  const { items } = useMarketTicker();

  return (
    <div className="relative z-40 overflow-hidden border-y border-white/[0.08] bg-black/90 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-black to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-black to-transparent" />
      <div className="flex w-max tk-marquee">
        {[...items, ...items].map((item, i) => (
          <div
            key={`${item.symbol}-${i}`}
            className="flex shrink-0 items-center gap-3 border-r border-white/[0.06] px-6 py-2.5 font-mono text-[11px]"
          >
            <span className="tracking-[0.18em] text-gray-500">{item.symbol}</span>
            <span className="num font-semibold text-white">{item.price}</span>
            <span
              className={`num inline-flex items-center gap-1 font-semibold ${
                item.up ? "text-tk-green" : "text-tk-red"
              }`}
            >
              {item.up ? (
                <ArrowUpRight className="h-3 w-3" aria-hidden />
              ) : (
                <ArrowDownRight className="h-3 w-3" aria-hidden />
              )}
              {item.delta}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CrossMark({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden className={`pointer-events-none absolute h-3 w-3 ${className}`}>
      <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/30" />
      <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-white/30" />
    </span>
  );
}

/** Esquina marcada com linhas (estilo CAD/blueprint) */
function CornerMarks({ orange = false }: { orange?: boolean }) {
  const color = orange ? "border-[#FF8C42]" : "border-white/30";
  return (
    <>
      <span aria-hidden className={`absolute -top-px -left-px h-3 w-3 border-t border-l ${color}`} />
      <span aria-hidden className={`absolute -top-px -right-px h-3 w-3 border-t border-r ${color}`} />
      <span aria-hidden className={`absolute -bottom-px -left-px h-3 w-3 border-b border-l ${color}`} />
      <span aria-hidden className={`absolute -bottom-px -right-px h-3 w-3 border-b border-r ${color}`} />
    </>
  );
}

function SectionLabel({ index, label, total = "04" }: { index: string; label: string; total?: string }) {
  return (
    <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.28em]">
      <span className="text-[#FF8C42]">[{index}]</span>
      <span className="h-px w-8 bg-white/20" aria-hidden />
      <span className="text-white">{label}</span>
      <span className="text-gray-600">/ {total}</span>
    </div>
  );
}

// ============================== PAGE ==============================

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

  const todayISO = new Date().toISOString().slice(0, 10);
  const year = new Date().getFullYear();

  return (
    <div className="relative overflow-hidden bg-black text-white">
      {/* =================== NAV ===================== */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/[0.06] bg-black/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-3.5">
          <a href="#" className="group flex items-center gap-2.5">
            <img
              src="/logo-trackion.png"
              alt=""
              width={26}
              height={26}
              className="h-6 w-6 shrink-0 object-contain"
              decoding="async"
            />
            <span className="text-base font-bold tracking-[0.32em] text-white">TRACKION</span>
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.22em] text-gray-500 sm:inline">
              ─ trading journal v2
            </span>
          </a>
          <div className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="group flex items-baseline gap-1.5 text-sm text-gray-400 transition hover:text-white"
              >
                <span className="font-mono text-[10px] text-[#FF8C42]/70 group-hover:text-[#FF8C42]">
                  {link.index}
                </span>
                {link.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={goStart}
              className="hidden font-mono text-[11px] uppercase tracking-[0.22em] text-gray-400 transition hover:text-white sm:inline-flex"
            >
              Entrar →
            </button>
            <button
              type="button"
              onClick={() => openTrialModal()}
              className="group relative inline-flex items-center gap-2 border border-[#FF8C42] bg-[#FF8C42] px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-black transition hover:bg-transparent hover:text-[#FF8C42]"
            >
              Start Free
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
            </button>
          </div>
        </div>
      </nav>

      {/* TICKER abaixo do nav */}
      <div className="fixed top-[57px] z-40 w-full">
        <TickerBar />
      </div>

      {/* =================== HERO ===================== */}
      <section className="relative pt-[8.5rem] pb-24 sm:pt-[10rem] sm:pb-32">
        {/* Background: grid + ambient orange + wave */}
        <div className="pointer-events-none absolute inset-0 bg-grid bg-grid-fade" aria-hidden />
        <div
          className="pointer-events-none absolute -top-40 left-1/2 z-0 h-[820px] w-[820px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,140,66,0.16),transparent_60%)] blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[60vh] opacity-50"
          aria-hidden
        >
          <div className="h-full w-full [mask-image:linear-gradient(to_bottom,transparent_0%,#000_55%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,#000_55%)]">
            <HeroWaveCanvas variant="orangeBlack" crop="wave-band" fit="stretch" />
          </div>
        </div>

        <div className="relative z-10 mx-auto max-w-[1400px] px-6">
          {/* Linha superior: metadata editorial */}
          <div className="tk-rise tk-rise-1 mb-12 flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4 font-mono text-[11px] uppercase tracking-[0.22em] text-gray-500">
            <div className="flex items-center gap-6">
              <span>
                <span className="text-[#FF8C42]">●</span> Beta privado
              </span>
              <span className="hidden sm:inline">14 dias grátis</span>
              <span className="hidden lg:inline">sem cartão de crédito</span>
            </div>
            <div className="flex items-center gap-6">
              <span className="hidden sm:inline num">VOL.01 — ISSUE {todayISO}</span>
              <span className="num text-white">SP-500 +0.42% · NDX +1.18%</span>
            </div>
          </div>

          {/* Grid hero assimétrico */}
          <div className="grid grid-cols-12 gap-6 lg:gap-10">
            {/* Coluna esquerda: tipografia massiva */}
            <div className="col-span-12 min-w-0 lg:col-span-6">
              <div className="tk-rise tk-rise-2 mb-6 font-mono text-[11px] uppercase tracking-[0.32em] text-[#FF8C42]">
                [00 — Trading Journal]
              </div>

              <h1 className="tk-rise tk-rise-3 font-sans text-[14vw] font-bold leading-[0.86] tracking-[-0.02em] text-white sm:text-[6rem] lg:text-[5rem] xl:text-[6.5rem] 2xl:text-[8rem]">
                <span className="block">DOMINE</span>
                <span className="block">SEUS</span>
                <span className="block">
                  <span className="font-serif italic font-light text-[#FF8C42] tracking-tight">trades</span>
                  <span className="text-[#FF8C42]">.</span>
                </span>
              </h1>

              {/* CTAs */}
              <div className="tk-rise tk-rise-5 mt-10 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => openTrialModal()}
                  className="group relative inline-flex items-center gap-2.5 border border-[#FF8C42] bg-[#FF8C42] px-6 py-3.5 text-sm font-bold uppercase tracking-[0.22em] text-black transition hover:bg-transparent hover:text-[#FF8C42]"
                >
                  <span>$ start --trial=14d</span>
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={goStart}
                  className="inline-flex items-center gap-2 border border-white/20 bg-transparent px-6 py-3.5 text-sm font-bold uppercase tracking-[0.22em] text-white transition hover:border-white/50 hover:bg-white/[0.04]"
                >
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-tk-green" />
                  Watch demo
                </button>
              </div>

              {/* Feature row */}
              <ul className="tk-rise tk-rise-6 mt-10 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
                {HERO_PILLS.map(({ icon: Icon, text }, i) => (
                  <li key={text} className="flex items-center gap-2 text-gray-400">
                    <span className="font-mono text-[10px] text-gray-600">
                      0{i + 1}
                    </span>
                    <Icon className="h-3.5 w-3.5 text-[#FF8C42]" aria-hidden />
                    {text}
                  </li>
                ))}
              </ul>
            </div>

            {/* Coluna direita: PC + mobile soltos com drop-shadow (estilo V1) */}
            <aside className="tk-rise tk-rise-4 relative col-span-12 min-w-0 self-center lg:col-span-6">
              <div className="absolute -top-7 left-0 z-30 hidden items-center gap-3 font-mono text-[10px] uppercase tracking-[0.28em] text-gray-500 lg:flex">
                <span className="text-[#FF8C42]">↘</span>
                <span>fig.01 — dashboard.exec</span>
                <span className="h-px w-16 bg-white/10" />
                <span className="flex items-center gap-1.5 text-tk-green">
                  <span className="h-1 w-1 animate-pulse rounded-full bg-tk-green" />
                  live
                </span>
              </div>

              {/* wrapper: cabe no aside até xl; vaza levemente em xl+ */}
              <div className="relative w-full xl:w-[108%] 2xl:w-[120%]">
                <img
                  src="/mockup_pc.png"
                  alt="Trackion Dashboard Desktop"
                  className="relative z-10 mx-auto block h-auto w-full drop-shadow-[0_30px_80px_rgba(0,0,0,0.7)]"
                  style={{ transform: `translateY(${Math.min(scrollY, 280) * 0.04}px)` }}
                  decoding="async"
                />
                <img
                  src="/mockup_mobile.png"
                  alt="Trackion Dashboard Mobile"
                  className="absolute right-[4%] bottom-0 z-20 h-auto w-[24%] min-w-[90px] max-w-[200px] drop-shadow-[0_30px_60px_rgba(0,0,0,0.85)] sm:w-[22%] sm:max-w-[230px] lg:w-[24%] lg:max-w-[250px] xl:max-w-[290px] 2xl:max-w-[320px]"
                  style={{ transform: `translateY(${Math.min(scrollY, 280) * 0.065}px)` }}
                  decoding="async"
                  loading="lazy"
                />
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* =================== STATS / NUMBERS ROW ===================== */}
      <section className="relative border-y border-white/[0.08] bg-black">
        <div className="pointer-events-none absolute inset-0 bg-grid-fine opacity-50" aria-hidden />
        <div className="relative mx-auto max-w-[1400px] px-6">
          <div className="flex items-center justify-between border-b border-white/[0.06] py-3 font-mono text-[10px] uppercase tracking-[0.28em] text-gray-500">
            <span>
              <span className="text-[#FF8C42]">●</span> índices · operação trackion
            </span>
            <span className="hidden sm:inline">ATUALIZADO {todayISO}</span>
          </div>
          <div className="grid grid-cols-2 divide-x divide-white/[0.06] lg:grid-cols-4">
            {BIG_STATS.map((s) => (
              <div key={s.label} className="relative space-y-3 px-6 py-10 first:pl-0 last:pr-0">
                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.28em] text-gray-500">
                  <span>{s.label}</span>
                  <span className="text-[#FF8C42]/70">[{s.index}]</span>
                </div>
                <p className="num text-5xl font-bold leading-none tracking-tight text-white sm:text-6xl">
                  {s.value}
                </p>
                <p className="text-xs text-gray-500 sm:text-sm">{s.caption}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =================== RECURSOS ===================== */}
      <section id="recursos" className="relative bg-black py-32">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-40 bg-grid-fade" aria-hidden />
        <div className="relative mx-auto max-w-[1400px] px-6">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-5">
              <SectionLabel index="01" label="Recursos" />
              <h2 className="mt-8 text-balance text-5xl font-bold leading-[0.92] tracking-tight text-white sm:text-6xl lg:text-[5rem] xl:text-[5.5rem]">
                Tudo num{" "}
                <span className="bg-gradient-to-r from-[#FFD0A8] via-[#FF8C42] to-[#BC5C2A] bg-clip-text text-transparent">
                  só
                </span>{" "}
                lugar.
              </h2>
              <p className="mt-8 max-w-md text-base leading-relaxed text-gray-400">
                Registro, análise e metas em um produto coeso — não em três planilhas e dois apps
                desconectados.
              </p>
              <div className="mt-10 flex items-center gap-4 border-t border-white/[0.06] pt-6 font-mono text-[10px] uppercase tracking-[0.28em] text-gray-500">
                <span className="text-[#FF8C42]">↳</span>
                <span>4 módulos / 1 dashboard / 0 planilhas</span>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-7">
              <ol className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
                {OFFERINGS.map(({ icon: Icon, title, description, tag }, i) => (
                  <li
                    key={title}
                    className="group relative grid grid-cols-[auto_1fr_auto] items-start gap-6 py-8 transition-colors hover:bg-white/[0.02] sm:gap-10 sm:py-10"
                  >
                    <div className="space-y-3">
                      <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#FF8C42]/80">
                        [0{i + 1}]
                      </p>
                      <div className="flex h-12 w-12 items-center justify-center border border-white/10 bg-black transition group-hover:border-[#FF8C42]/60">
                        <Icon className="h-5 w-5 text-[#FF8C42]" aria-hidden />
                      </div>
                    </div>
                    <div className="min-w-0 space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="border border-white/15 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.28em] text-gray-400">
                          {tag}
                        </span>
                      </div>
                      <h3 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
                        {title}
                      </h3>
                      <p className="max-w-xl text-sm leading-relaxed text-gray-400 sm:text-base">
                        {description}
                      </p>
                    </div>
                    <ArrowUpRight
                      className="mt-2 h-5 w-5 text-gray-700 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[#FF8C42]"
                      aria-hidden
                    />
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* =================== INTEGRAÇÕES — BRUTALIST HEADER ===================== */}
      <section id="integracoes" className="relative overflow-hidden border-t border-white/[0.08] bg-black py-32">
        <div className="pointer-events-none absolute inset-0 bg-grid-fine opacity-60" aria-hidden />
        <div className="relative mx-auto max-w-[1400px] px-6">
          <SectionLabel index="02" label="Integrações via API" />

          {/* HEADER MASSIVO */}
          <div className="mt-10">
            <h2 className="text-balance font-sans text-[11vw] font-bold leading-[0.9] tracking-[-0.03em] sm:text-[4.5rem] lg:text-[5.5rem] xl:text-[7rem] 2xl:text-[8rem]">
              <span className="block text-white">Trades entram</span>
              <span className="block">
                <span className="text-stroke-orange">sozinhos.</span>
              </span>
              <span className="block text-gray-700">
                Você só{" "}
                <span className="font-serif italic font-light text-white">analisa.</span>
              </span>
            </h2>
            <p className="mt-10 max-w-xl text-base leading-relaxed text-gray-400 sm:text-lg">
              Conectamos com as principais exchanges para puxar execuções em tempo real. Sem
              planilha, sem cadastro manual — Trackion monta seu histórico enquanto o mercado se
              mexe.
            </p>
          </div>

          {/* EXCHANGES TABLE */}
          <div className="mt-20 border-y border-white/[0.08]">
            <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-6 border-b border-white/[0.06] px-2 py-3 font-mono text-[10px] uppercase tracking-[0.28em] text-gray-500">
              <span>EXCHANGE</span>
              <span className="hidden sm:inline">TIPO</span>
              <span>STATUS</span>
              <span>I/O</span>
            </div>
            {EXCHANGES.map((ex, i) => (
              <div
                key={ex.name}
                className="group grid grid-cols-[1fr_auto_auto_auto] items-center gap-6 border-b border-white/[0.04] px-2 py-5 transition-colors last:border-0 hover:bg-white/[0.02]"
              >
                <div className="flex items-baseline gap-4">
                  <span className="font-mono text-[10px] text-gray-600">[0{i + 1}]</span>
                  <span className="text-2xl font-bold tracking-wide text-white sm:text-3xl">
                    {ex.name}
                  </span>
                </div>
                <span className="hidden font-mono text-[11px] uppercase tracking-[0.22em] text-gray-500 sm:inline">
                  {ex.pair}
                </span>
                <span
                  className={`inline-flex items-center gap-2 border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.28em] ${
                    ex.status === "live"
                      ? "border-tk-green/40 bg-tk-green/5 text-tk-green"
                      : "border-white/15 bg-transparent text-gray-500"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      ex.status === "live" ? "animate-pulse bg-tk-green" : "bg-gray-600"
                    }`}
                  />
                  {ex.status === "live" ? "LIVE" : "SOON"}
                </span>
                <ArrowUpRight
                  className={`h-4 w-4 transition-all ${
                    ex.status === "live"
                      ? "text-gray-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#FF8C42]"
                      : "text-gray-800"
                  }`}
                  aria-hidden
                />
              </div>
            ))}
          </div>

          {/* CHART CARD com header */}
          <div className="mt-20 grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-7">
              <div className="relative border border-white/10 bg-black">
                <CornerMarks orange />
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.28em]">
                  <span className="flex items-center gap-3 text-gray-400">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-tk-green" />
                    equity_curve · 30d
                  </span>
                  <span className="text-gray-600">trackion.app</span>
                </div>
                <div className="grid grid-cols-3 divide-x divide-white/[0.06] border-b border-white/[0.06]">
                  <div className="space-y-1 p-4">
                    <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-gray-500">
                      PNL
                    </p>
                    <p className="num text-2xl font-bold text-tk-green sm:text-3xl">+147.82%</p>
                  </div>
                  <div className="space-y-1 p-4">
                    <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-gray-500">
                      TRADES
                    </p>
                    <p className="num text-2xl font-bold text-white sm:text-3xl">312</p>
                  </div>
                  <div className="space-y-1 p-4">
                    <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-gray-500">
                      SHARPE
                    </p>
                    <p className="num text-2xl font-bold text-white sm:text-3xl">2.14</p>
                  </div>
                </div>
                <div className="p-2 sm:p-4">
                  <AnimatedWealthChart />
                </div>
              </div>
            </div>

            <div className="col-span-12 space-y-8 lg:col-span-5 lg:pl-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#FF8C42]">
                ↳ no que muda
              </p>
              <ul className="space-y-px border-y border-white/[0.08]">
                {INTEGRATION_BENEFITS.map(({ icon: Icon, title, description }, i) => (
                  <li
                    key={title}
                    className="group grid grid-cols-[auto_1fr] items-start gap-5 border-b border-white/[0.04] py-5 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[10px] tracking-[0.28em] text-gray-600">
                        0{i + 1}
                      </span>
                      <Icon className="h-5 w-5 text-[#FF8C42]" aria-hidden />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold tracking-tight text-white">{title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-gray-400">{description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* =================== MÉTODO — MANIFESTO BRUTALIST ===================== */}
      <section id="metodo" className="relative overflow-hidden border-t border-white/[0.08] bg-black py-32">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-30 bg-grid-fade" aria-hidden />
        <div
          className="pointer-events-none absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,140,66,0.10),transparent_70%)] blur-3xl"
          aria-hidden
        />

        <div className="relative mx-auto max-w-[1400px] px-6">
          <SectionLabel index="03" label="Manifesto" total="03" />

          <div className="mt-10">
            <h2 className="text-balance font-sans text-[15vw] font-bold leading-[0.88] tracking-[-0.04em] sm:text-[6rem] lg:text-[7.5rem] xl:text-[9.5rem] 2xl:text-[11rem]">
              <span className="block text-white">PARE</span>
              <span className="block">
                <span className="text-gray-700">DE</span>{" "}
                <span className="text-[#FF8C42]">APOSTAR.</span>
              </span>
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-12 items-start gap-6 border-t border-white/[0.08] pt-10">
            <div className="col-span-12 lg:col-span-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#FF8C42]">
                ↳ thesis
              </p>
              <p className="mt-4 max-w-md text-base leading-relaxed text-gray-300 sm:text-lg">
                Trading não é sorte. Quem opera no impulso está apostando o próprio capital.
                Trackion coloca{" "}
                <span className="text-white">processo, métricas e consistência</span> no centro —
                onde sempre deveriam estar.
              </p>
            </div>
            <div className="col-span-12 grid grid-cols-3 gap-6 lg:col-span-7">
              {[
                { k: "PROBLEMA", v: "Trading no feeling" },
                { k: "CAUSA", v: "Falta de método" },
                { k: "REMÉDIO", v: "Dados + disciplina" },
              ].map((it, i) => (
                <div key={it.k} className="space-y-2 border-l border-white/15 pl-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-gray-500">
                    0{i + 1} · {it.k}
                  </p>
                  <p className="text-sm font-semibold text-white sm:text-base">{it.v}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-24 space-y-px border-y border-white/[0.1]">
            {STOP_BETTING_POINTS.map(({ icon: Icon, title, description, tag }, i) => (
              <article
                key={title}
                className="group relative grid grid-cols-12 items-start gap-6 border-b border-white/[0.06] py-12 last:border-0 sm:py-16"
              >
                <div className="col-span-12 lg:col-span-3">
                  <div className="flex items-center gap-4">
                    <span
                      className="num text-7xl font-bold leading-none tracking-tighter text-stroke sm:text-8xl"
                      aria-hidden
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="border border-[#FF8C42]/50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.32em] text-[#FF8C42]">
                      {tag}
                    </span>
                  </div>
                  <div className="mt-6 flex h-12 w-12 items-center justify-center border border-white/15 bg-black transition group-hover:border-[#FF8C42]/60">
                    <Icon className="h-5 w-5 text-[#FF8C42]" aria-hidden />
                  </div>
                </div>
                <div className="col-span-12 space-y-4 lg:col-span-9">
                  <h3 className="text-balance text-4xl font-bold leading-[1] tracking-tight text-white sm:text-5xl lg:text-6xl">
                    {title}
                  </h3>
                  <p className="max-w-3xl text-base leading-relaxed text-gray-400 sm:text-lg">
                    {description}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-16 flex flex-col items-start gap-6 border-t border-white/[0.08] pt-10 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-gray-500">
                ↳ next step
              </p>
              <p className="max-w-md text-base text-white sm:text-lg">
                Pare de confiar no <span className="font-serif italic text-[#FF8C42]">feeling</span>.{" "}
                Comece a confiar nos seus dados.
              </p>
            </div>
            <button
              type="button"
              onClick={() => openTrialModal()}
              className="group inline-flex items-center gap-3 border border-[#FF8C42] bg-[#FF8C42] px-7 py-4 text-xs font-bold uppercase tracking-[0.28em] text-black transition hover:bg-transparent hover:text-[#FF8C42]"
            >
              Trocar aposta por método
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
            </button>
          </div>
        </div>
      </section>

      {/* =================== CTA / TERMINAL FOOTER ===================== */}
      <section id="precos" className="relative overflow-hidden border-t border-white/[0.08] bg-black py-32">
        <div className="pointer-events-none absolute inset-0 bg-grid-fine opacity-60" aria-hidden />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[600px] max-w-3xl bg-[radial-gradient(ellipse_at_top,rgba(255,140,66,0.22),transparent_70%)]"
          aria-hidden
        />

        <div className="relative mx-auto max-w-[1100px] px-6">
          <SectionLabel index="04" label="Acesso · 14 dias grátis" total="04" />

          <h2 className="mt-10 text-balance font-sans text-5xl font-bold leading-[0.92] tracking-tight text-white sm:text-6xl lg:text-[5rem]">
            Comece com <span className="font-serif italic font-light text-[#FF8C42]">método</span>{" "}
            hoje.
          </h2>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-gray-400 sm:text-lg">
            Deixe seu e-mail e teste o Trackion por 14 dias grátis — sem cartão de crédito, sem
            compromisso, sem letras miúdas.
          </p>

          {/* Terminal-style input */}
          <div className="mt-12 relative border border-white/15 bg-black/80 backdrop-blur-sm">
            <CornerMarks orange />
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.28em]">
              <span className="text-gray-500">trackion.app — signup --trial=14d</span>
              <span className="flex items-center gap-1 text-tk-green">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-tk-green" />
                ready
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-[1fr_auto] sm:items-stretch">
              <div className="flex items-center gap-3 border border-white/10 bg-black px-4 py-3 font-mono text-sm">
                <span className="select-none text-[#FF8C42]">$</span>
                <input
                  type="email"
                  value={footerEmail}
                  onChange={(e) => setFooterEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleFooterCta()}
                  placeholder="seu@email.com"
                  autoComplete="email"
                  className="min-w-0 flex-1 bg-transparent text-white placeholder:text-gray-600 outline-none"
                />
                <span className={footerEmail ? "tk-cursor opacity-0" : "tk-cursor"} aria-hidden />
              </div>
              <button
                type="button"
                onClick={handleFooterCta}
                className="group inline-flex items-center justify-center gap-2 border border-[#FF8C42] bg-[#FF8C42] px-7 py-3 text-xs font-bold uppercase tracking-[0.28em] text-black transition hover:bg-transparent hover:text-[#FF8C42]"
              >
                Iniciar
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
              </button>
            </div>
            <div className="border-t border-white/10 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.28em] text-gray-500">
              <span className="text-[#FF8C42]">›</span> sem cartão · cancele quando quiser · link
              por e-mail
            </div>
          </div>

          {/* meta info */}
          <div className="mt-12 grid grid-cols-1 gap-8 border-t border-white/[0.08] pt-10 sm:grid-cols-3">
            {[
              { label: "TEMPO DE SETUP", value: "< 2 minutos" },
              { label: "EXCHANGES ATIVAS", value: "MEXC · Bitget · Binance" },
              { label: "PERMISSÃO API", value: "read-only · seguro" },
            ].map((it) => (
              <div key={it.label} className="space-y-2">
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-gray-500">
                  {it.label}
                </p>
                <p className="text-base font-semibold text-white">{it.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =================== FOOTER ===================== */}
      <footer className="relative border-t border-white/[0.08] bg-black">
        <div className="pointer-events-none absolute inset-0 bg-grid-fine opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-[1400px] px-6 py-14">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-5">
              <div className="flex items-center gap-3">
                <img
                  src="/logo-trackion.png"
                  alt=""
                  width={28}
                  height={28}
                  className="h-7 w-7 object-contain"
                />
                <span className="text-base font-bold tracking-[0.32em] text-white">TRACKION</span>
              </div>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-gray-500">
                Trading journal e analytics para traders que querem operar com método — não no
                achismo.
              </p>
              <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.28em] text-gray-600">
                <Plus className="-mt-0.5 mr-1 inline h-3 w-3 text-[#FF8C42]" aria-hidden />
                BUILT FOR DISCIPLINED TRADERS
              </p>
            </div>

            <div className="col-span-6 lg:col-span-2">
              <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.28em] text-gray-500">
                Produto
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#recursos" className="transition hover:text-white">Recursos</a></li>
                <li><a href="#integracoes" className="transition hover:text-white">Integrações</a></li>
                <li><a href="#metodo" className="transition hover:text-white">Método</a></li>
                <li><a href="#precos" className="transition hover:text-white">Preços</a></li>
              </ul>
            </div>

            <div className="col-span-6 lg:col-span-2">
              <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.28em] text-gray-500">
                Conta
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <button onClick={goStart} className="transition hover:text-white">Entrar</button>
                </li>
                <li>
                  <button onClick={() => openTrialModal()} className="transition hover:text-white">
                    Trial 14d
                  </button>
                </li>
                <li><a href="#" className="transition hover:text-white">Status</a></li>
              </ul>
            </div>

            <div className="col-span-12 lg:col-span-3">
              <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.28em] text-gray-500">
                Last sync
              </p>
              <div className="space-y-2 border border-white/10 p-3 font-mono text-[11px] text-gray-400">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">timestamp</span>
                  <span className="text-white num">{todayISO}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">status</span>
                  <span className="text-tk-green">● online</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">version</span>
                  <span className="text-white num">v2.0</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/[0.06] pt-6 font-mono text-[10px] uppercase tracking-[0.28em] text-gray-600 sm:flex-row sm:items-center">
            <p>© {year} TRACKION · Trading com método, não no achismo</p>
            <div className="flex items-center gap-5">
              <a href="#" className="transition hover:text-white">Privacidade</a>
              <a href="#" className="transition hover:text-white">Termos</a>
              <a href="#" className="transition hover:text-white">Contato</a>
            </div>
          </div>
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

      {/* Cross-marks decorativos (estilo blueprint) — apenas em telas grandes */}
      <CrossMark className="left-6 top-32 hidden lg:block" />
      <CrossMark className="right-6 top-32 hidden lg:block" />
    </div>
  );
}
