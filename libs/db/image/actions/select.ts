import { db } from "@db";
import { imagesTable } from "@schema";
import { eq } from "drizzle-orm";
import { actionBuilder } from "@generics-db";

const selectImagesByProductIdQuery = (productId: string) =>
  db().query.imagesTable.findMany({
    where: eq(imagesTable.productId, productId),
  });

export const selectImageByCollectionIdQuery = (collectionId: string) =>
  db().query.imagesTable.findFirst({
    where: eq(imagesTable.collectionId, collectionId),
  });

export const getSelectImagesByProductIdAction = actionBuilder(
  selectImagesByProductIdQuery,
);

export const getSelectImageByCollectionIdAction = actionBuilder(
  selectImageByCollectionIdQuery,
);

const selectImageByUrlQuery = (url: string) =>
  db().query.imagesTable.findFirst({
    where: eq(imagesTable.url, url),
  });

export const getSelectImageByUrlAction = actionBuilder(selectImageByUrlQuery);
