import { Address, insertAddressSchema } from "@address-entity";
import { contextStore } from "@context-utils";
import { updateUser } from "@user-db";
import { encryptObject } from "@crypto-utils";
import { z } from "zod";
import { validateCartId } from "@cart-db";

const addressPostPayloadSchema = z.object({
  address: insertAddressSchema,
  saveAddress: z.boolean().optional(),
});

export const handleAddressPost = async (
  body: unknown,
): Promise<{ address: Address; encryptedAddress: string }> => {
  const { address: insertAddress, saveAddress } =
    addressPostPayloadSchema.parse(body);
  const { country, cartId } = contextStore.context;

  await validateCartId(cartId);

  const address = {
    ...insertAddress,
    country: country.code,
  };

  const encryptedAddress = await encryptObject(address);

  const { userId } = contextStore.context;
  if (userId) {
    if (saveAddress) {
      await updateUser(userId, { address: encryptedAddress });
    }
  }

  return { address, encryptedAddress };
};
