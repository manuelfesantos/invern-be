import { UserDTO, userDTOSchema } from "@entities/user/user-entity";
import { getDb } from "@adapters/db";
import { hash } from "@utils/crypto";
import { getUserByEmail } from "@adapters/users/get-user";
import { errors } from "@utils/error-handling/error-messages";

export const createUser = async (user: UserDTO, password: string) => {
  await validateThatEmailIsUnique(user.email);

  const id = crypto.randomUUID();

  const passwordHash = await hash(password, id);

  await runQuery(id, user, passwordHash);

  return userDTOSchema.parse(mergeUser(user, id));
};

const runQuery = async (id: string, user: UserDTO, passwordHash: string) => {
  const db = getDb();
  await db
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

const validateThatEmailIsUnique = async (email: string) => {
  const userExists = Boolean(await getUserByEmail(email));
  if (userExists) {
    throw errors.EMAIL_ALREADY_TAKEN;
  }
};

const mergeUser = (user: UserDTO, id: string) => ({
  ...user,
  id: id,
});
