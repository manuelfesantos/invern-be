import { decode, encode } from "@encoding-utils";
import { ENV } from "@env-utils";

const NUMBER_ZERO = 0;
const IV_BYTES = 12;
// Marks the per-message-IV format. The '.' is not a base64 character, so a
// legacy (bare-base64) ciphertext can never start with this prefix.
const NEW_FORMAT_PREFIX = "v1.";

let encryptionKey: CryptoKey | null = null;
let defaultIV: string | null = null;

const getDefaultIV = (): string => {
  if (!defaultIV) {
    const { DEFAULT_IV } = ENV;
    if (DEFAULT_IV) {
      defaultIV = DEFAULT_IV;
    } else {
      defaultIV = "L6zT8dEo4R1gVb";
    }
  }
  return defaultIV;
};

const getEncryptionKey = async (): Promise<CryptoKey> => {
  if (encryptionKey) {
    return encryptionKey;
  }
  encryptionKey = await importKey(ENV.ENCRYPTION_KEY);
  return encryptionKey;
};

export const encrypt = async (data: string): Promise<string> => {
  // Fresh random nonce per message — reusing a fixed IV under one key breaks
  // AES-GCM. The IV is not secret, only unique; it is prepended to the output.
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));

  const encryptedData = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    await getEncryptionKey(),
    encode(data),
  );

  const cipherBytes = new Uint8Array(encryptedData);
  const combined = new Uint8Array(iv.length + cipherBytes.length);
  combined.set(iv, NUMBER_ZERO);
  combined.set(cipherBytes, iv.length);

  return NEW_FORMAT_PREFIX + arrayBufferToBase64(combined.buffer);
};

export const decrypt = async (encryptedData: string): Promise<string> => {
  if (encryptedData.startsWith(NEW_FORMAT_PREFIX)) {
    const combined = new Uint8Array(
      base64ToArrayBuffer(encryptedData.slice(NEW_FORMAT_PREFIX.length)),
    );
    const iv = combined.slice(NUMBER_ZERO, IV_BYTES);
    const cipher = combined.slice(IV_BYTES);

    const decryptedData = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      await getEncryptionKey(),
      cipher,
    );
    return decode(decryptedData);
  }

  // Legacy format: bare base64, encrypted with the fixed DEFAULT_IV. Kept so
  // data written before this change (stored addresses, live sessions) decrypts.
  const decryptedData = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: encode(getDefaultIV()) },
    await getEncryptionKey(),
    base64ToArrayBuffer(encryptedData),
  );
  return decode(decryptedData);
};

const importKey = async (encryptionKey: string): Promise<CryptoKey> => {
  const keyBuffer = Uint8Array.from(encryptionKey, (c) =>
    c.charCodeAt(NUMBER_ZERO),
  );
  return await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"],
  );
};

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  // base64url (no '+', '/', or '=' padding): these live in cookie values and
  // URLs, where '+' silently becomes a space on the round-trip and breaks atob.
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  // Accept base64url (new) and legacy standard base64 (stored data): normalize
  // to standard base64 and re-pad before decoding.
  const urlDecoded = base64.replace(/-/g, "+").replace(/_/g, "/");
  const padded = urlDecoded.padEnd(
    urlDecoded.length + ((4 - (urlDecoded.length % 4)) % 4),
    "=",
  );
  const binaryString = atob(padded);
  const length = binaryString.length;
  const arrayBuffer = new ArrayBuffer(length);
  const view = new Uint8Array(arrayBuffer);
  for (let i = 0; i < length; i++) {
    view[i] = binaryString.charCodeAt(i);
  }
  return arrayBuffer;
};

export * from "./object";
