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
}
