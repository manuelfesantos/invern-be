import { prepareStatement } from "@db-utils";

export const deleteUser = async (id: string): Promise<void> => {
  await prepareStatement("DELETE FROM users WHERE userId = ?").bind(id).run();
};
