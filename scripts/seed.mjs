#!/usr/bin/env node
/**
 * Idempotent database seed for invern-be.
 *
 *   node scripts/seed.mjs --env=local          # local D1 (default)
 *   node scripts/seed.mjs --env=preview --yes  # remote D1 (requires --yes)
 *   node scripts/seed.mjs --env=prod --yes
 *   node scripts/seed.mjs --dry-run            # print the SQL, don't run it
 *
 * Replaces the old /private/insert-test-data endpoint. Runs entirely as SQL via
 * `wrangler d1 execute`, so it needs no server, no secrets and no Stripe call.
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
import { execFileSync } from "node:child_process";
import { writeFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// ---------------------------------------------------------------- CLI args ---
const argv = process.argv.slice(2);
const getFlag = (name, def) => {
  const eq = argv.find((a) => a.startsWith(`--${name}=`));
  if (eq) return eq.split("=").slice(1).join("=");
  const idx = argv.indexOf(`--${name}`);
  if (idx !== -1) {
    const next = argv[idx + 1];
    return next && !next.startsWith("--") ? next : true;
  }
  return def;
};
const ENV = String(getFlag("env", "local"));
const DATABASE = String(getFlag("database", "invern-db"));
const CONFIRM = Boolean(getFlag("yes", false));
const DRY_RUN = Boolean(getFlag("dry-run", false));

const ENVS = { local: { remote: false }, preview: { remote: true }, prod: { remote: true } };
if (!ENVS[ENV]) {
  console.error(`✗ Unknown --env "${ENV}". Use one of: ${Object.keys(ENVS).join(", ")}`);
  process.exit(1);
}
const REMOTE = ENVS[ENV].remote;

// ------------------------------------------------------------ seed data -----
// Deterministic uuid-v4-shaped id from a stable key (so re-runs hit the same
// rows). The v4/variant nibbles keep it valid for the API's `z.uuidv4()` reads.
const fixedId = (key) => {
  const h = createHash("sha256").update(`invern-seed:${key}`).digest("hex");
  const variant = ((parseInt(h[16], 16) & 0x3) | 0x8).toString(16);
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-${variant}${h.slice(17, 20)}-${h.slice(20, 32)}`;
};

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
// Rates stored as a fraction (matches the app's percentageToRate); SQLite keeps
// the real value in the (INTEGER-affinity) `rate` column since it's not lossless.
const taxes = [
  { id: fixedId("tax-PT"), name: "VAT", rate: 0.23, country_id: "PT" },
  { id: fixedId("tax-ES"), name: "VAT", rate: 0.21, country_id: "ES" },
];

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
const q = (v) => {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return v ? "1" : "0";
  return `'${String(v).replace(/'/g, "''")}'`;
};
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
  upsert("taxes", taxes, ["id", "name", "rate", "country_id"], ["id"]),
  upsert("shipping_methods", shippingMethods, ["id", "name"], ["id"]),
  upsert("shipping_rates", shippingRates, ["id", "price_in_cents", "min_weight", "max_weight", "delivery_time", "shipping_method_id"], ["id"]),
  upsert("shipping_rates_to_countries", ratesToCountries, ["shipping_rate_id", "country_code"], ["shipping_rate_id", "country_code"]),
];
const sql = `PRAGMA foreign_keys = ON;\n\n${statements.join("\n\n")}\n`;

// --------------------------------------------------------------- execute ----
const counts = { collections: collections.length, products: products.length, images: images.length, currencies: currencies.length, countries: countries.length, taxes: taxes.length, shipping_methods: shippingMethods.length, shipping_rates: shippingRates.length };
console.log(`Invern seed → env=${ENV} database=${DATABASE} ${REMOTE ? "(REMOTE)" : "(local)"}`);
console.log(`  rows: ${Object.entries(counts).map(([k, v]) => `${k}=${v}`).join(", ")}`);

if (DRY_RUN) {
  console.log("\n--- dry run: SQL below, not executed ---\n");
  console.log(sql);
  process.exit(0);
}

if (REMOTE && !CONFIRM) {
  console.error(`\n✗ Refusing to write to a REMOTE (${ENV}) database without --yes.`);
  console.error(`  Re-run with: node scripts/seed.mjs --env=${ENV} --yes`);
  process.exit(1);
}

const file = join(tmpdir(), `invern-seed-${process.pid}-${Date.now()}.sql`);
writeFileSync(file, sql);
try {
  const args = ["wrangler", "d1", "execute", DATABASE, REMOTE ? "--remote" : "--local", "--file", file];
  console.log(`\n  running: npx ${args.join(" ")}\n`);
  execFileSync("npx", args, { stdio: "inherit" });
  console.log("\n✓ Seed complete.");
} catch (err) {
  console.error("\n✗ Seed failed.", err?.message ?? err);
  process.exitCode = 1;
} finally {
  try { unlinkSync(file); } catch { /* ignore */ }
}
