import { BaseAddress, insertAddressSchema } from "@address-entity";
import { getAddressById, insertAddress } from "@address-db";

export const createAddress = async (
  body: unknown,
): Promise<BaseAddress | undefined> => {
  const newAddress = insertAddressSchema.parse(body);
  const addressId = await insertAddress(newAddress);
  return await getAddressById(addressId);
};
