export interface Env {
  INVERN_DB: D1Database;
  HONEYCOMB_API_KEY: string;
  HONEYCOMB_DATASET: string;
  STRIPE_API_KEY: string;
  STRIPE_ENV: string;
  SENDGRID_API_KEY: string;
  AUTH_KV: KVNamespace;
  TOKEN_SECRET: string;
  REFRESH_TOKEN_SECRET: string;
  FRONTEND_HOST: string;
  STOCK_BUCKET: R2Bucket;
  COUNTRIES_BUCKET: R2Bucket;
  STOCK_HOST: string;
  COUNTRIES_HOST: string;
  CACHE_API_KEY: string;
  CACHE_API_EMAIL: string;
  ZONE_ID: string;
  ENV: string;
  SETUP_STOCK_SECRET: string;
  INSERT_TEST_DATA_SECRET: string;
  SETUP_COUNTRIES_SECRET: string;
  LOGGER_LEVEL: string;
  DOMAIN: string;
}

export type Credentials = {
  userId?: string;
  cartId?: string;
  accessToken?: string;
  refreshToken: string;
  remember?: boolean;
};
