import { prepareStatement } from "@db-adapter";

export const deleteUser = async (id: string): Promise<void> => {
  await prepareStatement("DELETE FROM users WHERE userId = ?").bind(id).run();
};
