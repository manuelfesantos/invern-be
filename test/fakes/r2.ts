/**
 * In-memory fake of Cloudflare's R2Bucket for unit tests.
 *
 * The etag/conditional-put semantics are deliberately faithful because the
 * distributed-lock code (feature 03) depends on them:
 *   - every successful `put` assigns a new, unique etag;
 *   - `put(..., { onlyIf: { etagMatches } })` writes only when the current
 *     object's etag matches, returning `null` otherwise (precondition failed);
 *   - `get`/`head` expose that etag, and `get` returns a body with both
 *     `text()` and `json()`.
 *
 * Only the members the codebase uses are implemented; cast via `asR2Bucket`
 * where an `Env` binding is required.
 */

interface StoredObject {
  body: string;
  etag: string;
}

const bodyToString = (
  value: string | ArrayBuffer | ArrayBufferView | ReadableStream | null,
): string => {
  if (value === null) return "";
  if (typeof value === "string") return value;
  if (value instanceof ArrayBuffer) return new TextDecoder().decode(value);
  if (ArrayBuffer.isView(value)) {
    return new TextDecoder().decode(
      value.buffer as ArrayBuffer,
    );
  }
  return String(value);
};

export class FakeR2 {
  public readonly store = new Map<string, StoredObject>();
  private seq = 0;

  private nextEtag(): string {
    this.seq += 1;
    return `etag-${this.seq}`;
  }

  private toObject(key: string, obj: StoredObject): R2Object {
    return {
      key,
      etag: obj.etag,
      httpEtag: `"${obj.etag}"`,
      size: obj.body.length,
      uploaded: new Date(0),
    } as unknown as R2Object;
  }

  private toBody(key: string, obj: StoredObject): R2ObjectBody {
    return {
      key,
      etag: obj.etag,
      httpEtag: `"${obj.etag}"`,
      size: obj.body.length,
      uploaded: new Date(0),
      text: async () => obj.body,
      json: async () => JSON.parse(obj.body),
      arrayBuffer: async () =>
        new TextEncoder().encode(obj.body).buffer as ArrayBuffer,
    } as unknown as R2ObjectBody;
  }

  async head(key: string): Promise<R2Object | null> {
    const obj = this.store.get(key);
    return obj ? this.toObject(key, obj) : null;
  }

  async get(key: string): Promise<R2ObjectBody | null> {
    const obj = this.store.get(key);
    return obj ? this.toBody(key, obj) : null;
  }

  async put(
    key: string,
    value: string | ArrayBuffer | ArrayBufferView | ReadableStream | null,
    options?: R2PutOptions,
  ): Promise<R2Object | null> {
    const onlyIf = options?.onlyIf;
    if (onlyIf && typeof onlyIf === "object" && "etagMatches" in onlyIf) {
      const wanted = (onlyIf as { etagMatches?: string }).etagMatches;
      const existing = this.store.get(key);
      if (!existing || existing.etag !== wanted) {
        return null; // precondition failed — matches R2 behaviour
      }
    }
    const stored: StoredObject = { body: bodyToString(value), etag: this.nextEtag() };
    this.store.set(key, stored);
    return this.toObject(key, stored);
  }

  async delete(keys: string | string[]): Promise<void> {
    if (Array.isArray(keys)) {
      keys.forEach((k) => this.store.delete(k));
    } else {
      this.store.delete(keys);
    }
  }

  async list(): Promise<{ objects: { key: string }[]; truncated: boolean }> {
    return {
      objects: [...this.store.keys()].map((key) => ({ key })),
      truncated: false,
    };
  }
}

export const makeFakeR2 = (): FakeR2 => new FakeR2();

export const asR2Bucket = (r2: FakeR2): R2Bucket => r2 as unknown as R2Bucket;
