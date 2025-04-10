import { User } from "@user-entity";
import queryString from "query-string";
import { sendEmail } from "@sendgrid-adapter";
import { ENV } from "@env-utils";
import { contextStore } from "@context-utils";

export const sendSignupEmail = async (
  user: User,
  validationCode: string,
): Promise<void> => {
  const { country } = contextStore.context;
  const queryParams = queryString.stringify({
    email: user.email,
    code: validationCode,
  });

  await sendEmail({
    to: user.email,
    subject: `Welcome to ${ENV.SENDGRID_NAME}`,
    text: `Hi ${user.firstName}, welcome to ${ENV.SENDGRID_NAME}! Your validation code is: ${validationCode}. This code will expire in 30 minutes. You can also use the following link to sign up: ${ENV.FRONTEND_HOST}/${country.code.toLowerCase()}/sign-up/verify-email?${queryParams}`,
  });
};
