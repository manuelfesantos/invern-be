/**
 * Cloudflare Workers Rate Limiting binding.
 * https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/
 */
export interface RateLimit {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

interface Env {
  // Bindings (wrangler config)
  AUTH_KV: KVNamespace;
  VALIDATION_KV: KVNamespace;
  STOCK_KV: KVNamespace;
  STOCK_BUCKET: R2Bucket;
  INVERN_DB: D1Database;
  EMAIL_RATE_LIMITER: RateLimit;
  LOGIN_RATE_LIMITER: RateLimit;

  // Runtime config / secrets (.dev.vars locally; wrangler secrets/vars in prod)
  ENV: string;
  LOGGER_LEVEL: string;
  DOMAIN: string;
  FRONTEND_HOST: string;
  BACKOFFICE_HOST: string;
  IMAGES_HOST: string;
  STOCK_HOST: string;

  // Crypto
  TOKEN_SECRET: string;
  REFRESH_TOKEN_SECRET: string;
  ENCRYPTION_KEY: string;
  DEFAULT_IV: string;
  SALT: string;

  // Stripe
  STRIPE_API_KEY: string;
  STRIPE_ENV: string;
  STRIPE_CHECKOUT_SECRET: string;
  STRIPE_PAYMENT_SECRET: string;

  // Brevo (email)
  BREVO_API_KEY: string;
  BREVO_DOMAIN: string;
  BREVO_NAME: string;

  // Google OAuth
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_REDIRECT_URI: string;

  // Cloudflare cache purge
  CACHE_API_KEY: string;
  CACHE_API_EMAIL: string;
  ZONE_ID: string;

  // Self-gated setup secret
  SETUP_STOCK_SECRET: string;
}

export default Env;
