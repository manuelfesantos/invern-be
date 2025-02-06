import { Address, insertAddressSchema } from "@address-entity";
import { contextStore } from "@context-utils";
import { updateUser } from "@user-db";
import { encryptAddress } from "@address-utils";

export const handleAddressPost = async (
  body: unknown,
): Promise<{ address: Address; encryptedAddress: string }> => {
  const insertAddress = insertAddressSchema.parse(body);
  const { country } = contextStore.context;

  const address = {
    ...insertAddress,
    country: country.code,
  };

  const encryptedAddress = await encryptAddress(address);

  const { userId } = contextStore.context;
  if (userId) {
    if (shouldSaveAddress(body)) {
      await updateUser(userId, { address: encryptedAddress });
    }
  }

  return { address, encryptedAddress };
};

const shouldSaveAddress = (body: unknown): boolean => {
  if (
    body &&
    typeof body === "object" &&
    "saveAddress" in body &&
    body.saveAddress &&
    typeof body.saveAddress === "boolean"
  ) {
    return body.saveAddress;
  }
  return false;
};
