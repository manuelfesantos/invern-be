import {
  UserDTO,
  userDTOSchema,
  userSchema,
  userToUserDTO,
} from "@entities/user/user-entity";
import { hash } from "../../../utils/crypto";
import { getUserByEmail } from "@adapters/user/get-user";
import { errors } from "../../../utils/error-handling/error-messages";
import { createUser } from "@adapters/user/create-user";

export const signupUser = async (userDTO: UserDTO, password: string) => {
  await validateThatEmailIsUnique(userDTO.email);

  const id = crypto.randomUUID();
  const passwordHash = await hash(password, id);
  const user = userSchema.parse({ ...userDTO, id, password: passwordHash });

  await createUser(user);

  return userToUserDTO(user);
};

const validateThatEmailIsUnique = async (email: string) => {
  const userExists = Boolean(await getUserByEmail(email));
  if (userExists) {
    throw errors.EMAIL_ALREADY_TAKEN;
  }
};
