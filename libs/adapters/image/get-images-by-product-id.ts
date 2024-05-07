import { ImageUrl } from "@image-entity";
import { prepareStatement } from "@db-utils";

export const getImagesByProductId = async (
  productId: string,
): Promise<ImageUrl[]> => {
  const { results } = await prepareStatement(
    `SELECT url as imageUrl, alt as imageAlt FROM images WHERE productId = '${productId}'`,
  ).all<ImageUrl>();
  return results;
};
