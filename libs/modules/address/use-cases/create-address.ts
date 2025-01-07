import {
  ProtectedModuleFunction,
  protectedSuccessResponse,
} from "@response-entity";
import { insertAddressSchema } from "@address-entity";
import { insertAddress } from "@address-db";

export const createAddress: ProtectedModuleFunction = async (
  tokens,
  remember,
  body: unknown,
) => {
  const newAddress = insertAddressSchema.parse(body);
  const [{ addressId }] = await insertAddress(newAddress);

  return protectedSuccessResponse.OK(
    tokens,
    "successfully created address",
    { addressId },
    remember,
  );
};
