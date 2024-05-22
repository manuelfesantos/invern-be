import { InsertImage } from "@image-entity";
import { imagesTable } from "@schema";
import { eq } from "drizzle-orm";
import { db } from "@db";

export const updateImage = async (
  imageUrl: string,
  changes: Partial<InsertImage>,
): Promise<void> => {
  await db()
    .update(imagesTable)
    .set(changes)
    .where(eq(imagesTable.url, imageUrl));
};
