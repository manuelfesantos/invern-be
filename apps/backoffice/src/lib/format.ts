/** Cents → a euro string, e.g. 500 → "€5.00". */
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

/** Grams → "300 g". */
export function formatWeight(grams: number): string {
  return `${grams} g`;
}

/** ISO datetime → "7 Jul 2026, 14:30" (locale short). */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

/** First 8 chars of a UUID, for compact display (e.g. "2fef20d6…"). */
export function shortId(id: string): string {
  return id.length > 8 ? `${id.slice(0, 8)}…` : id;
}
