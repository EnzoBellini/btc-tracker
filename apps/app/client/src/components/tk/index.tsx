/**
 * Trackion Brutalist UI Kit
 * Shared editorial / terminal components used across all pages.
 */
import { cn } from "@/lib/utils";
import type { ComponentType, ReactNode, SVGProps } from "react";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

/* =====================================================================
 * CornerMarks — 4 marcas L nos cantos do bloco (estilo blueprint/CAD)
 * ===================================================================== */
export function CornerMarks({
  orange = false,
  className,
}: {
  orange?: boolean;
  className?: string;
}) {
  const color = orange ? "border-primary/70" : "border-white/30";
  return (
    <div className={cn("pointer-events-none absolute inset-0", className)} aria-hidden>
      <span className={`absolute -top-px -left-px h-2.5 w-2.5 border-t border-l ${color}`} />
      <span className={`absolute -top-px -right-px h-2.5 w-2.5 border-t border-r ${color}`} />
      <span className={`absolute -bottom-px -left-px h-2.5 w-2.5 border-b border-l ${color}`} />
      <span className={`absolute -bottom-px -right-px h-2.5 w-2.5 border-b border-r ${color}`} />
    </div>
  );
}

/* =====================================================================
 * SectionLabel — eyebrow editorial [01] ─── LABEL  / TOTAL
 * ===================================================================== */
export function SectionLabel({
  index,
  label,
  total,
}: {
  index: string;
  label: string;
  total?: string;
}) {
  return (
    <div className="flex items-center gap-3 font-mono-tk text-[11px] uppercase tracking-[0.28em]">
      <span className="text-primary">[{index}]</span>
      <span className="h-px w-8 bg-white/15" aria-hidden />
      <span className="text-foreground">{label}</span>
      {total && <span className="text-muted-foreground">/ {total}</span>}
    </div>
  );
}

/* =====================================================================
 * PageHeader — bloco padrão de topo de página
 * ===================================================================== */
export function PageHeader({
  index,
  total,
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  index: string;
  total: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="space-y-6 border-b border-border pb-8">
      <SectionLabel index={index} label={eyebrow} total={total} />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="font-display text-4xl font-bold leading-[0.95] tracking-tight text-foreground sm:text-5xl">
            {title}
          </h1>
          {subtitle && (
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}

/* =====================================================================
 * TerminalFrame — card com border, corner-marks e header opcional
 * ===================================================================== */
export function TerminalFrame({
  title,
  status,
  statusTone = "live",
  right,
  children,
  className,
  orangeCorners = false,
  padding = "p-0",
}: {
  title?: string;
  status?: string;
  statusTone?: "live" | "warn" | "off" | "info";
  right?: ReactNode;
  children: ReactNode;
  className?: string;
  orangeCorners?: boolean;
  padding?: string;
}) {
  const toneColor: Record<NonNullable<typeof statusTone>, string> = {
    live: "text-profit",
    warn: "text-[hsl(var(--neutral))]",
    off: "text-muted-foreground",
    info: "text-primary",
  };
  const dotColor: Record<NonNullable<typeof statusTone>, string> = {
    live: "bg-profit",
    warn: "bg-[hsl(var(--neutral))]",
    off: "bg-muted-foreground",
    info: "bg-primary",
  };
  return (
    <div className={cn("relative border border-border bg-card", className)}>
      <CornerMarks orange={orangeCorners} />
      {(title || status || right) && (
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5 font-mono-tk text-[10px] uppercase tracking-[0.28em]">
          <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
            {status !== undefined && (
              <span className={cn("h-1.5 w-1.5 animate-pulse rounded-full", dotColor[statusTone])} />
            )}
            <span className="truncate">{title}</span>
          </span>
          {(status || right) && (
            <span className={cn("flex shrink-0 items-center gap-2", toneColor[statusTone])}>
              {status}
              {right}
            </span>
          )}
        </div>
      )}
      <div className={padding}>{children}</div>
    </div>
  );
}

/* =====================================================================
 * KpiTerminal — KPI card editorial com label uppercase + valor enorme
 * tabular + delta colorido
 * ===================================================================== */
export function KpiTerminal({
  label,
  index,
  value,
  caption,
  delta,
  tone = "neutral",
  icon: Icon,
  loading,
}: {
  label: string;
  index?: string;
  value: ReactNode;
  caption?: ReactNode;
  delta?: ReactNode;
  tone?: "profit" | "loss" | "neutral" | "orange";
  icon?: IconType;
  loading?: boolean;
}) {
  const toneColor =
    tone === "profit"
      ? "text-profit"
      : tone === "loss"
      ? "text-loss"
      : tone === "orange"
      ? "text-primary"
      : "text-foreground";

  return (
    <div className="relative border border-border bg-card p-5 transition-colors hover:bg-card/60">
      <div className="flex items-start justify-between gap-3">
        <p className="font-mono-tk text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
          {label}
        </p>
        {index && (
          <span className="font-mono-tk text-[10px] tracking-[0.28em] text-primary/70">
            [{index}]
          </span>
        )}
        {Icon && !index && (
          <Icon className="h-4 w-4 text-primary/70" aria-hidden />
        )}
      </div>
      {loading ? (
        <div className="mt-3 h-9 w-24 animate-pulse bg-muted" />
      ) : (
        <p className={cn("num font-display mt-3 text-3xl font-bold leading-none tracking-tight sm:text-4xl", toneColor)}>
          {value}
        </p>
      )}
      {(delta || caption) && (
        <div className="mt-3 flex items-center justify-between gap-2 text-[11px] sm:text-xs">
          {delta && <span className="num font-mono-tk font-semibold">{delta}</span>}
          {caption && <span className="text-muted-foreground">{caption}</span>}
        </div>
      )}
    </div>
  );
}

/* =====================================================================
 * StatPill — tag/badge mono uppercase com ponto
 * ===================================================================== */
export function StatPill({
  children,
  tone = "info",
  pulse,
}: {
  children: ReactNode;
  tone?: "profit" | "loss" | "info" | "neutral" | "warn" | "off";
  pulse?: boolean;
}) {
  const tones: Record<NonNullable<typeof tone>, { dot: string; text: string; border: string; bg: string }> = {
    profit: { dot: "bg-profit", text: "text-profit", border: "border-profit/40", bg: "bg-profit/5" },
    loss: { dot: "bg-loss", text: "text-loss", border: "border-loss/40", bg: "bg-loss/5" },
    info: { dot: "bg-primary", text: "text-primary", border: "border-primary/40", bg: "bg-primary/5" },
    neutral: { dot: "bg-foreground", text: "text-foreground", border: "border-white/15", bg: "bg-transparent" },
    warn: { dot: "bg-[hsl(var(--neutral))]", text: "text-[hsl(var(--neutral))]", border: "border-[hsl(var(--neutral))]/40", bg: "bg-[hsl(var(--neutral))]/5" },
    off: { dot: "bg-muted-foreground/50", text: "text-muted-foreground", border: "border-white/10", bg: "bg-transparent" },
  };
  const t = tones[tone];
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 border px-2 py-1 font-mono-tk text-[10px] uppercase tracking-[0.22em]",
      t.border, t.bg, t.text,
    )}>
      <span className={cn("h-1.5 w-1.5 rounded-full", t.dot, pulse && "animate-pulse")} />
      {children}
    </span>
  );
}

/* =====================================================================
 * TerminalButton — botão rectangular brutalist com ícone opcional
 * ===================================================================== */
export function TerminalButton({
  variant = "primary",
  size = "md",
  icon: Icon,
  iconRight: IconRight,
  children,
  className,
  ...props
}: {
  variant?: "primary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: IconType;
  iconRight?: IconType;
  children?: ReactNode;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const sizes: Record<NonNullable<typeof size>, string> = {
    sm: "px-3 py-1.5 text-[10px]",
    md: "px-4 py-2.5 text-[11px]",
    lg: "px-6 py-3.5 text-xs",
  };
  const variants: Record<NonNullable<typeof variant>, string> = {
    primary:
      "border border-primary bg-primary text-primary-foreground hover:bg-transparent hover:text-primary",
    outline:
      "border border-white/15 bg-transparent text-foreground hover:border-white/30 hover:bg-white/[0.03]",
    ghost: "border border-transparent text-muted-foreground hover:text-foreground hover:bg-white/[0.04]",
    danger:
      "border border-loss/60 bg-loss/10 text-loss hover:bg-loss/20",
  };
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-mono-tk font-bold uppercase tracking-[0.22em] transition disabled:opacity-50 disabled:cursor-not-allowed",
        sizes[size],
        variants[variant],
        className,
      )}
    >
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />}
      {children}
      {IconRight && <IconRight className="h-3.5 w-3.5 shrink-0" aria-hidden />}
    </button>
  );
}

/* =====================================================================
 * NumStrong — número grande tabular display
 * ===================================================================== */
export function NumStrong({
  children,
  tone = "neutral",
  size = "lg",
  className,
}: {
  children: ReactNode;
  tone?: "profit" | "loss" | "neutral" | "orange";
  size?: "md" | "lg" | "xl" | "2xl";
  className?: string;
}) {
  const sizes: Record<NonNullable<typeof size>, string> = {
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-4xl sm:text-5xl",
    "2xl": "text-5xl sm:text-6xl",
  };
  const tones: Record<NonNullable<typeof tone>, string> = {
    profit: "text-profit",
    loss: "text-loss",
    orange: "text-primary",
    neutral: "text-foreground",
  };
  return (
    <span
      className={cn(
        "num font-display font-bold leading-none tracking-tight",
        sizes[size],
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* =====================================================================
 * KeyValueRow — linha de tabela tipo "key/value" editorial
 * ===================================================================== */
export function KeyValueRow({
  label,
  value,
  index,
  tone,
}: {
  label: string;
  value: ReactNode;
  index?: string;
  tone?: "profit" | "loss" | "orange" | "neutral";
}) {
  const toneCls =
    tone === "profit" ? "text-profit"
    : tone === "loss" ? "text-loss"
    : tone === "orange" ? "text-primary"
    : "text-foreground";
  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-border/70 py-3 last:border-0">
      {index ? (
        <span className="font-mono-tk text-[10px] tracking-[0.28em] text-muted-foreground">
          {index}
        </span>
      ) : <span />}
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn("num font-mono-tk text-sm font-semibold", toneCls)}>{value}</span>
    </div>
  );
}

/* =====================================================================
 * Eyebrow — small text label "↳ context"
 * ===================================================================== */
export function Eyebrow({
  symbol = "↳",
  children,
  tone = "primary",
  className,
}: {
  symbol?: string;
  children: ReactNode;
  tone?: "primary" | "muted";
  className?: string;
}) {
  return (
    <p
      className={cn(
        "font-mono-tk text-[10px] uppercase tracking-[0.32em]",
        tone === "primary" ? "text-primary" : "text-muted-foreground",
        className,
      )}
    >
      <span className="mr-2">{symbol}</span>
      {children}
    </p>
  );
}

/* =====================================================================
 * Spark — sparkline minimalista (SVG, sem libs)
 * ===================================================================== */
export function Spark({
  values,
  positive = true,
  height = 36,
}: {
  values: number[];
  positive?: boolean;
  height?: number;
}) {
  if (!values?.length) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 120;
  const h = height;
  const stepX = w / Math.max(1, values.length - 1);
  const points = values.map((v, i) => {
    const x = i * stepX;
    const y = h - ((v - min) / range) * h;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });
  const stroke = positive ? "hsl(var(--profit))" : "hsl(var(--loss))";
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        points={points.join(" ")}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
