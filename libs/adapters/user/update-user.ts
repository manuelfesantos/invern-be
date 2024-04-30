import { db } from "@adapters/db";

export const updateUser = async (id: string, updateOptions: string) => {
  await db()
    .prepare(`UPDATE users SET ${updateOptions} WHERE id = ?`)
    .bind(id)
    .run();
};
