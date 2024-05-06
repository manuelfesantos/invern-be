import { signupBodySchema } from "../../types/login-signup";
import {
  RolesEnum,
  User,
  UserDTO,
  userDTOSchema,
  userToUserDTO,
} from "@user-entity";
import { hashPassword } from "@crypto-utils";
import { createUser, getUserByEmail } from "@user-adapter";
import { generateErrorResponse, successResponse } from "@response-entity";
import { errors } from "@error-handling-utils";

export const signup = async (body: unknown): Promise<Response> => {
  try {
    const parsedBody = signupBodySchema.parse(body);
    const userDTO = userDTOSchema.parse(parsedBody);
    const { password } = parsedBody;

    await validateThatEmailIsUnique(userDTO.email);

    const userId = crypto.randomUUID();
    const cartId = crypto.randomUUID();
    const passwordHash = await hashPassword(password, userId);
    const user = buildUserFromData(userDTO, cartId, userId, passwordHash);

    await createUser(user);

    return successResponse.CREATED("user created", userToUserDTO(user));
  } catch (error: unknown) {
    return generateErrorResponse(error);
  }
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
