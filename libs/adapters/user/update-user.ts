import { prepareStatement } from "@db-adapter";

export const updateUser = async (id: string, updateOptions: string) => {
  await prepareStatement(`UPDATE users SET ${updateOptions} WHERE userId = ?`)
    .bind(id)
    .run();
};
