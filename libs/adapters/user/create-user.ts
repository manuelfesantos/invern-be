import { User } from "@entities/user/user-entity";
import { db } from "@adapters/db";

export const createUser = async (user: User) => {
  await db()
    .prepare(
      `INSERT INTO users (id, email, firstName, lastName, password, cartId) VALUES(?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      user.id,
      user.email,
      user.firstName,
      user.lastName,
      user.password,
      user.cart?.id || null,
    )
    .run();
};
