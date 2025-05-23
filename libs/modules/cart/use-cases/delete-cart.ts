import { getDeleteCartAction } from "@cart-db";

export const deleteCart = async (cartId: string): Promise<void> => {
  getDeleteCartAction(cartId).run();
};
