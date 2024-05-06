import { prepareStatement } from "@db-adapter";

export const addToCart = async (
  cartId: string,
  productId: string,
  quantity: number,
): Promise<void> => {
  const product = await prepareStatement(
    `SELECT quantity FROM productsCarts WHERE productId = '${productId}' AND cartId = '${cartId}'`,
  ).first();
  if (!product) {
    await prepareStatement(
      `INSERT INTO productsCarts (cartId, productId, quantity) VALUES('${cartId}', '${productId}', ${quantity})`,
    ).run();
  } else {
    await prepareStatement(
      `UPDATE productsCarts SET quantity = ${Number(product.quantity) + quantity} WHERE cartId = '${cartId}' AND productId = '${productId}'`,
    ).run();
  }
};
