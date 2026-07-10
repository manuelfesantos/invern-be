// World countries & currencies derived from the platform's own Intl data — no
// bundled dataset. Countries come from filtering region DisplayNames (there is
// no Intl.supportedValuesOf('region')); currencies from supportedValuesOf.

export interface Option {
  value: string;
  label: string;
}

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
const currencyNames = new Intl.DisplayNames(["en"], { type: "currency" });

// Region codes that resolve to a name but aren't shipping countries
// (aggregates, pseudo-locales, exceptional reservations).
const NON_COUNTRIES = new Set([
  "EU", "EZ", "QO", "UN", "XA", "XB", "ZZ", "AC", "CP", "DG", "EA", "IC", "TA",
]);

function buildCountries(): Option[] {
  const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const out: Option[] = [];
  for (const a of A) {
    for (const b of A) {
      const code = a + b;
      if (NON_COUNTRIES.has(code)) continue;
      const name = regionNames.of(code);
      if (name && name !== code) out.push({ value: code, label: name });
    }
  }
  return out.sort((x, y) => x.label.localeCompare(y.label));
}

export const COUNTRIES: Option[] = buildCountries();

export const CURRENCIES: Option[] = Intl.supportedValuesOf("currency")
  .map((code) => ({ value: code, label: currencyNames.of(code) ?? code }))
  .sort((x, y) => x.label.localeCompare(y.label));

export function countryName(code: string): string {
  const n = regionNames.of(code);
  return n && n !== code ? n : "";
}

// Primary official locale for a country via likely-subtags maximize
// (e.g. PT → pt-PT, BR → pt-BR). The backend stores one locale per country.
export function countryLocale(code: string): string {
  try {
    const loc = new Intl.Locale(`und-${code}`).maximize();
    return loc.language && loc.region ? `${loc.language}-${loc.region}` : "";
  } catch {
    return "";
  }
}

export function currencyName(code: string): string {
  const n = currencyNames.of(code);
  return n && n !== code ? n : "";
}

export function currencySymbol(code: string): string {
  try {
    const parts = new Intl.NumberFormat("en", {
      style: "currency",
      currency: code,
      currencyDisplay: "narrowSymbol",
    }).formatToParts(0);
    return parts.find((p) => p.type === "currency")?.value ?? code;
  } catch {
    return code;
  }
}
