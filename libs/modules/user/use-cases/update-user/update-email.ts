import { getUserByEmail, updateUser } from "@user-db";
import { errors } from "@error-handling-utils";

export const updateEmail = async (id: string, email: string): Promise<void> => {
  await checkIfEmailIsTaken(email);
  await updateUser(id, { email });
};

const checkIfEmailIsTaken = async (email: string): Promise<void> => {
  const user = await getUserByEmail(email);
  if (user) {
    throw errors.EMAIL_ALREADY_TAKEN();
  }
};
