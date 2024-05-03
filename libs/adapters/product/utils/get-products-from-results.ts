import { Product, productSchema } from "@product-entity";
import { imageSchema } from "@image-entity";

export const getProductsFromResults = (
  results: Record<string, unknown>[],
): Product[] =>
  results.map(({ productId, productName, price, stock, imageUrl, imageAlt }) =>
    productSchema.parse({
      productId,
      productName,
      price,
      stock,
      productImage:
        imageUrl && imageAlt ? imageSchema.parse({ imageUrl, imageAlt }) : null,
    }),
  );
