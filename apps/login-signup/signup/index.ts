import { z } from "zod";
import { userDTOSchema } from "@entities/user/user-entity";
import { signupUser } from "@modules/user/login-signup/signup";
import { generateErrorResponse } from "@entities/response/error-response";
import { successResponse } from "@entities/response/success-response";

const bodySchema = userDTOSchema.extend({
  password: z.string({ required_error: "password is required" }),
});

export const signup = async (body: unknown) => {
  try {
    const user = bodySchema.parse(body);

    const response = await signupUser(userDTOSchema.parse(user), user.password);

    return successResponse.CREATED("user created", response);
  } catch (error: any) {
    return generateErrorResponse(error);
  }
};
