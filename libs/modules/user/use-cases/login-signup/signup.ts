import { signupBodySchema } from "../../types/login-signup";
import { userDTOSchema, userSchema, userToUserDTO } from "@user-entity";
import { hash } from "@crypto-utils";
import { createUser, getUserByEmail } from "@user-adapter";
import { generateErrorResponse, successResponse } from "@response-entity";
import { errors } from "@error-handling-utils";
import { Cart } from "@cart-entity";

export const signup = async (body: unknown) => {
  try {
    const parsedBody = signupBodySchema.parse(body);
    const userDTO = userDTOSchema.parse(parsedBody);
    const { password } = parsedBody;

    await validateThatEmailIsUnique(userDTO.email);

    const userId = crypto.randomUUID();
    const cartId = crypto.randomUUID();
    const cart: Cart = {
      cartId,
      products: [],
    };
    const passwordHash = await hash(password, userId);
    const user = userSchema.parse({
      ...userDTO,
      userId,
      cart,
      password: passwordHash,
    });

    await createUser(user);

    return successResponse.CREATED("user created", userToUserDTO(user));
  } catch (error: any) {
    return generateErrorResponse(error);
  }
};

const validateThatEmailIsUnique = async (email: string) => {
  const userExists = Boolean(await getUserByEmail(email));
  if (userExists) {
    throw errors.EMAIL_ALREADY_TAKEN();
  }
};
