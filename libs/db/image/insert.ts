import { imagesTable } from "@schema";
import { db } from "@db";
import { contextStore } from "@context-utils";
import { InsertImage } from "@image-entity";

export const insertImage = async (
  image: InsertImage,
): Promise<
  {
    url: string;
  }[]
> => {
  return (contextStore.context.transaction ?? db())
    .insert(imagesTable)
    .values(image)
    .returning({
      url: imagesTable.url,
    });
};
