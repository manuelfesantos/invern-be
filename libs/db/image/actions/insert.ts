import { imagesTable } from "@schema";
import { db } from "@db";
import { InsertImage } from "@image-entity";
import { actionBuilder } from "@generics-db";

export const insertImageQuery = (image: InsertImage) =>
  db().insert(imagesTable).values(image).returning({
    url: imagesTable.url,
  });

export const getInsertImageAction = actionBuilder(insertImageQuery);
