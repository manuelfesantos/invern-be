#!/usr/bin/env node
/**
 * Idempotent database seed for invern-be.
 *
 *   node scripts/seed.mjs --env=local          # local D1 (default)
 *   node scripts/seed.mjs --env=preview --yes  # remote D1 (requires --yes)
 *   node scripts/seed.mjs --env=prod --yes
 *   node scripts/seed.mjs --dry-run            # print the SQL, don't run it
 *
 * Replaces the old /private/insert-test-data endpoint. Runs as SQL via
 * `wrangler d1 execute` (no server needed). Taxes are the one exception: if a
 * Stripe key is present in apps/backend/.dev.vars, the tax rows are keyed by
 * real Stripe TaxRate ids (so checkout's `tax_rates` resolve); without a key it
 * falls back to deterministic UUID ids and stays fully offline.
 *
 * Idempotent: every row has a deterministic id and is written with
 * `INSERT ... ON CONFLICT DO UPDATE`, so re-running never duplicates data — it
 * converges the DB to the seed's state.
 *
 * Options:
 *   --env <local|preview|prod>   target environment (default: local)
 *   --database <name>            D1 database name (default: invern-db)
 *   --yes                        confirm a write to a REMOTE (preview/prod) DB
 *   --dry-run                    print the generated SQL and exit
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import Stripe from "stripe";
import { resolveTarget, executeSql, sqlValue } from "./lib/d1.mjs";

const target = resolveTarget(process.argv.slice(2));

// ------------------------------------------------------------ seed data -----
// Deterministic uuid-v4-shaped id from a stable key (so re-runs hit the same
// rows). The v4/variant nibbles keep it valid for the API's `z.uuidv4()` reads.
const fixedId = (key) => {
  const h = createHash("sha256").update(`invern-seed:${key}`).digest("hex");
  const variant = ((parseInt(h[16], 16) & 0x3) | 0x8).toString(16);
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-${variant}${h.slice(17, 20)}-${h.slice(20, 32)}`;
};

// Seed images deliberately point at the PRODUCTION CDN, even when seeding
// locally. The image bytes live only in the prod R2 bucket, and we don't commit
// the ~48 binary files to the repo, so referencing the CDN keeps the seed
// lightweight. Consequence: on local dev, seeded product/collection images are
// fetched from images.invernspirit.com (needs internet), while images YOU upload
// go to local R2 and are served from IMAGES_HOST (http://localhost:8790/public/images).
// To make seeded images fully local instead, fetch each into local R2
// (`wrangler r2 object put <images-bucket>/<key> --local`) and store the local URL.
const IMG = "https://images.invernspirit.com/products";

const collectionsRaw = [
  { key: "erosion", name: "Erosion", description: "The nature of clay will speak of the continual erosion and weathering of the land we live on, of the traces made by the passage of humans across the surface of our planet and of the tension between a container and its contents." },
  { key: "midden", name: "Midden", description: "Skye’s landscape undergoes fundamental natural changes as a result of climatic and geological processes. Changes made by human activities such as settlement and agriculture are scratched on its surface." },
  { key: "contour", name: "Contour", description: "My contour collection grows from a feeling of connection to the land and the effect of people upon its surface. The forms of the land are bounded by fencing and dykes, crossed by paths and water courses, which can delineate, separate and unify." },
];

const productsRaw = [
  { name: "Earth Jar", collection: "Erosion", description: "Earth Jar 20 'riven', unglazed stoneware", priceInCents: 500, stock: 10, weight: 300 },
  { name: "Raku Fire", collection: "Erosion", description: "Watershed' hand formed, raku fired ceramic", priceInCents: 500, stock: 10, weight: 400 },
  { name: "Saggar Bottle", collection: "Erosion", description: "Erosion bottle of saggar fired stoneware", priceInCents: 500, stock: 10, weight: 500 },
  { name: "Strata Flask", collection: "Erosion", description: "A small hand made strata flask with dark iron tenmoku glazed interior.", priceInCents: 500, stock: 10, weight: 600 },
  { name: "Erosion Cup", collection: "Midden", description: "A hand made erosion cup (or yunomi) with iron matt glaze interior.", priceInCents: 500, stock: 10, weight: 500 },
  { name: "Tanka Fired", collection: "Midden", description: "Tanka fired strata vase. This textured hand made vase has been fired in a charcoal saggar in the gas kiln.", priceInCents: 500, stock: 10, weight: 400 },
  { name: "Strata Flask", collection: "Midden", description: "A small hand made strata flask with dark iron tenmoku glazed interior.", priceInCents: 500, stock: 10, weight: 300 },
  { name: "Strata Vase", collection: "Midden", description: "Tanka fired strata vase. This textured hand made vase has been fired in a charcoal saggar in the gas kiln.", priceInCents: 500, stock: 10, weight: 400 },
  { name: "Rolling Erosion", collection: "Contour", description: "Rolling erosion bowl. This textured hand made bowl has been fired in a charcoal saggar in the wood kiln where it takes on the soft greys and blacks from the firing process.", priceInCents: 500, stock: 10, weight: 500 },
  { name: "Contour Vase", collection: "Contour", description: "Contour vase. This textured hand made vase has been fired in a charcoal saggar in the gas kiln.", priceInCents: 500, stock: 10, weight: 600 },
  { name: "Strata Flask", collection: "Contour", description: "A small hand made strata flask with dark iron tenmoku glazed interior.", priceInCents: 500, stock: 10, weight: 500 },
  { name: "Kappa Vase", collection: "Contour", description: "Kappa vase bowl. This textured hand made bowl has been fired in a charcoal saggar in the wood kiln where it takes on the soft greys and blacks from the firing process.", priceInCents: 500, stock: 10, weight: 400 },
];

const shippingRatesRaw = {
  PT: [
    { priceInCents: 406, minWeight: 0, maxWeight: 3000, deliveryTime: 1 },
    { priceInCents: 426, minWeight: 3000, maxWeight: 5000, deliveryTime: 1 },
    { priceInCents: 449, minWeight: 5000, maxWeight: 10000, deliveryTime: 1 },
    { priceInCents: 572, minWeight: 10000, maxWeight: 15000, deliveryTime: 1 },
    { priceInCents: 606, minWeight: 15000, maxWeight: 20000, deliveryTime: 1 },
    { priceInCents: 736, minWeight: 20000, maxWeight: 25000, deliveryTime: 1 },
    { priceInCents: 775, minWeight: 25000, maxWeight: 30000, deliveryTime: 1 },
  ],
  ES: [
    { priceInCents: 608, minWeight: 0, maxWeight: 1000, deliveryTime: 2 },
    { priceInCents: 691, minWeight: 1000, maxWeight: 5000, deliveryTime: 2 },
    { priceInCents: 818, minWeight: 5000, maxWeight: 10000, deliveryTime: 2 },
    { priceInCents: 1186, minWeight: 10000, maxWeight: 15000, deliveryTime: 2 },
    { priceInCents: 1494, minWeight: 15000, maxWeight: 20000, deliveryTime: 2 },
  ],
};

// ------------------------------------------------------- resolve into rows ---
const collections = collectionsRaw.map((c) => ({ id: fixedId(`collection-${c.key}`), name: c.name, description: c.description }));
const collectionIdByName = Object.fromEntries(collections.map((c, i) => [collectionsRaw[i].name, c.id]));

const products = productsRaw.map((p, i) => ({
  id: fixedId(`product-${i}`),
  name: p.name,
  description: p.description,
  stock: p.stock,
  collection_id: collectionIdByName[p.collection],
  price_in_cents: p.priceInCents,
  weight: p.weight,
}));

const images = [];
products.forEach((p, i) => {
  const n = i + 1;
  const alt = productsRaw[i].name;
  for (let k = 1; k <= 4; k++) {
    images.push({ url: `${IMG}/ceramics-product-${n}-${k}.avif`, alt, product_id: p.id, collection_id: null, is_thumbnail: 0 });
  }
  images.push({ url: `${IMG}/ceramics-product-${n}-thumb.webp`, alt, product_id: p.id, collection_id: null, is_thumbnail: 1 });
});
// one cover image per collection (collection_id is UNIQUE on images)
images[0].collection_id = collectionIdByName["Erosion"];
images[16].collection_id = collectionIdByName["Midden"];
images[32].collection_id = collectionIdByName["Contour"];

const currencies = [{ code: "EUR", name: "Euro", symbol: "€", rate_to_euro: 1, stripe_name: "eur" }];
const countries = [
  { code: "PT", name: "Portugal", locale: "pt-PT", currency_code: "EUR" },
  { code: "ES", name: "Spain", locale: "es-ES", currency_code: "EUR" },
];
// Rates are a fraction (matches the app's percentageToRate), stored in a REAL
// column. The tax `id` must be a Stripe TaxRate id (`txr_…`) — checkout charges
// via `tax_rates: [tax.id]`. When a Stripe key is in apps/backend/.dev.vars we
// resolve real ids (reuse an active matching rate, else create one); otherwise
// we fall back to deterministic UUIDs (offline seed — those won't resolve at
// Stripe checkout, printed as a warning).
const taxesRaw = [
  { key: "tax-PT", name: "VAT", rate: 0.23, country_id: "PT" },
  { key: "tax-ES", name: "VAT", rate: 0.21, country_id: "ES" },
];

const readDevVar = (name) => {
  try {
    const content = readFileSync(
      new URL("../apps/backend/.dev.vars", import.meta.url),
      "utf8",
    );
    return content.match(new RegExp(`^${name}="?([^"\\n]+)"?`, "m"))?.[1];
  } catch {
    return undefined;
  }
};

const resolveTaxes = async () => {
  const key = readDevVar("STRIPE_API_KEY");
  if (!key || !key.startsWith("sk_")) {
    console.log(
      "  taxes: no Stripe key in apps/backend/.dev.vars → deterministic UUID " +
        "ids (checkout tax_rates won't resolve in Stripe).",
    );
    return {
      rows: taxesRaw.map((t) => ({
        id: fixedId(t.key),
        name: t.name,
        rate: t.rate,
        country_id: t.country_id,
      })),
      stripe: false,
    };
  }
  const stripe = new Stripe(key);
  const { data } = await stripe.taxRates.list({ active: true, limit: 100 });
  const rows = [];
  for (const t of taxesRaw) {
    const percentage = Math.round(t.rate * 10000) / 100; // 0.23 -> 23
    let rate = data.find(
      (r) =>
        r.active && r.country === t.country_id && r.percentage === percentage,
    );
    if (!rate) {
      rate = await stripe.taxRates.create({
        display_name: t.name,
        percentage,
        inclusive: false,
        country: t.country_id,
      });
      console.log(
        `  taxes: created Stripe TaxRate ${rate.id} for ${t.country_id} (${percentage}%)`,
      );
    } else {
      console.log(
        `  taxes: reusing Stripe TaxRate ${rate.id} for ${t.country_id} (${percentage}%)`,
      );
    }
    rows.push({
      id: rate.id,
      name: t.name,
      rate: t.rate,
      country_id: t.country_id,
    });
  }
  return { rows, stripe: true };
};

const { rows: taxes, stripe: taxesFromStripe } = await resolveTaxes();

const methodId = fixedId("method-batch");
const shippingMethods = [{ id: methodId, name: "Batch Logistics" }];
const shippingRates = [];
const ratesToCountries = [];
for (const [country, rates] of Object.entries(shippingRatesRaw)) {
  rates.forEach((r, i) => {
    const id = fixedId(`rate-${country}-${i}`);
    shippingRates.push({ id, price_in_cents: r.priceInCents, min_weight: r.minWeight, max_weight: r.maxWeight, delivery_time: r.deliveryTime, shipping_method_id: methodId });
    ratesToCountries.push({ shipping_rate_id: id, country_code: country });
  });
}

// ----------------------------------------------------------- SQL builders ---
const q = sqlValue;
const upsert = (table, rows, cols, pk) => {
  if (!rows.length) return "";
  const updates = cols.filter((c) => !pk.includes(c));
  const values = rows.map((r) => `  (${cols.map((c) => q(r[c])).join(", ")})`).join(",\n");
  const onConflict = updates.length
    ? `ON CONFLICT(${pk.join(", ")}) DO UPDATE SET ${updates.map((c) => `${c} = excluded.${c}`).join(", ")}`
    : `ON CONFLICT(${pk.join(", ")}) DO NOTHING`;
  return `INSERT INTO ${table} (${cols.join(", ")}) VALUES\n${values}\n${onConflict};`;
};

// dependency order (parents before children)
const statements = [
  upsert("currencies", currencies, ["code", "name", "symbol", "rate_to_euro", "stripe_name"], ["code"]),
  upsert("countries", countries, ["code", "name", "locale", "currency_code"], ["code"]),
  upsert("collections", collections, ["id", "name", "description"], ["id"]),
  upsert("products", products, ["id", "name", "description", "stock", "collection_id", "price_in_cents", "weight"], ["id"]),
  upsert("images", images, ["url", "alt", "product_id", "collection_id", "is_thumbnail"], ["url"]),
  // One-time cleanup: when switching to real Stripe ids, drop legacy non-`txr_`
  // seed rows for these countries so the PK change doesn't leave duplicates.
  // Leaves any real Stripe-id taxes (admin- or seed-created) untouched.
  ...(taxesFromStripe
    ? [
        `DELETE FROM taxes WHERE country_id IN (${taxesRaw
          .map((t) => q(t.country_id))
          .join(", ")}) AND id NOT LIKE 'txr%';`,
      ]
    : []),
  upsert("taxes", taxes, ["id", "name", "rate", "country_id"], ["id"]),
  upsert("shipping_methods", shippingMethods, ["id", "name"], ["id"]),
  upsert("shipping_rates", shippingRates, ["id", "price_in_cents", "min_weight", "max_weight", "delivery_time", "shipping_method_id"], ["id"]),
  upsert("shipping_rates_to_countries", ratesToCountries, ["shipping_rate_id", "country_code"], ["shipping_rate_id", "country_code"]),
];
const sql = `PRAGMA foreign_keys = ON;\n\n${statements.join("\n\n")}\n`;

// --------------------------------------------------------------- execute ----
const counts = { collections: collections.length, products: products.length, images: images.length, currencies: currencies.length, countries: countries.length, taxes: taxes.length, shipping_methods: shippingMethods.length, shipping_rates: shippingRates.length };
console.log(`Invern seed → env=${target.env} database=${target.database} ${target.remote ? "(REMOTE)" : "(local)"}`);
console.log(`  rows: ${Object.entries(counts).map(([k, v]) => `${k}=${v}`).join(", ")}`);

if (executeSql(sql, target)) console.log("\n✓ Seed complete.");
