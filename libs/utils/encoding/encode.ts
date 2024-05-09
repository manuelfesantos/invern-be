const textEncoder = new TextEncoder();

export function encode(text: string): ArrayBuffer {
  return textEncoder.encode(text);
}
