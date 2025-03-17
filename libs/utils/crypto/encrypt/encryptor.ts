import { decode, encode } from "@encoding-utils";
import { ENV } from "@env-utils";

const NUMBER_ZERO = 0;

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

export const encrypt = async (data: string, iv?: string): Promise<string> => {
  const dataBuffer = encode(data);

  const encryptedData = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: encode(iv ?? getDefaultIV()) },
    await getEncryptionKey(),
    dataBuffer,
  );

  return arrayBufferToBase64(encryptedData);
};

export const decrypt = async (
  encryptedDataBase64: string,
  iv?: string,
): Promise<string> => {
  const encryptedData = base64ToArrayBuffer(encryptedDataBase64);

  const decryptedData = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: encode(iv ?? getDefaultIV()) },
    await getEncryptionKey(),
    encryptedData,
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
  return btoa(binary);
};

const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binaryString = atob(base64);
  const length = binaryString.length;
  const arrayBuffer = new ArrayBuffer(length);
  const view = new Uint8Array(arrayBuffer);
  for (let i = 0; i < length; i++) {
    view[i] = binaryString.charCodeAt(i);
  }
  return arrayBuffer;
};

export * from "./object";
