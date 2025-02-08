import { decode, encode } from "@encoding-utils";

const NUMBER_ZERO = 0;

let encryptionKey: CryptoKey | null = null;
let defaultIV: string = "L6zT8dEo4R1gVb";

export const initEncryptionKey = async (key: string): Promise<void> => {
  encryptionKey = await importKey(key);
};

export const setDefaultIv = (iv?: string): void => {
  if (iv) {
    defaultIV = iv;
  }
};

export const encrypt = async (data: string, iv?: string): Promise<string> => {
  if (!encryptionKey) {
    throw Error("EncryptionKey is not initiated!");
  }
  const dataBuffer = encode(data);

  const encryptedData = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: encode(iv ?? defaultIV) },
    encryptionKey,
    dataBuffer,
  );

  return arrayBufferToBase64(encryptedData);
};

export const decrypt = async (
  encryptedDataBase64: string,
  iv?: string,
): Promise<string> => {
  if (!encryptionKey) {
    throw Error("EncryptionKey is not initiated!");
  }
  const encryptedData = base64ToArrayBuffer(encryptedDataBase64);

  const decryptedData = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: encode(iv ?? defaultIV) },
    encryptionKey,
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
