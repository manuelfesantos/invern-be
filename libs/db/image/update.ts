import { InsertImage } from "@image-entity";
import { imagesTable } from "@schema";
import { eq } from "drizzle-orm";
import { db } from "@db";
import { contextStore } from "@context-utils";

export const updateImage = async (
  imageUrl: string,
  changes: Partial<InsertImage>,
): Promise<void> => {
  await (contextStore.context.transaction ?? db())
    .update(imagesTable)
    .set(changes)
    .where(eq(imagesTable.url, imageUrl));
};
