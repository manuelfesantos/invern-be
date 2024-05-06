const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder("utf-8");

export function encode(text: string): ArrayBuffer {
  return textEncoder.encode(text);
}

export function decode(bytes: ArrayBuffer): string {
  return textDecoder.decode(bytes);
}
