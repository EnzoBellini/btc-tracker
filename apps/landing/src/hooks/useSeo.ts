import { useEffect, useMemo } from "react";
import { applySeoMeta, type SeoMeta } from "../lib/seo";

export function useSeo(meta: SeoMeta) {
  const metaKey = useMemo(() => JSON.stringify(meta), [meta]);

  useEffect(() => {
    applySeoMeta(meta);
  }, [metaKey, meta]);
}
