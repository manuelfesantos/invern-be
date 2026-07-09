import { imageClient } from "@r2-adapter";
import {
  getDeleteImageAction,
  getSelectImageByUrlAction,
} from "@image-db";
import { errors } from "@error-handling-utils";

/**
 * Deletes an image record AND its underlying R2 object, so deleting an image
 * never leaks storage. (A deleted *product* cascades its image rows in D1 but
 * not the R2 objects — those are handled by deleting each image here.)
 */
export const deleteImage = async (url: string): Promise<void> => {
  const existing = await getSelectImageByUrlAction(url).run();
  if (!existing) {
    throw errors.IMAGE_NOT_FOUND();
  }
  await getDeleteImageAction(url).run();
  await imageClient.delete(url);
};
