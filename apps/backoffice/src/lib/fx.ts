// Live EUR exchange rates from open.er-api.com — free, no API key, CORS-enabled
// (~160 currencies). `rateToEuro` in our schema means "1 EUR = X of this
// currency", which is exactly what `latest/EUR` returns per currency.

const ENDPOINT = "https://open.er-api.com/v6/latest/EUR";

let cache: Record<string, number> | null = null;

async function getRates(): Promise<Record<string, number> | null> {
  if (cache) return cache;
  try {
    const res = await fetch(ENDPOINT);
    if (!res.ok) return null;
    const json = (await res.json()) as {
      result?: string;
      rates?: Record<string, number>;
    };
    if (json.result === "success" && json.rates) {
      cache = json.rates;
      return cache;
    }
    return null;
  } catch {
    return null;
  }
}

/** 1 EUR = X `code`, or null if unavailable/unsupported. */
export async function fetchRateToEuro(code: string): Promise<number | null> {
  if (code === "EUR") return 1;
  const rates = await getRates();
  const rate = rates?.[code];
  return typeof rate === "number" ? rate : null;
}
