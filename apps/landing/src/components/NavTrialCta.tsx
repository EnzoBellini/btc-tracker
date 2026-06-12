import { useState } from "react";

type NavTrialCtaProps = {
  shortLabel: string;
  fullLabel: string;
  subtext: string;
  onHoverChange?: (hovered: boolean) => void;
  onClick: () => void;
};

export function NavTrialCta({
  shortLabel,
  fullLabel,
  subtext,
  onHoverChange,
  onClick,
}: NavTrialCtaProps) {
  const [hovered, setHovered] = useState(false);

  const setHover = (next: boolean) => {
    setHovered(next);
    onHoverChange?.(next);
  };

  return (
    <span className="relative inline-block h-8 w-[4.5rem] shrink-0">
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className={`absolute right-0 top-0 z-[60] inline-flex h-8 items-center justify-center overflow-hidden whitespace-nowrap border border-[#FF8C42] font-bold uppercase transition-[background-color,color,box-shadow] duration-200 ease-out ${
          hovered
            ? "bg-transparent px-3 text-[#FF8C42] shadow-[0_0_0_3px_rgba(255,140,66,0.18),0_8px_36px_rgba(255,140,66,0.55)] sm:px-4"
            : "w-full bg-[#FF8C42] px-2 text-[10px] tracking-[0.14em] text-black"
        }`}
      >
        {hovered ? (
          <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.12em] sm:text-[11px]">
            <span>{fullLabel}</span>
            <span className="hidden text-current/30 sm:inline" aria-hidden>
              ·
            </span>
            <span className="hidden font-normal normal-case tracking-normal opacity-80 sm:inline sm:text-[10px]">
              {subtext}
            </span>
          </span>
        ) : (
          shortLabel
        )}
      </button>
    </span>
  );
}
