import { db } from "@db";
import { imagesTable } from "@schema";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

const FIRST_COLLECTION_IMAGE_INDEX = 0;
const SECOND_COLLECTION_IMAGE_INDEX = 16;
const THIRD_COLLECTION_IMAGE_INDEX = 32;
const INDEX_TO_PRODUCT_NUMBER = 1;
export const insertImages = async (
  products: { productId: string; name: string }[],
  collections: { collectionId: string; name: string }[],
): Promise<void> => {
  const insertImageSchema = createInsertSchema(imagesTable);
  type InsertImage = z.infer<typeof insertImageSchema>;
  const imagesList: InsertImage[] = products
    .map((product, index) => [
      {
        productId: product.productId,
        url: `${imagesBaseUrl}/ceramics-product-${indexToProductNumber(index)}-1.jpeg`,
        alt: product.name,
        collectionId: undefined,
      },
      {
        productId: product.productId,
        url: `${imagesBaseUrl}/ceramics-product-${indexToProductNumber(index)}-2.jpeg`,
        alt: product.name,
        collectionId: undefined,
      },
      {
        productId: product.productId,
        url: `${imagesBaseUrl}/ceramics-product-${indexToProductNumber(index)}-3.jpeg`,
        alt: product.name,
        collectionId: undefined,
      },
      {
        productId: product.productId,
        url: `${imagesBaseUrl}/ceramics-product-${indexToProductNumber(index)}-4.jpeg`,
        alt: product.name,
        collectionId: undefined,
      },
    ])
    .flat();

  imagesList[FIRST_COLLECTION_IMAGE_INDEX].collectionId = getCollectionId(
    collections,
    "Erosion",
  );
  imagesList[SECOND_COLLECTION_IMAGE_INDEX].collectionId = getCollectionId(
    collections,
    "Midden",
  );
  imagesList[THIRD_COLLECTION_IMAGE_INDEX].collectionId = getCollectionId(
    collections,
    "Contour",
  );
  for (const image of imagesList) {
    await db().insert(imagesTable).values(image);
  }
};

const indexToProductNumber = (index: number): number =>
  index + INDEX_TO_PRODUCT_NUMBER;

const imagesBaseUrl = "https://images.invernspirit.com/products";

const getCollectionId = (
  collections: { collectionId: string; name: string }[],
  collectionName: string,
): string | undefined =>
  collections.find((collection) => collection.name === collectionName)
    ?.collectionId;
