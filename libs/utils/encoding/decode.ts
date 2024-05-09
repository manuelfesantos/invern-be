const textDecoder = new TextDecoder("utf-8");

export function decode(bytes: ArrayBuffer): string {
  return textDecoder.decode(bytes);
}
