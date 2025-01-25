import { updateUser } from "@user-db";

export const updateName = async (
  id: string,
  firstName?: string,
  lastName?: string,
): Promise<void> => {
  await updateUser(id, {
    ...(firstName && { firstName }),
    ...(lastName && { lastName }),
  });
};
