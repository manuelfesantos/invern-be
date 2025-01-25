import { AsyncLocalStorage } from "node:async_hooks";
import { Country } from "@country-entity";
import { DbTransaction } from "@db-entity";

class Context {
  private _cartId?: string;
  private _userId?: string;
  private _country?: Country;
  private _accessToken?: string;
  private _refreshToken: string = "";
  private _remember?: boolean;
  private _transaction?: DbTransaction;

  get cartId(): string | undefined {
    return this._cartId;
  }
  set cartId(cartId: string | undefined) {
    this._cartId = cartId;
  }

  get userId(): string | undefined {
    return this._userId;
  }
  set userId(value: string | undefined) {
    this._userId = value;
  }

  get country(): Country {
    return this._country as Country;
  }
  set country(value: Country) {
    this._country = value;
  }

  get refreshToken(): string {
    return this._refreshToken;
  }
  set refreshToken(value: string) {
    this._refreshToken = value;
  }

  get accessToken(): string | undefined {
    return this._accessToken;
  }
  set accessToken(value: string | undefined) {
    this._accessToken = value;
  }
  get remember(): boolean | undefined {
    return this._remember;
  }

  set remember(value: boolean | undefined) {
    this._remember = value;
  }

  get isLoggedIn(): boolean {
    return Boolean(this._userId);
  }

  get isLoggedOut(): boolean {
    return !this._userId;
  }

  get transaction(): DbTransaction | undefined {
    return this._transaction;
  }
  set transaction(value: DbTransaction | undefined) {
    this._transaction = value;
  }
}

class ContextStore {
  private store = new AsyncLocalStorage<Context>();
  public run<T>(fn: () => T): T {
    return this.store.run(new Context(), fn);
  }
  get context(): Context {
    const context = this.store.getStore();
    if (!context) {
      throw new Error("Context not initialized in store!");
    }
    return context;
  }
}

export const contextStore = new ContextStore();
