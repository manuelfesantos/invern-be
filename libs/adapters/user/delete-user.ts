import { prepareStatement } from "@db-adapter";

export const deleteUser = async (id: string) => {
  await prepareStatement("DELETE FROM user WHERE userId = ?").bind(id).run();
};
