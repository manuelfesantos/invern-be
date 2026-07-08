import { insertProductSchema } from "@product-entity";

// Mirrors the schema used by `updateProduct` — stock is stripped so a plain
// product edit can never change stock out-of-band (which would desync KV/R2).
const updateProductSchema = insertProductSchema.omit({ stock: true });

describe("product update excludes stock", () => {
  const base = {
    name: "Thing",
    description: "A thing",
    priceInCents: 1500,
    collectionId: "00000000-0000-4000-8000-000000000000",
    weight: 400,
  };

  it("drops a `stock` field from the parsed update payload", () => {
    const parsed = updateProductSchema.parse({ ...base, stock: 999 });
    expect(parsed).not.toHaveProperty("stock");
  });

  it("still accepts a valid update without stock", () => {
    expect(() => updateProductSchema.parse(base)).not.toThrow();
  });
});
