const FP_BASE = "https://api.firstpromoter.com/api/v2";

export function firstPromoterConfigured(): boolean {
  return !!(
    process.env.FIRSTPROMOTER_API_KEY?.trim() &&
    process.env.FIRSTPROMOTER_ACCOUNT_ID?.trim()
  );
}

function fpHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${process.env.FIRSTPROMOTER_API_KEY}`,
    "Account-ID": process.env.FIRSTPROMOTER_ACCOUNT_ID!,
    "Content-Type": "application/json",
  };
}

async function fpFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${FP_BASE}${path}`, {
    ...init,
    headers: { ...fpHeaders(), ...(init?.headers as Record<string, string> | undefined) },
  });
  const text = await res.text();
  let data: unknown = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    const msg =
      typeof data === "object" && data && "error" in data
        ? String((data as { error: unknown }).error)
        : text || res.statusText;
    throw new Error(`FirstPromoter ${res.status}: ${msg}`);
  }
  return data as T;
}

export type FpSignupTrack = {
  email: string;
  uid: string;
  ref_id?: string;
  tid?: string;
};

export async function trackFpSignup(payload: FpSignupTrack): Promise<void> {
  if (!firstPromoterConfigured()) return;
  if (!payload.ref_id && !payload.tid) return;
  try {
    await fpFetch("/track/signup", {
      method: "POST",
      body: JSON.stringify({
        email: payload.email,
        uid: payload.uid,
        ref_id: payload.ref_id,
        tid: payload.tid,
        skip_email_notification: true,
      }),
    });
  } catch (err) {
    console.warn("[firstpromoter] track signup", err);
  }
}

export type CreateFpPromoterInput = {
  name: string;
  slug: string;
  email?: string;
};

export async function createFpPromoter(input: CreateFpPromoterInput): Promise<string | null> {
  if (!firstPromoterConfigured()) return null;
  const email = input.email ?? `${input.slug}@partners.trackion.app`;
  try {
    const data = await fpFetch<{ id?: number | string; data?: { id?: number | string } }>(
      "/company/promoters",
      {
        method: "POST",
        body: JSON.stringify({
          email,
          cust_id: input.slug,
          profile: { first_name: input.name },
        }),
      },
    );
    const id = data.id ?? data.data?.id;
    return id != null ? String(id) : null;
  } catch (err) {
    console.warn("[firstpromoter] create promoter", err);
    return null;
  }
}

export type FpPromoterRow = {
  id: number;
  email: string;
  cust_id?: string;
  profile?: { first_name?: string };
  stats?: {
    clicks_count?: number;
    signups_count?: number;
    sales_count?: number;
    revenue_amount?: number;
    referrals_count?: number;
    customers_count?: number;
  };
};

export async function listFpPromoters(): Promise<FpPromoterRow[]> {
  if (!firstPromoterConfigured()) return [];
  try {
    const data = await fpFetch<{ data?: FpPromoterRow[] }>("/company/promoters?per_page=100");
    return data.data ?? [];
  } catch (err) {
    console.warn("[firstpromoter] list promoters", err);
    return [];
  }
}

export type FpReportRow = {
  promoter_id?: number;
  cust_id?: string;
  clicks_count?: number;
  signups_count?: number;
  sales_count?: number;
  revenue_amount?: number;
  referrals_count?: number;
  customers_count?: number;
};

export async function getFpPromoterReports(periodDays = 30): Promise<FpReportRow[]> {
  if (!firstPromoterConfigured()) return [];
  const start = new Date();
  start.setDate(start.getDate() - periodDays);
  const startDate = start.toISOString().slice(0, 10);
  const columns = [
    "clicks_count",
    "signups_count",
    "sales_count",
    "revenue_amount",
    "referrals_count",
    "customers_count",
  ];
  const qs = new URLSearchParams();
  for (const c of columns) qs.append("columns[]", c);
  qs.set("group_by", "month");
  qs.set("start_date", startDate);
  try {
    const data = await fpFetch<{ data?: FpReportRow[] }>(`/company/reports/promoters?${qs}`);
    return data.data ?? [];
  } catch (err) {
    console.warn("[firstpromoter] reports", err);
    return [];
  }
}
