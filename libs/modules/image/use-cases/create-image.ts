import type { Image } from "@image-entity";
import { insertImageSchema } from "@image-entity";
import {
  getInsertImageAction,
  getSelectImageByUrlAction,
} from "@image-db";

/**
 * Creates an image record for an already-uploaded URL and associates it with a
 * product (and optionally a collection), with an optional thumbnail flag.
 */
export const createImage = async (body: unknown): Promise<Image> => {
  const image = insertImageSchema.parse(body);
  await getInsertImageAction(image).run();
  const created = await getSelectImageByUrlAction(image.url).run();
  if (!created) {
    throw new Error("Failed to create image record");
  }
  return created;
};
