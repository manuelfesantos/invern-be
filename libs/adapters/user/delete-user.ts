import { prepareStatement } from "@db-adapter";

export const deleteUser = async (id: string): Promise<void> => {
  await prepareStatement("DELETE FROM user WHERE userId = ?").bind(id).run();
};
