import { imagesTable } from "@schema";
import { db } from "../db-client";
import { InsertImage } from "@image-entity";

export const insertImage = async (
  image: InsertImage,
): Promise<
  {
    url: string;
  }[]
> => {
  return db().insert(imagesTable).values(image).returning({
    url: imagesTable.url,
  });
};
