import type { ReactNode } from "react";

const LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;

/** Renderiza parágrafos com links internos no formato [texto](/caminho). */
export function BlogRichText({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  LINK_RE.lastIndex = 0;
  while ((match = LINK_RE.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index));
    }
    const [, label, href] = match;
    parts.push(
      <a
        key={key++}
        href={href}
        className="text-[#FF8C42] underline decoration-[#FF8C42]/40 underline-offset-2 transition hover:decoration-[#FF8C42]"
      >
        {label}
      </a>,
    );
    last = match.index + match[0].length;
  }

  if (last < text.length) {
    parts.push(text.slice(last));
  }

  return <>{parts.length > 0 ? parts : text}</>;
}
