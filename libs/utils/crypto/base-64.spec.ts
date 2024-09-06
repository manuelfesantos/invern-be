import { base64Decode, base64Encode } from "./base-64";

const FIVE_CHARACTERS = 5;

describe("base64", () => {
  describe("encode", () => {
    it("should encode", () => {
      const encoded = base64Encode("hello world");
      expect(encoded.substring(FIVE_CHARACTERS)).toBe("aGVsbG8gd29ybGQ=");
    });
  });
  describe("decode", () => {
    it("should decode", () => {
      const decoded = base64Decode("gF03HaGVsbG8gd29ybGQ=");
      expect(decoded).toBe("hello world");
    });
  });
});
