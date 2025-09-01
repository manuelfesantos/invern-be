import { contextStore } from "@context-utils";
import { errors } from "@error-handling-utils";
import { updatePersonalInformationBodySchema } from "../types/update-user";
import { updateName } from "./utils/update-name";
import { updateAddress } from "./utils/update-address";
import { getSelectUserByIdAction } from "@user-db";
import type { UserDTO} from "@user-entity";
import { userDTOSchema } from "@user-entity";
import { logCredentials } from "@logger-utils";

export const updateUserPersonalInformation = async (
  body: unknown,
): Promise<UserDTO> => {
  const { userId, cartId } = contextStore.context;

  if (!userId) {
    throw errors.UNAUTHORIZED("not logged in");
  }

  logCredentials(cartId, userId);

  const updateUserBody = updatePersonalInformationBodySchema.parse(body);

  if (updateUserBody.firstName || updateUserBody.lastName) {
    await updateName(userId, updateUserBody.firstName, updateUserBody.lastName);
  }
  if (updateUserBody.address) {
    await updateAddress(userId, updateUserBody.address);
  }

  const updatedUser = await getSelectUserByIdAction(userId).run();
  return userDTOSchema.parse(updatedUser);
};
