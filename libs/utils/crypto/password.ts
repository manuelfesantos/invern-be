import { encode } from "@encoding-utils";
import { ENV } from "@env-utils";
import { hashString } from "./hash";

/**
 * Password hashing with PBKDF2-HMAC-SHA-256 (native to the Workers Web Crypto
 * surface). Hashes are stored self-describing so params can be raised later
 * without another migration, and so legacy hashes can be detected and upgraded:
 *
 *   pbkdf2$sha256$<iterations>$<base64 salt>$<base64 hash>
 *
 * Legacy format (pre-migration) is a bare 64-char lowercase hex SHA-256 digest
 * of `password + SALT + userId` — verified transparently and upgraded on login.
 */

const PREFIX = "pbkdf2";
const HASH_NAME = "sha256";
// OWASP 2023 minimum for PBKDF2-HMAC-SHA256. Tunable via the stored params.
const PBKDF2_ITERATIONS = 600_000;
const DERIVED_BITS = 256;
const SALT_BYTES = 16;
const HASH_PARTS = 5;
const LEGACY_HEX = /^[0-9a-f]{64}$/;

const toBase64 = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes));

const fromBase64 = (value: string): Uint8Array =>
  Uint8Array.from(atob(value), (char) => char.charCodeAt(0));

const deriveBits = async (
  password: string,
  salt: Uint8Array,
  iterations: number,
): Promise<Uint8Array> => {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const derived = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    keyMaterial,
    DERIVED_BITS,
  );
  return new Uint8Array(derived);
};

const constantTimeEqual = (a: Uint8Array, b: Uint8Array): boolean => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
};

const isLegacyHash = (stored: string): boolean => LEGACY_HEX.test(stored);

/** Reproduce the legacy hash: SHA-256(password + SALT + userId), as hex. */
const legacyHash = (password: string, userId: string): Promise<string> =>
  hashString(`${password}${ENV.SALT}${userId}`);

export const hashPassword = async (password: string): Promise<string> => {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const hash = await deriveBits(password, salt, PBKDF2_ITERATIONS);
  return [
    PREFIX,
    HASH_NAME,
    PBKDF2_ITERATIONS,
    toBase64(salt),
    toBase64(hash),
  ].join("$");
};

export interface VerifyResult {
  valid: boolean;
  /** True when the stored hash is legacy or uses weaker-than-current params. */
  needsRehash: boolean;
}

export const verifyPassword = async (
  password: string,
  stored: string,
  userId: string,
): Promise<VerifyResult> => {
  if (isLegacyHash(stored)) {
    const expected = await legacyHash(password, userId);
    const valid = constantTimeEqual(encode(expected), encode(stored));
    return { valid, needsRehash: valid };
  }

  const parts = stored.split("$");
  if (parts.length !== HASH_PARTS || parts[0] !== PREFIX) {
    return { valid: false, needsRehash: false };
  }
  const iterations = Number(parts[2]);
  const salt = fromBase64(parts[3]);
  const expected = fromBase64(parts[4]);
  const actual = await deriveBits(password, salt, iterations);
  const valid = constantTimeEqual(actual, expected);
  return { valid, needsRehash: valid && iterations < PBKDF2_ITERATIONS };
};
