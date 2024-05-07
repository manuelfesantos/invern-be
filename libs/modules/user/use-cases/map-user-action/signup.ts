import { signupBodySchema } from "./types/map-user-action";
import {
  RolesEnum,
  User,
  UserDTO,
  userDTOSchema,
  userToUserDTO,
} from "@user-entity";
import { getRandomUUID, hashPassword } from "@crypto-utils";
import { createUser, getUserByEmail } from "@user-adapter";
import { successResponse } from "@response-entity";
import { errors } from "@error-handling-utils";

export const signup = async (body: unknown): Promise<Response> => {
  const parsedBody = signupBodySchema.parse(body);
  const userDTO = userDTOSchema.parse(parsedBody);
  const { password } = parsedBody;

  await validateThatEmailIsUnique(userDTO.email);

  const userId = getRandomUUID();
  const cartId = getRandomUUID();
  const passwordHash = await hashPassword(password, userId);
  const user = buildUserFromData(userDTO, cartId, userId, passwordHash);

  await createUser(user);

  return successResponse.CREATED("user created", userToUserDTO(user));
};

const validateThatEmailIsUnique = async (email: string): Promise<void> => {
  const userExists = Boolean(await getUserByEmail(email));
  if (userExists) {
    throw errors.EMAIL_ALREADY_TAKEN();
  }
};

const buildUserFromData = (
  userDTO: UserDTO,
  cartId: string,
  userId: string,
  password: string,
): User => ({
  ...userDTO,
  userId,
  password,
  cart: {
    cartId,
    products: [],
  },
  roles: [RolesEnum.USER],
});
