import { prepareStatement } from "@db-adapter";

export const addToCart = async (
  cartId: string,
  productId: string,
  quantity: number,
): Promise<void> => {
  await prepareStatement(
    `INSERT INTO productsCarts (cartId, productId, quantity) VALUES('${cartId}', '${productId}', ${quantity})`,
  ).run();
};
