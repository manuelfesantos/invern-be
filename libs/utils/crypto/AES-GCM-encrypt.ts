import { decode, encode } from "@encoding-utils";

const NUMBER_ZERO = 0;

let encryptionKey: CryptoKey | null = null;

export const initEncryptionKey = async (key: string): Promise<void> => {
  encryptionKey = await importKey(key);
};

async function importKey(encryptionKey: string): Promise<CryptoKey> {
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
}

export async function encrypt(data: string, iv: string): Promise<string> {
  if (!encryptionKey) {
    throw Error("EncryptionKey is not initiated!");
  }
  const dataBuffer = encode(data);

  const encryptedData = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: encode(iv) },
    encryptionKey,
    dataBuffer,
  );

  const encryptedString = arrayBufferToBase64(encryptedData);

  return encryptedString;
}

export async function decrypt(
  encryptedDataBase64: string,
  iv: string,
): Promise<string> {
  if (!encryptionKey) {
    throw Error("EncryptionKey is not initiated!");
  }
  const encryptedData = base64ToArrayBuffer(encryptedDataBase64);

  const decryptedData = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: encode(iv) },
    encryptionKey,
    encryptedData,
  );

  const decryptedString = decode(decryptedData);

  return decryptedString;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const length = binaryString.length;
  const arrayBuffer = new ArrayBuffer(length);
  const view = new Uint8Array(arrayBuffer);
  for (let i = 0; i < length; i++) {
    view[i] = binaryString.charCodeAt(i);
  }
  return arrayBuffer;
}
