import { UserDetails, userDetailsSchema } from "@user-entity";
import { encryptObject } from "@crypto-utils";
import { contextStore } from "@context-utils";
import { validateCartId } from "@cart-db";
import { requiredObjectSchema } from "@global-entity";

const userDetailsPostPayloadSchema = requiredObjectSchema("User Details", {
  personalDetails: userDetailsSchema,
});

export const handleDetailsPost = async (
  body: unknown,
): Promise<{ userDetails: UserDetails; encryptedUserDetails: string }> => {
  const { cartId } = contextStore.context;
  await validateCartId(cartId);
  const { personalDetails } = userDetailsPostPayloadSchema.parse(body);
  const encryptedUserDetails = await encryptObject(personalDetails);
  return { userDetails: personalDetails, encryptedUserDetails };
};
