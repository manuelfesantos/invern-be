import { db } from "@db";
import { imagesTable } from "@schema";
import { eq } from "drizzle-orm";
import { actionBuilder } from "@generics-db";

const deleteImageQuery = (imageUrl: string) =>
  db().delete(imagesTable).where(eq(imagesTable.url, imageUrl));

export const getDeleteImageAction = actionBuilder(deleteImageQuery);
