import { getUserById } from "@adapters/user/get-user";

export const getUser = async (id: string) => {
  return await getUserById(id);
};
