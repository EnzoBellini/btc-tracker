import { useEffect, useMemo, useRef, useState } from "react";

const SAMPLES = Array.from({ length: 140 }, (_, index) => {
  const t = index / 139;
  const trend = 0.1 + Math.pow(t, 1.38) * 0.8;
  const softMovement = Math.sin(t * Math.PI * 5.4) * 0.018 + Math.sin(t * Math.PI * 12.2) * 0.008;
  const calmPullback = t > 0.54 && t < 0.68 ? Math.sin((t - 0.54) / 0.14 * Math.PI) * 0.055 : 0;

  return Math.max(0.06, Math.min(0.92, trend + softMovement - calmPullback));
});

function useLinearProgress(active: boolean, durationMs = 7800) {
  const [progress, setProgress] = useState(0);
  const frameRef = useRef<number>();

  useEffect(() => {
    if (!active) {
      setProgress(0);
      return;
    }

    const start = performance.now();
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    const tick = (time: number) => {
      if (media.matches) {
        setProgress(1);
        return;
      }

      const nextProgress = Math.min((time - start) / durationMs, 1);
      setProgress(nextProgress);

      if (nextProgress < 1) {
        frameRef.current = window.requestAnimationFrame(tick);
      }
    };

    frameRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    };
  }, [active, durationMs]);

  return progress;
}

function catmullRomPath(points: Array<{ x: number; y: number }>) {
  if (points.length < 2) return "";

  let path = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;

  for (let index = 0; index < points.length - 1; index += 1) {
    const p0 = points[Math.max(0, index - 1)];
    const p1 = points[index];
    const p2 = points[index + 1];
    const p3 = points[Math.min(points.length - 1, index + 2)];
    const tension = 0.82;
    const c1x = p1.x + ((p2.x - p0.x) / 6) * tension;
    const c1y = p1.y + ((p2.y - p0.y) / 6) * tension;
    const c2x = p2.x - ((p3.x - p1.x) / 6) * tension;
    const c2y = p2.y - ((p3.y - p1.y) / 6) * tension;

    path += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(
      2,
    )} ${p2.y.toFixed(2)}`;
  }

  return path;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function getPointAtProgress(points: Array<{ x: number; y: number }>, progress: number) {
  if (points.length < 2) {
    return { x: 0, y: 0 };
  }

  const safeProgress = Number.isFinite(progress) ? Math.max(0, Math.min(1, progress)) : 0;
  const exactIndex = safeProgress * (points.length - 1);
  const leftIndex = Math.max(0, Math.min(points.length - 2, Math.floor(exactIndex)));
  const localProgress = exactIndex - leftIndex;
  const from = points[leftIndex];
  const to = points[leftIndex + 1] ?? from;

  return {
    x: lerp(from.x, to.x, localProgress),
    y: lerp(from.y, to.y, localProgress),
  };
}

export function AnimatedWealthChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const progress = useLinearProgress(active);
  const width = 980;
  const height = 520;
  const paddingX = 78;
  const paddingTop = 58;
  const paddingBottom = 76;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingTop - paddingBottom;
  const pulse = 0.5 + Math.sin(progress * Math.PI * 16) * 0.5;

  const coordinates = useMemo(
    () =>
      SAMPLES.map((value, index) => ({
        x: paddingX + (index / (SAMPLES.length - 1)) * chartWidth,
        y: paddingTop + (1 - value) * chartHeight,
      })),
    [chartHeight, chartWidth],
  );

  const linePath = catmullRomPath(coordinates);
  const lineEnd = getPointAtProgress(coordinates, progress);
  const areaPath = `${linePath} L ${width - paddingX} ${height - paddingBottom} L ${paddingX} ${height - paddingBottom} Z`;
  const revealWidth = Math.max(0, lineEnd.x - paddingX + 4);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.42 },
    );

    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relative aspect-[1.85/1] w-full overflow-hidden">
      <svg className="relative block h-full w-full" viewBox={`0 0 ${width} ${height}`} role="img">
        <title>Gráfico animado de crescimento patrimonial</title>
        <defs>
          <clipPath id="wealthReveal">
            <rect x={paddingX - 24} y="0" width={revealWidth + 24} height={height} />
          </clipPath>
          <linearGradient id="wealthArea" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#FF8C42" stopOpacity="0.4" />
            <stop offset="62%" stopColor="#FF6B12" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#FF6B12" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="wealthLine" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#A4420B" />
            <stop offset="54%" stopColor="#FF8C42" />
            <stop offset="100%" stopColor="#FFD0A8" />
          </linearGradient>
          <linearGradient id="wealthVerticalFade" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#FF8C42" stopOpacity="0" />
            <stop offset="20%" stopColor="#FF8C42" stopOpacity="0.22" />
            <stop offset="52%" stopColor="#FF8C42" stopOpacity="0.16" />
            <stop offset="82%" stopColor="#FF8C42" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#FF8C42" stopOpacity="0" />
          </linearGradient>
          <filter id="wealthGlow" x="-30%" y="-45%" width="160%" height="190%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="edgeFadeTop" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#000" stopOpacity="1" />
            <stop offset="100%" stopColor="#000" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="edgeFadeBottom" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="edgeFadeLeft" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#000" stopOpacity="1" />
            <stop offset="100%" stopColor="#000" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="edgeFadeRight" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="1" />
          </linearGradient>
        </defs>

        {[0.2, 0.4, 0.6, 0.8].map((line) => (
          <line
            key={line}
            x1={paddingX}
            x2={width - paddingX}
            y1={paddingTop + chartHeight * line}
            y2={paddingTop + chartHeight * line}
            stroke="rgba(255,255,255,0.08)"
            strokeDasharray="8 16"
          />
        ))}

        <line x1={paddingX} x2={paddingX} y1={paddingTop} y2={height - paddingBottom} stroke="rgba(255,255,255,0.08)" />
        <line
          x1={paddingX}
          x2={width - paddingX}
          y1={height - paddingBottom}
          y2={height - paddingBottom}
          stroke="rgba(255,255,255,0.1)"
        />

        <g clipPath="url(#wealthReveal)">
          <path d={areaPath} fill="url(#wealthArea)" opacity="0.9" />
        </g>

        <rect x="0" y="0" width={width} height="110" fill="url(#edgeFadeTop)" />
        <rect x="0" y={height - 130} width={width} height="130" fill="url(#edgeFadeBottom)" />
        <rect x="0" y="0" width="78" height={height} fill="url(#edgeFadeLeft)" />
        <rect x={width - 70} y="0" width="70" height={height} fill="url(#edgeFadeRight)" />

        <g clipPath="url(#wealthReveal)">
          <path d={linePath} fill="none" stroke="rgba(255,140,66,0.22)" strokeLinecap="round" strokeWidth="20" />
          <path
            d={linePath}
            fill="none"
            filter="url(#wealthGlow)"
            stroke="url(#wealthLine)"
            strokeLinecap="round"
            strokeWidth="7"
          />
        </g>

        <line
          x1={lineEnd.x}
          x2={lineEnd.x}
          y1={paddingTop - 36}
          y2={height - paddingBottom + 56}
          stroke="url(#wealthVerticalFade)"
          strokeWidth="2"
        />
        <circle cx={lineEnd.x} cy={lineEnd.y} r={9} fill="#000" stroke="#FFD0A8" strokeWidth="4" />
        <circle cx={lineEnd.x} cy={lineEnd.y} r={22 + pulse * 6} fill="none" stroke="#FF8C42" strokeOpacity="0.22" />
      </svg>
    </div>
  );
}
