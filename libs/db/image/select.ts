import { Image } from "@image-entity";
import { db } from "@db";
import { imagesTable } from "@schema";
import { eq } from "drizzle-orm";

export const getImagesByProductId = async (
  productId: string,
): Promise<Image[]> => {
  return db().query.imagesTable.findMany({
    where: eq(imagesTable.productId, productId),
  });
};

export const getImageByCollectionId = async (
  collectionId: string,
): Promise<Image | undefined> => {
  return db().query.imagesTable.findFirst({
    where: eq(imagesTable.collectionId, collectionId),
  });
};
