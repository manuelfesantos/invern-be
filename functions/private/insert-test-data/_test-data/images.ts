// eslint-disable-next-line import/no-restricted-paths
import { db } from "@db";
import { imagesTable } from "@schema";
import type { InsertImage } from "@image-entity";

const FIRST_COLLECTION_IMAGE_INDEX = 0;
const SECOND_COLLECTION_IMAGE_INDEX = 16;
const THIRD_COLLECTION_IMAGE_INDEX = 32;
const INDEX_TO_PRODUCT_NUMBER = 1;
export const insertImages = async (
  products: { productId: string; name: string }[],
  collections: { collectionId: string; name: string }[],
): Promise<void> => {
  const imagesList: InsertImage[] = products
    .map((product, index) => [
      {
        productId: product.productId,
        url: `${imagesBaseUrl}/ceramics-product-${indexToProductNumber(index)}-1.avif`,
        alt: product.name,
        collectionId: undefined,
      },
      {
        productId: product.productId,
        url: `${imagesBaseUrl}/ceramics-product-${indexToProductNumber(index)}-2.avif`,
        alt: product.name,
        collectionId: undefined,
      },
      {
        productId: product.productId,
        url: `${imagesBaseUrl}/ceramics-product-${indexToProductNumber(index)}-3.avif`,
        alt: product.name,
        collectionId: undefined,
      },
      {
        productId: product.productId,
        url: `${imagesBaseUrl}/ceramics-product-${indexToProductNumber(index)}-4.avif`,
        alt: product.name,
        collectionId: undefined,
      },
      {
        productId: product.productId,
        url: `${imagesBaseUrl}/ceramics-product-${indexToProductNumber(index)}-thumb.webp`,
        alt: product.name,
        collectionId: undefined,
        isThumbnail: true,
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

  const len = imagesList.length;
  const batches = [
    imagesList.slice(0, len / 3),
    imagesList.slice(len / 3, (len / 3) * 2),
    imagesList.slice((len / 3) * 2),
  ];

  await Promise.all(
    batches.map((batch) => {
      db().insert(imagesTable).values(batch).run();
    }),
  );
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
