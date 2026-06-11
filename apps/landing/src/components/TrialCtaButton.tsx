import { ArrowUpRight } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type TrialCtaButtonProps = {
  children: ReactNode;
  variant?: "solid" | "outline" | "solidPro";
  size?: "sm" | "md" | "lg";
  glow?: boolean;
  ring?: boolean;
  shine?: boolean;
  fullWidth?: boolean;
  showArrow?: boolean;
} & Pick<ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "disabled" | "className">;

const SIZE = {
  sm: "px-4 py-2 text-xs tracking-[0.22em]",
  md: "px-6 py-3.5 text-sm tracking-[0.22em]",
  lg: "px-8 py-4 text-sm tracking-[0.24em] sm:text-base sm:tracking-[0.22em]",
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
  const wrapClass = [
    "relative",
    fullWidth ? "block w-full" : "inline-flex",
    ring ? "tk-cta-ring-wrap" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const btnClass = [
    "group relative inline-flex items-center justify-center gap-2 font-bold uppercase transition overflow-hidden",
    SIZE[size],
    VARIANT[variant],
    glow ? "tk-cta-glow" : "",
    shine ? "tk-cta-shine" : "",
    fullWidth ? "w-full" : "",
    disabled ? "pointer-events-none opacity-60" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={wrapClass}>
      <button type="button" onClick={onClick} disabled={disabled} className={btnClass}>
        <span className="relative z-[1]">{children}</span>
        {showArrow && (
          <ArrowUpRight
            className="relative z-[1] h-4 w-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            aria-hidden
          />
        )}
      </button>
    </span>
  );
}
