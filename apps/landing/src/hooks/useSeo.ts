import { useEffect } from "react";
import { applySeoMeta, type SeoMeta } from "../lib/seo";

export function useSeo(meta: SeoMeta) {
  useEffect(() => {
    applySeoMeta(meta);
  }, [meta.title, meta.description, meta.path, meta.noindex]);
}
