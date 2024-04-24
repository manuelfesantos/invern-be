import { getDb } from "@adapters/db";
import { getUser } from "@adapters/users/get-user";
import { AdapterError } from "@utils/error-handling/adapter-error";
import { hash } from "@utils/crypto";
import { errorMessages } from "@utils/error-handling/error-messages";
import { userToUserDTO } from "@entities/user/user-entity";

export const loginUser = async (email: string, password: string) => {
  const db = getDb();
  const user = await getUser(email);

  if (!user) {
    throw new AdapterError(
      errorMessages.INVALID_CREDENTIALS.message,
      errorMessages.INVALID_CREDENTIALS.code,
    );
  }

  if ((await hash(password, user.id)) !== user.password) {
    throw new AdapterError(
      errorMessages.INVALID_CREDENTIALS.message,
      errorMessages.INVALID_CREDENTIALS.code,
    );
  }

  console.log("User:", JSON.stringify(user, null, 2));

  return userToUserDTO(user);
};
