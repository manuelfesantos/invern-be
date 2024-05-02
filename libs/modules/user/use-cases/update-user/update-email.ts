import { updateEmailBodySchema } from "../../types/update-user";
import { getUserById, updateUser } from "@user-adapter";
import { successResponse } from "@response-entity";
import { User, userToUserDTO } from "@user-entity";

export const updateEmail = async (id: string, body: unknown) => {
  const { email } = updateEmailBodySchema.parse(body);
  const user = await getUserById(id);

  await updateUser(id, `email = ${email}`);

  return successResponse.OK(
    "user email updated",
    userToUserDTO(mergeUser(user, email)),
  );
};

const mergeUser = (user: User, email: string) => ({
  ...user,
  email,
});
