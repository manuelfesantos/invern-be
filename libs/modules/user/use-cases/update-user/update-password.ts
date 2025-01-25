import { updateUser } from "@user-db";
import { hashPassword } from "@crypto-utils";

export const updatePassword = async (
  id: string,
  password: string,
): Promise<void> => {
  const passwordHash = await hashPassword(password, id);

  await updateUser(id, { password: passwordHash });
};
