import { prepareStatement } from "@db-adapter";
import { uuidSchema } from "@global-entity";
import { errors } from "@error-handling-utils";

export const validateProductId = async (productId: string): Promise<void> => {
  const id = uuidSchema("product id").parse(productId);
  const productIsValid = Boolean(
    await prepareStatement(
      `SELECT productId FROM products WHERE productId = '${id}'`,
    ).first(),
  );
  if (!productIsValid) {
    throw errors.PRODUCT_NOT_FOUND();
  }
};

export const validateProductIds = async (
  productIds: string[],
): Promise<void> => {
  const where = productIds.join("' OR productId = '");
  const { results } = await prepareStatement(
    `SELECT productId FROM products WHERE productId = '${where}'`,
  ).all();
  if (results.length !== productIds.length) {
    const invalidIds = productIds.filter(
      (id) => !results.some((result) => result.productId === id),
    );
    throw errors.INVALID_PRODUCT_IDS(invalidIds);
  }
};
