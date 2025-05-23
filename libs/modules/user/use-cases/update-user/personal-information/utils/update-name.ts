import { getUpdateUserAction } from "@user-db";

export const updateName = async (
  id: string,
  firstName?: string,
  lastName?: string,
): Promise<void> => {
  await getUpdateUserAction(id, {
    ...(firstName && { firstName }),
    ...(lastName && { lastName }),
  }).run();
};
