import { db } from "@db";
import { contextStore } from "@context-utils";
import { imagesTable } from "@schema";
import { eq } from "drizzle-orm";

export const deleteImage = async (imageUrl: string): Promise<void> => {
  await (contextStore.context.transaction ?? db())
    .delete(imagesTable)
    .where(eq(imagesTable.url, imageUrl));
};
