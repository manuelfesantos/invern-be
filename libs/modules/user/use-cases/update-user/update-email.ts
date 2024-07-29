import {
  ResponseWithVersion,
  updateEmailBodySchema,
} from "./types/update-user";
import { getUserByEmail, getUserById, updateUser } from "@user-db";
import { successResponse } from "@response-entity";
import { DEFAULT_USER_VERSION, User, userToUserDTO } from "@user-entity";
import { errors } from "@error-handling-utils";

export const updateEmail = async (
  id: string,
  body: unknown,
): Promise<ResponseWithVersion> => {
  const { email } = updateEmailBodySchema.parse(body);
  await checkIfEmailIsTaken(email);
  const user = await getUserById(id);

  await updateUser(id, { email });

  return {
    response: successResponse.OK(
      "user email updated",
      userToUserDTO(mergeUser(user, email)),
    ),
    version: user.version || DEFAULT_USER_VERSION,
  };
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
