import { Image } from "@image-entity";
import { db } from "@db";
import { contextStore } from "@context-utils";
import { imagesTable } from "@schema";
import { eq } from "drizzle-orm";

export const getImagesByProductId = async (
  productId: string,
): Promise<Image[]> => {
  return (contextStore.context.transaction ?? db()).query.imagesTable.findMany({
    where: eq(imagesTable.productId, productId),
  });
};

export const getImageByCollectionId = async (
  collectionId: string,
): Promise<Image | undefined> => {
  return (contextStore.context.transaction ?? db()).query.imagesTable.findFirst(
    {
      where: eq(imagesTable.collectionId, collectionId),
    },
  );
};
