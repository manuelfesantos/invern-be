import { z } from "zod";
import { userDTOSchema } from "@entities/user/user-entity";
import { createUser } from "@adapters/users/create-user";
import { generateErrorResponse } from "@entities/response/error-response";
import { successResponse } from "@entities/response/success-response";
import { getGlobalPassedTime, getPassedTime, setTimer } from "@utils/timer";

const bodySchema = userDTOSchema.extend({
  password: z.string({ required_error: "password is required" }),
});

export const signup = async (body: unknown) => {
  try {
    const user = bodySchema.parse(body);

    const response = await createUser(userDTOSchema.parse(user), user.password);

    setTimer();

    return successResponse.CREATED("user created", response);
  } catch (error: any) {
    return generateErrorResponse(error);
  }
};
