import { InsertImage } from "@image-entity";
import { imagesTable } from "@schema";
import { eq } from "drizzle-orm";
import { db } from "@db";
import { actionBuilder } from "@generics-db";

const updateImageQuery = (imageUrl: string, changes: Partial<InsertImage>) =>
  db().update(imagesTable).set(changes).where(eq(imagesTable.url, imageUrl));

export const getUpdateImageAction = actionBuilder(updateImageQuery);
