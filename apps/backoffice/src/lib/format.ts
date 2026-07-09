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
