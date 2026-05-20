import { clsx } from "clsx";
import { useEffect, useRef } from "react";

/** Mesma lógica do protótipo em C:\teste\index.html (halftone a partir da arte). */
const BRIGHTNESS_THRESHOLD = 180;

const BRAND_ORANGE = { r: 255, g: 140, b: 66 } as const; // #FF8C42 — CTAs / marca
/** Laranja mais apagado só na faixa halftone do hero */
const WAVE_ORANGE = { r: 188, g: 92, b: 42 } as const; // ~#BC5C2A
const DOT_BRAND = BRAND_ORANGE;
const DOT_MONO = { r: 255, g: 255, b: 255 } as const;
const WAVE_LAYER_OPACITY = 0.82;

type ProcessMode = "mono" | "brand" | "orangeBlack";

function processPixels(data: Uint8ClampedArray, mode: ProcessMode) {
  const bgR = mode === "orangeBlack" ? WAVE_ORANGE.r : BRAND_ORANGE.r;
  const bgG = mode === "orangeBlack" ? WAVE_ORANGE.g : BRAND_ORANGE.g;
  const bgB = mode === "orangeBlack" ? WAVE_ORANGE.b : BRAND_ORANGE.b;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] ?? 0;
    const g = data[i + 1] ?? 0;
    const b = data[i + 2] ?? 0;
    const brightness = (r + g + b) / 3;

    if (mode === "orangeBlack") {
      if (brightness > BRIGHTNESS_THRESHOLD) {
        data[i] = bgR;
        data[i + 1] = bgG;
        data[i + 2] = bgB;
        data[i + 3] = 255;
      } else {
        const t = 1 - brightness / BRIGHTNESS_THRESHOLD;
        data[i] = Math.round(bgR * (1 - t));
        data[i + 1] = Math.round(bgG * (1 - t));
        data[i + 2] = Math.round(bgB * (1 - t));
        data[i + 3] = 255;
      }
      continue;
    }

    const dot = mode === "brand" ? DOT_BRAND : DOT_MONO;

    if (brightness > BRIGHTNESS_THRESHOLD) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 255;
    } else {
      const strength = 1 - brightness / BRIGHTNESS_THRESHOLD;
      data[i] = dot.r;
      data[i + 1] = dot.g;
      data[i + 2] = dot.b;
      data[i + 3] = Math.min(255, strength * 255);
    }
  }
}

export type HeroWaveCanvasProps = {
  className?: string;
  /** Caminho público da arte original (halftone / bolinhas em tons de cinza). */
  src?: string;
  /** `orangeBlack`: campo #FF8C42 com bolinhas pretas. `mono`: claro no preto. `brand`: laranja no preto. */
  variant?: "brand" | "mono" | "orangeBlack";
  /** `bottom-left`: ancora embaixo à esquerda; `center`: centraliza horizontalmente. */
  align?: "center" | "bottom-left";
  /** `wave-band`: faixa central da arte (onde a onda existe). `bottom-half`: metade inferior. */
  crop?: "none" | "bottom-half" | "wave-band";
  /** `stretch`: preenche largura e altura; `stretch-width`: largura total, altura proporcional. */
  fit?: "cover" | "stretch" | "stretch-width";
  /** 0–1: desloca a faixa halftone ao rolar (usa crop `full`). */
  scrollProgress?: number;
};

type CropMode = NonNullable<HeroWaveCanvasProps["crop"]>;

/** Recorte na arte original — a onda fica na faixa central, não na metade inferior. */
function getSourceRect(iw: number, ih: number, crop: CropMode) {
  switch (crop) {
    case "bottom-half":
      return { sx: 0, sy: ih / 2, sw: iw, sh: ih / 2 };
    case "wave-band":
      return { sx: 0, sy: ih * 0.28, sw: iw, sh: ih * 0.42 };
    default:
      return { sx: 0, sy: 0, sw: iw, sh: ih };
  }
}

/**
 * Desenha a onda processada no cliente (canvas).
 * Escala com DPR; encaixa no container como cover ancorado embaixo (e à esquerda se `align` pedir).
 */
export function HeroWaveCanvas({
  className,
  src = "/wave-original.png",
  variant = "orangeBlack",
  align = "bottom-left",
  crop = "none",
  fit = "cover",
  scrollProgress,
}: HeroWaveCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const processedRef = useRef<HTMLCanvasElement | null>(null);
  const scrollProgressRef = useRef(scrollProgress ?? 0);
  const paintRef = useRef<(() => void) | null>(null);

  scrollProgressRef.current = scrollProgress ?? 0;

  useEffect(() => {
    paintRef.current?.();
  }, [scrollProgress]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let cancelled = false;

    const processMode: ProcessMode =
      variant === "orangeBlack" ? "orangeBlack" : variant === "brand" ? "brand" : "mono";

    const paint = () => {
      const processed = processedRef.current;
      if (!processed) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      if (cw < 1 || ch < 1) return;

      const wPx = Math.max(1, Math.floor(cw * dpr));
      const hPx = Math.max(1, Math.floor(ch * dpr));
      if (canvas.width !== wPx) canvas.width = wPx;
      if (canvas.height !== hPx) canvas.height = hPx;
      canvas.style.width = `${cw}px`;
      canvas.style.height = `${ch}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const iw = processed.width;
      const ih = processed.height;
      const progress = Math.max(0, Math.min(1, scrollProgressRef.current));
      const useScrollPan = crop === "none" && fit === "stretch-width";

      let sx: number;
      let sy: number;
      let sw: number;
      let sh: number;
      let dx: number;
      let dy: number;
      let dw: number;
      let dh: number;

      if (useScrollPan) {
        sx = 0;
        sw = iw;
        const scale = cw / iw;
        const visibleSourceH = ch / scale;
        const waveEnd = ih * 0.7;
        const startSy = Math.max(0, Math.min(ih - visibleSourceH, waveEnd - visibleSourceH));
        sy = startSy * (1 - progress);
        sh = visibleSourceH;
        dx = 0;
        dy = 0;
        dw = cw;
        dh = ch;
      } else {
        ({ sx, sy, sw, sh } = getSourceRect(iw, ih, crop));

        if (fit === "stretch-width") {
          const scale = cw / sw;
          dx = 0;
          dw = cw;
          dh = sh * scale;
          dy = ch - dh;
        } else if (fit === "stretch") {
          dx = 0;
          dy = 0;
          dw = cw;
          dh = ch;
        } else {
          const scale = Math.max(cw / sw, ch / sh);
          dw = sw * scale;
          dh = sh * scale;
          dx = align === "bottom-left" ? 0 : (cw - dw) / 2;
          dy = ch - dh;
        }
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cw, ch);
      if (variant === "orangeBlack") ctx.globalAlpha = WAVE_LAYER_OPACITY;
      ctx.drawImage(processed, sx, sy, sw, sh, dx, dy, dw, dh);
      if (variant === "orangeBlack") ctx.globalAlpha = 1;
    };

    paintRef.current = paint;

    const img = new Image();
    img.decoding = "async";
    img.src = src;

    img.onload = () => {
      if (cancelled) return;

      const srcCanvas = document.createElement("canvas");
      srcCanvas.width = img.naturalWidth;
      srcCanvas.height = img.naturalHeight;
      const sctx = srcCanvas.getContext("2d");
      if (!sctx) return;

      sctx.drawImage(img, 0, 0);
      const imageData = sctx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);
      processPixels(imageData.data, processMode);
      sctx.putImageData(imageData, 0, 0);
      processedRef.current = srcCanvas;
      paint();
    };

    const ro = new ResizeObserver(() => paint());
    ro.observe(container);

    return () => {
      cancelled = true;
      ro.disconnect();
      processedRef.current = null;
      paintRef.current = null;
    };
  }, [src, variant, align, crop, fit]);

  return (
    <div ref={containerRef} className={clsx("h-full min-h-0 w-full", className)}>
      <canvas ref={canvasRef} className="pointer-events-none block h-full w-full bg-transparent" aria-hidden />
    </div>
  );
}
