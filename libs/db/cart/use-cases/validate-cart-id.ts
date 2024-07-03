import { uuidSchema } from "@global-entity";
import { errors } from "@error-handling-utils";
import { db } from "@db";
import { cartsTable } from "@schema";
import { eq } from "drizzle-orm";
import { getLogger } from "@logger-utils";

export const validateCartId = async (cartId: string): Promise<void> => {
  const id = uuidSchema("cart id").parse(cartId);
  const cartToValidate = await db().query.cartsTable.findFirst({
    where: eq(cartsTable.cartId, id),
    columns: {
      cartId: true,
    },
  });
  const cartIsValid = cartToValidate !== undefined;

  getLogger().addData({ cartIsValid });
  if (!cartIsValid) {
    throw errors.CART_NOT_FOUND();
  }
};
