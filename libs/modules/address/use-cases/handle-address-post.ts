import { Address, insertAddressSchema } from "@address-entity";
import { contextStore } from "@context-utils";
import { updateUser } from "@user-db";
import { encryptObject } from "@crypto-utils";
import { z } from "zod";
import { validateCartId } from "@cart-db";

export const handleAddressPost = async (
  body: unknown,
): Promise<{ address: Address; encryptedAddress: string }> => {
  const insertAddress = insertAddressSchema.parse(body);
  const { country, cartId } = contextStore.context;

  await validateCartId(cartId);

  const address = {
    ...insertAddress,
    country: country.code,
  };

  const encryptedAddress = await encryptObject(address);

  const { userId } = contextStore.context;
  if (userId) {
    if (shouldSaveAddress(body)) {
      await updateUser(userId, { address: encryptedAddress });
    }
  }

  return { address, encryptedAddress };
};

const shouldSaveAddress = (body: unknown): boolean => {
  const { saveAddress } = saveAddressSchema.parse(body);
  return saveAddress ?? false;
};

const saveAddressSchema = z.object({
  saveAddress: z.boolean().optional(),
});
