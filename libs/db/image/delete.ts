import { db } from "@db";
import { imagesTable } from "@schema";
import { eq } from "drizzle-orm";

export const deleteImage = async (imageUrl: string): Promise<void> => {
  await db().delete(imagesTable).where(eq(imagesTable.url, imageUrl));
};
