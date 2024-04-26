import { z } from "zod";
import { loginUser } from "@adapters/users/login-user";
import { generateErrorResponse } from "@entities/response/error-response";
import { successResponse } from "@entities/response/success-response";

const bodySchema = z.object({
  email: z
    .string({ required_error: "email is required" })
    .email({ message: "Invalid email" }),
  password: z.string({ required_error: "password is required" }),
});

export const login = async (body: unknown) => {
  try {
    const user = bodySchema.parse(body);

    const data = await loginUser(user.email, user.password);

    return successResponse.OK("successfully logged in", data);
  } catch (error: any) {
    return generateErrorResponse(error);
  }
};
