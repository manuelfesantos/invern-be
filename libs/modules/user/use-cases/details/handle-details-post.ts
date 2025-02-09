import { UserDetails, userDetailsSchema } from "@user-entity";
import { encryptObject } from "@crypto-utils";
import { contextStore } from "@context-utils";
import { validateCartId } from "@cart-db";

export const handleDetailsPost = async (
  body: unknown,
): Promise<{ userDetails: UserDetails; encryptedUserDetails: string }> => {
  const { cartId } = contextStore.context;
  await validateCartId(cartId);
  const userDetails = userDetailsSchema.parse(body);
  const encryptedUserDetails = await encryptObject(userDetails);
  return { userDetails, encryptedUserDetails };
};
