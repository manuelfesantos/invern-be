import { ENV } from "@env-utils";
import { getRandomUUID } from "@crypto-utils";

/** Allowed image content types → their file extension. */
const CONTENT_TYPE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export const ALLOWED_IMAGE_CONTENT_TYPES = Object.keys(CONTENT_TYPE_EXTENSIONS);

/**
 * The R2 object key for a hosted image URL. Keys are a single `<uuid>.<ext>`
 * segment, so we take the last path segment — robust whether IMAGES_HOST is a
 * bare domain (`https://images.invernspirit.com/<key>`) or has a path prefix
 * (local dev: `http://localhost:8790/public/images/<key>`).
 */
const keyFromUrl = (url: string): string | undefined => {
  try {
    return new URL(url).pathname.split("/").pop() || undefined;
  } catch {
    return undefined;
  }
};

/** The hosted image URL (the DB primary key) for an R2 object key. */
export const urlFromKey = (key: string): string => `${ENV.IMAGES_HOST}/${key}`;

/**
 * Stores an image object in the images bucket under a collision-proof key
 * (`<uuid>.<ext>` — never the client filename) and returns its hosted URL.
 */
const upload = async (
  data: ArrayBuffer,
  contentType: string,
): Promise<string> => {
  const extension = CONTENT_TYPE_EXTENSIONS[contentType] ?? "bin";
  const key = `${getRandomUUID()}.${extension}`;
  await ENV.IMAGES_BUCKET.put(key, data, {
    httpMetadata: { contentType },
  });
  return `${ENV.IMAGES_HOST}/${key}`;
};

/** Deletes the R2 object backing a hosted image URL (no-op for an unparseable URL). */
const remove = async (url: string): Promise<void> => {
  const key = keyFromUrl(url);
  if (key) {
    await ENV.IMAGES_BUCKET.delete(key);
  }
};

/** Fetches a stored image object by its R2 key (null if it doesn't exist). */
const get = (key: string): Promise<R2ObjectBody | null> =>
  ENV.IMAGES_BUCKET.get(key);

export const imageClient = { upload, delete: remove, get };
