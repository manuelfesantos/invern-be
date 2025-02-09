import { Address, insertAddressSchema } from "@address-entity";
import { contextStore } from "@context-utils";
import { updateUser } from "@user-db";
import { encryptObject } from "@crypto-utils";
import { z } from "zod";
import { booleanSchema, requiredObjectSchema } from "@global-entity";

const addressPostPayloadSchema = z.object({
  address: requiredObjectSchema("Address", insertAddressSchema.shape),
  saveAddress: z.optional(booleanSchema("Save Address option")),
});

export const handleAddressPost = async (
  body: unknown,
): Promise<{ address: Address; encryptedAddress: string }> => {
  const { address: insertAddress, saveAddress } =
    addressPostPayloadSchema.parse(body);
  const { country } = contextStore.context;

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
