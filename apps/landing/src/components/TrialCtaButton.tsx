import { ArrowUpRight } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type TrialCtaButtonProps = {
  children: ReactNode;
  subtext?: string;
  subtextOnHover?: boolean;
  variant?: "solid" | "outline" | "solidPro";
  size?: "xs" | "sm" | "md" | "lg" | "nav";
  glow?: boolean;
  ring?: boolean;
  shine?: boolean;
  fullWidth?: boolean;
  showArrow?: boolean;
} & Pick<ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "disabled" | "className">;

const SIZE = {
  xs: "px-3 py-1.5 text-[10px] tracking-[0.14em]",
  sm: "px-4 py-2 text-xs tracking-[0.2em]",
  md: "px-6 py-3.5 text-sm tracking-[0.22em]",
  lg: "px-8 py-4 text-sm tracking-[0.24em] sm:text-base sm:tracking-[0.22em]",
  nav: "px-4 py-2.5 text-[10px] tracking-[0.16em] sm:px-5 sm:py-3 sm:text-[11px] sm:tracking-[0.14em]",
} as const;

const VARIANT = {
  solid:
    "border border-[#FF8C42] bg-[#FF8C42] text-black hover:bg-transparent hover:text-[#FF8C42]",
  solidPro:
    "border border-[#FF8C42] bg-[#FF8C42] text-black hover:bg-transparent hover:text-[#FF8C42]",
  outline:
    "border border-white/20 text-white hover:border-[#FF8C42] hover:text-[#FF8C42] hover:shadow-[0_0_20px_rgba(255,140,66,0.25)]",
} as const;

export function TrialCtaButton({
  children,
  subtext,
  subtextOnHover = false,
  onClick,
  disabled,
  className = "",
  variant = "solid",
  size = "md",
  glow = variant !== "outline",
  ring = false,
  shine = false,
  fullWidth = false,
  showArrow = true,
}: TrialCtaButtonProps) {
  const stacked = Boolean(subtext);
  const hideSubtextUntilHover = stacked && subtextOnHover;

  const wrapClass = [
    "relative",
    fullWidth ? "block w-full" : "inline-flex",
    ring ? "tk-cta-ring-wrap" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const btnClass = [
    "group relative inline-flex items-center justify-center font-bold uppercase transition overflow-hidden tk-cta-hover-boost",
    stacked ? "flex-col gap-0.5" : "gap-2",
    SIZE[size],
    VARIANT[variant],
    glow ? "tk-cta-glow" : "",
    shine ? "tk-cta-shine" : "",
    fullWidth ? "w-full" : "",
    disabled ? "pointer-events-none opacity-60" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const subtextClass = [
    "relative z-[1] font-normal normal-case transition-all duration-300",
    size === "nav"
      ? "text-[9px] tracking-[0.08em] sm:text-[10px]"
      : "text-[10px] tracking-[0.06em] sm:text-xs",
    variant === "solid" || variant === "solidPro"
      ? "text-black/70 group-hover:text-[#FF8C42]/90"
      : "text-gray-400 group-hover:text-[#FFB86A]",
    hideSubtextUntilHover
      ? "max-h-0 overflow-hidden opacity-0 group-hover:max-h-8 group-hover:opacity-100 group-hover:mt-1"
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={wrapClass}>
      <button type="button" onClick={onClick} disabled={disabled} className={btnClass}>
        <span className="relative z-[1] inline-flex items-center justify-center gap-2">
          <span>{children}</span>
          {showArrow && (
            <ArrowUpRight
              className={`shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ${
                size === "xs" || size === "nav" ? "h-3 w-3" : "h-4 w-4"
              }`}
              aria-hidden
            />
          )}
        </span>
        {subtext && <span className={subtextClass}>{subtext}</span>}
      </button>
    </span>
  );
}
