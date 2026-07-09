import * as z from "zod";
import type { Image } from "@image-entity";
import {
  getSelectImageByUrlAction,
  getUpdateImageAction,
} from "@image-db";
import { errors } from "@error-handling-utils";

/** `url` identifies the image (it's the PK); the rest are the editable fields. */
const updateImageSchema = z.object({
  url: z.url(),
  alt: z.string().nonempty().optional(),
  isThumbnail: z.boolean().optional(),
  productId: z.uuidv4().optional(),
  collectionId: z.uuidv4().optional(),
});

export const updateImage = async (body: unknown): Promise<Image> => {
  const { url, ...changes } = updateImageSchema.parse(body);

  const existing = await getSelectImageByUrlAction(url).run();
  if (!existing) {
    throw errors.IMAGE_NOT_FOUND();
  }

  if (Object.keys(changes).length) {
    await getUpdateImageAction(url, changes).run();
  }

  const updated = await getSelectImageByUrlAction(url).run();
  if (!updated) {
    throw errors.IMAGE_NOT_FOUND();
  }
  return updated;
};
