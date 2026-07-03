/**
 * Shared unit-test harness.
 *
 * The runtime relies on three process-global stores that are normally set up by
 * the request middleware:
 *   - `ENV` (a proxy that throws on any unset/unknown key) — set via `setEnv`;
 *   - the logger AsyncLocalStorage — entered via `withLogger` (`logger()` throws
 *     when it isn't);
 *   - the request `contextStore` AsyncLocalStorage — entered via `contextStore.run`.
 *
 * `withTestContext` initialises all three so an arbitrary use-case can run in a
 * test. See `test/README.md` for the DB-action mocking pattern.
 */
import type Env from "@env-entity";
import { setEnv } from "@env-utils";
import { contextStore } from "@context-utils";
import { withLogger } from "@logger-utils";
import { FakeKV, makeFakeKV, asKVNamespace } from "./fakes/kv";
import { FakeR2, makeFakeR2, asR2Bucket } from "./fakes/r2";
import { makeFakeLogger } from "./fakes/logger";

/** Fields of the request context a test may want to pre-populate. */
export interface TestContextFields {
  cartId?: string;
  userId?: string;
  accessToken?: string;
  refreshToken?: string;
  remember?: boolean;
  address?: string;
  userDetails?: string;
  shippingMethodId?: string;
  customerEmail?: string;
  // `country` is intentionally omitted here — set it inside the test body if needed.
}

export interface TestEnvBindings {
  authKv: FakeKV;
  validationKv: FakeKV;
  stockKv: FakeKV;
  stockBucket: FakeR2;
  countriesBucket: FakeR2;
}

export interface TestHarnessOptions {
  env?: Partial<Env>;
  context?: TestContextFields;
  /** Reuse existing fake bindings (e.g. to share KV/R2 state across calls). */
  bindings?: Partial<TestEnvBindings>;
}

/** A D1 binding that throws if a test accidentally hits the database. */
const throwingD1 = new Proxy(
  {},
  {
    get() {
      throw new Error(
        "INVERN_DB was accessed in a unit test. Mock the relevant @*-db action instead of hitting D1.",
      );
    },
  },
) as unknown as D1Database;

export const makeTestBindings = (
  overrides: Partial<TestEnvBindings> = {},
): TestEnvBindings => ({
  authKv: overrides.authKv ?? makeFakeKV(),
  validationKv: overrides.validationKv ?? makeFakeKV(),
  stockKv: overrides.stockKv ?? makeFakeKV(),
  stockBucket: overrides.stockBucket ?? makeFakeR2(),
  countriesBucket: overrides.countriesBucket ?? makeFakeR2(),
});

/** Build a complete fake `Env`. Every key is present so the ENV proxy never throws. */
export const makeTestEnv = (
  overrides: Partial<Env> = {},
  bindings: TestEnvBindings = makeTestBindings(),
): { env: Env; bindings: TestEnvBindings } => {
  const env: Env = {
    AUTH_KV: asKVNamespace(bindings.authKv),
    VALIDATION_KV: asKVNamespace(bindings.validationKv),
    STOCK_KV: asKVNamespace(bindings.stockKv),
    STOCK_BUCKET: asR2Bucket(bindings.stockBucket),
    COUNTRIES_BUCKET: asR2Bucket(bindings.countriesBucket),
    INVERN_DB: throwingD1,

    ENV: "test",
    STRIPE_ENV: "test",
    LOGGER_LEVEL: "100", // above all levels → logging is silent in tests by default

    // Crypto material — ENCRYPTION_KEY must be a valid AES-GCM key length
    // (exactly 16/24/32 chars → bytes); 32 here.
    TOKEN_SECRET: "test-token-secret-000000000000000",
    REFRESH_TOKEN_SECRET: "test-refresh-secret-00000000000000",
    ENCRYPTION_KEY: "0123456789abcdef0123456789abcdef",
    DEFAULT_IV: "test-iv-01234567",
    SALT: "test-salt-012345",

    // Local-convention secrets.
    SETUP_STOCK_SECRET: "test-setup-stock",
    SETUP_COUNTRIES_SECRET: "test-setup-countries",
    INSERT_TEST_DATA_SECRET: "test-insert-data",

    // Hosts / misc config.
    DOMAIN: "localhost",
    FRONTEND_HOST: "http://localhost:8081",
    STOCK_HOST: "http://localhost/stock",
    IMAGES_HOST: "http://localhost/images",
    COUNTRIES_HOST: "http://localhost/countries",

    // Third-party (unused in unit tests; present so the proxy resolves).
    STRIPE_API_KEY: "sk_test_fake",
    STRIPE_CHECKOUT_SECRET: "whsec_fake_checkout",
    STRIPE_PAYMENT_SECRET: "whsec_fake_payment",
    BREVO_API_KEY: "brevo-fake",
    BREVO_DOMAIN: "localhost",
    BREVO_NAME: "Invern Test",
    GOOGLE_CLIENT_ID: "google-fake",
    GOOGLE_CLIENT_SECRET: "google-secret-fake",
    GOOGLE_REDIRECT_URI: "http://localhost/oauth",
    HONEYCOMB_API_KEY: "",
    HONEYCOMB_DATASET: "invern-test",
    CACHE_API_KEY: "cache-fake",
    CACHE_API_EMAIL: "test@example.com",
    ZONE_ID: "zone-fake",
    TURSO_AUTH_TOKEN: "",
    TURSO_CONNECTION_URL: "",

    ...overrides,
  };
  return { env, bindings };
};

const applyContextFields = (fields: TestContextFields): void => {
  const ctx = contextStore.context;
  if (fields.cartId !== undefined) ctx.cartId = fields.cartId;
  if (fields.userId !== undefined) ctx.userId = fields.userId;
  if (fields.accessToken !== undefined) ctx.accessToken = fields.accessToken;
  if (fields.refreshToken !== undefined) ctx.refreshToken = fields.refreshToken;
  if (fields.remember !== undefined) ctx.remember = fields.remember;
  if (fields.address !== undefined) ctx.address = fields.address;
  if (fields.userDetails !== undefined) ctx.userDetails = fields.userDetails;
  if (fields.shippingMethodId !== undefined)
    ctx.shippingMethodId = fields.shippingMethodId;
  if (fields.customerEmail !== undefined)
    ctx.customerEmail = fields.customerEmail;
};

/**
 * Run `fn` with ENV, logger and request-context stores initialised.
 * Returns whatever `fn` returns (awaited). The fake bindings are also returned
 * on the resolved shape so tests can inspect KV/R2 state afterwards.
 */
export async function withTestContext<T>(
  fn: () => T | Promise<T>,
  options: TestHarnessOptions = {},
): Promise<T> {
  const { env } = makeTestEnv(options.env, makeTestBindings(options.bindings));
  setEnv(env);
  const logger = makeFakeLogger();
  return contextStore.run(() =>
    withLogger(logger, () => {
      if (options.context) applyContextFields(options.context);
      return fn();
    }),
  );
}
