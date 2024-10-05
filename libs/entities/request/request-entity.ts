export interface Env {
  INVERN_DB: D1Database;
  HONEYCOMB_API_KEY: string;
  HONEYCOMB_DATASET: string;
  STRIPE_API_KEY: string;
  SENDGRID_API_KEY: string;
  AUTH_KV: KVNamespace;
  TOKEN_SECRET: string;
  REFRESH_TOKEN_SECRET: string;
  FRONTEND_HOST: string;
  STOCK_BUCKET: R2Bucket;
  STOCK_HOST: string;
  CACHE_API_KEY: string;
  CACHE_API_EMAIL: string;
  ZONE_ID: string;
  ENV: string;
  SETUP_STOCK_SECRET: string;
}
