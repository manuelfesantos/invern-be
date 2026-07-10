/**
 * Feature 02 / step-03: per-message random IV for AES-GCM, with a
 * backward-compatible legacy (fixed-IV) decrypt path.
 */
import { encrypt, decrypt } from "@crypto-utils";
import { withTestContext, makeTestEnv } from "../harness";

// Reproduce the OLD fixed-IV encryption (bare base64, no version prefix) so we
// can prove the legacy decrypt path still works.
const legacyEncrypt = async (data: string): Promise<string> => {
  const { env } = makeTestEnv();
  const key = await crypto.subtle.importKey(
    "raw",
    Uint8Array.from(env.ENCRYPTION_KEY, (c) => c.charCodeAt(0)),
    { name: "AES-GCM" },
    false,
    ["encrypt"],
  );
  const ct = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: new TextEncoder().encode(env.DEFAULT_IV) },
    key,
    new TextEncoder().encode(data),
  );
  let binary = "";
  for (const byte of new Uint8Array(ct)) binary += String.fromCharCode(byte);
  return btoa(binary);
};

describe("AES-GCM per-message IV + legacy compatibility", () => {
  it("round-trips through encrypt/decrypt (new format)", async () => {
    const out = await withTestContext(async () => {
      const enc = await encrypt("hello address");
      return { enc, dec: await decrypt(enc) };
    });
    expect(out.enc.startsWith("v1.")).toBe(true);
    expect(out.dec).toBe("hello address");
  });

  it("produces different ciphertext for identical plaintext (random IV)", async () => {
    const { a, b } = await withTestContext(async () => ({
      a: await encrypt("same-value"),
      b: await encrypt("same-value"),
    }));
    expect(a).not.toBe(b);
    // both still decrypt to the original
    const [da, db] = await withTestContext(async () => [
      await decrypt(a),
      await decrypt(b),
    ]);
    expect(da).toBe("same-value");
    expect(db).toBe("same-value");
  });

  it("emits cookie/URL-safe base64url (no '+', '/', or '=' padding)", async () => {
    // Regression: standard base64 in a cookie value has its '+' turned into a
    // space on the round-trip, breaking atob() on decrypt — so the refresh
    // token in `s_r` failed to decode and reloads logged the user out.
    const enc = await withTestContext(() =>
      // long payload to make '+'/'/' bytes overwhelmingly likely
      encrypt("x".repeat(256)),
    );
    expect(enc).not.toMatch(/[+/=]/);
  });

  it("decrypts LEGACY fixed-IV ciphertext (no version prefix)", async () => {
    const legacy = await legacyEncrypt("legacy-secret");
    expect(legacy.startsWith("v1.")).toBe(false); // old bare-base64 format
    const dec = await withTestContext(() => decrypt(legacy));
    expect(dec).toBe("legacy-secret");
  });

  it("round-trips a JSON object (encryptObject/decryptObjectString path)", async () => {
    const { dec } = await withTestContext(async () => {
      const { encryptObject, decryptObjectString } = await import(
        "@crypto-utils"
      );
      const enc = await encryptObject({ city: "Porto", zip: "4000" });
      return { dec: await decryptObjectString<{ city: string; zip: string }>(enc) };
    });
    expect(dec).toEqual({ city: "Porto", zip: "4000" });
  });
});
