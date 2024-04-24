import { UserDTO } from "@entities/user/user-entity";
import { getDb } from "@adapters/db";
import { errorMessages } from "@utils/error-handling/error-messages";
import { AdapterError } from "@utils/error-handling/adapter-error";
import { hash } from "@utils/crypto";
import { getUser } from "@adapters/users/get-user";

export const createUser = async (user: UserDTO, password: string) => {
  const db = getDb();

  const id = crypto.randomUUID();
  const passwordHash = await hash(password, id);
  const userExists = Boolean(await getUser(user.email));
  if (userExists) {
    throw new AdapterError(
      errorMessages.USER_ALREADY_EXISTS.message,
      errorMessages.USER_ALREADY_EXISTS.code,
    );
  }

  return await db
    .prepare(
      `INSERT INTO users (id, email, firstName, lastName, password, cartId) VALUES(?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      user.email,
      user.firstName,
      user.lastName,
      passwordHash,
      user.cart?.id || null,
    )
    .run();
};
