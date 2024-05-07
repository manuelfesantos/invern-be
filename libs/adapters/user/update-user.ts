import { prepareStatement } from "@db-utils";

export const updateUser = async (
  id: string,
  updateOptions: string,
): Promise<void> => {
  await prepareStatement(`UPDATE users SET ${updateOptions} WHERE userId = ?`)
    .bind(id)
    .run();
};
