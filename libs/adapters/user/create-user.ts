import { User } from "@user-entity";
import { prepareStatement } from "@db-adapter";

export const createUser = async (user: User): Promise<void> => {
  await prepareStatement(
    `INSERT INTO users (userId, email, firstName, lastName, password, cartId) VALUES(?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      user.userId,
      user.email,
      user.firstName,
      user.lastName,
      user.password,
      user.cart?.cartId || null,
    )
    .run();
};
