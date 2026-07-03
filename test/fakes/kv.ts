/**
 * In-memory fake of Cloudflare's KVNamespace for unit tests.
 *
 * Implements the subset the codebase actually uses (get/put/delete/list) and
 * records `expirationTtl` so tests can assert on TTLs. Cast to `KVNamespace`
 * via `asKVNamespace` where an `Env` binding is required.
 */

export interface FakeKVEntry {
  value: string;
  expirationTtl?: number;
  expiration?: number;
  metadata?: unknown;
}

export class FakeKV {
  public readonly store = new Map<string, FakeKVEntry>();

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    return entry ? entry.value : null;
  }

  async getWithMetadata(
    key: string,
  ): Promise<{ value: string | null; metadata: unknown }> {
    const entry = this.store.get(key);
    return { value: entry ? entry.value : null, metadata: entry?.metadata ?? null };
  }

  async put(
    key: string,
    value: string | ArrayBuffer | ArrayBufferView | ReadableStream,
    options?: { expirationTtl?: number; expiration?: number; metadata?: unknown },
  ): Promise<void> {
    this.store.set(key, {
      value: typeof value === "string" ? value : String(value),
      expirationTtl: options?.expirationTtl,
      expiration: options?.expiration,
      metadata: options?.metadata,
    });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async list(): Promise<{
    keys: { name: string }[];
    list_complete: boolean;
    cacheStatus: string | null;
  }> {
    return {
      keys: [...this.store.keys()].map((name) => ({ name })),
      list_complete: true,
      cacheStatus: null,
    };
  }
}

export const makeFakeKV = (): FakeKV => new FakeKV();

export const asKVNamespace = (kv: FakeKV): KVNamespace =>
  kv as unknown as KVNamespace;
