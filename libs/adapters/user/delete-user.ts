import { db } from "@adapters/db";

export const deleteUser = async (id: string) => {
  await db().prepare("DELETE FROM user WHERE id = ?").bind(id).run();
};
