import { contextStore } from "@context-utils";
import { errors } from "@error-handling-utils";
import { updatePersonalInformationBodySchema } from "../types/update-user";
import { updateName } from "./utils/update-name";
import { updateAddress } from "./utils/update-address";
import { selectUserById } from "@user-db";
import { UserDTO, userDTOSchema } from "@user-entity";
import { withTransaction } from "@db";

export const updateUserPersonalInformation = withTransaction(
  async (body: unknown): Promise<UserDTO> => {
    const { userId } = contextStore.context;

    if (!userId) {
      throw errors.UNAUTHORIZED("not logged in");
    }

    const updateUserBody = updatePersonalInformationBodySchema.parse(body);

    if (updateUserBody.firstName || updateUserBody.lastName) {
      await updateName(
        userId,
        updateUserBody.firstName,
        updateUserBody.lastName,
      );
    }
    if (updateUserBody.address) {
      await updateAddress(userId, updateUserBody.address);
    }

    const updatedUser = await selectUserById(userId);
    return userDTOSchema.parse(updatedUser);
  },
);
