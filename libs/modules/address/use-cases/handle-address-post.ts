import type { Address } from "@address-entity";
import { insertAddressSchema } from "@address-entity";
import { contextStore } from "@context-utils";
import { getUpdateUserAction } from "@user-db";
import { encryptObject } from "@crypto-utils";
import * as z from "zod";

const addressPostPayloadSchema = z.object({
  address: z.object(insertAddressSchema.shape),
  saveAddress: z.boolean().optional(),
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
    saveAddress,
  };

  const encryptedAddress = await encryptObject(address);

  const { userId } = contextStore.context;
  if (userId && saveAddress) {
    await getUpdateUserAction(userId, { address: encryptedAddress }).run();
  }

  return { address, encryptedAddress };
};
