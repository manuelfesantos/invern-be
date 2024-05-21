import { updateEmailBodySchema } from "./types/update-user";
import { getUserByEmail, getUserById, updateUser } from "@user-adapter";
import { successResponse } from "@response-entity";
import { User, userToUserDTO } from "@user-entity";
import { errors } from "@error-handling-utils";

export const updateEmail = async (
  id: string,
  body: unknown,
): Promise<Response> => {
  const { email } = updateEmailBodySchema.parse(body);
  await checkIfEmailIsTaken(email);
  const user = await getUserById(id);

  await updateUser(id, `email = '${email}'`);

  return successResponse.OK(
    "user mail updated",
    userToUserDTO(mergeUser(user, email)),
  );
};

const mergeUser = (user: User, email: string): User => ({
  ...user,
  email,
});

const checkIfEmailIsTaken = async (email: string): Promise<void> => {
  const user = await getUserByEmail(email);
  if (user) {
    throw errors.EMAIL_ALREADY_TAKEN();
  }
};
