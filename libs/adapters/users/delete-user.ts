import { getDb } from "@adapters/db";
import { getUserById } from "@adapters/users/get-user";

export const deleteUser = async (id: string) => {
  const user = await getUserById(id);
  const db = getDb();
  await db.prepare("DELETE FROM users WHERE id = ?").bind(id).run();
};
