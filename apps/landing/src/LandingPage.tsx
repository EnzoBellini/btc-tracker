import { ArrowDownRight, ArrowUpRight, Menu, Plus, X } from "lucide-react";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { HeroWaveCanvas } from "./components/HeroWaveCanvas";
import { MarketSelector } from "./components/MarketSelector";
import {
  LaunchOfferBadge,
  LaunchOfferHighlight,
  LaunchPriceBlock,
} from "./components/LaunchPriceBlock";
import { LegalInfoModal } from "./components/LegalInfoModal";
import { TrialCtaButton } from "./components/TrialCtaButton";
import type { StaticPageKind } from "./lib/static-page-content";
import { useMarket } from "./hooks/useMarket";
import { getLandingContent } from "./lib/landing-content";
import { submitTrialSignup } from "./lib/trialSignup";
import { formatPlanPrice, formatOriginalPlanPrice, getPlansForMarket, launchSavingsPct } from "./lib/plans";
import { useMarketTicker } from "./hooks/useMarketTicker";

const AnimatedWealthChart = lazy(() =>
  import("./components/AnimatedWealthChart").then((m) => ({ default: m.AnimatedWealthChart })),
);
const TrialSignupModal = lazy(() =>
  import("./components/TrialSignupModal").then((m) => ({ default: m.TrialSignupModal })),
);

export type LandingPageProps = {
  onStartClick?: () => void;
  affiliateBanner?: {
    name: string;
    couponCode: string;
    discountPct: number;
  } | null;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

export default function LandingPage({ onStartClick, affiliateBanner }: LandingPageProps) {
  const { market, setMarket } = useMarket();
  const t = getLandingContent(market);
  const pricingPlans = getPlansForMarket(market);
  const pcMockupRef = useRef<HTMLImageElement>(null);
  const mobileMockupRef = useRef<HTMLImageElement>(null);
  const [footerEmail, setFooterEmail] = useState("");
  const [trialModalOpen, setTrialModalOpen] = useState(false);
  const [trialSubmitting, setTrialSubmitting] = useState(false);
  const [trialError, setTrialError] = useState<string | null>(null);
  const [trialSuccess, setTrialSuccess] = useState(false);
  const [trialDevVerifyUrl, setTrialDevVerifyUrl] = useState<string | null>(null);
  const [trialDevPassword, setTrialDevPassword] = useState<string | null>(null);
  const [trialEmailSent, setTrialEmailSent] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [legalModal, setLegalModal] = useState<StaticPageKind | null>(null);
  const [footerEmailError, setFooterEmailError] = useState<string | null>(null);
  const goStart = onStartClick ?? (() => {});

  const scrollToSection = (href: string) => {
    const id = href.replace(/^#/, "");
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setMobileNavOpen(false);
  };

  const openTrialModal = (email?: string) => {
    if (email?.trim()) setFooterEmail(email.trim());
    setTrialError(null);
    setTrialSuccess(false);
    setTrialDevVerifyUrl(null);
    setTrialDevPassword(null);
    setTrialEmailSent(true);
    setTrialModalOpen(true);
  };

  const handleFooterCta = () => {
    const trimmed = footerEmail.trim();
    if (!trimmed || !EMAIL_RE.test(trimmed)) {
      setFooterEmailError(t.pricing.emailInvalid);
      openTrialModal();
      return;
    }
    setFooterEmailError(null);
    openTrialModal(trimmed);
  };

  const handleTrialSubmit = async ({
    name,
    email,
    acceptTerms,
  }: {
    name: string;
    email: string;
    acceptTerms: boolean;
  }) => {
    setTrialSubmitting(true);
    setTrialError(null);
    const result = await submitTrialSignup(name, email, market, acceptTerms);
    setTrialSubmitting(false);
    if (!result.ok) {
      setTrialError(result.message);
      return;
    }
    setTrialSuccess(true);
    setTrialEmailSent(result.emailSent ?? true);
    setTrialDevVerifyUrl(result.devVerifyUrl ?? null);
    setTrialDevPassword(result.devPassword ?? null);
    setFooterEmail(email);
  };

  useEffect(() => {
    let raf = 0;
    const handleScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const y = Math.min(window.scrollY, 280);
        if (pcMockupRef.current) {
          pcMockupRef.current.style.transform = `translateY(${y * 0.04}px)`;
        }
        if (mobileMockupRef.current) {
          mobileMockupRef.current.style.transform = `translateY(${y * 0.065}px)`;
        }
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  const year = new Date().getFullYear();

  return (
    <div className="relative overflow-hidden bg-black text-white">
      {/* Grid contínuo em toda a página (sem “ilhas” por seção) */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-grid-fine opacity-[0.28]"
        aria-hidden
      />

      {/* =================== NAV ===================== */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/[0.06] bg-black/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-3.5">
          <a href="/" className="group flex items-center gap-2.5">
            <img
              src="/logo-trackion.webp"
              alt="Trackion"
              width={26}
              height={26}
              className="h-6 w-6 shrink-0 object-contain"
              decoding="async"
            />
            <span className="text-base font-bold tracking-[0.32em] text-white">TRACKION</span>
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.22em] text-gray-500 sm:inline">
              {t.navBrandSubtitle}
            </span>
          </a>
          <div className="hidden items-center gap-8 md:flex">
            {t.nav.map((link) => (
              <button
                key={link.href}
                type="button"
                onClick={() => scrollToSection(link.href)}
                className="group flex items-baseline gap-1.5 text-sm text-gray-400 transition hover:text-white"
              >
                <span className="font-mono text-[10px] text-[#FF8C42]/70 group-hover:text-[#FF8C42]">
                  {link.index}
                </span>
                {link.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              aria-label={mobileNavOpen ? t.navMenuClose : t.navMenuOpen}
              onClick={() => setMobileNavOpen((v) => !v)}
              className="inline-flex h-9 w-9 items-center justify-center border border-white/15 text-gray-400 transition hover:text-white md:hidden"
            >
              {mobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            <MarketSelector market={market} onChange={setMarket} />
            <button
              type="button"
              onClick={goStart}
              className="hidden font-mono text-[11px] uppercase tracking-[0.22em] text-gray-400 transition hover:text-white sm:inline-flex"
            >
              {t.navLogin}
            </button>
            <TrialCtaButton size="sm" onClick={() => openTrialModal()}>
              {t.navCta}
            </TrialCtaButton>
          </div>
        </div>
        {mobileNavOpen && (
          <div className="border-t border-white/[0.06] bg-black/95 px-6 py-4 md:hidden">
            <div className="flex flex-col gap-3">
              {t.nav.map((link) => (
                <button
                  key={link.href}
                  type="button"
                  onClick={() => scrollToSection(link.href)}
                  className="flex items-baseline gap-2 py-2 text-left text-sm text-gray-300"
                >
                  <span className="font-mono text-[10px] text-[#FF8C42]">{link.index}</span>
                  {link.label}
                </button>
              ))}
              <button type="button" onClick={goStart} className="py-2 text-left text-sm text-gray-400">
                {t.navLogin}
              </button>
              <TrialCtaButton fullWidth onClick={() => openTrialModal()}>
                {t.navCta}
              </TrialCtaButton>
            </div>
          </div>
        )}
      </nav>

      {affiliateBanner && (
        <div className="fixed top-[57px] z-40 w-full border-b border-orange-500/30 bg-orange-500/10 px-4 py-2 text-center font-mono text-[11px] tracking-wide text-orange-100">
          {t.affiliate.partner}{" "}
          <span className="font-bold text-white">{affiliateBanner.name}</span>
          {" · "}
          {t.affiliate.coupon}{" "}
          <span className="font-bold text-orange-300">{affiliateBanner.couponCode}</span>
          {" "}({t.affiliate.discount(affiliateBanner.discountPct)})
        </div>
      )}

      {/* TICKER abaixo do nav */}
      <div className={`fixed z-40 w-full ${affiliateBanner ? "top-[89px]" : "top-[57px]"}`}>
        <TickerBar />
      </div>

      {/* =================== HERO ===================== */}
      <section className={`relative z-[1] pb-24 sm:pb-32 ${affiliateBanner ? "pt-[11rem] sm:pt-[12.5rem]" : "pt-[8.5rem] sm:pt-[10rem]"}`}>
        {/* Onda animada no rodapé do hero */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[60vh] opacity-50"
          aria-hidden
        >
          <div className="h-full w-full [mask-image:linear-gradient(to_bottom,transparent_0%,#000_55%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,#000_55%)]">
            <HeroWaveCanvas variant="orangeBlack" crop="wave-band" fit="stretch" />
          </div>
        </div>

        <div className="relative z-10 mx-auto max-w-[1400px] px-6">
          {/* Grid hero assimétrico */}
          <div className="grid grid-cols-12 gap-6 lg:gap-10">
            {/* Coluna esquerda: tipografia massiva */}
            <div className="col-span-12 min-w-0 lg:col-span-6">
              <div className="tk-rise tk-rise-2 mb-6 font-mono text-[11px] uppercase tracking-[0.32em] text-[#FF8C42]">
                {t.heroEyebrow}
              </div>

              <h1 className="tk-rise tk-rise-3 font-sans text-[14vw] font-bold leading-[0.86] tracking-[-0.02em] text-white sm:text-[6rem] lg:text-[5rem] xl:text-[6.5rem] 2xl:text-[8rem]">
                <span className="block">{t.heroTitle[0]}</span>
                <span className="block">{t.heroTitle[1]}</span>
                <span className="block">
                  <span className="font-serif italic font-light text-[#FF8C42] tracking-tight">{t.heroTitle[2]}</span>
                  <span className="text-[#FF8C42]">.</span>
                </span>
              </h1>

              {/* CTAs */}
              <div className="tk-rise tk-rise-5 mt-10 flex flex-wrap items-center gap-3">
                <TrialCtaButton
                  size="lg"
                  ring
                  shine
                  onClick={() => openTrialModal()}
                >
                  {t.heroCtaPrimary}
                </TrialCtaButton>
                <button
                  type="button"
                  onClick={() => scrollToSection("#recursos")}
                  className="inline-flex items-center gap-2 border border-white/20 bg-transparent px-6 py-3.5 text-sm font-bold uppercase tracking-[0.22em] text-white transition hover:border-white/50 hover:bg-white/[0.04]"
                >
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-tk-green" />
                  {t.heroCtaSecondary}
                </button>
              </div>

              {/* Feature row */}
              <ul className="tk-rise tk-rise-6 mt-10 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
                {t.heroPills.map(({ icon: Icon, text }, i) => (
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
              {/* wrapper: cabe no aside até xl; vaza levemente em xl+ */}
              <div className="relative w-full xl:w-[108%] 2xl:w-[120%]">
                <picture>
                  <source srcSet="/mockup_pc.webp" type="image/webp" />
                  <img
                    ref={pcMockupRef}
                    src="/mockup_pc.png"
                    alt="Trackion Dashboard Desktop"
                    width={1536}
                    height={1024}
                    className="relative z-10 mx-auto block h-auto w-full drop-shadow-[0_30px_80px_rgba(0,0,0,0.7)]"
                    decoding="async"
                    fetchPriority="high"
                  />
                </picture>
                <picture>
                  <source srcSet="/mockup_mobile.webp" type="image/webp" />
                  <img
                    ref={mobileMockupRef}
                    src="/mockup_mobile.png"
                    alt="Trackion Dashboard Mobile"
                    width={941}
                    height={1672}
                    className="absolute right-[4%] bottom-0 z-20 h-auto w-[24%] min-w-[90px] max-w-[200px] drop-shadow-[0_30px_60px_rgba(0,0,0,0.85)] sm:w-[22%] sm:max-w-[230px] lg:w-[24%] lg:max-w-[250px] xl:max-w-[290px] 2xl:max-w-[320px]"
                    decoding="async"
                    loading="lazy"
                  />
                </picture>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* =================== RECURSOS ===================== */}
      <section id="recursos" className="relative z-[1] bg-black py-32">
        <div className="relative mx-auto max-w-[1400px] px-6">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-5">
              <SectionLabel index="01" label={t.features.sectionLabel} />
              <h2 className="mt-8 text-balance text-5xl font-bold leading-[0.92] tracking-tight text-white sm:text-6xl lg:text-[5rem] xl:text-[5.5rem]">
                {t.features.title[0]}{" "}
                <span className="bg-gradient-to-r from-[#FFD0A8] via-[#FF8C42] to-[#BC5C2A] bg-clip-text text-transparent">
                  {market === "us" ? "one" : "só"}
                </span>{" "}
                {t.features.title[1]}
              </h2>
              <p className="mt-8 max-w-md text-base leading-relaxed text-gray-400">
                {t.features.subtitle}
              </p>
            </div>

            <div className="col-span-12 lg:col-span-7">
              <ol className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
                {t.features.items.map(({ icon: Icon, title, description, tag }, i) => (
                  <li
                    key={title}
                    className="group relative grid grid-cols-[auto_1fr] items-start gap-6 py-8 transition-colors hover:bg-white/[0.02] sm:gap-10 sm:py-10"
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
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* =================== INTEGRAÇÕES — BRUTALIST HEADER ===================== */}
      <section id="integracoes" className="relative z-[1] overflow-hidden bg-black py-32">
        <div className="relative mx-auto max-w-[1400px] px-6">
          <SectionLabel index="02" label={t.integrations.sectionLabel} />

          {/* HEADER MASSIVO */}
          <div className="mt-10">
            <h2 className="text-balance font-sans text-[11vw] font-bold leading-[0.9] tracking-[-0.03em] sm:text-[4.5rem] lg:text-[5.5rem] xl:text-[7rem] 2xl:text-[8rem]">
              <span className="block text-white">{t.integrations.title[0]}</span>
              <span className="block">
                <span className="text-stroke-orange">{t.integrations.title[1]}</span>
              </span>
              <span className="block text-gray-700">
                {market === "us" ? (
                  <>
                    <span className="font-serif italic font-light text-white">{t.integrations.title[2]}</span>
                  </>
                ) : (
                  <>
                    Você só{" "}
                    <span className="font-serif italic font-light text-white">analisa.</span>
                  </>
                )}
              </span>
            </h2>
            <p className="mt-10 max-w-xl text-base leading-relaxed text-gray-400 sm:text-lg">
              {t.integrations.subtitle}
            </p>
          </div>

          {/* EXCHANGES TABLE */}
          <div className="mt-20 border-y border-white/[0.08]">
            <div className="grid grid-cols-[1fr_auto_auto] items-center gap-6 border-b border-white/[0.06] px-2 py-3 font-mono text-[10px] uppercase tracking-[0.28em] text-gray-500">
              <span>{t.integrations.tableHeaders.exchange}</span>
              <span className="hidden sm:inline">{t.integrations.tableHeaders.type}</span>
              <span>{t.integrations.tableHeaders.status}</span>
            </div>
            {t.integrations.exchanges.map((ex, i) => (
              <div
                key={ex.name}
                className="group grid grid-cols-[1fr_auto_auto] items-center gap-6 border-b border-white/[0.04] px-2 py-5 transition-colors last:border-0 hover:bg-white/[0.02]"
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
                <div className="p-2 sm:p-4">
                  <Suspense fallback={<div className="aspect-[1.85/1] w-full" aria-hidden />}>
                    <AnimatedWealthChart />
                  </Suspense>
                </div>
              </div>
            </div>

            <div className="col-span-12 space-y-8 lg:col-span-5 lg:pl-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#FF8C42]">
                {t.integrations.benefitsTitle}
              </p>
              <ul className="space-y-px border-y border-white/[0.08]">
                {t.integrations.benefits.map(({ icon: Icon, title, description }, i) => (
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
      <section id="metodo" className="relative z-[1] overflow-hidden bg-black py-32">
        <div className="relative mx-auto max-w-[1400px] px-6">
          <SectionLabel index="03" label={t.manifesto.sectionLabel} total="03" />

          <div className="mt-10">
            <h2 className="text-balance font-sans text-[15vw] font-bold leading-[0.88] tracking-[-0.04em] sm:text-[6rem] lg:text-[7.5rem] xl:text-[9.5rem] 2xl:text-[11rem]">
              <span className="block text-white">{t.manifesto.title[0]}</span>
              <span className="block">
                {market === "us" ? (
                  <span className="text-[#FF8C42]">{t.manifesto.title[1]}</span>
                ) : (
                  <>
                    <span className="text-gray-700">DE</span>{" "}
                    <span className="text-[#FF8C42]">APOSTAR.</span>
                  </>
                )}
              </span>
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-12 items-start gap-6 border-t border-white/[0.08] pt-10">
            <div className="col-span-12 lg:col-span-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#FF8C42]">
                {t.manifesto.thesisLabel}
              </p>
              <p className="mt-4 max-w-md text-base leading-relaxed text-gray-300 sm:text-lg">
                {market === "us" ? (
                  t.manifesto.thesis
                ) : (
                  <>
                    Trading não é sorte. Quem opera no impulso está apostando o próprio capital.
                    Trackion coloca{" "}
                    <span className="text-white">processo, métricas e consistência</span> no centro —
                    onde sempre deveriam estar.
                  </>
                )}
              </p>
            </div>
            <div className="col-span-12 grid grid-cols-3 gap-6 lg:col-span-7">
              {t.manifesto.pillars.map((it, i) => (
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
            {t.manifesto.points.map(({ icon: Icon, title, description, tag }, i) => (
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
                {t.manifesto.nextLabel}
              </p>
              <p className="max-w-md text-base text-white sm:text-lg">
                {market === "us" ? (
                  t.manifesto.nextText
                ) : (
                  <>
                    Pare de confiar no <span className="font-serif italic text-[#FF8C42]">feeling</span>.{" "}
                    Comece a confiar nos seus dados.
                  </>
                )}
              </p>
            </div>
            <TrialCtaButton size="lg" onClick={() => openTrialModal()}>
              {t.manifesto.cta}
            </TrialCtaButton>
          </div>
        </div>
      </section>

      {/* =================== LAUNCH PROMO ===================== */}
      <section id="lancamento" className="relative z-[1] overflow-hidden border-y border-[#FF8C42]/20 bg-[#FF8C42]/[0.06] py-24 sm:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,140,66,0.12),transparent_55%)]" aria-hidden />
        <div className="relative mx-auto max-w-[1100px] px-6">
          <SectionLabel index="04" label={t.launchPromo.sectionLabel} total="05" />

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <LaunchOfferBadge className="px-4 py-1.5 text-[10px] tracking-[0.28em]">
              {t.launchPromo.badge}
            </LaunchOfferBadge>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#FFB86A]/70">
              {t.launchPromo.priceRowLabel}
            </span>
          </div>

          <h2 className="mt-6 max-w-3xl text-balance font-sans text-4xl font-bold leading-[0.95] tracking-tight text-white sm:text-5xl lg:text-6xl">
            {t.launchPromo.title}
          </h2>
          <LaunchOfferHighlight>{t.launchPromo.subtitle}</LaunchOfferHighlight>

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {pricingPlans.map((plan) => {
              const savings = launchSavingsPct(market, plan.id);
              const isPro = plan.id === "pro";
              return (
                <div
                  key={plan.id}
                  className={`relative border bg-black/80 p-5 backdrop-blur-sm ${
                    isPro
                      ? "border-[#FF8C42] shadow-[0_0_28px_rgba(255,140,66,0.25)]"
                      : "border-[#FF8C42]/40 shadow-[0_0_18px_rgba(255,140,66,0.1)]"
                  }`}
                >
                  <CornerMarks orange={isPro} />
                  <LaunchPriceBlock
                    size="lg"
                    planName={plan.name}
                    launchPrice={formatPlanPrice(plan)}
                    originalPrice={formatOriginalPlanPrice(market, plan.id)}
                    perMonth={t.pricing.perMonth}
                    originalPriceLabel={t.pricing.originalPriceLabel}
                    savingsPct={savings}
                    savingsBadge={t.launchPromo.savingsBadge}
                  />
                </div>
              );
            })}
          </div>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <TrialCtaButton size="lg" onClick={() => openTrialModal()}>
              {t.launchPromo.cta}
            </TrialCtaButton>
            <LaunchOfferHighlight className="max-w-md !py-2 !text-[10px] !font-mono !uppercase !tracking-[0.18em] !text-[#FFB86A]/90">
              {t.launchPromo.finePrint}
            </LaunchOfferHighlight>
          </div>
        </div>
      </section>

      {/* =================== PRICING / CTA ===================== */}
      <section id="precos" className="relative z-[1] overflow-hidden bg-black py-32">
        <div className="relative mx-auto max-w-[1100px] px-6">
          <SectionLabel index="05" label={t.pricing.sectionLabel} total="05" />
          <div className="mt-6">
            <LaunchOfferBadge className="px-4 py-1.5 text-[10px] tracking-[0.28em]">
              {t.launchPromo.badge}
            </LaunchOfferBadge>
          </div>

          <h2 className="mt-8 text-balance font-sans text-5xl font-bold leading-[0.92] tracking-tight text-white sm:text-6xl lg:text-[4.5rem]">
            {market === "us" ? (
              <>
                Plans for every stage of your{" "}
                <span className="font-serif italic font-light text-[#FF8C42]">trading</span>.
              </>
            ) : (
              <>
                Planos para cada fase do seu{" "}
                <span className="font-serif italic font-light text-[#FF8C42]">trading</span>.
              </>
            )}
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-gray-400 sm:text-lg">
            {t.pricing.subtitle}
          </p>
          <LaunchOfferHighlight className="!mt-3 !text-sm">
            {t.pricing.afterTrialNote}
          </LaunchOfferHighlight>

          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {pricingPlans.map((plan) => {
              const isPro = plan.id === "pro";
              return (
                <div
                  key={plan.id}
                  className={`relative border bg-black/70 p-6 backdrop-blur-sm ${
                    isPro
                      ? "border-[#FF8C42] shadow-[0_0_24px_rgba(255,140,66,0.2)]"
                      : "border-[#FF8C42]/30 shadow-[0_0_14px_rgba(255,140,66,0.08)]"
                  }`}
                >
                  <CornerMarks orange={isPro} />
                  {isPro && (
                    <span className="absolute -top-2.5 left-4 bg-[#FF8C42] px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-black">
                      {t.pricing.anchorBadge}
                    </span>
                  )}
                  <LaunchPriceBlock
                    planName={plan.name}
                    launchPrice={formatPlanPrice(plan)}
                    originalPrice={formatOriginalPlanPrice(market, plan.id)}
                    perMonth={t.pricing.perMonth}
                    originalPriceLabel={t.pricing.originalPriceLabel}
                    launchBadge={t.pricing.launchBadge}
                    savingsPct={launchSavingsPct(market, plan.id)}
                    savingsBadge={t.launchPromo.savingsBadge}
                  />
                  <p className="mt-3 text-sm text-gray-400">{plan.tagline}</p>
                  <ul className="mt-5 space-y-2 text-sm text-gray-300">
                    {plan.highlights.map((h) => (
                      <li key={h} className="flex gap-2">
                        <span className="text-[#FF8C42]">›</span>
                        {h}
                      </li>
                    ))}
                  </ul>
                  <TrialCtaButton
                    className="mt-6"
                    fullWidth
                    size="sm"
                    variant={isPro ? "solidPro" : "outline"}
                    glow={isPro}
                    showArrow={false}
                    onClick={() => openTrialModal()}
                  >
                    {t.pricing.trialCta}
                  </TrialCtaButton>
                  <p className="mt-2 text-center text-[10px] text-gray-600">
                    {t.pricing.planTrialNote(plan.name, formatPlanPrice(plan))}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-12 relative border border-white/15 bg-black/80 backdrop-blur-sm">
            <CornerMarks orange />
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.28em]">
              <span className="text-gray-500">{t.pricing.terminalHeader}</span>
              <span className="flex items-center gap-1 text-tk-green">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-tk-green" />
                {t.pricing.terminalReady}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-[1fr_auto] sm:items-stretch">
              <div className="flex items-center gap-3 border border-white/10 bg-black px-4 py-3 font-mono text-sm">
                <span className="select-none text-[#FF8C42]">$</span>
                <input
                  type="email"
                  value={footerEmail}
                  onChange={(e) => {
                    setFooterEmail(e.target.value);
                    if (footerEmailError) setFooterEmailError(null);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleFooterCta()}
                  placeholder={t.pricing.emailPlaceholder}
                  autoComplete="email"
                  aria-invalid={footerEmailError ? true : undefined}
                  className="min-w-0 flex-1 bg-transparent text-white placeholder:text-gray-600 outline-none"
                />
                <span className={footerEmail ? "tk-cursor opacity-0" : "tk-cursor"} aria-hidden />
              </div>
              <TrialCtaButton onClick={handleFooterCta}>
                {t.pricing.startTrial}
              </TrialCtaButton>
            </div>
            {footerEmailError && (
              <p className="border-t border-white/10 px-4 py-2 text-xs text-red-400" role="alert">
                {footerEmailError}
              </p>
            )}
            <div className="border-t border-white/10 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.28em] text-gray-500">
              <span className="text-[#FF8C42]">›</span> {t.pricing.terminalFooter}
            </div>
          </div>
        </div>
      </section>

      {/* =================== SEO / FAQ / GUIAS ===================== */}
      <section id="guia-crypto" className="relative z-[1] border-t border-white/[0.06] bg-black py-24">
        <div className="relative mx-auto max-w-[1100px] px-6">
          <SectionLabel index="06" label={t.seo.sectionLabel} total="06" />
          <h2 className="mt-8 text-balance font-sans text-4xl font-bold leading-[0.95] tracking-tight text-white sm:text-5xl">
            <span className="block text-white">{t.seo.title[0]}</span>
            <span className="text-[#FF8C42]">{t.seo.title[1]}</span>
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-gray-400">{t.seo.subtitle}</p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="/blog"
              className="inline-flex items-center gap-2 border border-white/15 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-gray-300 transition hover:border-[#FF8C42]/50 hover:text-white"
            >
              {t.seo.blogCta}
            </a>
            <a
              href="/blog"
              className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#FF8C42] transition hover:text-white"
            >
              {t.seo.blogLink}
            </a>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-2">
            <div>
              <h3 className="font-mono text-[11px] uppercase tracking-[0.28em] text-gray-500">{t.seo.faqTitle}</h3>
              <dl className="mt-6 space-y-6">
                {t.seo.faq.map((item, i) => (
                  <div key={i} className="border-l border-[#FF8C42]/30 pl-4">
                    <dt className="text-sm font-semibold text-white">{item.q}</dt>
                    <dd className="mt-1.5 text-sm leading-relaxed text-gray-400">{item.a}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div>
              <h3 className="font-mono text-[11px] uppercase tracking-[0.28em] text-gray-500">{t.seo.guidesTitle}</h3>
              <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {t.seo.guides.map((guide) => (
                  <li key={guide.path}>
                    <a
                      href={guide.path}
                      className="block border border-white/10 px-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-gray-400 transition hover:border-[#FF8C42]/40 hover:text-white"
                    >
                      {guide.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* =================== FOOTER ===================== */}
      <footer className="relative z-[1] bg-black">
        <div className="relative mx-auto max-w-[1400px] px-6 py-14">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-sm">
              <div className="flex items-center gap-3">
                <img
                  src="/logo-trackion.webp"
                  alt="Trackion"
                  width={28}
                  height={28}
                  className="h-7 w-7 object-contain"
                />
                <span className="text-base font-bold tracking-[0.32em] text-white">TRACKION</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-gray-500">
                {t.footer.tagline}
              </p>
              <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.28em] text-gray-600">
                <Plus className="-mt-0.5 mr-1 inline h-3 w-3 text-[#FF8C42]" aria-hidden />
                {t.footer.taglineEn}
              </p>
            </div>

            <div className="flex gap-12 sm:gap-16 lg:gap-20 lg:justify-end">
              <div>
                <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.28em] text-gray-500">
                  {t.footer.product}
                </p>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><button type="button" onClick={() => scrollToSection("#recursos")} className="transition hover:text-white">{t.footer.links.product[0]}</button></li>
                  <li><button type="button" onClick={() => scrollToSection("#integracoes")} className="transition hover:text-white">{t.footer.links.product[1]}</button></li>
                  <li><button type="button" onClick={() => scrollToSection("#metodo")} className="transition hover:text-white">{t.footer.links.product[2]}</button></li>
                  <li><button type="button" onClick={() => scrollToSection("#precos")} className="transition hover:text-white">{t.footer.links.product[3]}</button></li>
                </ul>
              </div>

              <div>
                <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.28em] text-gray-500">
                  {t.footer.account}
                </p>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>
                    <button onClick={goStart} className="transition hover:text-white">{t.footer.login}</button>
                  </li>
                  <li>
                    <button onClick={() => openTrialModal()} className="transition hover:text-white">
                      {t.footer.trial}
                    </button>
                  </li>
                  <li><a href={t.footerPaths.status} className="transition hover:text-white">{t.footer.status}</a></li>
                  <li><a href="/blog" className="transition hover:text-white">{t.seo.blogCta}</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/[0.06] pt-6 font-mono text-[10px] uppercase tracking-[0.28em] text-gray-600 sm:flex-row sm:items-center">
            <p>© {year} TRACKION · {t.footer.copyright}</p>
            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={() => setLegalModal("privacy")}
                className="transition hover:text-white"
              >
                {t.footer.legal[0]}
              </button>
              <button
                type="button"
                onClick={() => setLegalModal("terms")}
                className="transition hover:text-white"
              >
                {t.footer.legal[1]}
              </button>
              <button
                type="button"
                onClick={() => setLegalModal("contact")}
                className="transition hover:text-white"
              >
                {t.footer.legal[2]}
              </button>
            </div>
          </div>
        </div>
      </footer>

      <LegalInfoModal
        open={legalModal !== null}
        kind={legalModal}
        market={market}
        closeLabel={t.static.close}
        onClose={() => setLegalModal(null)}
      />

      {trialModalOpen && (
        <Suspense fallback={null}>
          <TrialSignupModal
            open={trialModalOpen}
            initialEmail={footerEmail}
            copy={t.trialModal}
            onClose={() => {
              setTrialModalOpen(false);
              if (trialSuccess) {
                setTrialSuccess(false);
                setTrialError(null);
              }
            }}
            onSubmit={handleTrialSubmit}
            onOpenLegal={(kind) => setLegalModal(kind)}
            submitting={trialSubmitting}
            error={trialError}
            success={trialSuccess}
            emailSent={trialEmailSent}
            devVerifyUrl={trialDevVerifyUrl}
            devPassword={trialDevPassword}
          />
        </Suspense>
      )}

      {/* Cross-marks decorativos (estilo blueprint) — apenas em telas grandes */}
      <CrossMark className="left-6 top-32 hidden lg:block" />
      <CrossMark className="right-6 top-32 hidden lg:block" />
    </div>
  );
}
