import { Env } from "@request-entity";

class EnvironmentService {
  private static instance: EnvironmentService;
  private _env?: Env;

  private constructor() {}

  static getInstance(): EnvironmentService {
    if (!EnvironmentService.instance) {
      EnvironmentService.instance = new EnvironmentService();
    }
    return EnvironmentService.instance;
  }

  private var<T extends keyof Env>(name: T): Env[T] {
    const value = this._env?.[name];
    if (!value) {
      throw new Error(`${name} is not set`);
    }
    return value;
  }

  initialize(env: Env): void {
    this._env = env;
  }

  get HONEYCOMB_API_KEY(): string {
    return this.var("HONEYCOMB_API_KEY");
  }

  get HONEYCOMB_DATASET(): string {
    return this.var("HONEYCOMB_DATASET");
  }

  get STRIPE_API_KEY(): string {
    return this.var("STRIPE_API_KEY");
  }

  get SENDGRID_API_KEY(): string {
    return this.var("SENDGRID_API_KEY");
  }

  get TOKEN_SECRET(): string {
    return this.var("TOKEN_SECRET");
  }

  get REFRESH_TOKEN_SECRET(): string {
    return this.var("REFRESH_TOKEN_SECRET");
  }

  get STOCK_HOST(): string {
    return this.var("STOCK_HOST");
  }

  get COUNTRIES_HOST(): string {
    return this.var("COUNTRIES_HOST");
  }

  get CACHE_API_KEY(): string {
    return this.var("CACHE_API_KEY");
  }

  get CACHE_API_EMAIL(): string {
    return this.var("CACHE_API_EMAIL");
  }

  get FRONTEND_HOST(): string {
    return this.var("FRONTEND_HOST");
  }

  get ZONE_ID(): string {
    return this.var("ZONE_ID");
  }

  get ENV(): string {
    return this.var("ENV");
  }

  get SETUP_STOCK_SECRET(): string {
    return this.var("SETUP_STOCK_SECRET");
  }

  get SETUP_COUNTRIES_SECRET(): string {
    return this.var("SETUP_COUNTRIES_SECRET");
  }

  get STRIPE_ENV(): string {
    return this.var("STRIPE_ENV");
  }

  get INSERT_TEST_DATA_SECRET(): string {
    return this.var("INSERT_TEST_DATA_SECRET");
  }

  get LOGGER_LEVEL(): string {
    return this.var("LOGGER_LEVEL");
  }

  get DOMAIN(): string {
    return this.var("DOMAIN");
  }

  get ENCRYPTION_KEY(): string {
    return this.var("ENCRYPTION_KEY");
  }

  get DEFAULT_IV(): string {
    return this.var("DEFAULT_IV");
  }

  get SALT(): string {
    return this.var("SALT");
  }

  get GOOGLE_CLIENT_ID(): string {
    return this.var("GOOGLE_CLIENT_ID");
  }

  get GOOGLE_CLIENT_SECRET(): string {
    return this.var("GOOGLE_CLIENT_SECRET");
  }

  get GOOGLE_REDIRECT_URI(): string {
    return this.var("GOOGLE_REDIRECT_URI");
  }

  get INVERN_DB(): D1Database {
    return this.var("INVERN_DB");
  }

  get STOCK_BUCKET(): R2Bucket {
    return this.var("STOCK_BUCKET");
  }

  get COUNTRIES_BUCKET(): R2Bucket {
    return this.var("COUNTRIES_BUCKET");
  }

  get AUTH_KV(): KVNamespace {
    return this.var("AUTH_KV");
  }
}

export const ENV = EnvironmentService.getInstance();
