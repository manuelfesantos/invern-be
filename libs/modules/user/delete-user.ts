import { getUserById } from "@adapters/user/get-user";
import { deleteUser as deleteUserAdapter } from "@adapters/user/delete-user";

export const deleteUser = async (id: string) => {
  const user = await getUserById(id);
  await deleteUserAdapter(user.id);
};
