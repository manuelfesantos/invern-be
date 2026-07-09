import type { Image } from "@image-entity";
import { getSelectImagesByProductIdAction } from "@image-db";

/** All image records for a product (the storefront/backoffice image set). */
export const getImagesForProduct = async (
  productId: string,
): Promise<Image[]> => getSelectImagesByProductIdAction(productId).run();
