const textEncoder = new TextEncoder();

export function encode(text: string): Uint8Array<ArrayBufferLike> {
  return textEncoder.encode(text);
}
