import { clsx } from "clsx";
import { useEffect, useRef } from "react";

const BRAND_ORANGE = { r: 255, g: 140, b: 66 } as const;
const WAVE_DARK_ORANGE = { r: 188, g: 92, b: 42 } as const;

export type HeroWaveCanvasProps = {
  className?: string;
  /** Mantido por compatibilidade com chamadas antigas; a onda agora e procedural. */
  src?: string;
  /** `orangeBlack`: laranja da faixa do hero. `mono`: branco. `brand`: laranja da marca. */
  variant?: "brand" | "mono" | "orangeBlack";
  align?: "center" | "bottom-left";
  crop?: "none" | "bottom-half" | "wave-band";
  fit?: "cover" | "stretch" | "stretch-width";
  scrollProgress?: number;
};

function mixChannel(a: number, b: number, t: number) {
  return Math.round(a + (b - a) * t);
}

function dotColor(variant: NonNullable<HeroWaveCanvasProps["variant"]>, intensity: number, alpha: number) {
  if (variant === "mono") {
    const value = mixChannel(140, 255, intensity);
    return `rgba(${value}, ${value}, ${value}, ${alpha})`;
  }

  const base = variant === "brand" ? BRAND_ORANGE : WAVE_DARK_ORANGE;
  const hot = BRAND_ORANGE;
  return `rgba(${mixChannel(base.r, hot.r, intensity)}, ${mixChannel(base.g, hot.g, intensity)}, ${mixChannel(
    base.b,
    hot.b,
    intensity,
  )}, ${alpha})`;
}

export function HeroWaveCanvas({
  className,
  variant = "orangeBlack",
  scrollProgress,
}: HeroWaveCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollProgressRef = useRef(scrollProgress ?? 0);

  scrollProgressRef.current = scrollProgress ?? 0;

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let animationFrame = 0;
    let lastTime = performance.now();
    let elapsedSeconds = 0;
    let reducedMotion = false;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateReducedMotion = () => {
      reducedMotion = media.matches;
    };
    updateReducedMotion();
    media.addEventListener("change", updateReducedMotion);

    const paint = (time: number) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = container.clientWidth;
      const ch = container.clientHeight;

      if (cw < 1 || ch < 1) {
        animationFrame = window.requestAnimationFrame(paint);
        return;
      }

      const deltaSeconds = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;
      if (!reducedMotion) elapsedSeconds += deltaSeconds;

      const wPx = Math.max(1, Math.floor(cw * dpr));
      const hPx = Math.max(1, Math.floor(ch * dpr));
      if (canvas.width !== wPx) canvas.width = wPx;
      if (canvas.height !== hPx) canvas.height = hPx;
      canvas.style.width = `${cw}px`;
      canvas.style.height = `${ch}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cw, ch);
      ctx.globalCompositeOperation = "lighter";

      const columns = Math.max(128, Math.floor(cw / 8));
      const rows = Math.max(54, Math.floor(ch / 6));
      const scrollLift = Math.max(0, Math.min(1, scrollProgressRef.current)) * ch * 0.08;

      for (let row = 0; row < rows; row += 1) {
        const depth = row / (rows - 1);
        const perspective = 0.4 + depth * 1.42;
        const baseY = ch * 0.08 + depth * ch * 0.98 - scrollLift;
        const horizonFade = Math.min(1, Math.max(0.08, (depth - 0.02) / 0.2));

        for (let column = 0; column < columns; column += 1) {
          const xProgress = column / (columns - 1);
          const worldX = (xProgress - 0.5) * 2.55;
          const waveA = Math.sin(worldX * 3.75 + depth * 6.8 - elapsedSeconds * 0.58);
          const waveB = Math.sin(worldX * 6.1 - depth * 4.6 + elapsedSeconds * 0.34);
          const waveC = Math.cos(worldX * 2.35 + depth * 10.5 + elapsedSeconds * 0.24);
          const elevation = waveA * 0.16 + waveB * 0.075 + waveC * 0.045;
          const sway = Math.sin(depth * 8.5 + elapsedSeconds * 0.42) * cw * 0.014;
          const x = cw / 2 + worldX * cw * 0.43 * perspective + sway;
          const y = baseY - elevation * ch * (0.2 + depth * 0.68);

          if (x < -16 || x > cw + 16 || y < -16 || y > ch + 16) continue;

          const sideFade = Math.min(1, Math.max(0.46, 1 - Math.max(0, Math.abs(xProgress - 0.5) - 0.38) * 4.2));
          const intensity = Math.min(1, Math.max(0.38, 0.55 + elevation * 2.3 + depth * 0.22));
          const alpha = 0.34 * horizonFade * sideFade * (0.8 + intensity * 0.35);
          const radius = 0.78 + depth * 2.45 + Math.max(elevation, 0) * 3.2;

          ctx.beginPath();
          ctx.fillStyle = dotColor(variant, intensity, alpha);
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalCompositeOperation = "source-over";
      animationFrame = window.requestAnimationFrame(paint);
    };

    animationFrame = window.requestAnimationFrame((time) => {
      lastTime = time;
      paint(time);
    });

    const ro = new ResizeObserver(() => {
      lastTime = performance.now();
    });
    ro.observe(container);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      ro.disconnect();
      media.removeEventListener("change", updateReducedMotion);
    };
  }, [variant]);

  return (
    <div ref={containerRef} className={clsx("h-full min-h-0 w-full", className)}>
      <canvas ref={canvasRef} className="pointer-events-none block h-full w-full bg-transparent" aria-hidden />
    </div>
  );
}
