export type Market = "br" | "us";

const STORAGE_KEY = "trackion_market";
const MANUAL_KEY = "trackion_market_manual";

const US_TIMEZONES = new Set([
  "America/New_York",
  "America/Detroit",
  "America/Kentucky/Louisville",
  "America/Kentucky/Monticello",
  "America/Indiana/Indianapolis",
  "America/Indiana/Vincennes",
  "America/Indiana/Winamac",
  "America/Indiana/Marengo",
  "America/Indiana/Petersburg",
  "America/Indiana/Tell_City",
  "America/Indiana/Knox",
  "America/Indiana/Vevay",
  "America/Chicago",
  "America/Menominee",
  "America/North_Dakota/Center",
  "America/North_Dakota/New_Salem",
  "America/North_Dakota/Beulah",
  "America/Denver",
  "America/Boise",
  "America/Phoenix",
  "America/Los_Angeles",
  "America/Anchorage",
  "America/Juneau",
  "America/Sitka",
  "America/Metlakatla",
  "America/Yakutat",
  "America/Nome",
  "Pacific/Honolulu",
]);

function marketFromCountry(code: string | null | undefined): Market | null {
  if (!code) return null;
  const upper = code.trim().toUpperCase();
  if (upper === "US") return "us";
  if (upper === "BR") return "br";
  return null;
}

function marketFromBrowserSignals(): Market {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (US_TIMEZONES.has(tz)) return "us";
  const lang = navigator.language?.toLowerCase() ?? "";
  if (lang === "en-us" || lang.endsWith("-us")) return "us";
  return "br";
}

async function fetchCountryCode(): Promise<string | null> {
  try {
    const res = await fetch("https://ipapi.co/country_code/", {
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const text = (await res.text()).trim();
    return text.length === 2 ? text : null;
  } catch {
    return null;
  }
}

export function readStoredMarket(): Market | null {
  try {
    const v = sessionStorage.getItem(STORAGE_KEY);
    return v === "us" || v === "br" ? v : null;
  } catch {
    return null;
  }
}

export function storeMarket(market: Market): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, market);
  } catch {
    /* ignore */
  }
}

export function isMarketManual(): boolean {
  try {
    return sessionStorage.getItem(MANUAL_KEY) === "1";
  } catch {
    return false;
  }
}

/** Escolha explícita do usuário — persiste e ignora auto-detecção. */
export function setMarketPreference(market: Market): void {
  storeMarket(market);
  try {
    sessionStorage.setItem(MANUAL_KEY, "1");
  } catch {
    /* ignore */
  }
  document.documentElement.lang = market === "us" ? "en" : "pt-BR";
}

/** Detecta mercado: EUA → inglês/USD; demais → pt-BR/BRL. */
export async function detectMarket(): Promise<Market> {
  const cached = readStoredMarket();
  if (cached && isMarketManual()) return cached;
  if (cached) return cached;

  const country = await fetchCountryCode();
  const fromGeo = marketFromCountry(country);
  const market = fromGeo ?? marketFromBrowserSignals();
  storeMarket(market);
  return market;
}

export function detectMarketSync(): Market {
  return readStoredMarket() ?? marketFromBrowserSignals();
}
