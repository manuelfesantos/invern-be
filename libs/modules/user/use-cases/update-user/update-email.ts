import { updateEmailBodySchema } from "./types/update-user";
import { getUserByEmail, getUserById, updateUser } from "@user-db";
import {
  ProtectedModuleFunction,
  protectedSuccessResponse,
} from "@response-entity";
import { User, userToUserDTO } from "@user-entity";
import { errors } from "@error-handling-utils";

export const updateEmail: ProtectedModuleFunction = async (
  tokens: { refreshToken: string; accessToken?: string },
  remember: boolean | undefined,
  id: string,
  body: unknown,
) => {
  const { email } = updateEmailBodySchema.parse(body);
  await checkIfEmailIsTaken(email);
  const user = await getUserById(id);

  await updateUser(id, { email });

  return protectedSuccessResponse.OK(
    tokens,
    "user email updated",
    { user: userToUserDTO(mergeUser(user, email)) },
    remember,
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
