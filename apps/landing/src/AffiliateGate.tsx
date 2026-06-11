import { useEffect, useState } from "react";

import LandingPage from "./LandingPage";

import { readAffiliateSlugFromPath, saveAffiliateAttribution } from "./lib/affiliate";

import { getLandingContent } from "./lib/landing-content";

import { resolveApiBase } from "./lib/trialSignup";

import { useMarket } from "./hooks/useMarket";



type AffiliatePublic = {

  slug: string;

  name: string;

  couponCode: string;

  discountPct: number;

};



export default function AffiliateGate({

  onStartClick,

}: {

  onStartClick: () => void;

}) {

  const { market } = useMarket();

  const t = getLandingContent(market);

  const slug = readAffiliateSlugFromPath();

  const [affiliate, setAffiliate] = useState<AffiliatePublic | null>(null);

  const [loading, setLoading] = useState(!!slug);

  const [error, setError] = useState<string | null>(null);



  useEffect(() => {

    if (!slug) return;

    let cancelled = false;

    (async () => {

      try {

        const res = await fetch(`${resolveApiBase()}/api/affiliates/${encodeURIComponent(slug)}`);

        const data = (await res.json()) as AffiliatePublic & { error?: string };

        if (!res.ok) throw new Error(data.error ?? t.affiliate.loading);

        if (cancelled) return;

        saveAffiliateAttribution({

          refId: data.slug,

          couponCode: data.couponCode,

          discountPct: data.discountPct,

          name: data.name,

        });

        setAffiliate(data);

        const url = new URL(window.location.href);

        url.searchParams.set("fpr", data.slug);

        window.history.replaceState({}, "", url.pathname + url.search);

      } catch (e) {

        if (!cancelled) setError(e instanceof Error ? e.message : t.affiliate.loading);

      } finally {

        if (!cancelled) setLoading(false);

      }

    })();

    return () => {

      cancelled = true;

    };

  }, [slug, t.affiliate.loading]);



  if (!slug) {

    return <LandingPage onStartClick={onStartClick} affiliateBanner={null} />;

  }



  if (loading) {

    return (

      <div className="flex min-h-screen items-center justify-center bg-[#0B0B0B] text-white">

        <p className="font-mono text-sm text-zinc-400">{t.affiliate.loading}</p>

      </div>

    );

  }



  if (error) {

    return <LandingPage onStartClick={onStartClick} affiliateBanner={null} />;

  }



  const banner = affiliate

    ? {

        name: affiliate.name,

        couponCode: affiliate.couponCode,

        discountPct: affiliate.discountPct,

      }

    : null;



  return <LandingPage onStartClick={onStartClick} affiliateBanner={banner} />;

}

